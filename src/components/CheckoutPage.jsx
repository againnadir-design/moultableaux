import { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle, Tag, ShoppingBag, Shield, Truck, Phone, CreditCard, Sparkles, ImagePlus, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

// ── Client-side image compression ──
async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const DEFAULT_TEMPLATE = `Nouvelle Commande Moul Tableaux

Ref: {{ref}}

Client:
{{name}}
{{phone}}
{{city}}
{{address}}
Notes: {{notes}}

Articles:
{{items}}

{{coupon}}
{{savings}}

Sous-total: {{subtotal}} DH
Livraison: {{delivery}} DH
Total: {{total}} DH (Paiement a la Livraison)

{{images}}

{{prefix}}
{{suffix}}`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    cartItems, subtotal, originalSubtotal, deliveryFee, clearCart, totalItems,
    savings, appliedOffers, calculateItemPrice
  } = useCart();
  const { t, isRtl } = useLanguage();
  const { activeDiscountCode, activeDiscountPercentage, playPop, playSuccess, addCheckoutOrder, siteSettings } = useApp();

  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', city: '', address: '', notes: '' });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  // WhatsApp config from admin settings
  const whatsappPhone = siteSettings?.whatsapp_phone || '212623391688';
  const whatsappTemplate = siteSettings?.whatsapp_template || DEFAULT_TEMPLATE;
  const whatsappPrefix = siteSettings?.whatsapp_prefix || '';
  const whatsappSuffix = siteSettings?.whatsapp_suffix || '';
  const whatsappImagesEnabled = siteSettings?.whatsapp_images_enabled !== 'false';

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag size={48} className="text-theme-muted mx-auto" />
          <h2 className="font-serif text-xl font-bold text-theme-text uppercase tracking-wider">{t('cart_empty')}</h2>
          <button onClick={() => { playPop(); navigate('/'); }} className="btn-primary px-8 py-3 text-xs shadow-[0_4px_0_#911616] cursor-pointer">
            {t('cart_continue')}
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const discountedAmount = subtotal * activeDiscountPercentage;
  const finalTotal = subtotal - discountedAmount + deliveryFee;

  // ── Handle image upload ──
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (uploadedImages.length + files.length > 3) {
      setUploadError('Maximum 3 images autorisees.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const compressed = await Promise.all(files.map(f => compressImage(f)));
      const { urls } = await api.upload.checkout(compressed);
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setUploadError(err.message || "Echec de l'upload.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Build WhatsApp message from template ──
  const buildWhatsAppMessage = (orderId) => {
    const itemsText = cartItems.map(item => {
      const { lineTotal, appliedOffer } = calculateItemPrice(item);
      const offerText = appliedOffer ? ` (${appliedOffer.label})` : '';
      return `- ${item.quantity}x ${item.name} (${item.sizeLabel}) = ${lineTotal} DH${offerText}`;
    }).join('\n');

    const couponLine = activeDiscountCode ? `Code: ${activeDiscountCode} (-${activeDiscountPercentage * 100}%)` : '';
    const savingsLine = savings > 0 ? `Economies: -${savings} DH` : '';

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const imageLinks = uploadedImages.length > 0
      ? uploadedImages.map((url, i) => `Image ${i + 1}: ${url.startsWith('http') ? url : `${baseUrl}${url}`}`).join('\n')
      : '';

    const template = whatsappTemplate || DEFAULT_TEMPLATE;
    const message = template
      .replace(/\{\{ref\}\}/g, orderId)
      .replace(/\{\{name\}\}/g, formData.fullName)
      .replace(/\{\{phone\}\}/g, formData.phone)
      .replace(/\{\{city\}\}/g, formData.city)
      .replace(/\{\{address\}\}/g, formData.address)
      .replace(/\{\{notes\}\}/g, formData.notes || 'Aucune')
      .replace(/\{\{items\}\}/g, itemsText)
      .replace(/\{\{coupon\}\}/g, couponLine)
      .replace(/\{\{savings\}\}/g, savingsLine)
      .replace(/\{\{subtotal\}\}/g, subtotal)
      .replace(/\{\{delivery\}\}/g, deliveryFee)
      .replace(/\{\{total\}\}/g, finalTotal.toFixed(0))
      .replace(/\{\{images\}\}/g, whatsappImagesEnabled ? imageLinks : '')
      .replace(/\{\{prefix\}\}/g, whatsappPrefix)
      .replace(/\{\{suffix\}\}/g, whatsappSuffix)
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playSuccess();

    try {
      const orderId = await addCheckoutOrder({
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        notes: formData.notes,
        cartItems: cartItems,
        total: finalTotal.toFixed(0),
        discountCode: activeDiscountCode || null,
        images: uploadedImages
      });

      const message = buildWhatsAppMessage(orderId);
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

      setIsSuccess(true);
      setTimeout(() => { window.open(whatsappUrl, '_blank'); clearCart(); }, 800);
    } catch (err) {
      console.error('Order submission failed:', err);
      setSubmitError(err.message || 'Erreur lors de la commande. Reessayez.');
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-5 max-w-md mx-auto px-4">
          <div className="text-green-500 bg-green-50 p-4 rounded-full border border-green-200 animate-bounce w-fit mx-auto">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-theme-text uppercase tracking-wider">{t('checkout_success_title')}</h2>
          <p className="text-theme-text text-sm font-semibold leading-relaxed">{t('checkout_success_msg')}</p>
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs font-bold">
            Redirection vers WhatsApp pour confirmer. Sinon contactez-nous au +212 623-391688.
          </div>
          <button onClick={() => { playPop(); navigate('/'); setIsSuccess(false); setFormData({ fullName: '', phone: '', city: '', address: '', notes: '' }); setUploadedImages([]); }} className="mt-4 btn-primary px-8 py-3 text-xs shadow-[0_4px_0_#911616] cursor-pointer">
            {t('checkout_success_cta')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 md:pb-16 min-h-screen bg-theme-bg">
      <div className="container-custom max-w-5xl mx-auto px-4">
        <button onClick={() => { playPop(); navigate('/'); }} className="flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-theme-text hover:text-primary-400 mb-6 group cursor-pointer">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {t('cart_continue')}
        </button>

        <h1 className="font-serif text-2xl font-bold text-theme-text uppercase tracking-wider mb-1">{t('checkout_title')}</h1>
        <p className="text-xs text-theme-muted font-bold mb-6">{t('checkout_cod_note')}</p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Form */}
          <div className="flex-1 order-2 md:order-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-theme-surface border-2 border-theme-border rounded-xl p-5">
                <h3 className="text-sm font-bold text-theme-text mb-4 uppercase tracking-wider">{t('checkout_shipping_info')}</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="fullName" className="block text-[10px] font-bold text-theme-text mb-1.5 uppercase tracking-wider">{t('checkout_full_name')}</label>
                    <input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg bg-theme-bg border-2 border-theme-border focus:border-primary-400 outline-none text-sm text-theme-text font-bold min-h-[48px]"
                      placeholder={t('checkout_name_placeholder')} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-bold text-theme-text mb-1.5 uppercase tracking-wider">{t('checkout_phone')}</label>
                    <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg bg-theme-bg border-2 border-theme-border focus:border-primary-400 outline-none text-sm text-theme-text font-bold min-h-[48px]"
                      placeholder={t('checkout_phone_placeholder')} />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-[10px] font-bold text-theme-text mb-1.5 uppercase tracking-wider">{t('checkout_city')}</label>
                    <input type="text" id="city" name="city" required value={formData.city} onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg bg-theme-bg border-2 border-theme-border focus:border-primary-400 outline-none text-sm text-theme-text font-bold min-h-[48px]"
                      placeholder={t('checkout_city_placeholder')} />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-[10px] font-bold text-theme-text mb-1.5 uppercase tracking-wider">{t('checkout_address')}</label>
                    <textarea id="address" name="address" required rows="2" value={formData.address} onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg bg-theme-bg border-2 border-theme-border focus:border-primary-400 outline-none text-sm text-theme-text font-bold resize-none min-h-[80px]"
                      placeholder={t('checkout_address_placeholder')} />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-[10px] font-bold text-theme-text mb-1.5 uppercase tracking-wider">{t('checkout_notes')}</label>
                    <input type="text" id="notes" name="notes" value={formData.notes} onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg bg-theme-bg border-2 border-theme-border focus:border-primary-400 outline-none text-sm text-theme-text font-bold min-h-[48px]"
                      placeholder={t('checkout_notes_placeholder')} />
                  </div>
                </div>
              </div>

              {/* ── Image Upload ── */}
              <div className="bg-theme-surface border-2 border-theme-border rounded-xl p-5">
                <h3 className="text-sm font-bold text-theme-text mb-1 uppercase tracking-wider">Images (optionnel)</h3>
                <p className="text-[10px] text-theme-muted font-bold mb-3">Ajoutez des images pour votre commande (max 3, 2 Mo chacune)</p>

                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-theme-border group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < 3 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-theme-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-400 transition-colors">
                      {uploading ? (
                        <Loader2 size={16} className="text-theme-muted animate-spin" />
                      ) : (
                        <>
                          <ImagePlus size={16} className="text-theme-muted" />
                          <span className="text-[8px] text-theme-muted font-bold">Ajouter</span>
                        </>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload}
                        className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[10px] text-red-500 font-bold mt-2">{uploadError}</p>
                )}
              </div>

              <div className="bg-theme-surface border-2 border-theme-border rounded-xl p-5">
                <h3 className="text-sm font-bold text-theme-text mb-4 uppercase tracking-wider">{t('checkout_trust_title')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Shield, title: t('checkout_trust_cod_title'), desc: t('checkout_trust_cod_desc') },
                    { icon: Truck, title: t('checkout_trust_delivery_title'), desc: t('checkout_trust_delivery_desc') },
                    { icon: Phone, title: t('checkout_trust_support_title'), desc: t('checkout_trust_support_desc') },
                    { icon: CreditCard, title: t('checkout_trust_premium_title'), desc: t('checkout_trust_premium_desc') },
                  ].map(({ icon: Icon, title, desc }, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-theme-bg border border-theme-border">
                      <Icon size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-theme-text uppercase tracking-wider">{title}</p>
                        <p className="text-[9px] text-theme-muted font-bold mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-[340px] order-1 md:order-2">
            <div className="bg-theme-surface border-2 border-theme-border rounded-xl p-5 md:sticky md:top-24">
              <h3 className="text-sm font-bold text-theme-text mb-4 uppercase tracking-wider">{t('checkout_summary')}</h3>

              {/* Items */}
              <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4 pr-1">
                {cartItems.map((item) => {
                  const { lineTotal, originalTotal, itemSavings, appliedOffer } = calculateItemPrice(item);
                  return (
                    <div key={item.key} className="flex gap-3 bg-theme-card p-2 rounded-lg border border-theme-border">
                      <div className="w-12 h-12 bg-[#FAF7F2] rounded-lg overflow-hidden flex-shrink-0 relative border border-theme-border p-0.5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" loading="lazy" decoding="async" width="48" height="48" onError={(e) => { e.target.src = '/logo.png'; }} />
                        <span className="absolute -top-1 -right-1 bg-primary-400 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold border border-white z-10">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 py-0.5 text-[10px] font-bold leading-snug text-theme-text">
                        <p className="line-clamp-1 font-serif uppercase tracking-wide">{item.name}</p>
                        <p className="text-[9px] text-theme-muted font-bold">{item.sizeLabel} ({item.sizeCm}) x {item.quantity}</p>
                        {appliedOffer ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-theme-muted line-through text-[9px]">{originalTotal} DH</span>
                            <span className="text-green-600 font-serif font-bold">{lineTotal} DH</span>
                          </div>
                        ) : (
                          <p className="text-primary-400 font-serif font-bold mt-0.5">{lineTotal} DH</p>
                        )}
                        {appliedOffer && (
                          <p className="text-[8px] text-green-600 font-bold flex items-center gap-0.5 mt-0.5">
                            <Sparkles size={8} /> {appliedOffer.label}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-theme-border pt-3 space-y-2">
                {savings > 0 && (
                  <div className="flex justify-between text-xs font-bold text-theme-muted">
                    <span>الأصلية</span>
                    <span className="line-through">{originalSubtotal} DH</span>
                  </div>
                )}

                <div className="flex justify-between text-xs font-bold text-theme-text">
                  <span>المجموع</span>
                  <span>{subtotal} DH</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-xs font-bold text-green-600">
                    <span className="flex items-center gap-1"><Sparkles size={12} /> وفّر</span>
                    <span>-{savings} DH</span>
                  </div>
                )}

                {appliedOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center gap-2 text-[10px] font-bold text-green-600">
                    <Sparkles size={10} />
                    <span className="font-serif">{offer.label}</span>
                  </div>
                ))}

                {activeDiscountCode && (
                  <div className="flex justify-between text-xs font-bold text-green-500">
                    <span className="flex items-center gap-1"><Tag size={12} /> {activeDiscountCode}</span>
                    <span>-{discountedAmount.toFixed(0)} DH</span>
                  </div>
                )}

                <div className="flex justify-between text-xs font-bold text-theme-text">
                  <span>التوصيل</span>
                  <span className="font-serif">{deliveryFee} DH</span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-theme-border">
                  <span className="font-serif font-extrabold text-xs text-theme-text uppercase">الإجمالي</span>
                  <span className="font-serif text-xl font-extrabold text-primary-500">{finalTotal.toFixed(0)} DH</span>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-medium text-red-700 mb-3">
                  {submitError}
                </div>
              )}

              <button type="submit" form="checkout-form" className="hidden md:flex btn-primary w-full py-3.5 text-xs shadow-[0_4px_0_#911616] justify-center cursor-pointer mt-5">
                {t('checkout_submit')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-theme-surface border-t-2 border-theme-border p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-theme-text">{totalItems} items</span>
          <span className="font-serif text-lg font-extrabold text-primary-500">{finalTotal.toFixed(0)} DH</span>
        </div>
        <button type="submit" form="checkout-form" className="btn-primary w-full py-3.5 text-xs shadow-[0_4px_0_#911616] justify-center cursor-pointer">
          {t('checkout_submit')}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;

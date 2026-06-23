import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const CartSidebar = () => {
  const navigate = useNavigate();
  const {
    isSidebarOpen, toggleSidebar, cartItems, updateQuantity, removeFromCart,
    subtotal, originalSubtotal, deliveryFee, totalItems, savings, appliedOffers,
    cartMessage, SIZES, calculateItemPrice
  } = useCart();
  const { t, isRtl } = useLanguage();
  const {
    activeDiscountCode, activeDiscountPercentage,
    applyDiscountCode, removeDiscountCode, playPop
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = await applyDiscountCode(couponInput);
    if (res.success) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const discountedAmount = subtotal * activeDiscountPercentage;
  const finalTotal = subtotal - discountedAmount + deliveryFee;

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => { playPop(); toggleSidebar(); }} />
      )}

      <div
        className={`fixed top-0 h-full w-full sm:w-[380px] bg-theme-surface border-l-2 border-theme-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isRtl ? 'left-0' : 'right-0'
        } ${isSidebarOpen ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-theme-border bg-theme-surface">
          <h2 className="font-serif text-lg uppercase tracking-wider font-bold text-theme-text flex items-center gap-2">
            {t('cart_title')}
          </h2>
          <button onClick={() => { playPop(); toggleSidebar(); }} className="text-theme-muted hover:text-primary-400 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-theme-bg">
            <X size={20} />
          </button>
        </div>

        {/* Cart Message */}
        {cartMessage && (
          <div className="mx-5 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-[10px] font-bold dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle size={14} />
            {cartMessage}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-theme-muted space-y-3.5">
              <div className="w-16 h-16 bg-primary-50 dark:bg-[#1E2229] border border-theme-border rounded-xl flex items-center justify-center text-primary-400 select-none">
                <ShoppingBag size={28} />
              </div>
              <p className="font-serif font-bold text-xs uppercase tracking-wide text-theme-text">{t('cart_empty')}</p>
              <button onClick={() => { playPop(); toggleSidebar(); }} className="text-primary-400 text-xs hover:text-primary-500 font-bold underline underline-offset-4 cursor-pointer font-serif uppercase tracking-wider">
                {t('cart_continue')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const { unitPrice, appliedOffer, lineTotal, originalTotal, itemSavings } = calculateItemPrice(item);
                const isBelowMin = item.quantity < item.minQty;
                return (
                  <div key={item.key} className={`flex gap-4 border-b border-theme-border pb-4 ${isBelowMin ? 'bg-red-50 dark:bg-red-950/20 -mx-2 px-2 py-2 rounded-lg border border-red-200 dark:border-red-800' : ''}`}>
                    <div className="w-16 h-16 bg-[#FAF7F2] dark:bg-[#1E2229] border border-theme-border rounded-lg overflow-hidden flex-shrink-0 p-1">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" loading="lazy" decoding="async" width="64" height="64" onError={(e) => { e.target.src = '/logo.png'; }} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif font-bold text-theme-text leading-tight text-xs uppercase tracking-wider truncate">{item.name}</h3>
                            <p className="text-[9px] text-theme-muted font-bold mt-0.5">
                              {item.sizeLabel} ({item.sizeCm})
                            </p>
                          </div>
                          <button onClick={() => removeFromCart(item.key)} className="text-theme-muted hover:text-primary-400 cursor-pointer p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center" aria-label="Remove">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Price per item */}
                        <div className="mt-1.5">
                          {appliedOffer ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-muted line-through font-bold">{originalTotal} DH</span>
                              <span className="text-xs font-serif font-bold text-green-600">{lineTotal} DH</span>
                              <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold dark:bg-green-900 dark:text-green-300">-{itemSavings} DH</span>
                            </div>
                          ) : (
                            <p className="text-primary-400 font-serif font-bold text-xs">{lineTotal} DH</p>
                          )}
                        </div>

                        {/* Offer badge */}
                        {appliedOffer && (
                          <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-green-600">
                            <Sparkles size={10} />
                            <span>{appliedOffer.label}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center border border-theme-border w-fit rounded bg-theme-bg overflow-hidden p-0.5 mt-1.5">
                        <button onClick={() => updateQuantity(item.key, -1)} className="w-9 h-9 flex items-center justify-center text-theme-text hover:text-primary-400 cursor-pointer font-bold text-xs">
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-[11px] font-bold text-theme-text font-serif">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, 1)} className="w-9 h-9 flex items-center justify-center text-theme-text hover:text-primary-400 cursor-pointer font-bold text-xs">
                          <Plus size={12} />
                        </button>
                      </div>
                      {isBelowMin && (
                        <p className="text-[9px] text-red-500 font-bold mt-1">الحد الأدنى: {item.minQty} {item.sizeLabel}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-theme-border bg-theme-bg">
            {/* Coupon */}
            <form onSubmit={handleApplyCoupon} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('cart_coupon_placeholder')}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="bg-theme-surface border-2 border-theme-border focus:border-primary-450 outline-none flex-1 text-xs text-theme-text placeholder-theme-muted px-4 py-3 rounded-lg font-bold shadow-sm min-h-[44px]"
                />
                <button type="submit" className="bg-lavender-300 hover:bg-lavender-450 text-white px-4 py-3 min-h-[44px] rounded-lg border border-lavender-400 font-serif font-bold text-xs shadow-[0_3px_0_#B57F20] active:translate-y-0.5 cursor-pointer">
                  {t('cart_coupon_btn')}
                </button>
              </div>
              {couponError && <p className="text-primary-400 text-[10px] font-bold mt-1 px-3 font-serif">{couponError}</p>}
            </form>

            {activeDiscountCode && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg mb-4 text-[10px] font-bold dark:bg-green-950/40 dark:text-green-300">
                <span className="flex items-center gap-1 font-serif">
                  <Tag size={12} className="text-green-500" />
                  <strong>{activeDiscountCode}</strong> (-{(activeDiscountPercentage * 100)}%)
                </span>
                <button type="button" onClick={removeDiscountCode} className="text-red-500 hover:text-red-700 font-bold uppercase tracking-wider text-[9px] cursor-pointer min-h-[36px] px-2">
                  Retirer
                </button>
              </div>
            )}

            {/* Applied Offers */}
            {appliedOffers.length > 0 && (
              <div className="mb-4 space-y-2">
                {appliedOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-[10px] font-bold dark:bg-green-950/40 dark:text-green-300">
                    <Sparkles size={12} className="text-green-500" />
                    <span className="font-serif">{offer.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1.5 mb-4 border-b border-theme-border pb-3 text-xs font-bold text-theme-text">
              {savings > 0 && (
                <div className="flex justify-between items-center text-theme-muted">
                  <span>الأصلية</span>
                  <span className="font-serif line-through">{originalSubtotal} DH</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>المجموع</span>
                <span className="font-serif">{subtotal} DH</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-1"><Sparkles size={12} /> وفّر</span>
                  <span className="font-serif">-{savings} DH</span>
                </div>
              )}
              {activeDiscountCode && (
                <div className="flex justify-between items-center text-green-600">
                  <span>الخصم</span>
                  <span className="font-serif">-{discountedAmount.toFixed(0)} DH</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>التوصيل</span>
                <span className="font-serif">{deliveryFee} DH</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-5">
              <span className="text-theme-text font-serif font-bold text-xs uppercase tracking-wider">الإجمالي</span>
              <span className="font-serif text-xl font-bold text-primary-400">{finalTotal.toFixed(0)} DH</span>
            </div>

            <button onClick={() => { playPop(); toggleSidebar(); navigate('/checkout'); }} className="btn-primary w-full py-3.5 text-xs shadow-[0_4px_0_#911616] justify-center">
              {t('cart_checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

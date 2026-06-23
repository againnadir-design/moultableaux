import { useState, useMemo, useEffect } from 'react';
import { Heart, ShoppingCart, ArrowLeft, Star, MessageSquarePlus, Sparkles, MessageCircle, Truck, PackageCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    setPage,
    toggleWishlist,
    inWishlist,
    playPop,
    playSuccess,
  } = useApp();
  const { addToCart, SIZES } = useCart();

  const product = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState('small');
  const [quantity, setQuantity] = useState(1);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });

  useEffect(() => {
    setReviewsList(product.reviews || []);
    setActiveImage(product.image);
    setQuantity(SIZES[selectedSize].minQty);
  }, [product]);

  const isFav = inWishlist(product.id);
  const sizeInfo = SIZES[selectedSize];
  const currentPrice = sizeInfo.price * quantity;

  const thumbnails = [
    { id: 1, url: product.image, label: 'Vue Face' },
    { id: 2, url: product.image, label: 'Gros Plan', filter: 'brightness(1.05) contrast(1.05)' },
    { id: 3, url: product.image, label: 'Mise en situation', filter: 'saturate(0.9)' }
  ];

  const handleAddToCart = () => {
    playPop();
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
  };

  const handleBuyNow = () => {
    playSuccess();
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setTimeout(() => navigate('/checkout'), 300);
  };

  const handleWhatsAppOrder = () => {
    playSuccess();
    const message = `Bonjour Moul Tableaux ! Je souhaite commander :
- *Nom* : ${product.name}
- *Taille* : ${sizeInfo.label} (${sizeInfo.size})
- *Quantite* : ${quantity}
- *Prix Total* : ${currentPrice} DH
Merci de confirmer !`;
    window.open(`https://wa.me/212623391688?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewText) return;
    playPop();
    setReviewsList([{
      id: Date.now(),
      author: newReviewAuthor,
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      text: newReviewText
    }, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewRating(5);
    setNewReviewText('');
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.5)' });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const relatedProducts = useMemo(() => {
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [products, product]);

  return (
    <div className="pt-24 pb-16 vintage-texture min-h-screen">
      <div className="container-custom">
        <button
          onClick={() => { playPop(); setPage('shop'); }}
          className="flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-theme-text hover:text-primary-400 mb-6 group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          {/* Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-[#FAF7F2] dark:bg-[#1E2229] border-2 border-theme-border rounded-xl overflow-hidden aspect-square relative shadow-theme-shadow p-3">
              <div
                className="w-full h-full border border-dashed border-[#2B2B2B]/20 rounded overflow-hidden relative cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-75 select-none"
                  loading="eager"
                  decoding="async"
                  width="600"
                  height="600"
                  style={{ ...zoomStyle, filter: thumbnails.find(t => t.url === activeImage)?.filter || 'none' }}
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              {thumbnails.map((thumb) => (
                <button
                  key={thumb.id}
                  onClick={() => { playPop(); setActiveImage(thumb.url); }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-white p-0.5 ${
                    activeImage === thumb.url ? 'border-primary-400 scale-105 shadow-sm' : 'border-theme-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={thumb.url} alt={thumb.label} className="w-full h-full object-cover rounded" style={{ filter: thumb.filter }} loading="lazy" decoding="async" width="64" height="64" onError={(e) => { e.target.src = '/logo.png'; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] bg-primary-50 text-primary-500 border border-primary-200 px-3 py-1 rounded font-bold uppercase tracking-wider dark:bg-[#1E2229]">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="text-[9px] bg-lavender-100 text-lavender-800 border border-lavender-200 px-3 py-1 rounded font-bold uppercase tracking-wider dark:bg-[#1E2229]">
                    {product.badge === 'new' ? t('badge_new') : t('badge_bestseller')}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl md:text-4xl font-bold text-theme-text mb-3 leading-tight uppercase tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-1.5 mb-5">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-xs text-theme-text font-bold">({product.rating} / 5.0)</span>
                <span className="text-theme-muted text-xs font-bold font-serif">| {reviewsList.length} Avis</span>
              </div>

              {/* Size Selector */}
              <div className="mb-5">
                <label className="text-[10px] text-theme-text uppercase font-bold block mb-2">Taille</label>
                <div className="flex gap-2">
                  {Object.entries(SIZES).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => { playPop(); setSelectedSize(key); setQuantity(s.minQty); }}
                      className={`flex-1 py-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
                        selectedSize === key
                          ? 'bg-primary-400 border-primary-500 text-white shadow-[0_3px_0_#911616]'
                          : 'bg-theme-surface border-theme-border text-theme-text hover:border-primary-300'
                      }`}
                    >
                      <span className="block font-serif font-bold text-xs">{s.label}</span>
                      <span className="block text-[9px] opacity-80">{s.size}</span>
                      <span className="block font-bold text-sm mt-0.5">{s.price} DH</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-theme-muted font-bold mt-1.5">
                  Min: {sizeInfo.minQty} | {sizeInfo.minQty} x {sizeInfo.price} DH = {sizeInfo.minQty * sizeInfo.price} DH
                </p>
              </div>

              {/* Price */}
              <div className="inline-block bg-[#FAF7F2] dark:bg-[#1E2229] border-2 border-theme-border py-2.5 px-6 rounded-lg mb-5 shadow-sm">
                <span className="font-serif text-2xl font-bold text-primary-400">{currentPrice} DH</span>
                <span className="text-[9px] text-theme-muted font-bold block mt-0.5">
                  {quantity} x {sizeInfo.price} DH ({sizeInfo.label})
                </span>
              </div>

              <p className="text-theme-text font-medium text-xs leading-relaxed mb-6">{product.description}</p>
            </div>

            {/* Controls */}
            <div className="space-y-4 pt-4 border-t border-theme-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-theme-border rounded-lg p-0.5 bg-theme-surface">
                  <button
                    onClick={() => { playPop(); setQuantity(prev => Math.max(sizeInfo.minQty, prev - 1)); }}
                    className="w-8 h-8 rounded flex items-center justify-center text-theme-text hover:bg-theme-bg cursor-pointer font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-theme-text font-serif">{quantity}</span>
                  <button
                    onClick={() => { playPop(); setQuantity(prev => prev + 1); }}
                    className="w-8 h-8 rounded flex items-center justify-center text-theme-text hover:bg-theme-bg cursor-pointer font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors ${
                    isFav ? 'bg-primary-50 border-primary-300 text-primary-500 dark:bg-primary-950' : 'bg-white border-theme-border text-theme-text dark:bg-[#1E2229]'
                  }`}
                >
                  <Heart size={14} className={isFav ? 'fill-primary-400 text-primary-400' : ''} />
                  {isFav ? 'Favorise' : 'Favoris'}
                </button>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleAddToCart} className="btn-outline flex-1 py-3.5 text-xs shadow-[0_4px_0_#EADEC9] flex justify-center items-center gap-2 uppercase font-serif">
                    <ShoppingCart size={14} /> Ajouter au Panier
                  </button>
                  <button onClick={handleBuyNow} className="btn-primary flex-1 py-3.5 text-xs shadow-[0_4px_0_#911616] flex justify-center items-center gap-2 uppercase font-serif">
                    Achat Immadiat
                  </button>
                </div>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-serif font-bold transition-all shadow-[0_4px_0_#1b7a3d] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer uppercase tracking-wider"
                >
                  <MessageCircle size={16} /> Commander via WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-theme-border text-[10px] font-bold text-theme-muted">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-primary-400" />
                  <span>Livraison: 2 a 4 jours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PackageCheck size={14} className="text-primary-400" />
                  <span>Chassis bois solide</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-theme-border pt-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-serif text-lg font-bold text-theme-text uppercase tracking-wider flex items-center gap-1.5 mb-4">
                Avis Clients <Sparkles className="text-primary-400 animate-sparkle" size={16} />
              </h3>
              {reviewsList.length === 0 ? (
                <p className="text-theme-muted text-xs italic font-bold">Aucun avis pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="bg-theme-card border-2 border-theme-border rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-xs text-theme-text block">{rev.author}</span>
                          <span className="text-[9px] text-theme-muted font-bold font-serif">{rev.date}</span>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-theme-text text-xs leading-relaxed font-medium italic">"{rev.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-theme-surface border-2 border-theme-border rounded-xl p-5 shadow-theme-shadow">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-theme-text flex items-center gap-1.5 mb-4">
                Rediger un avis <MessageSquarePlus size={16} className="text-primary-400" />
              </h4>
              <form onSubmit={handleAddReview} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Votre Nom</label>
                  <input type="text" required value={newReviewAuthor} onChange={(e) => setNewReviewAuthor(e.target.value)} placeholder="Ex: Tariq"
                    className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Note</label>
                  <div className="flex gap-1.5 text-gray-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => { playPop(); setNewReviewRating(star); }} className="cursor-pointer">
                        <Star size={18} className={star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-border'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Details</label>
                  <textarea required value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Partagez votre avis..." rows="3"
                    className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 text-xs cursor-pointer shadow-[0_3px_0_#911616] uppercase font-serif">
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-theme-border pt-12">
            <h3 className="font-serif text-lg font-bold text-theme-text uppercase tracking-wider flex items-center justify-center gap-1.5 mb-8">
              Similaires <Sparkles className="text-primary-400 animate-sparkle" size={18} />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => { setSelectedProductId(rel.id); playPop(); }}
                  className="group bg-theme-card border-2 border-theme-border rounded-xl overflow-hidden shadow-theme-shadow hover:translate-y-[-4px] transition-all duration-300 cursor-pointer p-1.5"
                >
                  <div className="aspect-square bg-[#FAF7F2] dark:bg-[#1E2229] overflow-hidden border border-theme-border rounded-lg">
                    <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" loading="lazy" decoding="async" width="300" height="300" onError={(e) => { e.target.src = '/logo.png'; }} />
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="font-serif font-bold text-xs text-theme-text truncate group-hover:text-primary-400 uppercase tracking-wider">{rel.name}</h4>
                    <span className="font-serif text-[10px] font-bold text-primary-400 block mt-1">A partir de {SIZES.small.price} DH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

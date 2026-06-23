import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { addToCart, SIZES } = useCart();
  const { t } = useLanguage();
  const { toggleWishlist, inWishlist, setPage, setSelectedProductId, playPop } = useApp();
  const [selectedSize, setSelectedSize] = useState('small');

  const isFav = inWishlist(product.id);

  const getBadgeLabel = (badge) => {
    if (badge === 'new') return t('badge_new');
    if (badge === 'bestseller') return t('badge_bestseller');
    return null;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    playPop();
    addToCart(product, selectedSize);
  };

  const handleProductClick = () => {
    setSelectedProductId(product.id);
    setPage('product');
  };

  return (
    <div
      onClick={handleProductClick}
      className="group bg-theme-card border-2 border-theme-border rounded-xl overflow-hidden shadow-theme-shadow hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 cursor-pointer relative"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#FAF7F2] dark:bg-[#1E2229] overflow-hidden border-b-2 border-theme-border">
        <picture>
          <source
            srcSet={`${product.image?.replace(/\.\w+$/, '.webp') || product.image} 400w, ${product.image?.replace(/\.\w+$/, '.webp') || product.image} 800w`}
            type="image/webp"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            width="400"
            height="400"
          />
        </picture>

        {product.badge && (
          <span className={`absolute top-2 left-2 text-[8px] font-bold uppercase px-2 py-0.5 rounded z-10 select-none ${
            product.badge === 'new'
              ? 'bg-lavender-300 border border-lavender-400 text-white'
              : 'bg-primary-400 border border-primary-500 text-white'
          }`}>
            {getBadgeLabel(product.badge)}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-[#1E2229]/90 flex items-center justify-center shadow-md cursor-pointer border border-theme-border"
          aria-label="Wishlist"
        >
          <Heart size={14} className={isFav ? 'fill-primary-400 text-primary-400' : 'text-gray-400'} />
        </button>
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="font-serif font-bold text-[11px] text-theme-text truncate group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>

        {/* Size Selector */}
        <div className="flex gap-1.5 mt-2">
          {Object.entries(SIZES).map(([key, s]) => (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); setSelectedSize(key); }}
              className={`flex-1 py-1.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                selectedSize === key
                  ? 'bg-primary-400 border-primary-500 text-white'
                  : 'bg-theme-bg border-theme-border text-theme-text hover:border-primary-300'
              }`}
            >
              {s.label} {s.price} DH
            </button>
          ))}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between mt-2.5">
          <div>
            <span className="font-serif text-sm font-bold text-primary-400">
              {SIZES[selectedSize].price} DH
            </span>
            <span className="block text-[8px] text-theme-muted font-bold">
              Min: {SIZES[selectedSize].minQty} units
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 rounded-lg bg-primary-400 hover:bg-primary-500 flex items-center justify-center shadow cursor-pointer text-white"
            aria-label="Add to cart"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  const { products, setPage, playPop } = useApp();
  const { t } = useLanguage();

  const featured = products.slice(0, 8);

  return (
    <section id="featured" className="py-12 sm:py-16 bg-theme-surface border-b border-theme-border">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 border-b border-theme-border pb-4">
          <div className="text-center md:text-start">
            <h2 className="section-heading mb-1">{t('products_title')}</h2>
            <p className="text-theme-muted text-xs font-bold">{t('products_subtitle')}</p>
          </div>
          <button
            onClick={() => { playPop(); setPage('shop'); }}
            className="text-xs font-serif font-bold uppercase tracking-wider text-primary-400 hover:text-primary-500 transition-colors mt-3 md:mt-0 border-b-2 border-primary-200 hover:border-primary-400 pb-0.5 cursor-pointer"
          >
            {t('products_view_all')}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

import { useState, useMemo, useEffect } from 'react';
import { Heart, ShoppingCart, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const ShopProductCard = ({ product }) => {
  const { addToCart, SIZES } = useCart();
  const { t } = useLanguage();
  const { toggleWishlist, inWishlist, setPage, setSelectedProductId, playPop } = useApp();
  const [selectedSize, setSelectedSize] = useState('small');

  const isFav = inWishlist(product.id);

  return (
    <div
      onClick={() => { setSelectedProductId(product.id); setPage('product'); }}
      className="group bg-theme-card border-2 border-theme-border rounded-xl overflow-hidden shadow-theme-shadow hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 cursor-pointer relative"
    >
      <div className="relative aspect-square bg-[#FAF7F2] dark:bg-[#1E2229] overflow-hidden border-b-2 border-theme-border">
        <picture>
          <source
            srcSet={`${product.image?.replace(/\.\w+$/, '.webp') || product.image} 400w, ${product.image?.replace(/\.\w+$/, '.webp') || product.image} 800w`}
            type="image/webp"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
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
            {product.badge === 'new' ? t('badge_new') : t('badge_bestseller')}
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

      <div className="p-3">
        <h3 className="font-serif font-bold text-[11px] text-theme-text truncate group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>

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

        <div className="flex items-center justify-between mt-2.5">
          <div>
            <span className="font-serif text-sm font-bold text-primary-400">
              {SIZES[selectedSize].price} DH
            </span>
            <span className="block text-[8px] text-theme-muted font-bold">
              Min: {SIZES[selectedSize].minQty}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); playPop(); addToCart(product, selectedSize); }}
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

const ShopPage = () => {
  const { t } = useLanguage();
  const { products, wishlist, toggleWishlist, playPop } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const savedCat = sessionStorage.getItem('shop_selected_category');
    if (savedCat) {
      setActiveCategory(savedCat);
      sessionStorage.removeItem('shop_selected_category');
    }
    const savedQuery = sessionStorage.getItem('shop_search_query');
    if (savedQuery) {
      setSearchQuery(savedQuery);
      sessionStorage.removeItem('shop_search_query');
    }
  }, []);

  const { categories: dbCategories } = useApp();

  const categories = [
    { id: 'all', label: 'Tous' },
    ...dbCategories.map(c => ({ id: c.slug, label: c.name })),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (activeCategory !== 'all' && prod.category !== activeCategory) return false;
      if (showOnlyWishlist && !useApp.getState().inWishlist(prod.id)) return false;
      if (searchQuery && !prod.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return b.id - a.id;
    });
  }, [products, activeCategory, sortBy, showOnlyWishlist, wishlist, searchQuery]);

  return (
    <div className="pt-24 pb-16 min-h-screen vintage-texture">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h1 className="section-heading text-2xl sm:text-4xl uppercase tracking-wide">
            {t('products_title')}
          </h1>
          <p className="text-theme-muted text-xs font-bold max-w-md mx-auto mt-2">
            {t('products_subtitle')}
          </p>
          <div className="w-16 h-0.5 bg-primary-400 mx-auto mt-4"></div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative mb-6">
          <input
            type="text"
            placeholder={t('nav_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-surface border-2 border-theme-border focus:border-primary-400 rounded-lg px-5 py-3 outline-none text-xs text-theme-text placeholder-theme-muted font-bold shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-primary-400 font-bold text-xs cursor-pointer"
            >
              X
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide sm:flex-wrap sm:justify-center mb-8 -mx-5 px-5 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { playPop(); setActiveCategory(cat.id); }}
              className={`shrink-0 px-4 py-2.5 min-h-[40px] rounded-lg border-2 text-[10px] uppercase font-serif font-bold tracking-wider cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary-400 border-primary-500 text-white shadow-[0_3px_0_#911616]'
                  : 'bg-theme-surface border-theme-border text-theme-text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Mobile Sort */}
        <div className="flex gap-3 mb-6 lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-theme-surface border-2 border-theme-border rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            <SlidersHorizontal size={14} className="text-primary-400" />
            Filtres
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-theme-surface border-2 border-theme-border text-[10px] uppercase font-bold px-3 rounded-xl outline-none focus:border-primary-400 min-h-[44px]"
          >
            <option value="popularity">Populaire</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix decroissant</option>
            <option value="rating">Note</option>
          </select>
        </div>

        {/* Desktop Sidebar */}
        {mobileFiltersOpen && (
          <div className="lg:hidden mb-6 bg-theme-surface border-2 border-theme-border rounded-xl p-5">
            <div className="flex items-center gap-2 border-b border-theme-border pb-3 mb-4">
              <SlidersHorizontal size={16} className="text-primary-400" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">Filtrer</h3>
            </div>
            <button
              onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                showOnlyWishlist
                  ? 'bg-primary-50 border-primary-300 text-primary-500'
                  : 'bg-transparent border-theme-border text-theme-text'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Heart size={14} className={showOnlyWishlist ? 'fill-primary-400 text-primary-400' : ''} />
                Favoris Uniquement
              </span>
            </button>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-theme-surface border-2 border-dashed border-theme-border rounded-xl p-10 text-center">
            <AlertCircle size={40} className="text-primary-400/40 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-base mb-1 uppercase">Aucun tableau trouve</h4>
            <p className="text-theme-muted text-[11px] font-semibold max-w-xs mx-auto mb-4">
              Essayez de reinitialiser les filtres.
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setShowOnlyWishlist(false); setSearchQuery(''); }}
              className="btn-outline px-5 py-2 text-[10px]"
            >
              Reinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

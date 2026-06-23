import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const Categories = () => {
  const { t } = useLanguage();
  const { setPage, playPop, categories } = useApp();

  const BLANK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f0e8' stroke='%23d4c5a9' stroke-width='2' stroke-dasharray='8 4'/%3E%3Ctext x='200' y='200' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='14' fill='%23b0a48a'%3EImage à venir%3C/text%3E%3C/svg%3E";

  const displayCategories = categories.map(cat => ({
    id: cat.slug,
    title: cat.name,
    image: cat.image || BLANK,
    desc: cat.description || '',
  }));

  const handleCategoryClick = (catId) => {
    playPop();
    setPage('shop');
    sessionStorage.setItem('shop_selected_category', catId);
  };

  return (
    <section id="categories" className="py-16 bg-theme-surface border-b border-theme-border">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-heading">{t('categories_title')}</h2>
          <p className="text-theme-muted text-xs font-bold max-w-sm mx-auto mt-2">
            {t('categories_subtitle')}
          </p>
          <div className="w-16 h-0.5 bg-primary-400 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {displayCategories.map((category) => (
            <button 
              onClick={() => handleCategoryClick(category.id)}
              key={category.id} 
              className="group block relative aspect-square overflow-hidden rounded-xl border-2 border-theme-border bg-theme-bg shadow-sm cursor-pointer hover:translate-y-[-5px] hover:shadow-md transition-all duration-300"
            >
              <div className="absolute inset-0 z-0 bg-[#FAF7F2]">
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="400"
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>

              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-20 flex flex-col items-center text-center">
                <h3 className="text-white text-[11px] sm:text-xs md:text-sm font-serif font-bold uppercase tracking-wider mb-1">
                  {category.title}
                </h3>
                {category.desc && (
                  <p className="text-white/60 text-[8px] sm:text-[9px] md:text-[9px] font-sans font-medium line-clamp-1 max-w-[90%] mb-2 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-300">
                    {category.desc}
                  </p>
                )}
                <span className="text-white bg-primary-400 hover:bg-primary-500 text-[8px] sm:text-[9px] md:text-[9px] uppercase tracking-widest px-3 py-1.5 rounded font-bold border border-primary-500 hover:scale-102 transition-transform duration-200 min-h-[28px] sm:min-h-[32px] sm:opacity-0 sm:group-hover:opacity-100 sm:transition-all sm:duration-300">
                  {t('category_explore')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;

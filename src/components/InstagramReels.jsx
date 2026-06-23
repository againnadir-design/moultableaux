import { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const REELS = [
  { id: 1, url: 'https://www.instagram.com/reel/DZvM00rsvmA/' },
  { id: 2, url: 'https://www.instagram.com/reel/DZstE9jMKiu/' },
  { id: 3, url: 'https://www.instagram.com/reel/DZavAwZsX8Q/' },
  { id: 4, url: 'https://www.instagram.com/reel/DZLWCFPM1TB/' },
  { id: 5, url: 'https://www.instagram.com/reel/DYfP-rtseYJ/' },
  { id: 6, url: 'https://www.instagram.com/reel/DYcVzVJsSc7/' },
  { id: 7, url: 'https://www.instagram.com/reel/DYaVym2sxVe/' },
];

const InstagramReels = () => {
  const { playPop } = useApp();
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth || 200;
    el.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' });
  };

  return (
    <section id="gallery-section" className="py-12 sm:py-16 bg-theme-surface border-b border-theme-border overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#E1306C] via-[#F77737] to-[#FCAF45] flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-5.5 sm:h-5.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
            </svg>
          </div>
          <h2 className="font-serif font-bold text-theme-text text-lg sm:text-2xl md:text-3xl leading-tight">
            {t('instagram_title')}
          </h2>
          <p className="text-theme-muted text-[11px] sm:text-xs mt-2 max-w-md mx-auto leading-relaxed">
            {t('gallery_subtitle')}
          </p>
          <div className="w-12 sm:w-16 h-0.5 bg-primary-400 mx-auto mt-4" />
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scroll arrows — desktop only */}
          {canScrollLeft && (
            <button
              onClick={() => scroll(-1)}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-9 h-9 rounded-full bg-theme-surface border border-theme-border shadow-md items-center justify-center text-theme-text hover:text-primary-400 hover:border-primary-400 transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll(1)}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-9 h-9 rounded-full bg-theme-surface border border-theme-border shadow-md items-center justify-center text-theme-text hover:text-primary-400 hover:border-primary-400 transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Scrollable reel cards */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:pb-0 md:snap-none"
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {REELS.map((reel, idx) => (
              <a
                key={reel.id}
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playPop}
                className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-auto md:snap-align-none group"
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-theme-border bg-gradient-to-br from-primary-100 via-primary-50 to-lavender-100 dark:from-primary-900 dark:via-primary-950 dark:to-lavender-800 shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300">
                  {/* Reel icon placeholder */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-bold text-primary-400 dark:text-primary-300 uppercase tracking-wider">Reel</span>
                  </div>

                  {/* Instagram badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="5" />
                    </svg>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <div className="flex items-center gap-1.5 text-white">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span className="text-[10px] font-serif font-bold">Watch</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8 sm:mt-10">
          <a
            href="https://www.instagram.com/moultableaux/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playPop}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#E1306C] via-[#F77737] to-[#FCAF45] text-white font-serif font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:scale-[1.03] transition-all duration-200 shadow-[0_3px_0_rgba(0,0,0,0.15)] active:translate-y-0.5 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
            </svg>
            {t('gallery_cta')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramReels;

import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useEffect, useRef } from 'react';

// ── Full-coverage street poster wall ──
// 4 rows × 7 columns = 28 poster slots, cycling through 16 images.
// Every slot is filled. No empty space. Images repeat (browser caches, no extra downloads).
const IMGS = [
  '/img1', '/img2', '/img3', '/img4', '/img5', '/img6', '/img7', '/img8',
  '/img9', '/img10', '/img11', '/img12', '/img13', '/img14', '/img15', '/img16',
];

// Column left positions (%). 7 cols filling 0–100%.
const COLS = [0, 14.2, 28.5, 42.8, 57.1, 71.4, 85.7];
// Row top positions (%). 4 rows filling 0–100%.
const ROWS = [0, 24, 48, 72];

// Rotation & z-index per slot (deterministic variety)
const VARIANTS = [
  { rot: -3, z: 2 }, { rot: 4, z: 1 }, { rot: -1, z: 3 }, { rot: 5, z: 2 },
  { rot: -4, z: 1 }, { rot: 2, z: 3 }, { rot: -2, z: 2 },
  { rot: 3, z: 3 }, { rot: -5, z: 1 }, { rot: 4, z: 2 }, { rot: -2, z: 3 },
  { rot: 5, z: 1 }, { rot: -3, z: 2 }, { rot: 1, z: 3 },
  { rot: -4, z: 2 }, { rot: 3, z: 1 }, { rot: -1, z: 3 }, { rot: 5, z: 2 },
  { rot: -2, z: 1 }, { rot: 4, z: 3 }, { rot: -5, z: 2 },
  { rot: 2, z: 3 }, { rot: -3, z: 1 }, { rot: 4, z: 2 }, { rot: -1, z: 3 },
  { rot: 5, z: 1 }, { rot: -2, z: 2 }, { rot: 3, z: 3 },
];

// Float classes staggered across the grid — only SOME posters move
const FLOAT_CLASSES = [
  '', 'poster-float-1', '', '', 'poster-float-2', '', 'poster-float-3',
  '', '', 'poster-float-2', '', 'poster-float-1', '', '',
  'poster-float-3', '', '', 'poster-float-1', '', '', 'poster-float-2',
  '', '', 'poster-float-1', '', '', 'poster-float-3', '',
];

// Animation delays per poster for organic staggering
const FLOAT_DELAYS = [
  0, 2.5, 0, 0, 5, 0, 3.5,
  0, 0, 7, 0, 1, 0, 0,
  4, 0, 0, 8.5, 0, 0, 6,
  0, 0, 10, 0, 0, 2, 0,
];

// ── Auto-adaptive tier system ──
// 'a' = always visible (12 center posters — cols 2,3,4)
// 'b' = tablet + desktop only (8 mid-edge posters — cols 1,5)
// 'c' = desktop only (8 outer-edge posters — cols 0,6)
// Desktop: 28 | Tablet: 20 | Mobile: 12
const POSTER_TIER = [
  'c', 'b', 'a', 'a', 'a', 'b', 'c',
  'c', 'b', 'a', 'a', 'a', 'b', 'c',
  'c', 'b', 'a', 'a', 'a', 'b', 'c',
  'c', 'b', 'a', 'a', 'a', 'b', 'c',
];

// Build the grid: 28 posters, each assigned an image cycling through IMGS
const GRID = [];
for (let row = 0; row < ROWS.length; row++) {
  for (let col = 0; col < COLS.length; col++) {
    const idx = row * COLS.length + col;
    const imgIdx = idx % IMGS.length;
    const v = VARIANTS[idx];
    GRID.push({
      src: IMGS[imgIdx] + '.webp',
      fb: IMGS[imgIdx] + '.jpg',
      top: `${ROWS[row]}%`,
      left: `${COLS[col]}%`,
      rot: v.rot,
      z: v.z,
      floatClass: FLOAT_CLASSES[idx],
      floatDelay: FLOAT_DELAYS[idx],
      tier: POSTER_TIER[idx],
    });
  }
}

const Poster = ({ src, fb, top, left, rot, z, floatClass, floatDelay, tier }) => (
  <div
    className={`absolute poster-tier-${tier}`}
    style={{ top, left, zIndex: z }}
  >
    <div
      className={floatClass || undefined}
      style={{
        width: 'clamp(100px, 14.8vw, 220px)',
        aspectRatio: '3 / 4',
        transform: `rotate(${rot}deg)`,
        '--base-rot': `${rot}deg`,
        borderRadius: '2px',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.75)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)',
        filter: 'brightness(0.88) saturate(0.92)',
        opacity: 0.7,
        animationDelay: floatClass ? `${floatDelay}s` : undefined,
      }}
    >
      <picture>
        <source srcSet={`${src} 400w, ${src} 800w`} type="image/webp" sizes="(max-width: 768px) 28vw, 15vw" />
        <img
          src={fb}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          width="200"
          height="267"
        />
      </picture>
    </div>
  </div>
);

const Hero = () => {
  const { t } = useLanguage();
  const { setPage, playPop } = useApp();
  const posterGridRef = useRef(null);

  // Auto-adaptive parallax — desktop: 0.4x, tablet: 0.15x, mobile: none
  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 1025px)');
    const mqTablet = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (posterGridRef.current) {
            const y = window.scrollY;
            if (mqDesktop.matches) {
              posterGridRef.current.style.transform = `translateY(${y * 0.4}px)`;
            } else if (mqTablet.matches) {
              posterGridRef.current.style.transform = `translateY(${y * 0.15}px)`;
            }
            // Mobile: no transform applied
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShopClick = () => {
    playPop();
    setPage('shop');
  };

  return (
    <section className="relative w-full h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden">

      {/* ── Wall base — warm dark brown, NOT pure black ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #2A1E18 0%, #1A1210 40%, #110C09 100%)',
        }}
      />

      {/* ── Full poster grid — 28 posters covering entire viewport ── */}
      <div ref={posterGridRef} className="absolute inset-0 z-[1] will-change-transform poster-grid">
        {GRID.map((item, i) => (
          <Poster key={i} {...item} />
        ))}
      </div>

      {/* ── Warm glow — soft brand-colored light pulsing behind collage ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none warm-glow-pulse"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(181,74,58,0.12) 0%, rgba(212,160,48,0.06) 35%, transparent 65%)',
        }}
      />

      {/* ── Warmth overlay — removes cold black feeling ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(170deg, rgba(181,74,58,0.04) 0%, rgba(212,160,48,0.03) 50%, rgba(42,30,24,0.06) 100%)',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* ── Vignette — darken edges only ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(17,12,9,0.5) 70%, rgba(17,12,9,0.85) 100%)',
        }}
      />

      {/* ── Grain texture — subtle on desktop, lighter on mobile ── */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Center dark spot — keeps logo readable on all screens ── */}
      <div
        className="absolute z-[4] pointer-events-none"
        style={{
          width: 'min(380px, 65vw)',
          height: 'min(380px, 65vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(17,12,9,0.8) 0%, rgba(17,12,9,0.5) 35%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-[5] flex flex-col items-center justify-center text-center px-6 gap-6 sm:gap-7 max-w-xl mx-auto">

        {/* Logo */}
        <div
          className="hero-logo-entrance pointer-events-none"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          <div className="hero-logo-breathe relative">
            <div
              className="absolute inset-0 -m-5 sm:-m-7 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(181,74,58,0.3) 0%, rgba(212,160,48,0.12) 45%, transparent 72%)',
                filter: 'blur(24px)',
              }}
            />
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="Moul Tableaux"
                className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 object-contain pointer-events-none"
                style={{
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6)) drop-shadow(0 10px 28px rgba(0,0,0,0.4)) drop-shadow(0 0 40px rgba(181,74,58,0.15))',
                }}
                loading="eager"
                decoding="async"
                width="240"
                height="240"
              />
            </picture>
          </div>
        </div>

        {/* Brand message */}
        <p
          className="text-[11px] sm:text-xs md:text-sm text-white/50 font-semibold tracking-[0.25em] uppercase max-w-sm leading-relaxed hero-fade-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
        >
          {t('hero_tagline')}
        </p>

        {/* Primary CTA */}
        <div
          className="hero-fade-up relative z-10"
          style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
        >
          <button
            onClick={handleShopClick}
            className="group relative px-10 py-4 sm:px-12 sm:py-4.5 min-h-[48px] bg-[#B54A3A] hover:bg-[#C85A3A] text-white font-serif font-bold text-sm sm:text-base rounded-2xl transition-all duration-300 hover:scale-[1.04] cursor-pointer overflow-hidden"
            style={{
              boxShadow: '0 0 24px rgba(181,74,58,0.4), 0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
              }}
            />
            <span className="relative flex items-center gap-2">
              {t('hero_cta')}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Secondary micro-link */}
        <button
          onClick={() => { playPop(); const el = document.getElementById('gallery-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          className="text-[10px] sm:text-[11px] text-white/30 hover:text-white/60 font-semibold tracking-widest uppercase transition-colors duration-300 cursor-pointer hero-fade-up relative z-10"
          style={{ animationDelay: '1.2s', animationFillMode: 'both' }}
        >
          {t('hero_cta_secondary')}
        </button>
      </div>

      {/* ── Bottom fade ── */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-theme-bg via-theme-bg/60 to-transparent z-[6] pointer-events-none" />
    </section>
  );
};

export default Hero;

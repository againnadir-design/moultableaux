import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, ChevronDown, Heart, Sun, Moon, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useAdminAuth } from '../context/AdminAuthContext';

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartItems, toggleSidebar } = useCart();
  const { t, lang, switchLanguage, isRtl } = useLanguage();
  const { page, setPage, themeMode, toggleTheme, wishlist, playPop } = useApp();
  const { isAuthenticated: adminLoggedIn } = useAdminAuth();
  const langRef = useRef(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const currentLang = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (pageName, e) => {
    playPop();
    setMobileMenuOpen(false);

    // If it's a section on the home page
    if (pageName === 'gallery') {
      if (page === 'home') {
        const el = document.getElementById('gallery-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setPage('home');
        setTimeout(() => {
          const el = document.getElementById('gallery-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (pageName === 'reviews') {
      if (page === 'home') {
        const el = document.getElementById('reviews-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setPage('home');
        setTimeout(() => {
          const el = document.getElementById('reviews-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      setPage(pageName);
    }
  };

  const navLinks = [
    { id: 'home', label: t('nav_home') },
    { id: 'shop', label: t('nav_shop') },
    { id: 'custom', label: t('nav_custom') },
    { id: 'gallery', label: t('nav_gallery') },
    { id: 'reviews', label: t('nav_reviews') },
    { id: 'contact', label: t('nav_contact') },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    playPop();
    sessionStorage.setItem('shop_search_query', searchQuery.trim());
    setPage('shop');
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-theme-surface/95 shadow-md py-2 border-b border-theme-border' : 'bg-theme-surface/85 py-3.5'}`}>
        <div className="container-custom flex items-center justify-between">

          {/* Left: Mobile Hamburger + Desktop Nav Links */}
          <div className="flex items-center gap-4 shrink-0 md:flex-1">
            <button
              className="text-theme-text hover:text-primary-400 focus:outline-none md:hidden cursor-pointer p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => { playPop(); setMobileMenuOpen(!mobileMenuOpen); }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop Links Left */}
            <div className="hidden md:flex items-center gap-5 text-xs font-serif font-bold text-theme-text uppercase tracking-wider">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={(e) => handleNavClick(link.id, e)}
                  className={`relative py-1.5 transition-all duration-200 cursor-pointer ${
                    page === link.id 
                      ? 'text-primary-400 scale-105 font-bold border-b-2 border-primary-400' 
                      : 'hover:text-primary-400'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <button 
            onClick={(e) => handleNavClick('home', e)}
            className="shrink-0 mx-2 md:mx-4 cursor-pointer flex items-center justify-center"
          >
            <div className="relative">
              {/* Subtle glow behind logo (desktop only) */}
              <div
                className="absolute inset-0 -m-2 rounded-full pointer-events-none hidden md:block"
                style={{
                  background: 'radial-gradient(circle, rgba(181,74,58,0.18) 0%, transparent 70%)',
                  filter: 'blur(12px)',
                }}
              />
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img 
                  src="/logo.png" 
                  alt="Moul Tableaux" 
                  className="relative h-10 w-10 md:h-11 md:w-11 rounded-full border border-theme-border shadow-sm animate-logo-float hover:scale-105 transition-transform duration-500"
                  width="44"
                  height="44"
                />
              </picture>
            </div>
          </button>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0 md:flex-1 md:justify-end">
            
            {/* Search Icon Toggle */}
            <button 
              onClick={() => { playPop(); setSearchOpen(!searchOpen); }}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-theme-text hover:text-primary-400 transition-colors cursor-pointer rounded-full hover:bg-theme-bg"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Admin Icon - only visible when admin is logged in */}
            {adminLoggedIn && (
              <button 
                onClick={() => { playPop(); navigate('/admin'); }}
                className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-theme-text hover:text-primary-400 transition-colors cursor-pointer rounded-full hover:bg-theme-bg`}
                aria-label="Admin Dashboard"
              >
                <Lock size={20} />
              </button>
            )}

            {/* Wishlist */}
            <button 
              onClick={(e) => handleNavClick('shop', e)}
              className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-theme-text hover:text-primary-400 transition-colors cursor-pointer rounded-full hover:bg-theme-bg"
            >
              <Heart size={20} className={wishlistCount > 0 ? 'fill-primary-400 text-primary-400' : ''} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary-400 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-theme-surface">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button 
              className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-theme-text hover:text-primary-400 transition-colors cursor-pointer rounded-full hover:bg-theme-bg" 
              onClick={() => { playPop(); toggleSidebar(); }}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary-400 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-theme-surface">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => { playPop(); setLangDropdownOpen(!langDropdownOpen); }}
                className="flex items-center gap-0.5 text-theme-text hover:text-primary-400 transition-colors text-xs font-bold cursor-pointer"
              >
                <span className="tracking-wider uppercase">{currentLang.label}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {langDropdownOpen && (
                <div className={`absolute top-full mt-2 bg-theme-card rounded-xl shadow-xl border border-theme-border overflow-hidden min-w-[70px] ${isRtl ? 'left-0' : 'right-0'}`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { switchLanguage(l.code); setLangDropdownOpen(false); playPop(); }}
                      className={`block w-full text-start px-3 py-2 text-xs hover:bg-primary-50 transition-colors cursor-pointer font-bold ${lang === l.code ? 'bg-primary-50 text-primary-500 font-bold' : 'text-theme-text'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-theme-text hover:text-primary-400 transition-colors cursor-pointer rounded-full hover:bg-theme-bg"
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Header WhatsApp Button */}
            <a
              href="https://wa.me/212623391688"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playPop}
              className="hidden sm:inline-flex bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg items-center gap-1.5 text-xs font-serif font-bold transition-all hover:scale-102 hover:shadow-md cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Search Bar Input Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 w-full bg-theme-surface border-t border-theme-border shadow-md">
            <div className="container-custom py-3.5">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b-2 border-primary-200 pb-2">
                <Search size={18} className="text-primary-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t('nav_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs text-theme-text placeholder-theme-muted font-bold font-sans"
                  autoFocus
                />
                <button type="submit" className="bg-primary-400 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider hover:bg-primary-500 cursor-pointer">
                  OK
                </button>
                <button type="button" onClick={() => { playPop(); setSearchOpen(false); }} className="text-theme-muted hover:text-primary-400 cursor-pointer">
                  <X size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-35 bg-black/50 md:hidden" onClick={() => { playPop(); setMobileMenuOpen(false); }}>
          <div
            className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-[280px] h-full bg-theme-surface shadow-2xl pt-20 px-6 flex flex-col border-r border-theme-border`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={(e) => handleNavClick(link.id, e)}
                  className={`block w-full text-start py-3.5 min-h-[44px] text-sm font-serif font-bold uppercase tracking-wider border-b border-theme-border cursor-pointer transition-colors ${page === link.id ? 'text-primary-400 font-bold border-b-2 border-primary-400' : 'text-theme-text hover:text-primary-400'}`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Mobile Admin Dashboard */}
            {adminLoggedIn && (
              <div className="mt-4 pt-4 border-t border-theme-border">
                <button
                  onClick={() => { playPop(); navigate('/admin'); }}
                  className="w-full flex items-center justify-center gap-1.5 py-3 min-h-[44px] border rounded-xl font-bold text-xs border-theme-border text-theme-text hover:border-primary-400 hover:text-primary-400"
                >
                  <Lock size={14} /> Admin
                </button>
              </div>
            )}

            {/* Mobile Language Switcher */}
            <div className="mt-8 pt-6 border-t border-theme-border">
              <p className="text-[10px] uppercase font-bold tracking-widest text-theme-muted mb-3 font-serif">Langue</p>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { switchLanguage(l.code); setMobileMenuOpen(false); playPop(); }}
                    className={`px-4 py-2.5 min-h-[44px] text-xs rounded-lg border transition-all cursor-pointer font-bold ${lang === l.code ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-theme-border text-theme-text hover:border-primary-200'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Link Mobile */}
            <div className="mt-auto mb-8 pt-4">
              <a
                href="https://wa.me/212623391688"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playPop}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 min-h-[48px] rounded-xl flex items-center justify-center gap-2 text-xs font-serif font-bold shadow-md"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

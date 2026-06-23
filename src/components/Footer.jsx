import { Mail, MapPin, Phone, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const Footer = () => {
  const { t } = useLanguage();
  const { setPage, playPop } = useApp();

  const handleNavClick = (pageName, e) => {
    playPop();

    if (pageName === 'gallery') {
      const el = document.getElementById('gallery-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setPage('home');
        setTimeout(() => {
          const el = document.getElementById('gallery-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (pageName === 'reviews') {
      const el = document.getElementById('reviews-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    playPop();
    alert("Merci pour votre inscription ! Vous recevrez bientôt nos offres spéciales. 🎨");
  };

  return (
    <footer className="bg-[#12141C] text-[#E5E7EB] pt-16 pb-8 border-t-4 border-primary-400">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img src="/logo.png" alt="Moul Tableaux Logo" className="h-10 w-10 rounded-full border border-theme-border" loading="lazy" decoding="async" width="40" height="40" />
              </picture>
              <span className="font-serif text-xl font-bold tracking-wider text-primary-400 uppercase">
                Moul Tableaux
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">{t('footer_tagline')}</p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a 
                href="https://instagram.com/moultableaux" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary-500/20 flex items-center justify-center transition-colors group cursor-pointer"
                onClick={playPop}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-400 transition-colors">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <circle cx="12" cy="12" r="5"></circle>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"></circle>
                </svg>
              </a>
              {/* WhatsApp */}
              <a 
                href="https://wa.me/212623391688" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors group cursor-pointer"
                onClick={playPop}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#25D366] transition-colors">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 col-span-6">
            <h3 className="font-serif font-bold uppercase tracking-wider text-xs mb-4 text-[#ede6f5]">{t('footer_shop')}</h3>
            <ul className="space-y-2.5 text-gray-400 text-xs font-bold">
              <li>
                <button onClick={(e) => handleNavClick('home', e)} className="hover:text-primary-400 transition-colors duration-200 cursor-pointer">
                  {t('nav_home')}
                </button>
              </li>
              <li>
                <button onClick={(e) => handleNavClick('shop', e)} className="hover:text-primary-400 transition-colors duration-200 cursor-pointer">
                  {t('nav_shop')}
                </button>
              </li>
              <li>
                <button onClick={(e) => handleNavClick('custom', e)} className="hover:text-primary-400 transition-colors duration-200 cursor-pointer">
                  {t('nav_custom')}
                </button>
              </li>
              <li>
                <button onClick={(e) => handleNavClick('gallery', e)} className="hover:text-primary-400 transition-colors duration-200 cursor-pointer">
                  {t('nav_gallery')}
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2 col-span-6">
            <h3 className="font-serif font-bold uppercase tracking-wider text-xs mb-4 text-[#ede6f5]">Support</h3>
            <ul className="space-y-2.5 text-gray-400 text-xs font-bold">
              <li>
                <button onClick={(e) => handleNavClick('contact', e)} className="hover:text-primary-400 transition-colors duration-200 cursor-pointer">
                  {t('footer_contact')}
                </button>
              </li>
              <li><a href="#" className="hover:text-primary-400 transition-colors duration-200">{t('footer_delivery')}</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-serif font-bold uppercase tracking-wider text-xs mb-4 text-[#ede6f5]">{t('footer_newsletter')}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{t('footer_newsletter_desc')}</p>
            <form className="flex" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                placeholder={t('footer_email_placeholder')}
                className="bg-white/5 border border-white/10 focus:border-primary-400 outline-none flex-1 text-xs text-white placeholder-gray-500 px-4 py-3 min-h-[44px] rounded-l-lg transition-colors font-bold"
              />
              <button type="submit" className="bg-primary-400 hover:bg-primary-500 text-white px-5 py-3 min-h-[44px] min-w-[44px] rounded-r-lg transition-colors cursor-pointer border-y border-r border-primary-500 flex items-center justify-center">
                <Mail size={16} />
              </button>
            </form>

            {/* Contact Info */}
            <div className="pt-2 space-y-2.5 text-gray-400 text-[11px] font-bold">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-primary-400 flex-shrink-0" />
                <span>Casablanca, Maroc</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-primary-400 flex-shrink-0" />
                <span>+212 623-391688</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-6 text-[10px] text-gray-500 font-bold">
          <p className="flex items-center gap-1">
            &copy; {new Date().getFullYear()} Moul Tableaux. Fait avec <Heart size={10} className="fill-primary-400 text-primary-400 animate-pulse" /> au Maroc.
          </p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <a href="#" className="hover:text-primary-400 transition-colors">{t('footer_privacy')}</a>
            <a href="#" className="hover:text-primary-400 transition-colors">{t('footer_terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

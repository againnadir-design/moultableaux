import { createContext, useState, useContext, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('moul_lang') || 'en';
    } catch { return 'en'; }
  });
  const isRtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try { localStorage.setItem('moul_lang', lang); } catch { /* ignore */ }
  }, [lang, isRtl]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const switchLanguage = (newLang) => {
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, isRtl, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

import { useLanguage } from '../context/LanguageContext';
import { Truck, Clock, Banknote } from 'lucide-react';

const DeliveryInfo = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Truck, titleKey: 'delivery_free_title', descKey: 'delivery_free_desc', highlight: true },
    { icon: Clock, titleKey: 'delivery_fast_title', descKey: 'delivery_fast_desc', highlight: false },
    { icon: Banknote, titleKey: 'delivery_cod_title', descKey: 'delivery_cod_desc', highlight: false },
  ];

  return (
    <section className="py-10 sm:py-12 bg-theme-surface border-b border-theme-border">
      <div className="container-custom">
        <h2 className="sr-only">{t('delivery_title')}</h2>
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {features.map(({ icon: Icon, titleKey, descKey, highlight }, index) => (
            <div key={index} className="text-center group flex flex-col items-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${highlight ? 'bg-primary-500 text-white' : 'bg-primary-50 dark:bg-[#1E2229] text-primary-400'} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300`}>
                <Icon size={18} className={highlight ? 'text-white' : ''} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-theme-text text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1">{t(titleKey)}</h3>
              <p className="text-theme-muted text-[9px] sm:text-[10px] leading-relaxed max-w-[160px] sm:max-w-[200px]">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeliveryInfo;

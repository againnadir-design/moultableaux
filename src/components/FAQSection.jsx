import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const faqs = [
  {
    question: 'Comment se passe la livraison au Maroc ?',
    answer: 'La livraison est 100% gratuite dans toutes les villes du Maroc ! À Casablanca et Rabat, vous recevez vos tableaux sous 24 à 48 heures. Pour les autres villes (Marrakech, Fès, Tanger, Agadir, Oujda, etc.), comptez 2 à 4 jours ouvrables.'
  },
  {
    question: 'Puis-je commander si mon image est de basse qualité ?',
    answer: 'Oui absolument ! Notre équipe de designers examine chaque photo reçue dans les commandes sur mesure. Si la résolution est faible, nous appliquons des filtres artistiques adaptés (effet peinture à l\'huile, aquarelle, croquis manga, ou néon pop) pour restaurer les détails et masquer le flou. Nous vous envoyons une maquette sur WhatsApp pour validation avant impression !'
  },
  {
    question: 'Quels types de cadres et supports utilisez-vous ?',
    answer: 'Nous imprimons sur des toiles de coton épaisses (canvas) qui offrent un rendu mat haut de gamme, antireflet et résistant aux UV. Nos toiles sont tendues à la main sur des châssis robustes en bois de pin marocain (épaisseur 2cm). Nous proposons également des cadres noirs ou en bois beige naturel.'
  },
  {
    question: 'Comment s\'effectue le paiement ?',
    answer: 'Pour votre tranquillité d\'esprit, nous travaillons uniquement avec le paiement à la livraison (Cash on Delivery). Vous ne payez rien en ligne. Vous réglez la commande en espèces au livreur après avoir réceptionné et vérifié la qualité de vos tableaux.'
  },
  {
    question: 'Que se passe-t-il si mon tableau arrive endommagé ?',
    answer: 'Nous prenons la satisfaction de nos clients très au sérieux. Tous nos colis sont emballés dans du plastique à bulles ultra-protecteur avec des coins renforcés. Si malgré cela votre tableau arrivait avec un défaut ou abîmé durant le transport, contactez-nous sur WhatsApp et nous trouverons une solution.'
  }
];

const FAQSection = () => {
  const { playPop } = useApp();
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFaq = (idx) => {
    playPop();
    setOpenIdx(prev => prev === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-theme-surface border-b border-theme-border">
      <div className="container-custom max-w-[750px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="section-heading flex items-center justify-center gap-2">
            Questions Fréquentes
          </h2>
          <p className="text-theme-muted text-xs font-bold max-w-sm mx-auto mt-2">
            Des réponses claires pour commander vos tableaux d'art en toute confiance.
          </p>
          <div className="w-16 h-0.5 bg-primary-400 mx-auto mt-4"></div>
        </div>

        {/* FAQ list Accordions */}
        <div className="space-y-4 font-bold text-theme-text text-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                className="border-2 border-theme-border rounded-xl bg-theme-bg/30 overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-4 min-h-[52px] text-left font-serif text-[11px] md:text-xs uppercase tracking-wide cursor-pointer hover:bg-primary-50/30 dark:hover:bg-[#1E2229]/50 transition-colors"
                >
                  <span className="flex items-center gap-2 pr-4 leading-snug">
                    <HelpCircle size={15} className="text-primary-400 flex-shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-theme-muted flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-400' : ''}`} 
                  />
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[200px] border-t border-theme-border p-4 bg-theme-surface' : 'max-h-0 overflow-hidden'
                  }`}
                >
                  <p className="text-theme-text/80 font-normal leading-relaxed font-sans text-xs">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

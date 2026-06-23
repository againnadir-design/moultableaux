import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Star, Send, MessageSquare, CheckCircle2, User } from 'lucide-react';

const demoReviews = [
  {
    id: 'demo-1',
    name: 'Sara M.',
    rating: 5,
    comment: 'J\'ai commandé le tableau Luffy Gear 5 Wanted en format 50x70cm avec cadre noir. Le papier a un effet texture vintage incroyable, et l\'impression est super nette ! Tous mes amis me demandent où je l\'ai acheté. Service client réactif sur WhatsApp.',
    date: '15/03/2026',
    isDemo: true,
  },
  {
    id: 'demo-2',
    name: 'Nadia K.',
    rating: 5,
    comment: 'Excellent service de personnalisation ! J\'ai téléversé une photo de ma famille et en 3 jours j\'ai reçu un magnifique tableau sur toile monté sur châssis en bois. Le rendu est extrêmement chaleureux. C\'est parfait pour décorer notre salon.',
    date: '02/04/2026',
    isDemo: true,
  },
  {
    id: 'demo-3',
    name: 'Fatima Z.',
    rating: 5,
    comment: 'Le tableau Berserk Guts est juste sublime. L\'effet gravure noire est très puissant, ça donne un style collector unique sur le mur de mon setup gaming. Livraison rapide en 48 heures. Je recommande à 100% !',
    date: '18/04/2026',
    isDemo: true,
  },
  {
    id: 'demo-4',
    name: 'Tariq A.',
    rating: 5,
    comment: 'Très satisfait de ma commande Hakimi Lion. Le splash aquarelle rouge et vert rend extrêmement bien. Le cadre est robuste et l\'emballage était très protecteur.',
    date: '25/05/2026',
    isDemo: true,
  },
];

const Reviews = () => {
  const { t } = useLanguage();
  const { feedbacks, addFeedback, playPop, playSuccess } = useApp();

  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const allReviews = [
    ...feedbacks.map((fb) => ({ ...fb, isDemo: false })),
    ...demoReviews,
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim() || !name.trim()) return;

    playSuccess();
    addFeedback(name.trim(), rating, comment.trim());
    setName('');
    setRating(0);
    setComment('');
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="reviews-section" className="py-16 bg-theme-bg/20 border-b border-theme-border">
      <div className="container-custom max-w-[900px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="section-heading flex items-center justify-center gap-2">
            {t('reviews_title')}
          </h2>
          <p className="text-theme-muted text-xs font-bold mt-2 max-w-sm mx-auto">
            {t('reviews_subtitle')}
          </p>
          <div className="w-16 h-0.5 bg-primary-400 mx-auto mt-4"></div>
        </div>

        {/* Write a Review Form */}
        <div className="bg-theme-card border-2 border-theme-border rounded-xl p-6 md:p-8 shadow-theme-shadow mb-10">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-theme-text mb-5 flex items-center gap-2">
            <MessageSquare size={14} className="text-primary-400" />
            {t('feedback_title')}
          </h3>

          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2 text-xs font-bold mb-4 dark:bg-green-950/40 dark:text-green-300">
              <CheckCircle2 size={16} />
              {t('feedback_success')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-[10px] text-theme-text uppercase font-bold block mb-1.5 font-serif tracking-wider">
                {t('review_name')}
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('review_name_placeholder')}
                  className="w-full bg-theme-bg border-2 border-theme-border focus:border-primary-400 rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none text-theme-text font-bold transition-colors"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-[10px] text-theme-text uppercase font-bold block mb-2 font-serif tracking-wider">
                {t('feedback_rating')}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => { playPop(); setRating(star); }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="cursor-pointer transition-transform hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Star
                      size={28}
                      className={`transition-colors ${
                        star <= (hoveredStar || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-theme-border'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-[10px] text-theme-text uppercase font-bold block mb-1.5 font-serif tracking-wider">
                {t('feedback_comment')}
              </label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('feedback_placeholder')}
                rows="3"
                className="w-full bg-theme-bg border-2 border-theme-border focus:border-primary-400 rounded-lg px-4 py-3 text-xs outline-none text-theme-text font-bold resize-none transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={rating === 0 || !comment.trim() || !name.trim()}
              className={`btn-primary py-3 text-xs shadow-[0_4px_0_#911616] w-full justify-center font-serif uppercase tracking-wider ${
                rating === 0 || !comment.trim() || !name.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send size={14} /> {t('feedback_submit')}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div>
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-theme-text mb-6 flex items-center gap-2 border-b border-theme-border pb-3">
            <MessageSquare size={14} className="text-primary-400" />
            {t('feedback_list_title')} ({allReviews.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {allReviews.map((review) => (
              <div
                key={review.id}
                className="premium-card p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary-50 dark:bg-[#1E2229] border border-theme-border rounded-full flex items-center justify-center text-primary-400 font-serif font-bold text-xs">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-xs text-theme-text">{review.name}</span>
                          {review.isDemo && (
                            <span className="inline-flex items-center text-[8px] bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-200 px-1.5 py-0.5 rounded font-bold gap-0.5">
                              <CheckCircle2 size={8} /> {t('review_verified')}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-theme-muted font-bold block">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-theme-text text-xs leading-relaxed font-medium italic">"{review.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;

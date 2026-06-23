import { useState } from 'react';
import { Star, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const UserFeedback = () => {
  const { t } = useLanguage();
  const { feedbacks, addFeedback, playPop, playSuccess } = useApp();

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    playSuccess();
    addFeedback('', rating, comment.trim());
    setRating(0);
    setComment('');
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="py-16 bg-theme-surface border-b border-theme-border">
      <div className="container-custom max-w-[800px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="section-heading">{t('feedback_title')}</h2>
          <p className="text-theme-muted text-xs font-bold max-w-sm mx-auto mt-2">
            {t('feedback_subtitle')}
          </p>
          <div className="w-16 h-0.5 bg-primary-400 mx-auto mt-4"></div>
        </div>

        {/* Feedback Form */}
        <div className="bg-theme-card border-2 border-theme-border rounded-xl p-6 md:p-8 shadow-theme-shadow mb-10">
          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2 text-xs font-bold mb-4 dark:bg-green-950/40 dark:text-green-300">
              <CheckCircle2 size={16} />
              {t('feedback_success')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star Rating */}
            <div>
              <label className="text-[10px] text-theme-text uppercase font-bold block mb-2 font-serif tracking-wider">
                {t('feedback_rating')}
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => { playPop(); setRating(star); }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
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
              {rating > 0 && (
                <p className="text-[10px] text-primary-400 font-bold mt-1 font-serif">
                  {rating === 1 && '1 étoile'}
                  {rating === 2 && '2 étoiles'}
                  {rating === 3 && '3 étoiles'}
                  {rating === 4 && '4 étoiles'}
                  {rating === 5 && '5 étoiles'}
                </p>
              )}
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
                rows="4"
                className="w-full bg-theme-bg border-2 border-theme-border focus:border-primary-400 rounded-lg px-4 py-3 text-xs outline-none text-theme-text font-bold resize-none transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={rating === 0 || !comment.trim()}
              className={`btn-primary py-3 text-xs shadow-[0_4px_0_#911616] w-full justify-center font-serif uppercase tracking-wider ${
                rating === 0 || !comment.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send size={14} /> {t('feedback_submit')}
            </button>
          </form>
        </div>

        {/* Feedback List */}
        {feedbacks.length > 0 && (
          <div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-theme-text mb-6 flex items-center gap-2 border-b border-theme-border pb-3">
              <MessageSquare size={14} className="text-primary-400" />
              {t('feedback_list_title')} ({feedbacks.length})
            </h3>

            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-theme-card border-2 border-theme-border rounded-xl p-5 hover:translate-y-[-2px] transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary-50 dark:bg-[#1E2229] border border-theme-border rounded-full flex items-center justify-center text-primary-400 font-serif font-bold text-xs">
                        {fb.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-serif font-bold text-xs text-theme-text block">{fb.author}</span>
                        <span className="text-[9px] text-theme-muted font-bold">{fb.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-theme-text text-xs leading-relaxed font-medium italic">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {feedbacks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-theme-muted text-xs font-bold font-serif">{t('feedback_empty')}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserFeedback;

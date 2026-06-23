import { useState } from 'react';
import { MessageSquare, Send, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const ContactPage = () => {
  const { t } = useLanguage();
  const { playPop } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !msg) return;
    playPop();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMsg('');
  };

  const socials = [
    { 
      name: 'Instagram', 
      icon: '📸', 
      url: 'https://instagram.com/moultableaux', 
      handle: '@moultableaux',
      desc: 'Suivez nos créations'
    },
    { 
      name: 'TikTok', 
      icon: '🎬', 
      url: 'https://tiktok.com/@moultableaux', 
      handle: '@moultableaux',
      desc: 'Vidéos coulisses atelier'
    },
    { 
      name: 'WhatsApp', 
      icon: '💬', 
      url: 'https://wa.me/212623391688', 
      handle: '+212 623-391688',
      desc: 'Commande & Personnalisation'
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary-400/40 bg-primary-400/10 text-primary-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Contactez-Nous
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-theme-text uppercase tracking-wider mb-4">
            On Vous Répond
          </h1>
          <p className="text-theme-muted text-sm font-medium max-w-md mx-auto leading-relaxed">
            Une question sur votre commande, une demande personnalisée ? Notre équipe est disponible pour vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left column */}
          <div className="lg:col-span-5 space-y-5">
            {/* Contact cards */}
            {socials.map((soc, i) => (
              <a
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                key={i}
                className="group flex items-center gap-4 border border-theme-border bg-theme-surface p-5 rounded-xl hover:border-primary-400/50 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 flex-shrink-0 bg-theme-bg rounded-lg flex items-center justify-center text-2xl border border-theme-border group-hover:border-primary-400/40 transition-colors">
                  {soc.icon}
                </div>
                <div>
                  <p className="font-serif font-bold text-theme-text text-sm uppercase tracking-wide">{soc.name}</p>
                  <p className="text-primary-400 text-xs font-bold">{soc.handle}</p>
                  <p className="text-theme-muted text-[10px] mt-0.5">{soc.desc}</p>
                </div>
              </a>
            ))}

            {/* Hours */}
            <div className="bg-theme-surface border border-theme-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-golden-400" />
                <h4 className="font-serif font-bold text-sm text-theme-text uppercase tracking-wider">Horaires Support</h4>
              </div>
              <div className="space-y-1 text-[11px] text-theme-muted font-medium">
                <p>🕘 <strong className="text-theme-text">Lun – Ven:</strong> 9h00 – 18h00 (GMT+1)</p>
                <p>🕙 <strong className="text-theme-text">Sam:</strong> 10h00 – 15h00</p>
                <p className="text-[10px] text-theme-muted mt-2">Réponse sous 24h garanti.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-theme-surface border border-theme-border rounded-xl p-7 relative overflow-hidden">
              {/* Vintage stamp decoration */}
              <div className="absolute top-4 right-4 w-16 h-16 border-2 border-dashed border-theme-border/40 rounded flex items-center justify-center opacity-30 rotate-12">
                <span className="text-2xl">🇲🇦</span>
              </div>

              {submitted ? (
                <div className="text-center py-10 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-theme-text uppercase tracking-wider">Message Envoyé!</h3>
                  <p className="text-theme-muted text-xs font-medium max-w-sm mx-auto leading-relaxed">
                    Merci de nous avoir contactés ! Nous reviendrons vers vous dans les 24h.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-outline px-6 py-2.5 text-xs mt-4"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-theme-border pb-3 mb-2">
                    <MessageSquare size={14} className="text-primary-400" />
                    <h3 className="font-serif font-bold text-sm text-theme-text uppercase tracking-wider">Envoyez-Nous un Message</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-theme-muted font-bold block mb-1 uppercase tracking-wider">Votre Nom</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mohammed El Amrani"
                        className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-theme-muted font-bold block mb-1 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-theme-muted font-bold block mb-1 uppercase tracking-wider">Message</label>
                    <textarea
                      required
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      placeholder="Votre question, demande personnalisée, ou message..."
                      rows="5"
                      className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3.5 text-xs cursor-pointer shadow-[0_4px_0_#911616] flex justify-center items-center gap-2"
                  >
                    <Send size={14} />
                    Envoyer le Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

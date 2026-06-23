import { Heart, Palette, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const AboutPage = () => {
  const { t } = useLanguage();
  const { playPop } = useApp();

  const values = [
    { id: 1, icon: <Palette className="text-primary-400" size={24} />, title: 'Artisanat Marocain', desc: 'Chaque tableau est imprimé sur toile de coton épaisse et tendu à la main sur des châssis en bois de pin marocain. Un savoir-faire local pour une qualité premium.' },
    { id: 2, icon: <Heart className="text-primary-400" size={24} />, title: 'Service Personnalisé', desc: 'De la photo brute à l\'œuvre finie, notre équipe de designers retouche et optimise vos images gratuitement avant impression. Vous validez chaque étape.' }
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container-custom">
        {/* Banner Title */}
        <div className="text-center mb-12">
          <h1 className="section-heading text-4xl flex items-center justify-center gap-2">
            Notre Histoire <Heart className="text-primary-400 fill-primary-400 animate-pulse" size={24} />
          </h1>
          <p className="text-theme-muted text-sm font-semibold max-w-md mx-auto">
            Moul Tableaux est né d\'une passion : transformer vos images et univers préférés en œuvres d\'art murales.
          </p>
          <div className="section-divider mt-4 justify-center">🇲🇦 🇲🇦 🇲🇦</div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
          {/* Photo Frame (Mascot) */}
          <div className="md:col-span-5 flex justify-center">
            <div 
              onClick={() => { playPop(); }}
              className="relative bg-gradient-to-r from-primary-100 to-lavender-100 p-6 rounded-[48px] border-4 border-primary-200 shadow-theme-shadow cursor-pointer hover:rotate-2 hover:scale-103 transition-all duration-300 select-none animate-float"
            >
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img 
                  src="/logo.png" 
                  alt="Moul Tableaux" 
                  className="w-56 h-56 rounded-full border-4 border-white shadow-md mx-auto object-cover bg-white"
                  width="224"
                  height="224"
                />
              </picture>
              <p className="font-serif font-extrabold text-xs text-primary-500 text-center mt-4 tracking-wider uppercase">L\'art mural marocain depuis 2024!</p>
            </div>
          </div>

          {/* Narrative Text */}
          <div className="md:col-span-7 space-y-5">
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-theme-text flex items-center gap-1.5">
              Bienvenue chez Moul Tableaux ! <Palette className="text-primary-400 animate-sparkle" size={20} />
            </h2>
            <p className="text-theme-text font-medium text-sm leading-relaxed">
              Nous sommes une équipe de designers et d\'artisans basés à Casablanca, passionnés par l\'univers de l\'art mural personnalisé. 🇲🇦
            </p>
            <p className="text-theme-text font-medium text-sm leading-relaxed">
              Moul Tableaux est né d\'un constat simple : il est difficile de trouver des cadres et posters de qualité qui reflètent vraiment nos passions au Maroc. Anime, gaming, football, cinéma, ou photos personnelles — nous avons décidé de créer des toiles premium accessibles à tous.
            </p>
            <p className="text-theme-text font-medium text-sm leading-relaxed">
              Chaque commande est préparée avec soin : impression sur toile de coton mat haut de gamme, montage sur châssis en bois massif, emballage anti-choc pour la livraison. Notre équipe de designers retouche et optimise gratuitement vos images pour garantir un rendu parfait.
            </p>
            <p className="text-theme-text font-medium text-sm leading-relaxed">
              Nous croyons en un service simple et transparent : paiement à la livraison, expédition rapide dans tout le Maroc. Merci de nous faire confiance pour embellir vos murs !
            </p>
          </div>
        </div>

        {/* Brand Values Cards */}
        <div className="border-t-2 border-theme-border pt-12 text-center">
          <h3 className="font-serif text-2xl font-bold text-theme-text mb-10 flex items-center justify-center gap-1.5">
            Nos Valeurs <Star className="text-yellow-400 fill-yellow-400 animate-spin-slow" size={20} />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.id} className="cute-card flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 border border-primary-200">
                  {v.icon}
                </div>
                <h4 className="font-serif font-bold text-sm text-theme-text mb-2">{v.title}</h4>
                <p className="text-theme-muted text-xs font-semibold leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

const CustomOrderPage = () => {
  const { t } = useLanguage();
  const { addCustomOrder, playPop, playSuccess } = useApp();

  // Size constants
  const CUSTOM_SIZES = [
    { key: 'small', label: '30×21 cm', price: 30, minQty: 3 },
    { key: 'large', label: '42×30 cm', price: 50, minQty: 2 },
  ];

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [productType, setProductType] = useState('Anime');
  const [size, setSize] = useState('small');
  const [quantity, setQuantity] = useState(3);
  const [instructions, setInstructions] = useState('');

  // Upload States
  const [images, setImages] = useState([]); // Array of base64 strings
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const fileInputRef = useRef(null);

  // Resize and compress image client side
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 600; // maximum 600px width or height
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Export as compressed JPEG
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList) => {
    playPop();
    setLoading(true);
    const compressedList = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        compressedList.push(compressed);
      }
    }
    setImages(prev => [...prev, ...compressedList]);
    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files);
    }
  };

  const removeImage = (index) => {
    playPop();
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !phone || !whatsapp || !email || images.length === 0) {
      alert("Veuillez remplir toutes les informations et téléverser au moins une image !");
      return;
    }

    const selectedSize = CUSTOM_SIZES.find(s => s.key === size);
    if (quantity < selectedSize.minQty) {
      alert(`Minimum order for ${selectedSize.label} is ${selectedSize.minQty}`);
      return;
    }

    playSuccess();

    // Save order locally
    const orderId = addCustomOrder({
      fullName,
      phone,
      whatsapp,
      email,
      productType,
      size: `${selectedSize.label} — ${selectedSize.price} MAD`,
      quantity,
      instructions,
      images
    });

    setSubmittedId(orderId);

    // Send image to Telegram with order details
    if (images.length > 0) {
      const caption = `🛒 Commande Personnalisee\n👤 ${fullName}\n📞 ${whatsapp}\n📐 ${selectedSize.label} — ${selectedSize.price} MAD\n🔢 x${quantity}\n📝 ${productType}\n🆔 ${orderId}`;
      api.settings.telegramSendPhoto(images[0], caption).catch(() => {});
    }

    // Build WhatsApp prefilled message redirect
    const message = `Bonjour Moul Tableaux ! Je viens de soumettre un projet de tableau sur mesure sur le site :
- *Référence* : ${orderId}
- *Nom* : ${fullName}
- *WhatsApp* : ${whatsapp}
- *Type de Tableau* : ${productType}
- *Format choisi* : ${selectedSize.label} — ${selectedSize.price} MAD
- *Quantité* : ${quantity}
- *Nombre d'images* : ${images.length}
- *Détails supplémentaires* : ${instructions || 'Aucune instruction'}
Merci de valider les maquettes ! 🎨🇲🇦`;

    const whatsappUrl = `https://wa.me/212623391688?text=${encodeURIComponent(message)}`;
    
    // Redirect after a brief moment
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1500);
  };

  const resetForm = () => {
    playPop();
    setFullName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setProductType('Anime');
    setSize('small');
    setQuantity(3);
    setInstructions('');
    setImages([]);
    setSubmittedId(null);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen vintage-texture">
      <div className="container-custom max-w-[900px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="section-heading text-3xl md:text-4xl flex items-center justify-center gap-2 uppercase tracking-wide">
            Créer un Tableau Sur Mesure <Sparkles size={24} className="text-primary-400 animate-sparkle" />
          </h1>
          <p className="text-theme-muted text-xs font-bold max-w-md mx-auto mt-2">
            Téléversez vos photos, illustrations ou images préférées. Notre équipe crée votre maquette personnalisée et l'imprime sur toile premium.
          </p>
          <div className="w-16 h-0.5 bg-primary-400 mx-auto mt-4"></div>
        </div>

        {submittedId ? (
          <div className="premium-card text-center p-8 md:p-12 space-y-6 max-w-xl mx-auto animate-scale-up">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 rounded-full flex items-center justify-center text-green-500 mx-auto animate-bounce shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-serif font-bold text-xl uppercase tracking-wider text-theme-text">Demande de Projet Envoyée ! 🎉</h2>
            <p className="text-theme-muted text-xs font-semibold leading-relaxed">
              Félicitations, votre projet a été enregistré avec succès sous la référence <strong className="text-primary-400 font-serif">{submittedId}</strong>.
            </p>
            <div className="bg-primary-50 dark:bg-[#1E2229] border border-theme-border rounded-lg p-4 text-[11px] leading-relaxed text-theme-text max-w-sm mx-auto font-bold">
              👉 Redirection en cours vers WhatsApp... Si la page ne s'ouvre pas automatiquement, cliquez sur le bouton ci-dessous pour envoyer vos images au designer.
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/212623391688?text=${encodeURIComponent(`Bonjour Moul Tableaux ! Réf Commande : ${submittedId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-6 rounded-lg font-serif font-bold text-xs tracking-wider uppercase inline-flex items-center gap-1.5 shadow-[0_3px_0_#1b7a3d]"
              >
                <MessageCircle size={15} /> Envoyer via WhatsApp 💬
              </a>
              <button
                onClick={resetForm}
                className="btn-outline px-6 py-3 text-xs"
              >
                Créer un nouveau projet
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Upload Area */}
            <div className="lg:col-span-5 space-y-5">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-theme-text">1. Télécharger vos images</h3>
              
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] bg-theme-surface ${
                  isDragActive 
                    ? 'border-primary-400 bg-primary-50/50' 
                    : 'border-theme-border hover:border-primary-300'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-[#1E2229] flex items-center justify-center text-primary-400 mb-4 border border-theme-border">
                  <Upload size={22} />
                </div>
                <p className="text-theme-text font-bold text-xs mb-1">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-theme-muted text-[10px] font-bold">
                  ou cliquez pour sélectionner (JPG, PNG)
                </p>
                {loading && (
                  <span className="text-[10px] text-primary-400 font-bold mt-3 animate-pulse">Compression en cours...</span>
                )}
              </div>

              {/* Warnings / Explanations */}
              <div className="bg-[#EADEC9]/10 border border-theme-border rounded-lg p-4 text-[10px] leading-relaxed text-theme-muted font-bold flex gap-2">
                <AlertCircle size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <p>
                  Pour garantir un résultat d'encadrement parfait, téléversez des images de bonne résolution. Notre designer effectuera gratuitement les retouches et l'optimisation des dimensions avant impression.
                </p>
              </div>

              {/* Upload Previews */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] text-theme-text uppercase font-bold tracking-wider block font-serif">Images Sélectionnées ({images.length}) :</span>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((imgBase64, idx) => (
                      <div key={idx} className="relative aspect-square border border-theme-border rounded-lg bg-theme-surface p-1 group">
                        <img
                          src={imgBase64}
                          alt="preview custom"
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md cursor-pointer border border-white"
                          aria-label="Remove image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Form Fields */}
            <div className="lg:col-span-7 bg-theme-surface border-2 border-theme-border rounded-xl p-6 md:p-8 shadow-theme-shadow">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-theme-text border-b border-theme-border pb-3.5 mb-5 flex items-center gap-1.5">
                <FileText size={16} className="text-primary-400" /> 2. Remplir vos coordonnées
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Nom Complet</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Tariq"
                      className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tariq@gmail.com"
                      className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Téléphone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 0623391688"
                  className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold"
                />
                  </div>
                  <div>
                    <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Numéro WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: +212 623-391688"
                  className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold"
                />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Catégorie</label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg p-2.5 text-[10px] font-bold uppercase outline-none"
                    >
                      <option value="Anime">Anime 🐉</option>
                      <option value="Gaming">Gaming 🎮</option>
                      <option value="Football">Football ⚽</option>
                      <option value="Photo">Photo Perso 📸</option>
                      <option value="Autre">Création Spéciale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-theme-text uppercase font-bold block mb-2">Format & Prix</label>
                  <div className="grid grid-cols-2 gap-3">
                    {CUSTOM_SIZES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => { setSize(s.key); setQuantity(s.minQty); }}
                        className={`border-2 rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                          size === s.key
                            ? 'border-[#B54A3A] bg-[#B54A3A]/5 shadow-sm'
                            : 'border-theme-border hover:border-primary-300 bg-theme-bg'
                        }`}
                      >
                        <div className="text-[10px] text-theme-text uppercase tracking-wider font-bold mb-1">{s.label}</div>
                        <div className="text-lg font-serif font-bold text-theme-text">{s.price} <span className="text-[10px] font-bold uppercase">MAD</span></div>
                        <div className={`text-[9px] mt-1.5 font-bold ${size === s.key ? 'text-[#B54A3A]' : 'text-theme-muted'}`}>
                          Min. {s.minQty} {s.minQty > 1 ? 'pcs' : 'pc'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Quantité</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const min = CUSTOM_SIZES.find(s => s.key === size).minQty;
                        setQuantity(prev => Math.max(min, prev - 1));
                      }}
                      className="w-10 h-10 rounded-lg border-2 border-theme-border bg-theme-bg hover:border-primary-400 flex items-center justify-center text-lg font-bold text-theme-text cursor-pointer transition-colors"
                    >−</button>
                    <input
                      type="number"
                      required
                      min={CUSTOM_SIZES.find(s => s.key === size).minQty}
                      value={quantity}
                      onChange={(e) => {
                        const min = CUSTOM_SIZES.find(s => s.key === size).minQty;
                        const val = Number(e.target.value);
                        setQuantity(val < min ? min : val);
                      }}
                      className="w-20 bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-center text-xs outline-none text-theme-text font-bold font-serif"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-10 h-10 rounded-lg border-2 border-theme-border bg-theme-bg hover:border-primary-400 flex items-center justify-center text-lg font-bold text-theme-text cursor-pointer transition-colors"
                    >+</button>
                  </div>
                  <p className="text-[9px] text-theme-muted font-bold mt-1">
                    Minimum pour {CUSTOM_SIZES.find(s => s.key === size).label} : {CUSTOM_SIZES.find(s => s.key === size).minQty} pièces
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-theme-text uppercase font-bold block mb-1">Détails de retouche / Instructions spéciales</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Ex: Mettre un cadre en bois beige, ajouter un filtre noir et blanc, ou modifier les écritures..."
                    rows="4"
                    className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-2.5 text-xs outline-none text-theme-text font-bold resize-none font-sans"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-xs shadow-[0_4px_0_#911616] flex justify-center items-center gap-2 uppercase font-serif"
                >
                  <MessageCircle size={15} /> Envoyer Ma Demande 🇲🇦💬
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrderPage;

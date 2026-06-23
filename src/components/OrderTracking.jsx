import { useState } from 'react';
import { Search, Package, Compass, CheckCircle2, AlertCircle, Clock, Truck, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

const OrderTracking = () => {
  const { playPop, playSuccess } = useApp();
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    playPop();
    setLoading(true);
    const cleanId = searchId.trim().toUpperCase();

    // Check local orders first
    let localCheckout = [];
    let localCustom = [];
    try { localCheckout = JSON.parse(localStorage.getItem('moul_checkout_orders')) || []; } catch { /* ignore */ }
    try { localCustom = JSON.parse(localStorage.getItem('moul_custom_orders')) || []; } catch { /* ignore */ }

    let order = localCheckout.find(o => o.id === cleanId) || localCustom.find(o => o.id === cleanId);

    // Try backend API if not found locally
    if (!order) {
      try {
        const res = await api.orders.get(cleanId);
        order = res.order;
      } catch { /* not found */ }
    }

    setLoading(false);
    if (order) {
      setFoundOrder(order);
      setErrorMsg('');
      playSuccess();
    } else {
      setFoundOrder(null);
      setErrorMsg("Référence de commande introuvable. Veuillez vérifier l'identifiant (ex: ORD-... ou M-ORD-... ou M-CUST-...).");
    }
  };

  // Backend status mapping
  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const stepLabels = {
    'pending': 'Reçu',
    'processing': 'En Production',
    'shipped': 'Expédié',
    'delivered': 'Livré'
  };
  const stepIcons = {
    'pending': Clock,
    'processing': Compass,
    'shipped': Truck,
    'delivered': Home
  };

  // Map legacy statuses to backend statuses
  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    const map = { 'received': 'pending', 'in production': 'processing' };
    return map[status.toLowerCase()] || status.toLowerCase();
  };

  const getStepStatus = (stepName) => {
    if (!foundOrder) return 'upcoming';
    const normalized = normalizeStatus(foundOrder.status);
    const currentIdx = statusSteps.indexOf(normalized);
    const stepIdx = statusSteps.indexOf(stepName);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="pt-24 pb-16 min-h-screen vintage-texture flex items-center justify-center">
      <div className="container-custom max-w-[650px] w-full">
        {/* Search Panel Card */}
        <div className="bg-theme-surface border-2 border-theme-border rounded-xl p-6 md:p-8 shadow-theme-shadow">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-50 dark:bg-[#1E2229] border border-theme-border rounded-xl flex items-center justify-center text-primary-400 mx-auto mb-3">
              <Package size={22} />
            </div>
            <h1 className="font-serif font-bold text-xl uppercase tracking-wider text-theme-text">Suivi de Commande</h1>
            <p className="text-[10px] text-theme-muted font-bold uppercase tracking-wider mt-1">Consultez l'étape de fabrication et d'expédition de votre tableau</p>
          </div>

          <form onSubmit={handleTrack} className="flex gap-2.5 mb-6">
            <input
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ex: M-ORD-12345 ou M-CUST-12345"
              className="bg-theme-bg border border-theme-border focus:border-primary-450 outline-none flex-1 text-xs text-theme-text placeholder-theme-muted px-4 py-2.5 rounded-lg font-bold font-serif uppercase tracking-wider"
            />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-400 hover:bg-primary-500 text-white font-serif uppercase tracking-wider font-bold text-xs py-2 px-5 rounded-lg shadow-[0_3.5px_0_#911616] active:translate-y-0.5 active:shadow-[0_1px_0_#911616] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
              <Search size={14} /> {loading ? 'Recherche...' : 'Suivre'}
            </button>
          </form>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search Result Tracking progress bar */}
          {foundOrder && (
            <div className="pt-6 border-t border-theme-border space-y-6 animate-scale-up text-xs font-bold text-theme-text">
              <div className="flex justify-between items-start bg-theme-bg/50 border border-theme-border rounded-lg p-3.5">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-theme-muted font-serif block">Identifiant Commande</span>
                  <span className="font-serif text-sm text-primary-500 uppercase mt-0.5">{foundOrder.id}</span>
                  <span className="block text-[9px] font-normal text-theme-muted font-sans mt-0.5">Destinataire : {foundOrder.fullName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-theme-muted font-serif block">Statut Actuel</span>
                  <span className="inline-block bg-primary-100 text-primary-700 text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded mt-1 dark:bg-primary-950 dark:text-primary-300">
                    {stepLabels[foundOrder.status]}
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div>
                <span className="text-[9px] uppercase tracking-wider text-theme-muted font-serif block mb-6">Évolution de la livraison</span>
                <div className="relative flex justify-between items-center max-w-[500px] mx-auto">
                  {/* Gray Background Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-theme-border -z-10"></div>
                  
                  {/* Colored Active Line */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-400 transition-all duration-500 -z-10"
                    style={{ 
                      width: `${
                        normalizeStatus(foundOrder.status) === 'pending' ? '0%' :
                        normalizeStatus(foundOrder.status) === 'processing' ? '33.3%' :
                        normalizeStatus(foundOrder.status) === 'shipped' ? '66.6%' : '100%'
                      }` 
                    }}
                  ></div>

                  {/* Steps */}
                  {statusSteps.map((step, idx) => {
                    const stepStatus = getStepStatus(step);
                    const StepIcon = stepIcons[step];
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300 ${
                          stepStatus === 'completed' ? 'bg-primary-400 border-primary-500 text-white' :
                          stepStatus === 'active' ? 'bg-theme-surface border-primary-400 text-primary-400 shadow-md scale-110' :
                          'bg-theme-surface border-theme-border text-theme-muted'
                        }`}>
                          {stepStatus === 'completed' ? <CheckCircle2 size={15} /> : <StepIcon size={14} />}
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider mt-2.5 font-serif font-bold ${
                          stepStatus === 'active' ? 'text-primary-400 font-bold' : 'text-theme-muted'
                        }`}>
                          {stepLabels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details table */}
              <div className="space-y-2 border-t border-theme-border pt-4">
                <span className="text-[9px] uppercase tracking-wider text-theme-muted font-serif block mb-1">Détails de livraison</span>
                <p className="font-normal leading-relaxed">
                  Votre colis sera expédié à l'adresse <strong>{foundOrder.address}</strong> à <strong>{foundOrder.city}</strong>. 
                  {normalizeStatus(foundOrder.status) === 'pending' && " Nous sommes en train d'enregistrer vos fichiers."}
                  {normalizeStatus(foundOrder.status) === 'processing' && " Nos artistes procèdent à l'encadrement en bois."}
                  {normalizeStatus(foundOrder.status) === 'shipped' && " Le livreur vous contactera par téléphone sous 24h."}
                  {normalizeStatus(foundOrder.status) === 'delivered' && " Le colis a été remis en mains propres et payé au livreur. Merci pour votre commande !"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

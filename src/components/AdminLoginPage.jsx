import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useLanguage } from '../context/LanguageContext';

const AdminLoginPage = () => {
  const { t } = useLanguage();
  const { login, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { error: authError } = await login(email, password);
    if (authError) {
      setError(authError.message || 'Identifiants incorrects.');
      setSubmitting(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center px-4 vintage-texture">
      <div className="w-full max-w-sm">
        {/* Back to site */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-theme-muted hover:text-primary-400 text-[10px] font-bold uppercase tracking-wider mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={12} /> Retour au site
        </button>

        {/* Login Card */}
        <div className="bg-theme-surface border-2 border-theme-border rounded-xl p-6 md:p-8 shadow-theme-shadow">
          {/* Header */}
          <div className="text-center mb-8">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img src="/logo.png" alt="Moul Tableaux" className="w-16 h-16 mx-auto mb-4 rounded-full border border-theme-border" width="64" height="64" />
            </picture>
            <div className="w-12 h-12 bg-primary-50 dark:bg-[#1E2229] border border-theme-border rounded-xl flex items-center justify-center text-primary-400 mx-auto mb-3">
              <Lock size={20} />
            </div>
            <h1 className="font-serif font-bold text-base uppercase tracking-wider text-theme-text">
              Administration
            </h1>
            <p className="text-[10px] text-theme-muted font-bold uppercase tracking-wider mt-1">
              Acces reserve au proprietaire
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] text-theme-text uppercase font-bold block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@moultableaux.com"
                className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-3 text-xs outline-none text-theme-text font-bold transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] text-theme-text uppercase font-bold block mb-1.5">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-theme-bg border border-theme-border focus:border-primary-400 rounded-lg px-4 py-3 pr-10 text-xs outline-none text-theme-text font-bold transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-text cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-[10px] font-bold text-center font-serif uppercase tracking-wider dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 text-xs shadow-[0_4px_0_#911616] uppercase font-serif disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Se Connecter'
              )}
            </button>
          </form>
        </div>

        {/* Backend status */}
        <p className="text-center text-[9px] text-theme-muted mt-4 font-bold uppercase tracking-wider">
          {import.meta.env.VITE_SUPABASE_URL ? 'Supabase Auth connecte' : 'Configurez VITE_SUPABASE_URL dans .env'}
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;

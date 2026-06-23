import { createContext, useState, useContext, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAdminUser(session.user);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase n\'est pas configure. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env.' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: { message: error.message } };
    }

    const user = data.user;
    if (user.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut();
      return { error: { message: 'Acces non autorise. Seuls les administrateurs peuvent se connecter.' } };
    }

    setAdminUser(user);
    return { error: null };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      adminUser,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(adminUser),
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

import { supabase } from './supabase';

// ─────────────────────────────
// Helpers
// ─────────────────────────────

function normalizeProduct(p) {
  if (!p) return p;

  const images =
    Array.isArray(p.images)
      ? p.images
      : typeof p.images === 'string'
      ? (() => {
          try {
            return JSON.parse(p.images);
          } catch {
            return [];
          }
        })()
      : [];

  return {
    ...p,
    images,
    image: p.image || images[0] || '',
    reviews: Array.isArray(p.reviews)
      ? p.reviews
      : typeof p.reviews === 'string'
      ? (() => {
          try {
            return JSON.parse(p.reviews);
          } catch {
            return [];
          }
        })()
      : [],
    active: Boolean(p.active),
  };
}

function parseJson(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

// ─────────────────────────────
// API CORE
// ─────────────────────────────

export const api = {
  // ───────── AUTH ─────────
  auth: {
    login: async (email, password) => {
      const { data, error } =
        await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      return {
        token: data.session?.access_token,
        user: data.user,
      };
    },

    logout: async () => {
      await supabase.auth.signOut();
      return { success: true };
    },

    me: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error('Not authenticated');
      return { user: data.user };
    },
  },

  // ───────── PRODUCTS ─────────
  products: {
    list: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { products: data.map(normalizeProduct) };
    },

    get: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { product: normalizeProduct(data) };
    },
  },

  // ───────── ORDERS ─────────
  orders: {
    create: async (payload) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return { order: data };
    },

    list: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { orders: data.map((o) => ({
        ...o,
        products: parseJson(o.products),
      })) };
    },
  },

  // ───────── SETTINGS ─────────
  settings: {
    get: async () => {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      const result = {};
      data.forEach((r) => {
        result[r.key] = r.value;
      });

      return { settings: result };
    },
  },

  // ───────── UPLOAD ─────────
  upload: {
    image: async (file) => {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `uploads/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('uploads')
        .upload(path, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(path);

      return {
        url: data.publicUrl,
        path,
      };
    },
  },
};


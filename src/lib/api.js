import { supabase } from './supabase';

// ── Supabase product normalizer ──
function normalizeProduct(p) {
  if (!p) return p;
  const images = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? (() => { try { return JSON.parse(p.images); } catch { return []; } })() : []);
  return {
    ...p,
    images,
    image: p.image || images[0] || '',
    reviews: Array.isArray(p.reviews) ? p.reviews : (typeof p.reviews === 'string' ? (() => { try { return JSON.parse(p.reviews); } catch { return []; } })() : []),
    badge: p.badge || null,
    active: Boolean(p.active),
  };
}

function parseJsonField(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') { try { return JSON.parse(value); } catch { return []; } }
  return [];
}

export const api = {
  auth: {
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw { status: 401, message: error.message };
      return { token: data.session?.access_token, admin: data.user };
    },
    logout: async () => {
      await supabase.auth.signOut();
      return { message: 'Deconnexion reussie.' };
    },
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw { status: 401, message: 'Non authentifie.' };
      return { admin: user };
    },
    changePassword: async (_currentPassword, newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw { status: 400, message: error.message };
      return { message: 'Mot de passe mis a jour.' };
    },
  },

  products: {
    list: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false });
      if (error) throw { status: 500, message: error.message };
      return { products: data.map(normalizeProduct) };
    },
    listAll: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw { status: 500, message: error.message };
      return { products: data.map(normalizeProduct) };
    },
    get: async (id) => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw { status: 404, message: 'Produit non trouve.' };
      return { product: normalizeProduct(data) };
    },
    create: async (data) => {
      const payload = {
        name: data.name,
        description: data.description || '',
        price: data.price || 0,
        images: data.images || [],
        image: data.image || (data.images && data.images[0]) || '',
        stock: data.stock || 0,
        category: data.category || 'anime',
        badge: data.badge || null,
        rating: data.rating || 5.0,
        active: data.active !== undefined ? data.active : true,
      };
      const { data: created, error } = await supabase.from('products').insert(payload).select().single();
      if (error) throw { status: 500, message: error.message };
      return { product: normalizeProduct(created) };
    },
    update: async (id, data) => {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (payload.active !== undefined) payload.active = Boolean(payload.active);
      const { data: updated, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
      if (error) throw { status: 500, message: error.message };
      return { product: normalizeProduct(updated) };
    },
    delete: async (id) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Produit supprime.' };
    },
  },

  orders: {
    list: async (params = {}) => {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (params.status && params.status !== 'all') query = query.eq('status', params.status);
      if (params.search) {
        const s = `%${params.search}%`;
        query = query.or(`id.ilike.${s},customer_name.ilike.${s},city.ilike.${s},phone.ilike.${s}`);
      }
      const { data, error } = await query;
      if (error) throw { status: 500, message: error.message };
      return { orders: data.map(o => ({ ...o, products: parseJsonField(o.products) })) };
    },
    get: async (id) => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) throw { status: 404, message: 'Commande non trouvee.' };
      return { order: { ...data, products: parseJsonField(data.products) } };
    },
    create: async (data) => {
      const { full_name, phone, whatsapp, address, city, cart_items, images, delivery_fee, instructions, discount } = data;
      if (!full_name || !phone || !address || !city || !cart_items?.length) {
        throw { status: 400, message: 'Champs obligatoires manquants.' };
      }
      const computedSubtotal = cart_items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
      const delivery = Number(delivery_fee) || 30;
      const discountAmount = Number(discount) || 0;
      const computedTotal = Math.max(0, computedSubtotal - discountAmount + delivery);
      const id = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const payload = {
        id, customer_name: full_name, full_name, phone, whatsapp: whatsapp || '',
        address, city, products: cart_items, cart_items, images: images || [],
        total: computedTotal, delivery_fee: delivery, instructions: instructions || '',
        status: 'pending', discount_code: data.discount_code || null,
      };
      const { data: created, error } = await supabase.from('orders').insert(payload).select().single();
      if (error) throw { status: 500, message: error.message };
      return { order: { ...created, products: parseJsonField(created.products) } };
    },
    updateStatus: async (id, status) => {
      const { data: updated, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw { status: 500, message: error.message };
      return { order: { ...updated, products: parseJsonField(updated.products) } };
    },
    exportCsv: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw { status: 500, message: error.message };
      const safe = (val) => {
        const s = String(val || '');
        if (/^[=+\-@\t\r\n]/.test(s)) return "'" + s;
        return '"' + s.replace(/"/g, '""') + '"';
      };
      const header = 'ID,Customer,Phone,City,Address,Total,Status,Date\n';
      const rows = data.map(o =>
        `${safe(o.id)},${safe(o.customer_name)},${safe(o.phone)},${safe(o.city)},${safe(o.address)},${o.total || 0},${safe(o.status)},${safe(o.created_at)}`
      ).join('\n');
      return new Blob([header + rows], { type: 'text/csv' });
    },
  },

  feedbacks: {
    list: async (limit = 20) => {
      const { data, error } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false }).limit(limit);
      if (error) throw { status: 500, message: error.message };
      return { feedbacks: data };
    },
    create: async (data) => {
      const { author, rating, comment } = data;
      if (!author || !rating) throw { status: 400, message: 'Auteur et note requis.' };
      const { data: created, error } = await supabase.from('feedbacks').insert({ author, rating, comment: comment || '', date: new Date().toISOString().split('T')[0] }).select().single();
      if (error) throw { status: 500, message: error.message };
      return { feedback: created };
    },
    delete: async (id) => {
      const { error } = await supabase.from('feedbacks').delete().eq('id', id);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Avis supprime.' };
    },
  },

  settings: {
    get: async () => {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw { status: 500, message: error.message };
      const settings = {};
      data.forEach(r => { settings[r.key] = r.value; });
      return { settings };
    },
    update: async (data) => {
      const rows = Object.entries(data).map(([key, value]) => ({ key, value: String(value), updated_at: new Date().toISOString() }));
      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
      if (error) throw { status: 500, message: error.message };
      const { data: all } = await supabase.from('settings').select('*');
      const settings = {};
      (all || []).forEach(r => { settings[r.key] = r.value; });
      return { settings };
    },
    gallery: {
      list: async () => {
        const { data, error } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
        if (error) throw { status: 500, message: error.message };
        return { gallery: data };
      },
      create: async (gdata) => {
        const { title, image, category } = gdata;
        if (!title) throw { status: 400, message: 'Titre requis.' };
        const { data: created, error } = await supabase.from('gallery_items').insert({ title, image: image || '', category: category || 'anime' }).select().single();
        if (error) throw { status: 500, message: error.message };
        return { item: created };
      },
      delete: async (id) => {
        const { error } = await supabase.from('gallery_items').delete().eq('id', id);
        if (error) throw { status: 500, message: error.message };
        return { message: 'Image supprimee.' };
      },
    },
    discounts: {
      list: async () => {
        const { data, error } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
        if (error) throw { status: 500, message: error.message };
        return { discounts: data.map(c => ({ ...c, active: Boolean(c.active) })) };
      },
      create: async (ddata) => {
        const { code, percentage } = ddata;
        if (!code || !percentage) throw { status: 400, message: 'Code et pourcentage requis.' };
        const { data: created, error } = await supabase.from('discount_codes').insert({ code: code.toUpperCase(), percentage }).select().single();
        if (error) {
          if (error.code === '23505') throw { status: 409, message: 'Ce code existe deja.' };
          throw { status: 500, message: error.message };
        }
        return { discount: { ...created, active: Boolean(created.active) } };
      },
      delete: async (id) => {
        const { error } = await supabase.from('discount_codes').delete().eq('id', id);
        if (error) throw { status: 500, message: error.message };
        return { message: 'Code supprime.' };
      },
      validate: async (code) => {
        const { data, error } = await supabase.from('discount_codes').select('code, percentage').eq('code', code.toUpperCase()).eq('active', true).single();
        if (error || !data) throw { status: 404, message: 'Code invalide.' };
        return { discount: data };
      },
    },
  },

  upload: {
    image: async (file) => {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
      if (error) throw { status: 500, message: error.message };
      const { data: urlData } = supabase.storage.from('products').getPublicUrl(path);
      return { url: urlData.publicUrl, filename: path };
    },
    multiple: async (files) => {
      const urls = [];
      for (const file of files) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('uploads').upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
        if (error) throw { status: 500, message: error.message };
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }
      return { urls };
    },
    checkout: async (files) => {
      const urls = [];
      for (const file of files) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('uploads').upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
        if (error) throw { status: 500, message: error.message };
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }
      return { urls };
    },
    delete: async (filenameOrUrl) => {
      let path = filenameOrUrl;
      if (filenameOrUrl.startsWith('http')) {
        const match = filenameOrUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (match) path = match[2];
      }
      const bucketMatch = path.match(/^(products|uploads|gallery)\//);
      const bucket = bucketMatch ? bucketMatch[1] : 'uploads';
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Image supprimee.' };
    },
  },

  offers: {
    list: async () => {
      const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
      if (error) throw { status: 500, message: error.message };
      return { offers: data.map(o => ({ ...o, product_ids: parseJsonField(o.product_ids), active: Boolean(o.active) })) };
    },
    listActive: async () => {
      const now = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.from('offers').select('*').eq('active', true).or(`start_date.eq.,start_date.lte.${now}`).or(`end_date.eq.,end_date.gte.${now}`).order('created_at', { ascending: false });
      if (error) throw { status: 500, message: error.message };
      return { offers: data.map(o => ({ ...o, product_ids: parseJsonField(o.product_ids), active: Boolean(o.active) })) };
    },
    create: async (odata) => {
      const { title, description, discount_type, discount_value, product_ids, start_date, end_date } = odata;
      if (!title || discount_value === undefined) throw { status: 400, message: 'Titre et valeur de remise requis.' };
      const payload = { title, description: description || '', discount_type: discount_type || 'percentage', discount_value, product_ids: product_ids || [], start_date: start_date || '', end_date: end_date || '' };
      const { data: created, error } = await supabase.from('offers').insert(payload).select().single();
      if (error) throw { status: 500, message: error.message };
      return { offer: { ...created, product_ids: parseJsonField(created.product_ids), active: Boolean(created.active) } };
    },
    update: async (id, odata) => {
      const payload = { ...odata, updated_at: new Date().toISOString() };
      if (payload.product_ids) payload.product_ids = Array.isArray(payload.product_ids) ? payload.product_ids : [];
      const { data: updated, error } = await supabase.from('offers').update(payload).eq('id', id).select().single();
      if (error) throw { status: 500, message: error.message };
      return { offer: { ...updated, product_ids: parseJsonField(updated.product_ids), active: Boolean(updated.active) } };
    },
    delete: async (id) => {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Offre supprimee.' };
    },
  },

  notifications: {
    list: async (limit = 50) => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(limit);
      if (error) throw { status: 500, message: error.message };
      return { notifications: data };
    },
    unreadCount: async () => {
      const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('read', false);
      if (error) throw { status: 500, message: error.message };
      return { count: count || 0 };
    },
    markRead: async (id) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Marquee comme lue.' };
    },
    markAllRead: async () => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Toutes les notifications marquees comme lues.' };
    },
    delete: async (id) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Notification supprimee.' };
    },
  },

  categories: {
    list: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (error) throw { status: 500, message: error.message };
      return { categories: data };
    },
    listActive: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (error) throw { status: 500, message: error.message };
      return { categories: data };
    },
    get: async (id) => {
      const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
      if (error) throw { status: 404, message: 'Categorie non trouvee.' };
      return { category: data };
    },
    create: async (cdata) => {
      const { name, description, image, parent_id, sort_order } = cdata;
      if (!name?.trim()) throw { status: 400, message: 'Le nom est obligatoire.' };
      let slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
      const { data: existingSlug } = await supabase.from('categories').select('id').eq('slug', slug).single();
      if (existingSlug) slug = `${slug}-${Date.now()}`;
      const { data: created, error } = await supabase.from('categories').insert({ name: name.trim(), slug, description: description || '', image: image || '', parent_id: parent_id || null, sort_order: sort_order || 0 }).select().single();
      if (error) throw { status: 500, message: error.message };
      return { category: created };
    },
    update: async (id, cdata) => {
      const { data: existing } = await supabase.from('categories').select('*').eq('id', id).single();
      if (!existing) throw { status: 404, message: 'Categorie non trouvee.' };
      let slug = existing.slug;
      if (cdata.name && cdata.name.trim() !== existing.name) {
        slug = cdata.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
        const { data: dup } = await supabase.from('categories').select('id').eq('slug', slug).neq('id', id).single();
        if (dup) slug = `${slug}-${Date.now()}`;
      }
      const payload = {
        name: cdata.name?.trim() ?? existing.name, slug,
        description: cdata.description ?? existing.description,
        image: cdata.image ?? existing.image,
        parent_id: cdata.parent_id !== undefined ? (cdata.parent_id || null) : existing.parent_id,
        sort_order: cdata.sort_order ?? existing.sort_order,
        active: cdata.active !== undefined ? cdata.active : existing.active,
      };
      const { data: updated, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
      if (error) throw { status: 500, message: error.message };
      return { category: updated };
    },
    delete: async (id) => {
      await supabase.from('categories').update({ parent_id: null }).eq('parent_id', id);
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw { status: 500, message: error.message };
      return { message: 'Categorie supprimee.' };
    },
  },
};

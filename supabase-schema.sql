-- ============================================================
-- MOUL TABLEAUX — Supabase Schema (v4)
-- Serverless-first: Supabase DB + optional Express fallback
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Idempotent: safe to re-run
-- ============================================================

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  image TEXT DEFAULT '',
  stock INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'anime',
  badge TEXT DEFAULT NULL,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  reviews JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT DEFAULT '',
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  products JSONB DEFAULT '[]'::jsonb,
  cart_items JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  total NUMERIC(10, 2) DEFAULT 0,
  delivery_fee NUMERIC(10, 2) DEFAULT 30,
  status TEXT DEFAULT 'pending',
  instructions TEXT DEFAULT '',
  discount_code TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. FEEDBACKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS feedbacks (
  id BIGSERIAL PRIMARY KEY,
  author TEXT NOT NULL DEFAULT 'Anonyme',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  parent_id BIGINT DEFAULT NULL REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. GALLERY ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT DEFAULT '',
  category TEXT DEFAULT 'anime',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. DISCOUNT CODES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  percentage NUMERIC(5, 0) NOT NULL DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. OFFERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS offers (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 10,
  product_ids JSONB DEFAULT '[]'::jsonb,
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'order',
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  order_id TEXT DEFAULT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. ADMINS TABLE (legacy — authentication now uses Supabase Auth)
-- ============================================================
-- The admins table is kept for reference but is no longer used for authentication.
-- Admin users are now managed via Supabase Auth (Dashboard > Authentication > Users).
-- When creating an admin user in Supabase Auth, set user metadata: { "role": "admin" }
-- ============================================================

-- ============================================================
-- 11. ADMIN LOGIN — MIGRATED TO SUPABASE AUTH
-- ============================================================
-- The admin_login RPC function has been removed.
-- Login now uses: supabase.auth.signInWithPassword({ email, password })
-- Session management uses: supabase.auth.getSession() / onAuthStateChange()
-- Admin role is checked via user.user_metadata.role === 'admin'
-- ============================================================

-- ============================================================
-- SEED: Admin user — NOW VIA SUPABASE AUTH
-- ============================================================
-- Create admin users in Supabase Dashboard > Authentication > Users
-- Set user metadata: { "role": "admin" }
-- Default credentials: admin@moultableaux.com / moultableaux2026
-- ============================================================

-- ============================================================
-- SEED: Default categories
-- ============================================================
INSERT INTO categories (name, slug, description, sort_order, active) VALUES
('Anime Art', 'anime', 'Tableaux animes et heroiques', 1, true),
('Manga Panels', 'manga', 'Planches de manga cultes', 2, true),
('Wanted Posters', 'wanted', 'Booster reward posters', 3, true),
('Gaming & Neon', 'gaming', 'Art de jeux video et univers neon', 4, true),
('Cinema & Retro', 'movies', 'Films cultes et affiches vintage', 5, true),
('Football Legends', 'football', 'As du ballon rond', 6, true),
('Personal Photos', 'personal', 'Photos personnalisees', 7, true),
('Custom Creations', 'custom', 'Projets sur mesure', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: Default products
-- ============================================================
INSERT INTO products (name, price, category, image, badge, description, rating, reviews, stock) VALUES
('Luffy Gear 5 Wanted Poster', 180, 'wanted', '/img1.webp', 'new', 'Bounty Wanted Poster of Monkey D. Luffy in his legendary Gear 5 form. Printed on high-grade vintage canvas parchment texture.', 5.0, '[{"id":1,"author":"Youssef B.","rating":5,"date":"2026-06-12","text":"Qualite d impression incrayable!"}]', 50),
('Zoro Roronoa Wanted Poster (Wano)', 180, 'wanted', '/img2.webp', 'bestseller', 'The updated post-Wano bounty wanted poster for Roronoa Zoro. Vintage woodblock borders.', 4.9, '[{"id":1,"author":"Tariq A.","rating":5,"date":"2026-06-14","text":"Superbe! Je recommande vivement."}]', 50),
('Demon Slayer Hinokami Kagura Canvas', 220, 'anime', '/img3.webp', 'new', 'Vibrant, high-contrast digital brush artwork capturing Tanjiro Kamado performing the Sun Breathing technique.', 4.8, '[{"id":1,"author":"Nassim M.","rating":5,"date":"2026-06-03","text":"Les couleurs explosent sur le mur."}]', 50),
('Naruto & Sasuke Final Valley Canvas', 220, 'anime', '/img4.webp', NULL, 'Epic minimal silhouette depiction of the legendary final valley clash.', 4.9, '[{"id":1,"author":"Salma T.","rating":5,"date":"2026-05-29","text":"Je l ai offert a mon frere, il a adore!"}]', 50),
('Berserk Guts Black Swordsman Engraving', 250, 'manga', '/img5.webp', 'bestseller', 'Dark, highly detailed manga panel engraving print of Guts in his Berserker Armor.', 5.0, '[{"id":1,"author":"Kenza P.","rating":5,"date":"2026-06-01","text":"Le niveau de detail est incroyable."}]', 50),
('Elden Ring The Tarnished Wall Art', 230, 'gaming', '/img7.webp', 'new', 'Dark fantasy oil-painting aesthetic wall art showcasing the Tarnished facing the Erdtree.', 4.7, '[]', 50),
('Interstellar Gargantua Black Hole Art', 220, 'movies', '/img8.webp', NULL, 'High-definition glossy space art representing the massive black hole Gargantua from Interstellar.', 4.8, '[]', 50),
('Hakimi: Moroccan Lion Splash Art', 240, 'football', '/img6.webp', 'bestseller', 'Stunning dynamic watercolor paint-splatter poster of Achraf Hakimi celebrating.', 5.0, '[{"id":1,"author":"Morad L.","rating":5,"date":"2026-06-10","text":"Magnifique hommage a Hakimi!"}]', 50),
('Votre Tableau Sur Mesure (Premium)', 250, 'personal', '/img12.webp', 'new', 'Print your own photography, anime characters, or digital design on our premium textured canvases.', 5.0, '[{"id":1,"author":"Sofia K.","rating":5,"date":"2026-06-08","text":"J ai telecharge ma propre photo, qualite exceptionnelle!"}]', 50)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: Default discount codes
-- ============================================================
INSERT INTO discount_codes (code, percentage) VALUES
('MAROC10', 10),
('OTAKU20', 20),
('MOU50', 50)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED: Default settings
-- ============================================================
INSERT INTO settings (key, value) VALUES
('delivery_fee', '30'),
('min_order_qty', '1'),
('instagram_enabled', 'true'),
('tiktok_enabled', 'false'),
('whatsapp_phone', '212623391688'),
('whatsapp_images_enabled', 'true'),
('whatsapp_prefix', ''),
('whatsapp_suffix', ''),
('whatsapp_template', 'Nouvelle Commande Moul Tableaux

Ref: {{ref}}

Client:
{{name}}
{{phone}}
{{city}}
{{address}}
Notes: {{notes}}

Articles:
{{items}}

{{coupon}}
{{savings}}

Sous-total: {{subtotal}} DH
Livraison: {{delivery}} DH
Total: {{total}} DH (Paiement a la Livraison)

{{images}}

{{prefix}}{{suffix}}'),
('telegram_enabled', 'false'),
('telegram_bot_token', ''),
('telegram_chat_id', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- This app handles auth at the application level (admin login via RPC).
-- The anon key is public. RLS policies allow full access so the
-- frontend can read/write directly. Security is enforced by the
-- admin login gate in the frontend, not by database RLS.
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent re-run support)
DROP POLICY IF EXISTS "Products: public read" ON products;
DROP POLICY IF EXISTS "Products: auth insert" ON products;
DROP POLICY IF EXISTS "Products: auth update" ON products;
DROP POLICY IF EXISTS "Products: auth delete" ON products;
DROP POLICY IF EXISTS "Products: full access" ON products;

DROP POLICY IF EXISTS "Orders: public insert" ON orders;
DROP POLICY IF EXISTS "Orders: auth read" ON orders;
DROP POLICY IF EXISTS "Orders: auth update" ON orders;
DROP POLICY IF EXISTS "Orders: full access" ON orders;

DROP POLICY IF EXISTS "Feedbacks: public read" ON feedbacks;
DROP POLICY IF EXISTS "Feedbacks: public insert" ON feedbacks;
DROP POLICY IF EXISTS "Feedbacks: auth delete" ON feedbacks;
DROP POLICY IF EXISTS "Feedbacks: full access" ON feedbacks;

DROP POLICY IF EXISTS "Categories: public read" ON categories;
DROP POLICY IF EXISTS "Categories: auth insert" ON categories;
DROP POLICY IF EXISTS "Categories: auth update" ON categories;
DROP POLICY IF EXISTS "Categories: auth delete" ON categories;
DROP POLICY IF EXISTS "Categories: full access" ON categories;

DROP POLICY IF EXISTS "Gallery: public read" ON gallery_items;
DROP POLICY IF EXISTS "Gallery: auth insert" ON gallery_items;
DROP POLICY IF EXISTS "Gallery: auth delete" ON gallery_items;
DROP POLICY IF EXISTS "Gallery: full access" ON gallery_items;

DROP POLICY IF EXISTS "Discounts: public read" ON discount_codes;
DROP POLICY IF EXISTS "Discounts: auth insert" ON discount_codes;
DROP POLICY IF EXISTS "Discounts: auth delete" ON discount_codes;
DROP POLICY IF EXISTS "Discounts: full access" ON discount_codes;

DROP POLICY IF EXISTS "Settings: auth read" ON settings;
DROP POLICY IF EXISTS "Settings: auth insert" ON settings;
DROP POLICY IF EXISTS "Settings: auth update" ON settings;
DROP POLICY IF EXISTS "Settings: full access" ON settings;

DROP POLICY IF EXISTS "Offers: public read" ON offers;
DROP POLICY IF EXISTS "Offers: auth insert" ON offers;
DROP POLICY IF EXISTS "Offers: auth update" ON offers;
DROP POLICY IF EXISTS "Offers: auth delete" ON offers;
DROP POLICY IF EXISTS "Offers: full access" ON offers;

DROP POLICY IF EXISTS "Notifications: auth read" ON notifications;
DROP POLICY IF EXISTS "Notifications: auth insert" ON notifications;
DROP POLICY IF EXISTS "Notifications: auth update" ON notifications;
DROP POLICY IF EXISTS "Notifications: auth delete" ON notifications;
DROP POLICY IF EXISTS "Notifications: full access" ON notifications;

DROP POLICY IF EXISTS "Admins: service role" ON admins;
DROP POLICY IF EXISTS "Admins: RPC only" ON admins;

-- Permissive policies: full CRUD for anon + authenticated
-- (app-level auth via admin login, not Supabase Auth)
CREATE POLICY "Products: full access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Orders: full access" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Feedbacks: full access" ON feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Categories: full access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gallery: full access" ON gallery_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Discounts: full access" ON discount_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Settings: full access" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Offers: full access" ON offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Notifications: full access" ON notifications FOR ALL USING (true) WITH CHECK (true);
-- Admins table: RPC function is SECURITY DEFINER, bypasses RLS
-- No direct access from frontend needed
CREATE POLICY "Admins: RPC only" ON admins FOR ALL USING (false) WITH CHECK (false);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;

-- Storage policies (drop + recreate for idempotency)
DROP POLICY IF EXISTS "Public read products" ON storage.objects;
DROP POLICY IF EXISTS "Auth write products" ON storage.objects;
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
DROP POLICY IF EXISTS "Auth write uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth write gallery" ON storage.objects;

CREATE POLICY "Public read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Auth write products" ON storage.objects FOR ALL USING (bucket_id = 'products');
CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Auth write uploads" ON storage.objects FOR ALL USING (bucket_id = 'uploads');
CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Auth write gallery" ON storage.objects FOR ALL USING (bucket_id = 'gallery');


-- =============================================================
-- COMPLETE SCHEMA BASELINE
-- All tables, indexes, triggers, and RLS policies for PropertyCV
-- Safe to run on existing DB (uses IF NOT EXISTS)
-- =============================================================

-- =====================
-- 1. PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  avatar text,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  membership_level text NOT NULL DEFAULT 'basic' CHECK (membership_level IN ('basic', 'premium', 'vip')),
  verified boolean NOT NULL DEFAULT false,
  currency text NOT NULL DEFAULT 'EUR',
  language text NOT NULL DEFAULT 'en',
  theme text NOT NULL DEFAULT 'light',
  measurement_unit text NOT NULL DEFAULT 'metric',
  email_notifications boolean NOT NULL DEFAULT true,
  sms_notifications boolean NOT NULL DEFAULT false,
  price_alerts boolean NOT NULL DEFAULT false,
  new_listing_alerts boolean NOT NULL DEFAULT true,
  market_insights boolean NOT NULL DEFAULT false,
  agent_messages boolean NOT NULL DEFAULT true,
  whatsapp_number text,
  social_link text,
  facebook_handle text,
  instagram_handle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================
-- 2. PROPERTIES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  property_type text NOT NULL,
  listing_type text NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  total_area numeric,
  location text NOT NULL,
  island text NOT NULL,
  latitude double precision,
  longitude double precision,
  images text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented', 'archived')),
  year_built integer,
  furnished boolean NOT NULL DEFAULT false,
  ocean_view boolean NOT NULL DEFAULT false,
  beach_distance integer,
  price_per_sqm numeric,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_active_properties" ON public.properties;
CREATE POLICY "select_active_properties" ON public.properties
  FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "insert_own_properties" ON public.properties;
CREATE POLICY "insert_own_properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "update_own_properties" ON public.properties;
CREATE POLICY "update_own_properties" ON public.properties
  FOR UPDATE TO authenticated USING (auth.uid() = agent_id) WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "delete_own_properties" ON public.properties;
CREATE POLICY "delete_own_properties" ON public.properties
  FOR DELETE TO authenticated USING (auth.uid() = agent_id);

CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_island ON public.properties(island);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);


-- =====================
-- 3. MARKETPLACE_ITEMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price_cve numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Other',
  subcategory text,
  condition text DEFAULT 'used',
  island text NOT NULL DEFAULT 'Santiago',
  municipality text,
  images text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_phone text,
  contact_whatsapp text,
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_active_marketplace_items" ON public.marketplace_items;
CREATE POLICY "select_active_marketplace_items" ON public.marketplace_items
  FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "insert_own_marketplace_items" ON public.marketplace_items;
CREATE POLICY "insert_own_marketplace_items" ON public.marketplace_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_marketplace_items" ON public.marketplace_items;
CREATE POLICY "update_own_marketplace_items" ON public.marketplace_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_marketplace_items" ON public.marketplace_items;
CREATE POLICY "delete_own_marketplace_items" ON public.marketplace_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_island ON public.marketplace_items(island);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_user_id ON public.marketplace_items(user_id);


-- =====================
-- 4. MARKETPLACE INQUIRIES
-- =====================
CREATE TABLE IF NOT EXISTS public.marketplace_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.marketplace_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_marketplace_inquiries" ON public.marketplace_inquiries;
CREATE POLICY "select_own_marketplace_inquiries" ON public.marketplace_inquiries
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "insert_marketplace_inquiry" ON public.marketplace_inquiries;
CREATE POLICY "insert_marketplace_inquiry" ON public.marketplace_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);


-- =====================
-- 5. FAVORITES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON public.favorites;
CREATE POLICY "select_own_favorites" ON public.favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON public.favorites;
CREATE POLICY "insert_own_favorites" ON public.favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON public.favorites;
CREATE POLICY "delete_own_favorites" ON public.favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

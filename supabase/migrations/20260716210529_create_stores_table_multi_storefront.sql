/*
# Multi-Storefront Architecture: Create stores table and link to listings

1. Modified Tables
   - `profiles`
     - Add `max_stores` (integer, default 1) — max number of branded storefronts a user can create
   
2. New Tables
   - `stores` — represents a branded storefront that users can create
     - `id` (uuid, primary key)
     - `owner_id` (uuid, FK to profiles.id, defaults to auth.uid()) — the store owner
     - `slug` (text, unique) — clean URL handle for the store
     - `title` (text, not null) — display name
     - `description` (text) — store bio
     - `logo_url` (text) — logo image path
     - `banner_url` (text) — banner image path
     - `store_location` (text) — physical location or region
     - `category_focus` (text) — primary category (Imobiliario, Automovel, Geral, etc.)
     - `created_at` (timestamptz)

3. Modified Tables (add store_id foreign key)
   - `properties` — add nullable `store_id` (uuid, FK to stores.id ON DELETE SET NULL)
   - `marketplace_items` — add nullable `store_id` (uuid, FK to stores.id ON DELETE SET NULL)
   - When store_id is NULL, the listing belongs to a casual C2C profile.
   - When store_id is populated, the listing belongs to that branded storefront.

4. Security
   - RLS enabled on `stores`
   - Public SELECT (anon + authenticated) for stores — storefronts are publicly browseable
   - INSERT restricted to authenticated users with ownership check
   - UPDATE/DELETE restricted to the store owner only
   - Properties/marketplace_items existing policies remain unchanged (store_id is additive)

5. Important Notes
   - The `max_stores` column on profiles controls how many stores a user can create
   - The `paywall_active` column (already exists) gates whether the limit is enforced
   - If paywall_active=false OR store count < max_stores, user can create freely
   - Indexes added on store_id columns and owner_id for query performance
*/

-- Add max_stores to profiles (paywall_active already exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'max_stores') THEN
    ALTER TABLE public.profiles ADD COLUMN max_stores integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  store_location text,
  category_focus text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores (owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores (slug);

-- Public read access (storefronts are public)
DROP POLICY IF EXISTS "public_select_stores" ON public.stores;
CREATE POLICY "public_select_stores" ON public.stores FOR SELECT
  TO anon, authenticated USING (true);

-- Only owner can insert their own stores
DROP POLICY IF EXISTS "owner_insert_stores" ON public.stores;
CREATE POLICY "owner_insert_stores" ON public.stores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

-- Only owner can update their own stores
DROP POLICY IF EXISTS "owner_update_stores" ON public.stores;
CREATE POLICY "owner_update_stores" ON public.stores FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Only owner can delete their own stores
DROP POLICY IF EXISTS "owner_delete_stores" ON public.stores;
CREATE POLICY "owner_delete_stores" ON public.stores FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- Add store_id to properties
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'store_id') THEN
    ALTER TABLE public.properties ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add store_id to marketplace_items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'store_id') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_properties_store_id ON public.properties (store_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_store_id ON public.marketplace_items (store_id);
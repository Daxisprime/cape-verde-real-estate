CREATE TABLE IF NOT EXISTS vendor_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('real_estate', 'item_service')),
  title text NOT NULL,
  price numeric NOT NULL,
  description text,
  island text NOT NULL,
  zone text,
  address text,
  bedrooms smallint,
  bathrooms smallint,
  square_meters numeric,
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived', 'draft')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vendor_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_vendor_ads_public" ON vendor_ads FOR SELECT
  TO anon, authenticated USING (status = 'active');

CREATE POLICY "insert_own_ads" ON vendor_ads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "update_own_ads" ON vendor_ads FOR UPDATE
  TO authenticated USING (auth.uid() = vendor_id) WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "delete_own_ads" ON vendor_ads FOR DELETE
  TO authenticated USING (auth.uid() = vendor_id);

CREATE INDEX idx_vendor_ads_vendor ON vendor_ads(vendor_id);
CREATE INDEX idx_vendor_ads_mode ON vendor_ads(mode);
CREATE INDEX idx_vendor_ads_island ON vendor_ads(island);
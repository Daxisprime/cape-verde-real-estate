
CREATE TABLE IF NOT EXISTS marketplace_items (
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_phone text,
  contact_whatsapp text,
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Public read access for active listings
CREATE POLICY "select_active_marketplace_items" ON marketplace_items FOR SELECT
  USING (status = 'active');

-- Authenticated users can insert their own items
CREATE POLICY "insert_own_marketplace_items" ON marketplace_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "update_own_marketplace_items" ON marketplace_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "delete_own_marketplace_items" ON marketplace_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for common queries
CREATE INDEX idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX idx_marketplace_items_island ON marketplace_items(island);
CREATE INDEX idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX idx_marketplace_items_created_at ON marketplace_items(created_at DESC);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  total_area NUMERIC(10, 2),
  location TEXT NOT NULL,
  island TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] DEFAULT '{}'::TEXT[],
  features TEXT[] DEFAULT '{}'::TEXT[],
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented', 'archived')),
  year_built INTEGER,
  furnished BOOLEAN NOT NULL DEFAULT false,
  ocean_view BOOLEAN NOT NULL DEFAULT false,
  beach_distance INTEGER,
  price_per_sqm NUMERIC(10, 2),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_properties_island ON properties(island);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = true;
CREATE INDEX idx_properties_created ON properties(created_at DESC);

-- RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Anyone can view active properties
CREATE POLICY "select_active_properties" ON properties FOR SELECT
  USING (status = 'active');

-- Authenticated users who own the listing can insert
CREATE POLICY "insert_own_properties" ON properties FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = agent_id);

-- Owners can update their own properties
CREATE POLICY "update_own_properties" ON properties FOR UPDATE
  TO authenticated USING (auth.uid() = agent_id) WITH CHECK (auth.uid() = agent_id);

-- Owners can delete their own properties
CREATE POLICY "delete_own_properties" ON properties FOR DELETE
  TO authenticated USING (auth.uid() = agent_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_properties_updated_at();

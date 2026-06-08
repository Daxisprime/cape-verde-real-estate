-- ============================================
-- ProCV Database Schema v2.0
-- Unified Profiles + Properties for Cape Verde
-- Linked to Supabase Auth
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (Linked to Supabase Auth)
-- ============================================
-- This table extends auth.users with app-specific data
-- Automatically created when a user signs up

DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  -- Links to Supabase Auth (auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,

  -- Multi-role support: buyer, agent, vendor, admin
  -- A user can have multiple roles (e.g., buyer + vendor)
  roles TEXT[] DEFAULT ARRAY['buyer']::TEXT[] NOT NULL,

  -- Profile status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_roles CHECK (
    roles <@ ARRAY['buyer', 'agent', 'vendor', 'admin']::TEXT[]
  ),
  CONSTRAINT roles_not_empty CHECK (array_length(roles, 1) > 0)
);

-- Index for role-based queries
CREATE INDEX idx_profiles_roles ON profiles USING GIN(roles);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- 2. PROPERTIES TABLE
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Property details
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE, -- URL-friendly identifier

  -- Pricing
  price DECIMAL(12,2) NOT NULL,
  price_currency TEXT DEFAULT 'EUR',
  price_type TEXT DEFAULT 'sale' CHECK (price_type IN ('sale', 'rent')),

  -- Property characteristics
  property_type TEXT NOT NULL CHECK (property_type IN (
    'apartment', 'house', 'villa', 'penthouse', 'townhouse',
    'land', 'commercial', 'hotel', 'resort'
  )),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  total_area DECIMAL(10,2), -- in square meters
  lot_size DECIMAL(10,2), -- in square meters
  year_built INTEGER,

  -- Cape Verde location
  island TEXT NOT NULL CHECK (island IN (
    'Santiago', 'Santo Antão', 'São Vicente', 'São Nicolau',
    'Sal', 'Boa Vista', 'Maio', 'Fogo', 'Brava'
  )),
  city TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  coordinates DECIMAL[] DEFAULT ARRAY[0, 0]::DECIMAL[], -- [longitude, latitude]

  -- Media
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_url TEXT,
  virtual_tour_url TEXT,

  -- Features & amenities
  features TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Ownership & status
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending', 'active', 'sold', 'rented', 'archived'
  )),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_properties_island ON properties(island);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = true;
CREATE INDEX idx_properties_slug ON properties(slug);

-- ============================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. AUTO-UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. GENERATE PROPERTY SLUG
-- ============================================

CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      )
    ) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_property_slug_trigger
  BEFORE INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION generate_property_slug();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Active properties are viewable by everyone"
  ON properties FOR SELECT
  USING (status = 'active' OR agent_id = auth.uid());

CREATE POLICY "Agents can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND 'agent' = ANY(roles)
    )
  );

CREATE POLICY "Agents can update own properties"
  ON properties FOR UPDATE
  USING (agent_id = auth.uid());

CREATE POLICY "Agents can delete own properties"
  ON properties FOR DELETE
  USING (agent_id = auth.uid());

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND check_role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add role to user
CREATE OR REPLACE FUNCTION add_role_to_user(user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET roles = array_append(roles, new_role)
  WHERE id = user_id AND NOT (new_role = ANY(roles));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. SEED CAPE VERDE PROPERTIES
-- ============================================

INSERT INTO properties (
  title, description, price, price_type, property_type,
  bedrooms, bathrooms, total_area, island, city,
  coordinates, images, features, status, is_featured, is_verified
) VALUES
-- Santiago Island
('Modern Apartment in Praia Centro',
 'Beautifully renovated apartment in the heart of Praia with stunning city views. Walking distance to Plateau and all amenities.',
 185000, 'sale', 'apartment', 2, 2, 95, 'Santiago', 'Praia',
 ARRAY[-23.5133, 14.9177],
 ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
 ARRAY['City View', 'Balcony', 'Parking', 'Security', 'Elevator'],
 'active', false, true),

('Seaside Townhouse in Tarrafal',
 'Charming townhouse just steps from the famous Tarrafal beach. Perfect for families or vacation rental investment.',
 275000, 'sale', 'townhouse', 3, 2, 160, 'Santiago', 'Tarrafal',
 ARRAY[-23.7500, 15.2833],
 ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'],
 ARRAY['Near Beach', 'Terrace', 'Garden', 'Parking'],
 'active', false, true),

-- Sal Island
('Luxury Beachfront Villa in Santa Maria',
 'Stunning 4-bedroom villa with direct beach access and infinity pool. Premium finishes throughout, perfect for luxury living or high-end rentals.',
 890000, 'sale', 'villa', 4, 3, 280, 'Sal', 'Santa Maria',
 ARRAY[-22.9018, 16.5897],
 ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
 ARRAY['Ocean View', 'Pool', 'Beach Access', 'Garden', 'Garage', 'Solar Panels'],
 'active', true, true),

('Investment Studio Near Beach',
 'Modern studio apartment in popular tourist area. Excellent rental potential with resort amenities access.',
 95000, 'sale', 'apartment', 0, 1, 45, 'Sal', 'Santa Maria',
 ARRAY[-22.8985, 16.6012],
 ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
 ARRAY['Near Beach', 'Furnished', 'Pool Access', 'Reception'],
 'active', false, true),

('Prime Development Land',
 'Large plot with approved building permits in growing area. Utilities available, perfect for residential development.',
 150000, 'sale', 'land', 0, 0, 1500, 'Sal', 'Espargos',
 ARRAY[-22.9444, 16.7500],
 ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
 ARRAY['Building Permit', 'Utilities Available', 'Road Access', 'Flat Terrain'],
 'active', false, true),

-- São Vicente Island
('Panoramic Penthouse in Mindelo',
 'Exceptional penthouse with 360° views of Mindelo bay and Monte Verde. Private rooftop terrace, modern design.',
 680000, 'sale', 'penthouse', 3, 3, 220, 'São Vicente', 'Mindelo',
 ARRAY[-24.9956, 16.8755],
 ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
 ARRAY['Ocean View', 'Roof Terrace', 'Elevator', 'Parking', 'Smart Home'],
 'active', true, true),

-- Boa Vista Island
('Resort Condo with Rental Income',
 'Fully furnished apartment in 5-star resort. Currently generating rental income with professional management.',
 320000, 'sale', 'apartment', 1, 1, 65, 'Boa Vista', 'Sal Rei',
 ARRAY[-22.9167, 16.1667],
 ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
 ARRAY['Beach Access', 'Resort Amenities', 'Rental Income', 'Furnished', 'Pool'],
 'active', true, true),

-- Santo Antão Island
('Mountain Retreat with Valley Views',
 'Renovated traditional stone house in the lush Ribeira Grande valley. Authentic architecture with modern comforts.',
 220000, 'sale', 'house', 3, 2, 150, 'Santo Antão', 'Ribeira Grande',
 ARRAY[-25.0667, 17.1833],
 ARRAY['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'],
 ARRAY['Mountain View', 'Garden', 'Traditional Architecture', 'Quiet Location'],
 'active', false, true),

-- Fogo Island
('Volcanic Landscape Property',
 'Unique property at the base of Pico do Fogo volcano. Ideal for eco-tourism or wine production venture.',
 175000, 'sale', 'house', 2, 1, 120, 'Fogo', 'Chã das Caldeiras',
 ARRAY[-24.3833, 14.9333],
 ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'],
 ARRAY['Volcano View', 'Garden', 'Wine Region', 'Eco-Tourism Potential'],
 'active', false, true),

-- Maio Island
('Beachfront Plot on Maio',
 'Rare opportunity: beachfront land on pristine Maio island. Perfect for boutique hotel or private estate.',
 280000, 'sale', 'land', 0, 0, 2000, 'Maio', 'Vila do Maio',
 ARRAY[-23.2167, 15.1333],
 ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
 ARRAY['Beachfront', 'Development Potential', 'Pristine Location'],
 'active', true, true);

-- ============================================
-- 9. VERIFY SETUP
-- ============================================

SELECT
  'SCHEMA CREATED SUCCESSFULLY' as status,
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM properties WHERE is_featured) as featured_count;

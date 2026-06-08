-- =============================================
-- PROPERTIES TABLE VERIFICATION & CREATION SCRIPT
-- Run this in your Supabase SQL Editor
-- =============================================

-- Step 1: Create ENUM types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM (
            'apartment', 'house', 'villa', 'penthouse', 'townhouse',
            'land', 'commercial', 'hotel', 'resort'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status') THEN
        CREATE TYPE property_status AS ENUM (
            'draft', 'pending', 'active', 'sold', 'rented', 'archived'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_type') THEN
        CREATE TYPE price_type AS ENUM ('sale', 'rent');
    END IF;
END $$;

-- Step 2: Create the properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,

    -- Pricing
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    price_currency VARCHAR(3) DEFAULT 'CVE',
    price_type price_type DEFAULT 'sale',

    -- Property Details
    property_type property_type DEFAULT 'apartment',
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    total_area NUMERIC(10, 2),
    lot_size NUMERIC(10, 2),
    year_built INTEGER,

    -- Location
    island VARCHAR(50) NOT NULL DEFAULT 'Santiago',
    city VARCHAR(100) NOT NULL DEFAULT 'Praia',
    address TEXT,
    postal_code VARCHAR(20),
    coordinates DOUBLE PRECISION[] DEFAULT NULL, -- [latitude, longitude]

    -- Media
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    virtual_tour_url TEXT,

    -- Features
    features TEXT[] DEFAULT '{}',

    -- Relations
    agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Status & Flags
    status property_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Analytics
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Step 3: Add missing columns if table already exists
DO $$
BEGIN
    -- Add coordinates column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'coordinates') THEN
        ALTER TABLE properties ADD COLUMN coordinates DOUBLE PRECISION[] DEFAULT NULL;
    END IF;

    -- Add bedrooms column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bedrooms') THEN
        ALTER TABLE properties ADD COLUMN bedrooms INTEGER DEFAULT 0;
    END IF;

    -- Add bathrooms column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') THEN
        ALTER TABLE properties ADD COLUMN bathrooms INTEGER DEFAULT 0;
    END IF;

    -- Add images column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'images') THEN
        ALTER TABLE properties ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;

    -- Add property_type column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'property_type') THEN
        ALTER TABLE properties ADD COLUMN property_type VARCHAR(50) DEFAULT 'apartment';
    END IF;

    -- Add city column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'city') THEN
        ALTER TABLE properties ADD COLUMN city VARCHAR(100) DEFAULT 'Praia';
    END IF;

    -- Add island column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'island') THEN
        ALTER TABLE properties ADD COLUMN island VARCHAR(50) DEFAULT 'Santiago';
    END IF;

    -- Add price_currency column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'price_currency') THEN
        ALTER TABLE properties ADD COLUMN price_currency VARCHAR(3) DEFAULT 'CVE';
    END IF;
END $$;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties USING GIN(coordinates);
CREATE INDEX IF NOT EXISTS idx_properties_island ON properties(island);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
CREATE POLICY "Anyone can view active properties" ON properties
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Agents can manage their own properties" ON properties;
CREATE POLICY "Agents can manage their own properties" ON properties
    FOR ALL USING (auth.uid() = agent_id);

-- Step 8: Insert sample Cape Verde properties for testing
INSERT INTO properties (title, description, price, price_currency, property_type, bedrooms, bathrooms, total_area, island, city, coordinates, images, status, is_featured)
VALUES
    ('Luxury Ocean View Villa', 'Stunning 4-bedroom villa with panoramic ocean views in Praia', 45000000, 'CVE', 'villa', 4, 3, 280, 'Santiago', 'Praia', ARRAY[14.9212, -23.5126], ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], 'active', true),
    ('Modern Palmarejo Apartment', 'Contemporary 3-bed apartment in upscale Palmarejo neighborhood', 12500000, 'CVE', 'apartment', 3, 2, 120, 'Santiago', 'Praia', ARRAY[14.9350, -23.5250], ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], 'active', false),
    ('Beachfront House Quebra Canela', 'Direct beach access, 3 bedrooms with stunning sunset views', 28000000, 'CVE', 'house', 3, 2, 180, 'Santiago', 'Praia', ARRAY[14.9150, -23.5050], ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], 'active', true),
    ('Penthouse Plateau', 'Exclusive penthouse in historic Plateau district with rooftop terrace', 35000000, 'CVE', 'penthouse', 2, 2, 150, 'Santiago', 'Praia', ARRAY[14.9180, -23.5100], ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], 'active', false),
    ('Family Home Terra Branca', 'Spacious family home with large garden in quiet Terra Branca', 22000000, 'CVE', 'house', 4, 3, 220, 'Santiago', 'Praia', ARRAY[14.9280, -23.5180], ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'], 'active', false),
    ('Santa Maria Beach Resort Villa', 'Luxury resort villa steps from Santa Maria beach', 65000000, 'CVE', 'villa', 5, 4, 350, 'Sal', 'Santa Maria', ARRAY[16.5988, -22.9058], ARRAY['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'], 'active', true),
    ('Mindelo Harbor View Apartment', 'Modern apartment overlooking Mindelo harbor', 15000000, 'CVE', 'apartment', 2, 1, 85, 'São Vicente', 'Mindelo', ARRAY[16.8842, -24.9879], ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], 'active', false),
    ('Boa Vista Beachfront Land', 'Prime beachfront development land in Boa Vista', 50000000, 'CVE', 'land', 0, 0, 5000, 'Boa Vista', 'Sal Rei', ARRAY[16.1857, -22.9175], ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], 'active', false)
ON CONFLICT DO NOTHING;

-- Step 9: Verify the table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

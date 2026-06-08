-- ============================================
-- ProCV COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- This creates everything and seeds 10 properties
-- ============================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Create Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  total_area DECIMAL(10,2),
  location TEXT NOT NULL,
  island TEXT NOT NULL,
  coordinates DECIMAL[],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Step 6: Create Inquiries table
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Create indexes for performance
CREATE INDEX idx_properties_island ON properties(island);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_price ON properties(price);

-- Step 8: Seed 10 Cape Verde properties
INSERT INTO properties (title, description, price, property_type, listing_type, bedrooms, bathrooms, total_area, location, island, images, features, is_featured, is_verified, status) VALUES
('Modern Beachfront Villa', 'Stunning villa with ocean views and direct beach access. Features infinity pool, outdoor kitchen, and private garden.', 450000, 'Villa', 'sale', 4, 3, 280, 'Santa Maria, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], ARRAY['Ocean View', 'Pool', 'Garden', 'Garage'], true, true, 'active'),

('City Center Apartment', 'Modern apartment in the heart of Praia with stunning city views. Walking distance to restaurants and shops.', 185000, 'Apartment', 'sale', 2, 2, 95, 'Praia, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ARRAY['City View', 'Balcony', 'Parking'], false, true, 'active'),

('Ocean View Penthouse', 'Luxury penthouse with panoramic ocean views, private rooftop terrace, and modern finishes throughout.', 680000, 'Penthouse', 'sale', 3, 3, 220, 'Mindelo, Sao Vicente', 'Sao Vicente', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], ARRAY['Ocean View', 'Roof Terrace', 'Elevator'], true, true, 'active'),

('Traditional Stone House', 'Charming renovated stone house with authentic Cape Verdean architecture. Perfect blend of tradition and modern comfort.', 220000, 'House', 'sale', 3, 2, 150, 'Ribeira Grande, Santo Antao', 'Santo Antao', ARRAY['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'], ARRAY['Mountain View', 'Garden', 'Traditional'], false, true, 'active'),

('Beachfront Resort Condo', 'Investment opportunity in a 5-star resort. Fully furnished with rental management included.', 320000, 'Apartment', 'sale', 1, 1, 65, 'Sal Rei, Boa Vista', 'Boa Vista', ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], ARRAY['Beach Access', 'Resort Amenities', 'Rental Income'], true, true, 'active'),

('Mountain Retreat', 'Peaceful mountain property with breathtaking views of the volcanic landscape. Ideal for nature lovers.', 175000, 'House', 'sale', 2, 1, 120, 'Cha das Caldeiras, Fogo', 'Fogo', ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'], ARRAY['Mountain View', 'Garden', 'Quiet Location'], false, true, 'active'),

('Luxury Beach Villa', 'Exclusive beachfront property with private pool and direct beach access. Premium location in Santa Maria.', 890000, 'Villa', 'sale', 5, 4, 350, 'Santa Maria, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'], ARRAY['Private Beach', 'Pool', 'Staff Quarters', 'Garage'], true, true, 'active'),

('Modern Studio Apartment', 'Cozy studio perfect for young professionals or investors. Great rental potential in prime location.', 95000, 'Apartment', 'sale', 0, 1, 45, 'Praia, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], ARRAY['City Center', 'Modern Kitchen', 'Balcony'], false, true, 'active'),

('Seaside Townhouse', 'Beautiful townhouse steps from the beach. Perfect for family living or vacation home.', 275000, 'Townhouse', 'sale', 3, 2, 160, 'Tarrafal, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'], ARRAY['Near Beach', 'Terrace', 'Parking'], false, true, 'active'),

('Investment Land Plot', 'Prime development land with approved building permits. Excellent investment opportunity.', 150000, 'Land', 'sale', 0, 0, 1500, 'Espargos, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], ARRAY['Building Permit', 'Utilities Available', 'Road Access'], false, true, 'active');

-- Step 9: Verify everything worked
SELECT
  '✅ SUCCESS!' as status,
  (SELECT COUNT(*) FROM properties) as properties_created,
  (SELECT COUNT(*) FROM properties WHERE is_featured = true) as featured_properties;

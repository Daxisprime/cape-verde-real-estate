-- ProCV Database Quick Setup
-- Copy this entire file and paste into Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT DEFAULT 'sale',
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  total_area DECIMAL(10,2),
  location TEXT NOT NULL,
  island TEXT NOT NULL,
  coordinates DECIMAL[],
  images TEXT[],
  features TEXT[],
  agent_id UUID REFERENCES users(id),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO properties (title, description, price, property_type, listing_type, bedrooms, bathrooms, total_area, location, island, images, features, is_featured, is_verified, status) VALUES
('Modern Beachfront Villa', 'Stunning villa with ocean views', 450000, 'Villa', 'sale', 4, 3, 280, 'Santa Maria, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], ARRAY['Ocean View', 'Pool', 'Garden'], true, true, 'active'),
('City Center Apartment', 'Modern apartment in Praia', 185000, 'Apartment', 'sale', 2, 2, 95, 'Praia, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ARRAY['City View', 'Balcony'], false, true, 'active'),
('Ocean View Penthouse', 'Luxury penthouse in Mindelo', 680000, 'Penthouse', 'sale', 3, 3, 220, 'Mindelo, Sao Vicente', 'Sao Vicente', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], ARRAY['Ocean View', 'Terrace'], true, true, 'active'),
('Traditional Stone House', 'Charming renovated house', 220000, 'House', 'sale', 3, 2, 150, 'Ribeira Grande, Santo Antao', 'Santo Antao', ARRAY['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'], ARRAY['Mountain View', 'Garden'], false, true, 'active'),
('Beachfront Resort Condo', 'Investment opportunity', 320000, 'Apartment', 'sale', 1, 1, 65, 'Sal Rei, Boa Vista', 'Boa Vista', ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], ARRAY['Beach Access', 'Resort'], true, true, 'active'),
('Mountain Retreat', 'Peaceful mountain property', 175000, 'House', 'sale', 2, 1, 120, 'Cha das Caldeiras, Fogo', 'Fogo', ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'], ARRAY['Mountain View', 'Garden'], false, true, 'active'),
('Luxury Beach Villa', 'Exclusive beachfront property', 890000, 'Villa', 'sale', 5, 4, 350, 'Santa Maria, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'], ARRAY['Private Beach', 'Pool'], true, true, 'active'),
('Modern Studio', 'Perfect for investors', 95000, 'Apartment', 'sale', 0, 1, 45, 'Praia, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], ARRAY['City Center', 'Modern'], false, true, 'active'),
('Seaside Townhouse', 'Steps from the beach', 275000, 'Townhouse', 'sale', 3, 2, 160, 'Tarrafal, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'], ARRAY['Near Beach', 'Terrace'], false, true, 'active'),
('Investment Land', 'Prime development land', 150000, 'Land', 'sale', 0, 0, 1500, 'Espargos, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], ARRAY['Building Permit'], false, true, 'active');

SELECT 'SUCCESS! Created 4 tables with 10 Cape Verde properties!' as result;

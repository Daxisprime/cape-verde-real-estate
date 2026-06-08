-- =============================================
-- ProCV Cape Verde Real Estate Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROPERTIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  total_area DECIMAL(10, 2),
  location TEXT NOT NULL,
  island TEXT NOT NULL,
  coordinates DECIMAL[] DEFAULT ARRAY[0, 0],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- =============================================
-- INQUIRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  participant_ids UUID[] NOT NULL,
  title TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SEARCH ALERTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS search_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_properties_island ON properties(island);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

-- Properties: Anyone can read active properties
CREATE POLICY "Anyone can view active properties" ON properties
  FOR SELECT USING (status = 'active');

-- Properties: Agents can manage their own properties
CREATE POLICY "Agents can manage own properties" ON properties
  FOR ALL USING (auth.uid() = agent_id);

-- Users: Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users: Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Inquiries: Users can view and create their own inquiries
CREATE POLICY "Users can manage own inquiries" ON inquiries
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = agent_id);

-- Messages: Users can view messages in their conversations
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

-- Search Alerts: Users can manage their own alerts
CREATE POLICY "Users can manage own alerts" ON search_alerts
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SEED DATA: Cape Verde Properties
-- =============================================
INSERT INTO properties (title, description, price, property_type, listing_type, bedrooms, bathrooms, total_area, location, island, coordinates, images, features, is_featured, is_verified, status)
VALUES
  ('Modern Beachfront Villa', 'Stunning modern villa with direct beach access and panoramic ocean views. Features include infinity pool, outdoor kitchen, and private garden.', 450000, 'Villa', 'sale', 4, 3, 280, 'Santa Maria, Sal', 'Sal', ARRAY[-22.9018, 16.5897], ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], ARRAY['Ocean View', 'Pool', 'Garden', 'Garage'], true, true, 'active'),

  ('City Center Apartment', 'Modern apartment in the heart of Praia with stunning city views. Walking distance to restaurants and shops.', 185000, 'Apartment', 'sale', 2, 2, 95, 'Praia, Santiago', 'Santiago', ARRAY[-23.5133, 14.9177], ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ARRAY['City View', 'Balcony', 'Parking'], false, true, 'active'),

  ('Ocean View Penthouse', 'Luxury penthouse with panoramic ocean views, private rooftop terrace, and modern finishes throughout.', 680000, 'Penthouse', 'sale', 3, 3, 220, 'Mindelo, São Vicente', 'São Vicente', ARRAY[-24.9956, 16.8755], ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], ARRAY['Ocean View', 'Roof Terrace', 'Elevator'], true, true, 'active'),

  ('Traditional Stone House', 'Charming renovated stone house with authentic Cape Verdean architecture. Perfect blend of tradition and modern comfort.', 220000, 'House', 'sale', 3, 2, 150, 'Ribeira Grande, Santo Antão', 'Santo Antão', ARRAY[-25.0667, 17.1833], ARRAY['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'], ARRAY['Mountain View', 'Garden', 'Traditional'], false, true, 'active'),

  ('Beachfront Resort Condo', 'Investment opportunity in a 5-star resort. Fully furnished with rental management included.', 320000, 'Apartment', 'sale', 1, 1, 65, 'Sal Rei, Boa Vista', 'Boa Vista', ARRAY[-22.9167, 16.1667], ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], ARRAY['Beach Access', 'Resort Amenities', 'Rental Income'], true, true, 'active'),

  ('Mountain Retreat', 'Peaceful mountain property with breathtaking views of the volcanic landscape. Ideal for nature lovers.', 175000, 'House', 'sale', 2, 1, 120, 'Chã das Caldeiras, Fogo', 'Fogo', ARRAY[-24.3833, 14.9333], ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'], ARRAY['Mountain View', 'Garden', 'Quiet Location'], false, true, 'active'),

  ('Luxury Beach Villa', 'Exclusive beachfront property with private pool and direct beach access. Premium location.', 890000, 'Villa', 'sale', 5, 4, 350, 'Santa Maria, Sal', 'Sal', ARRAY[-22.8985, 16.6012], ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'], ARRAY['Private Beach', 'Pool', 'Staff Quarters', 'Garage'], true, true, 'active'),

  ('Modern Studio Apartment', 'Cozy studio perfect for young professionals or investors. Great rental potential.', 95000, 'Apartment', 'sale', 0, 1, 45, 'Praia, Santiago', 'Santiago', ARRAY[-23.5089, 14.9211], ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], ARRAY['City Center', 'Modern Kitchen', 'Balcony'], false, true, 'active'),

  ('Seaside Townhouse', 'Beautiful townhouse steps from the beach. Perfect for family living or vacation home.', 275000, 'Townhouse', 'sale', 3, 2, 160, 'Tarrafal, Santiago', 'Santiago', ARRAY[-23.7500, 15.2833], ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'], ARRAY['Near Beach', 'Terrace', 'Parking'], false, true, 'active'),

  ('Investment Land Plot', 'Prime development land with approved building permits. Excellent investment opportunity.', 150000, 'Land', 'sale', 0, 0, 1500, 'Espargos, Sal', 'Sal', ARRAY[-22.9444, 16.7500], ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], ARRAY['Building Permit', 'Utilities Available', 'Road Access'], false, true, 'active')

ON CONFLICT DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'ProCV Database Schema Created Successfully!' as status;

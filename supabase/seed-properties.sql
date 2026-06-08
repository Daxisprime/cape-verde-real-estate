-- ProCV Property Seeding
-- Run this in Supabase SQL Editor to add properties
-- This runs with admin privileges, bypassing RLS

INSERT INTO properties (title, description, price, property_type, listing_type, bedrooms, bathrooms, total_area, location, island, images, features, is_featured, is_verified, status)
VALUES
  ('Modern Beachfront Villa', 'Stunning villa with ocean views and direct beach access', 450000, 'Villa', 'sale', 4, 3, 280, 'Santa Maria, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], ARRAY['Ocean View', 'Pool', 'Garden', 'Garage'], true, true, 'active'),

  ('City Center Apartment', 'Modern apartment in the heart of Praia', 185000, 'Apartment', 'sale', 2, 2, 95, 'Praia, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ARRAY['City View', 'Balcony', 'Parking'], false, true, 'active'),

  ('Ocean View Penthouse', 'Luxury penthouse with panoramic ocean views', 680000, 'Penthouse', 'sale', 3, 3, 220, 'Mindelo, Sao Vicente', 'Sao Vicente', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], ARRAY['Ocean View', 'Roof Terrace', 'Elevator'], true, true, 'active'),

  ('Traditional Stone House', 'Charming renovated house with authentic architecture', 220000, 'House', 'sale', 3, 2, 150, 'Ribeira Grande, Santo Antao', 'Santo Antao', ARRAY['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'], ARRAY['Mountain View', 'Garden', 'Traditional'], false, true, 'active'),

  ('Beachfront Resort Condo', 'Investment opportunity in a 5-star resort', 320000, 'Apartment', 'sale', 1, 1, 65, 'Sal Rei, Boa Vista', 'Boa Vista', ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], ARRAY['Beach Access', 'Resort Amenities', 'Rental Income'], true, true, 'active'),

  ('Mountain Retreat', 'Peaceful property with volcanic landscape views', 175000, 'House', 'sale', 2, 1, 120, 'Cha das Caldeiras, Fogo', 'Fogo', ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'], ARRAY['Mountain View', 'Garden', 'Quiet Location'], false, true, 'active'),

  ('Luxury Beach Villa', 'Exclusive beachfront property with private pool', 890000, 'Villa', 'sale', 5, 4, 350, 'Santa Maria, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'], ARRAY['Private Beach', 'Pool', 'Staff Quarters', 'Garage'], true, true, 'active'),

  ('Modern Studio Apartment', 'Perfect for young professionals or investors', 95000, 'Apartment', 'sale', 0, 1, 45, 'Praia, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], ARRAY['City Center', 'Modern Kitchen', 'Balcony'], false, true, 'active'),

  ('Seaside Townhouse', 'Beautiful townhouse steps from the beach', 275000, 'Townhouse', 'sale', 3, 2, 160, 'Tarrafal, Santiago', 'Santiago', ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'], ARRAY['Near Beach', 'Terrace', 'Parking'], false, true, 'active'),

  ('Investment Land Plot', 'Prime development land with approved permits', 150000, 'Land', 'sale', 0, 0, 1500, 'Espargos, Sal', 'Sal', ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], ARRAY['Building Permit', 'Utilities Available', 'Road Access'], false, true, 'active')

ON CONFLICT DO NOTHING;

-- Verify the insert
SELECT COUNT(*) as property_count FROM properties;

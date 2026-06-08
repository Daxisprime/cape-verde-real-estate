-- =============================================
-- ADD MAP COLUMNS TO PROPERTIES TABLE
-- Run this in your Supabase SQL Editor
-- =============================================

-- Add detailed filters and geographic data to your properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS bedrooms INT DEFAULT 1;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS bathrooms INT DEFAULT 1;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS listing_type TEXT CHECK (listing_type IN ('buy', 'rent'));
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- =============================================
-- INSERT SAMPLE DATA WITH COORDINATES
-- =============================================

INSERT INTO public.properties (title, price, bedrooms, bathrooms, listing_type, latitude, longitude, image_url, neighborhood)
VALUES
    ('Luxury Villa Plateau', 45000000, 4, 3, 'buy', 14.9212, -23.5126, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'Plateau'),
    ('Modern Apartment Palmarejo', 12500000, 3, 2, 'buy', 14.9350, -23.5250, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'Palmarejo'),
    ('Beachfront House', 28000000, 3, 2, 'buy', 14.9150, -23.5050, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'Quebra Canela'),
    ('Penthouse with View', 35000000, 2, 2, 'buy', 14.9180, -23.5100, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Plateau'),
    ('Family Home', 22000000, 4, 3, 'buy', 14.9280, -23.5180, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'Terra Branca'),
    ('Rental Apartment', 85000, 2, 1, 'rent', 14.9220, -23.5140, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'Achada Santo António'),
    ('Studio Near Beach', 45000, 1, 1, 'rent', 14.9170, -23.5080, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'Prainha'),
    ('Commercial Space', 150000, 0, 1, 'rent', 14.9195, -23.5115, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'Plateau')
ON CONFLICT DO NOTHING;

-- =============================================
-- VERIFY DATA
-- =============================================
SELECT id, title, price, bedrooms, bathrooms, listing_type, latitude, longitude, neighborhood
FROM public.properties
WHERE latitude IS NOT NULL
LIMIT 10;

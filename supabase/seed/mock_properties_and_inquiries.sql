-- ============================================
-- ProCV Mock Data: Properties & Inquiries
--
-- Run AFTER mock_users_and_links.sql
-- Creates test properties and sample inquiries
-- to test the email notification system.
-- ============================================

-- ============================================
-- 1. CLEAN UP EXISTING TEST DATA
-- ============================================

DELETE FROM property_inquiries WHERE property_id IN (
  SELECT id FROM properties WHERE agent_id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'
  )
);

DELETE FROM properties WHERE agent_id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'
);

-- ============================================
-- 2. INSERT TEST PROPERTIES
-- ============================================

-- Maria's Properties (Santiago Island)
INSERT INTO properties (
  id,
  title,
  description,
  slug,
  price,
  price_currency,
  price_type,
  property_type,
  bedrooms,
  bathrooms,
  total_area,
  island,
  city,
  address,
  images,
  features,
  agent_id,
  status,
  is_featured,
  is_verified
) VALUES
-- Property 1: Luxury Villa
(
  '11111111-1111-1111-1111-111111111111',
  'Luxury Ocean View Villa in Praia',
  'Stunning 4-bedroom villa with panoramic ocean views, private pool, and modern finishes. Located in the prestigious Palmarejo neighborhood.',
  'luxury-ocean-view-villa-praia',
  750000,
  'EUR',
  'sale',
  'villa',
  4,
  3,
  320,
  'Santiago',
  'Praia',
  'Palmarejo Grande, Praia',
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
  ],
  ARRAY['Ocean View', 'Pool', 'Garden', 'Garage', 'Security System', 'Air Conditioning'],
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'active',
  true,
  true
),
-- Property 2: City Apartment
(
  '22222222-2222-2222-2222-222222222222',
  'Modern 2-Bedroom Apartment in Plateau',
  'Contemporary apartment in the heart of Praia. Recently renovated with high-end appliances and city views.',
  'modern-apartment-plateau-praia',
  185000,
  'EUR',
  'sale',
  'apartment',
  2,
  2,
  95,
  'Santiago',
  'Praia',
  'Plateau, Praia Centro',
  ARRAY[
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
  ],
  ARRAY['City View', 'Balcony', 'Elevator', 'Parking'],
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'active',
  false,
  true
),
-- Property 3: Rental
(
  '33333333-3333-3333-3333-333333333333',
  'Furnished Studio for Rent - Achada Santo António',
  'Cozy furnished studio perfect for professionals. All utilities included. Walking distance to amenities.',
  'furnished-studio-asa-praia',
  450,
  'EUR',
  'rent',
  'apartment',
  1,
  1,
  35,
  'Santiago',
  'Praia',
  'Achada Santo António',
  ARRAY[
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800'
  ],
  ARRAY['Furnished', 'Utilities Included', 'WiFi'],
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'active',
  false,
  true
);

-- João's Properties (Sal Island)
INSERT INTO properties (
  id,
  title,
  description,
  slug,
  price,
  price_currency,
  price_type,
  property_type,
  bedrooms,
  bathrooms,
  total_area,
  island,
  city,
  address,
  images,
  features,
  agent_id,
  status,
  is_featured,
  is_verified
) VALUES
-- Property 4: Beach House
(
  '44444444-4444-4444-4444-444444444444',
  'Beachfront House in Santa Maria',
  'Direct beach access! Beautiful 3-bedroom house just steps from the famous Santa Maria beach. Perfect for vacation or investment.',
  'beachfront-house-santa-maria',
  520000,
  'EUR',
  'sale',
  'house',
  3,
  2,
  180,
  'Sal',
  'Santa Maria',
  'Praia de Santa Maria',
  ARRAY[
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'
  ],
  ARRAY['Beach Access', 'Terrace', 'BBQ Area', 'Outdoor Shower'],
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'active',
  true,
  true
),
-- Property 5: Investment Apartment
(
  '55555555-5555-5555-5555-555555555555',
  'Investment Apartment with Rental History',
  'Turn-key investment opportunity! 2-bedroom apartment with proven rental income. Currently rented at €1,200/month.',
  'investment-apartment-santa-maria',
  280000,
  'EUR',
  'sale',
  'apartment',
  2,
  1,
  85,
  'Sal',
  'Santa Maria',
  'Centro de Santa Maria',
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  ],
  ARRAY['Rental Income', 'Furnished', 'Pool Access', 'Near Beach'],
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'active',
  true,
  true
);

-- ============================================
-- 3. INSERT TEST INQUIRIES
-- ============================================
-- Note: This will trigger email notifications!
-- The emails will be queued in email_queue table.

-- Inquiry 1: Sarah interested in Maria's villa
INSERT INTO property_inquiries (
  id,
  property_id,
  agent_id,
  user_id,
  name,
  email,
  phone,
  message,
  inquiry_type,
  preferred_contact,
  preferred_time,
  status,
  priority
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111', -- Luxury Villa
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', -- Maria
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', -- Sarah
  'Sarah Johnson',
  'sarah.johnson@test.procv.cv',
  '+1 (415) 555-0123',
  'Hi Maria! I''m very interested in this villa. I''m planning to relocate to Cape Verde and this property looks perfect for my family. Could we schedule a video tour? I''m available most weekday evenings (PST time).',
  'viewing',
  'whatsapp',
  'Weekday evenings',
  'new',
  'high'
);

-- Inquiry 2: Anonymous inquiry for João's beach house
INSERT INTO property_inquiries (
  id,
  property_id,
  agent_id,
  user_id,
  name,
  email,
  phone,
  message,
  inquiry_type,
  preferred_contact,
  preferred_time,
  status,
  priority
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '44444444-4444-4444-4444-444444444444', -- Beach House
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', -- João
  NULL, -- Anonymous user
  'Pierre Dubois',
  'pierre.dubois@example.fr',
  '+33 6 12 34 56 78',
  'Bonjour! I saw this property on your website. Is this still available? What are the annual maintenance costs? I''m interested in buying as a vacation rental investment.',
  'question',
  'email',
  NULL,
  'new',
  'medium'
);

-- Inquiry 3: Quick inquiry for Maria's apartment
INSERT INTO property_inquiries (
  id,
  property_id,
  agent_id,
  user_id,
  name,
  email,
  phone,
  message,
  inquiry_type,
  preferred_contact,
  preferred_time,
  status,
  priority
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222', -- City Apartment
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', -- Maria
  NULL,
  'Ana Rodrigues',
  'ana.rodrigues@gmail.com',
  '+351 968 123 456',
  'Olá! Estou interessada neste apartamento. Moro em Lisboa mas quero comprar em Cabo Verde. Pode enviar mais fotos e informações sobre o condomínio?',
  'general',
  'phone',
  'Mornings',
  'new',
  'medium'
);

-- Inquiry 4: Offer inquiry (already read)
INSERT INTO property_inquiries (
  id,
  property_id,
  agent_id,
  user_id,
  name,
  email,
  phone,
  message,
  inquiry_type,
  preferred_contact,
  preferred_time,
  status,
  priority,
  read_at
) VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555', -- Investment Apartment
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', -- João
  NULL,
  'Hans Mueller',
  'hans.mueller@example.de',
  '+49 151 12345678',
  'I would like to make an offer of €265,000 for this property. I can complete the purchase within 30 days with cash payment. Please let me know if the owner is interested.',
  'offer',
  'email',
  NULL,
  'read',
  'urgent',
  NOW() - INTERVAL '2 hours'
);

-- Inquiry 5: Already replied
INSERT INTO property_inquiries (
  id,
  property_id,
  agent_id,
  user_id,
  name,
  email,
  phone,
  message,
  inquiry_type,
  preferred_contact,
  preferred_time,
  status,
  priority,
  read_at,
  replied_at,
  first_response_at,
  response_time_minutes
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '33333333-3333-3333-3333-333333333333', -- Studio Rental
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', -- Maria
  NULL,
  'Carlos Mendes',
  'carlos.mendes@empresa.cv',
  '+238 987 6543',
  'Bom dia! Preciso de um estúdio para arrendar por 6 meses enquanto trabalho em Praia. Este ainda está disponível?',
  'general',
  'whatsapp',
  'Any time',
  'replied',
  'low',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '23 hours',
  NOW() - INTERVAL '23 hours',
  60
);

-- ============================================
-- 4. CHECK EMAIL QUEUE
-- ============================================

-- See queued emails (should have 3 new ones from the 'new' inquiries)
SELECT
  id,
  to_email,
  to_name,
  subject,
  status,
  created_at
FROM email_queue
WHERE reference_type = 'inquiry'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 5. SUMMARY
-- ============================================

SELECT 'PROPERTIES' as type, COUNT(*) as count FROM properties
WHERE agent_id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'
)
UNION ALL
SELECT 'INQUIRIES' as type, COUNT(*) as count FROM property_inquiries
WHERE agent_id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'
)
UNION ALL
SELECT 'QUEUED EMAILS' as type, COUNT(*) as count FROM email_queue
WHERE status = 'pending';

-- Show inquiry breakdown by status
SELECT
  status,
  COUNT(*) as count,
  ARRAY_AGG(name) as inquirers
FROM property_inquiries
WHERE agent_id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'
)
GROUP BY status
ORDER BY
  CASE status
    WHEN 'new' THEN 1
    WHEN 'read' THEN 2
    WHEN 'replied' THEN 3
    ELSE 4
  END;

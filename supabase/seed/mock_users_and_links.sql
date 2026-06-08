-- ============================================
-- ProCV Mock Data: Users & Social Links
--
-- Run this in Supabase SQL Editor after running
-- the main schema migrations.
--
-- Creates 3 test users with:
-- - WhatsApp numbers (Cape Verde, Portugal, USA)
-- - Facebook Messenger handles
-- - Personal portfolio URLs
-- - Various other social links
-- ============================================

-- ============================================
-- 1. CREATE TEST USER IDs (UUIDs)
-- ============================================
-- We'll use fixed UUIDs so the script is idempotent

DO $$
DECLARE
  v_user1_id UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
  v_user2_id UUID := 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e';
  v_user3_id UUID := 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f';
BEGIN
  -- Note: In production, users are created via Supabase Auth
  -- This script creates profiles directly for testing

  RAISE NOTICE 'Mock user IDs:';
  RAISE NOTICE '  User 1 (Maria): %', v_user1_id;
  RAISE NOTICE '  User 2 (João): %', v_user2_id;
  RAISE NOTICE '  User 3 (Sarah): %', v_user3_id;
END $$;

-- ============================================
-- 2. INSERT TEST PROFILES
-- ============================================
-- First, we need to create auth.users entries (for FK constraint)
-- In a real scenario, users sign up via the app

-- Clean up existing test data
DELETE FROM user_links WHERE user_id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'
);

DELETE FROM profiles WHERE id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'
);

-- For testing without auth.users, we'll create a workaround
-- by temporarily disabling the FK constraint or using raw inserts

-- Option A: If you have auth.users entries, use this:
-- INSERT INTO profiles (id, email, full_name, ...) VALUES ...

-- Option B: Create mock auth.users entries (requires service role)
-- This works in SQL Editor with service role access

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES
-- User 1: Maria Santos (Cape Verde Agent)
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  '00000000-0000-0000-0000-000000000000',
  'maria.santos@test.procv.cv',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Maria Santos"}',
  'authenticated',
  'authenticated'
),
-- User 2: João Pereira (Portuguese Agent)
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  '00000000-0000-0000-0000-000000000000',
  'joao.pereira@test.procv.cv',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "João Pereira"}',
  'authenticated',
  'authenticated'
),
-- User 3: Sarah Johnson (US Buyer)
(
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  '00000000-0000-0000-0000-000000000000',
  'sarah.johnson@test.procv.cv',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Sarah Johnson"}',
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- ============================================
-- 3. INSERT PROFILES
-- ============================================

INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  roles,
  is_verified,
  is_active
) VALUES
-- Maria Santos - Cape Verde Real Estate Agent
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'maria.santos@test.procv.cv',
  'Maria Santos',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256',
  '+238 991 2345',
  ARRAY['agent', 'buyer']::text[],
  true,
  true
),
-- João Pereira - Portuguese Agent specializing in Sal
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'joao.pereira@test.procv.cv',
  'João Pereira',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256',
  '+351 912 345 678',
  ARRAY['agent']::text[],
  true,
  true
),
-- Sarah Johnson - US Buyer looking for vacation property
(
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'sarah.johnson@test.procv.cv',
  'Sarah Johnson',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256',
  '+1 (415) 555-0123',
  ARRAY['buyer']::text[],
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  phone = EXCLUDED.phone,
  roles = EXCLUDED.roles,
  updated_at = NOW();

-- ============================================
-- 4. INSERT USER LINKS
-- ============================================
-- The trigger will auto-format URLs!

-- ----------------
-- MARIA SANTOS - Cape Verde Agent
-- ----------------

-- WhatsApp (Cape Verde number)
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'whatsapp',
  '+238 991 2345',
  '+238 991 2345', -- Trigger will format to https://wa.me/2389912345
  'WhatsApp CV',
  true,
  true,
  1
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input,
  display_label = EXCLUDED.display_label;

-- Facebook Messenger
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'messenger',
  'maria.santos.realestate',
  'maria.santos.realestate', -- Trigger formats to https://m.me/maria.santos.realestate
  'Chat on Messenger',
  true,
  false,
  2
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Personal Portfolio Website
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'website',
  'mariasantos-realestate.cv',
  'mariasantos-realestate.cv', -- Trigger formats to https://mariasantos-realestate.cv
  'My Portfolio',
  true,
  false,
  3
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Instagram
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'instagram',
  '@maria.santos.cv',
  '@maria.santos.cv',
  NULL,
  true,
  true,
  4
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- LinkedIn
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'linkedin',
  'mariasantos-cv',
  'mariasantos-cv',
  'Connect on LinkedIn',
  true,
  false,
  5
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Email
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'email',
  'maria.santos@atlanticrealestate.cv',
  'maria.santos@atlanticrealestate.cv',
  'Email Me',
  true,
  true,
  6
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- ----------------
-- JOÃO PEREIRA - Portuguese Agent
-- ----------------

-- WhatsApp (Portuguese number)
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'whatsapp',
  '+351 912 345 678',
  '+351 912 345 678',
  'WhatsApp PT',
  true,
  true,
  1
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Secondary WhatsApp (Cape Verde office) - stored as phone since only one whatsapp allowed
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'phone',
  '+238 242 5678',
  '+238 242 5678',
  'Cape Verde Office',
  true,
  false,
  2
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Facebook Messenger
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'messenger',
  'https://www.facebook.com/joao.pereira.sal',
  'https://www.facebook.com/joao.pereira.sal', -- Trigger extracts username
  'Messenger',
  true,
  false,
  3
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Portfolio Website
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'website',
  'https://joaopereira-properties.com',
  'https://joaopereira-properties.com',
  'View My Properties',
  true,
  false,
  4
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- YouTube Channel
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'youtube',
  '@JoaoPereiraSalProperties',
  '@JoaoPereiraSalProperties',
  'Property Tours',
  true,
  false,
  5
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Twitter/X
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'twitter',
  '@joao_sal_realty',
  '@joao_sal_realty',
  NULL,
  true,
  false,
  6
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- ----------------
-- SARAH JOHNSON - US Buyer
-- ----------------

-- WhatsApp (US number)
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'whatsapp',
  '+1 (415) 555-0123',
  '+1 (415) 555-0123',
  'WhatsApp',
  true,
  false,
  1
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Facebook Messenger (with @)
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'messenger',
  '@sarah.johnson.sf',
  '@sarah.johnson.sf',
  'Messenger',
  true,
  false,
  2
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Personal Website/Blog
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'website',
  'sarahjohnson.dev',
  'sarahjohnson.dev',
  'My Blog',
  true,
  false,
  3
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- LinkedIn
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'linkedin',
  'https://linkedin.com/in/sarahjohnson-tech',
  'https://linkedin.com/in/sarahjohnson-tech',
  NULL,
  true,
  false,
  4
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input;

-- Instagram (private - not public)
INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, is_verified, display_order)
VALUES (
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'instagram',
  'sarah_adventures',
  'sarah_adventures',
  NULL,
  false, -- Private link!
  false,
  5
) ON CONFLICT (user_id, platform) DO UPDATE SET
  raw_input = EXCLUDED.raw_input,
  is_public = EXCLUDED.is_public;

-- ============================================
-- 5. VERIFY INSERTED DATA
-- ============================================

-- Show all users with their links
SELECT
  p.full_name,
  p.email,
  p.roles,
  ul.platform,
  ul.raw_input,
  ul.formatted_url,
  ul.display_label,
  ul.is_public,
  ul.is_verified
FROM profiles p
LEFT JOIN user_links ul ON p.id = ul.user_id
WHERE p.id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'
)
ORDER BY p.full_name, ul.display_order;

-- ============================================
-- 6. TEST THE URL FORMATTING TRIGGER
-- ============================================

-- Check that WhatsApp URLs were formatted correctly
SELECT
  platform,
  raw_input AS "Input",
  formatted_url AS "Formatted URL",
  CASE
    WHEN formatted_url LIKE 'https://wa.me/%' THEN '✓ Correct'
    ELSE '✗ Check trigger'
  END AS "Status"
FROM user_links
WHERE platform = 'whatsapp'
  AND user_id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
    'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'
  );

-- Check Messenger URLs
SELECT
  platform,
  raw_input AS "Input",
  formatted_url AS "Formatted URL",
  CASE
    WHEN formatted_url LIKE 'https://m.me/%' THEN '✓ Correct'
    ELSE '✗ Check trigger'
  END AS "Status"
FROM user_links
WHERE platform = 'messenger'
  AND user_id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
    'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'
  );

-- Summary
SELECT
  'MOCK DATA INSERTED' AS status,
  (SELECT COUNT(*) FROM profiles WHERE id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
    'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'
  )) AS profiles_count,
  (SELECT COUNT(*) FROM user_links WHERE user_id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
    'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'
  )) AS links_count;

-- ============================================
-- ProCV User Links - COMPLETE SETUP
--
-- Run this single file in Supabase SQL Editor
-- Includes: Table, Enum, RLS, Triggers, Validation
--
-- Order of execution:
-- 1. Extensions & Types
-- 2. Table Creation
-- 3. Indexes
-- 4. Country Codes & Validation
-- 5. URL Formatter Trigger
-- 6. Timestamp Trigger
-- 7. RLS Policies
-- 8. Helper Functions
-- 9. Test Cases
-- ============================================

-- ============================================
-- 1. EXTENSIONS & TYPES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate enum for clean setup
DROP TYPE IF EXISTS link_platform CASCADE;

CREATE TYPE link_platform AS ENUM (
  'whatsapp',
  'messenger',
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
  'telegram',
  'website',
  'email',
  'phone',
  'youtube',
  'tiktok',
  'other'
);

-- ============================================
-- 2. COUNTRY CODES TABLE (for validation)
-- ============================================
DROP TABLE IF EXISTS country_codes CASCADE;

CREATE TABLE country_codes (
  code VARCHAR(5) PRIMARY KEY,        -- e.g., '+238'
  country_name VARCHAR(100) NOT NULL,
  country_code_iso VARCHAR(2),        -- e.g., 'CV'
  min_length INTEGER DEFAULT 7,       -- Minimum digits after country code
  max_length INTEGER DEFAULT 15,      -- Maximum digits after country code
  is_active BOOLEAN DEFAULT true
);

-- Insert common country codes (focus on Cape Verde and common origins)
INSERT INTO country_codes (code, country_name, country_code_iso, min_length, max_length) VALUES
-- Cape Verde
('+238', 'Cape Verde', 'CV', 7, 7),
-- Europe
('+351', 'Portugal', 'PT', 9, 9),
('+33', 'France', 'FR', 9, 9),
('+44', 'United Kingdom', 'GB', 10, 10),
('+49', 'Germany', 'DE', 10, 11),
('+31', 'Netherlands', 'NL', 9, 9),
('+34', 'Spain', 'ES', 9, 9),
('+39', 'Italy', 'IT', 9, 10),
('+41', 'Switzerland', 'CH', 9, 9),
('+32', 'Belgium', 'BE', 8, 9),
('+352', 'Luxembourg', 'LU', 6, 9),
-- Americas
('+1', 'USA/Canada', 'US', 10, 10),
('+55', 'Brazil', 'BR', 10, 11),
-- Africa
('+245', 'Guinea-Bissau', 'GW', 7, 7),
('+239', 'São Tomé and Príncipe', 'ST', 7, 7),
('+244', 'Angola', 'AO', 9, 9),
('+258', 'Mozambique', 'MZ', 9, 9),
('+27', 'South Africa', 'ZA', 9, 9)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. USER_LINKS TABLE
-- ============================================
DROP TABLE IF EXISTS user_links CASCADE;

CREATE TABLE user_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform link_platform NOT NULL,
  raw_input TEXT NOT NULL,
  formatted_url TEXT NOT NULL,
  display_label TEXT,
  country_code VARCHAR(5),           -- Detected country code for phone/whatsapp
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One link per platform per user
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform),

  -- raw_input cannot be empty
  CONSTRAINT raw_input_not_empty CHECK (TRIM(raw_input) != '')
);

-- ============================================
-- 4. INDEXES
-- ============================================
CREATE INDEX idx_user_links_user_id ON user_links(user_id);
CREATE INDEX idx_user_links_platform ON user_links(platform);
CREATE INDEX idx_user_links_public ON user_links(user_id, is_public) WHERE is_public = true;
CREATE INDEX idx_user_links_country ON user_links(country_code) WHERE country_code IS NOT NULL;

-- ============================================
-- 5. PHONE NUMBER VALIDATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION validate_phone_number(
  p_input TEXT,
  OUT is_valid BOOLEAN,
  OUT cleaned_number TEXT,
  OUT detected_country_code VARCHAR(5),
  OUT country_name TEXT,
  OUT error_message TEXT
) AS $$
DECLARE
  v_digits TEXT;
  v_country country_codes%ROWTYPE;
  v_remaining_digits TEXT;
BEGIN
  -- Default values
  is_valid := false;
  cleaned_number := '';
  detected_country_code := NULL;
  country_name := NULL;
  error_message := NULL;

  -- Clean input: remove all non-digit characters except leading +
  v_digits := REGEXP_REPLACE(TRIM(p_input), '[^0-9+]', '', 'g');

  -- Must start with + or be all digits
  IF v_digits = '' THEN
    error_message := 'Phone number cannot be empty';
    RETURN;
  END IF;

  -- If starts with 00, convert to +
  IF v_digits LIKE '00%' THEN
    v_digits := '+' || SUBSTRING(v_digits FROM 3);
  END IF;

  -- If no +, assume it needs one (try to detect country)
  IF NOT v_digits LIKE '+%' THEN
    -- Try common prefixes
    -- Check if it starts with a known country code without +
    FOR v_country IN
      SELECT * FROM country_codes
      WHERE is_active = true
      ORDER BY LENGTH(code) DESC
    LOOP
      IF v_digits LIKE LTRIM(v_country.code, '+') || '%' THEN
        v_digits := '+' || v_digits;
        EXIT;
      END IF;
    END LOOP;

    -- If still no +, add default (Cape Verde)
    IF NOT v_digits LIKE '+%' THEN
      v_digits := '+238' || v_digits;
    END IF;
  END IF;

  -- Try to match country code
  FOR v_country IN
    SELECT * FROM country_codes
    WHERE is_active = true
    ORDER BY LENGTH(code) DESC
  LOOP
    IF v_digits LIKE v_country.code || '%' THEN
      detected_country_code := v_country.code;
      country_name := v_country.country_name;
      v_remaining_digits := SUBSTRING(v_digits FROM LENGTH(v_country.code) + 1);

      -- Validate length
      IF LENGTH(v_remaining_digits) < v_country.min_length THEN
        error_message := format('Phone number too short for %s (minimum %s digits after %s)',
          v_country.country_name, v_country.min_length, v_country.code);
        RETURN;
      END IF;

      IF LENGTH(v_remaining_digits) > v_country.max_length THEN
        error_message := format('Phone number too long for %s (maximum %s digits after %s)',
          v_country.country_name, v_country.max_length, v_country.code);
        RETURN;
      END IF;

      -- Valid!
      is_valid := true;
      cleaned_number := LTRIM(v_digits, '+');
      RETURN;
    END IF;
  END LOOP;

  -- No matching country code found, but allow if reasonable length
  v_remaining_digits := LTRIM(v_digits, '+');
  IF LENGTH(v_remaining_digits) >= 7 AND LENGTH(v_remaining_digits) <= 15 THEN
    is_valid := true;
    cleaned_number := v_remaining_digits;
    error_message := 'Country code not recognized, but number appears valid';
  ELSE
    error_message := 'Invalid phone number length';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. URL FORMATTER TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION format_user_link_url_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_clean_input TEXT;
  v_formatted_url TEXT;
  v_validation RECORD;
BEGIN
  v_clean_input := TRIM(COALESCE(NEW.raw_input, ''));

  IF v_clean_input = '' THEN
    RAISE EXCEPTION 'raw_input cannot be empty';
  END IF;

  CASE NEW.platform
    -- ==========================================
    -- WHATSAPP FORMATTING WITH VALIDATION
    -- ==========================================
    WHEN 'whatsapp' THEN
      -- Validate phone number
      SELECT * INTO v_validation FROM validate_phone_number(v_clean_input);

      IF NOT v_validation.is_valid THEN
        RAISE EXCEPTION 'Invalid WhatsApp number: %', v_validation.error_message;
      END IF;

      -- Store detected country code
      NEW.country_code := v_validation.detected_country_code;

      -- Format URL (wa.me requires number without +)
      v_formatted_url := 'https://wa.me/' || v_validation.cleaned_number;

    -- ==========================================
    -- MESSENGER FORMATTING
    -- ==========================================
    WHEN 'messenger' THEN
      -- Extract username from various URL formats
      IF v_clean_input ~* '^https?://(www\.)?(m\.me|messenger\.com)/(.+)$' THEN
        v_clean_input := REGEXP_REPLACE(
          v_clean_input,
          '^https?://(www\.)?(m\.me|messenger\.com)/',
          '', 'i'
        );
        v_clean_input := REGEXP_REPLACE(v_clean_input, '[/?].*$', '');
      ELSIF v_clean_input ~* '^https?://(www\.)?facebook\.com/(.+)$' THEN
        v_clean_input := REGEXP_REPLACE(
          v_clean_input,
          '^https?://(www\.)?facebook\.com/',
          '', 'i'
        );
        v_clean_input := REGEXP_REPLACE(v_clean_input, '[/?].*$', '');
      END IF;

      v_clean_input := LTRIM(TRIM(v_clean_input), '@');

      IF v_clean_input = '' THEN
        RAISE EXCEPTION 'Invalid Messenger username';
      END IF;

      v_formatted_url := 'https://m.me/' || v_clean_input;

    -- ==========================================
    -- PHONE FORMATTING WITH VALIDATION
    -- ==========================================
    WHEN 'phone' THEN
      SELECT * INTO v_validation FROM validate_phone_number(v_clean_input);

      IF NOT v_validation.is_valid AND v_validation.error_message NOT LIKE '%not recognized%' THEN
        RAISE EXCEPTION 'Invalid phone number: %', v_validation.error_message;
      END IF;

      NEW.country_code := v_validation.detected_country_code;
      v_formatted_url := 'tel:+' || v_validation.cleaned_number;

    -- ==========================================
    -- OTHER PLATFORMS
    -- ==========================================
    WHEN 'facebook' THEN
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://facebook.com/' || LTRIM(v_clean_input, '@');
      END IF;

    WHEN 'instagram' THEN
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://instagram.com/' || v_clean_input;
      END IF;

    WHEN 'twitter' THEN
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://twitter.com/' || v_clean_input;
      END IF;

    WHEN 'linkedin' THEN
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://linkedin.com/in/' || v_clean_input;
      END IF;

    WHEN 'telegram' THEN
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://t.me/' || v_clean_input;
      END IF;

    WHEN 'youtube' THEN
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSIF v_clean_input LIKE '@%' THEN
        v_formatted_url := 'https://youtube.com/' || v_clean_input;
      ELSE
        v_formatted_url := 'https://youtube.com/@' || v_clean_input;
      END IF;

    WHEN 'tiktok' THEN
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://tiktok.com/@' || v_clean_input;
      END IF;

    WHEN 'website' THEN
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://' || v_clean_input;
      END IF;

    WHEN 'email' THEN
      IF v_clean_input ~* '^mailto:' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'mailto:' || v_clean_input;
      END IF;

    ELSE
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://' || v_clean_input;
      END IF;
  END CASE;

  NEW.formatted_url := v_formatted_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_format_user_link_url ON user_links;
CREATE TRIGGER trigger_format_user_link_url
  BEFORE INSERT OR UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION format_user_link_url_trigger();

-- ============================================
-- 7. TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_user_links_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_links_timestamp ON user_links;
CREATE TRIGGER trigger_user_links_timestamp
  BEFORE UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION update_user_links_timestamp();

-- ============================================
-- 8. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read all links (for public profiles)
DROP POLICY IF EXISTS "Anyone can view all links" ON user_links;
CREATE POLICY "Anyone can view all links"
  ON user_links FOR SELECT
  USING (true);

-- Only authenticated users can insert their own links
DROP POLICY IF EXISTS "Users can insert own links" ON user_links;
CREATE POLICY "Users can insert own links"
  ON user_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only owners can update their links
DROP POLICY IF EXISTS "Users can update own links" ON user_links;
CREATE POLICY "Users can update own links"
  ON user_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only owners can delete their links
DROP POLICY IF EXISTS "Users can delete own links" ON user_links;
CREATE POLICY "Users can delete own links"
  ON user_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Get public links for a user
CREATE OR REPLACE FUNCTION get_user_public_links(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  platform link_platform,
  formatted_url TEXT,
  display_label TEXT,
  is_verified BOOLEAN,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.id,
    ul.platform,
    ul.formatted_url,
    ul.display_label,
    ul.is_verified,
    ul.display_order
  FROM user_links ul
  WHERE ul.user_id = p_user_id AND ul.is_public = true
  ORDER BY ul.display_order, ul.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upsert a link
CREATE OR REPLACE FUNCTION upsert_user_link(
  p_user_id UUID,
  p_platform link_platform,
  p_raw_input TEXT,
  p_display_label TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT true,
  p_display_order INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, display_order)
  VALUES (p_user_id, p_platform, p_raw_input, '', p_display_label, p_is_public, p_display_order)
  ON CONFLICT (user_id, platform) DO UPDATE SET
    raw_input = EXCLUDED.raw_input,
    display_label = EXCLUDED.display_label,
    is_public = EXCLUDED.is_public,
    display_order = EXCLUDED.display_order
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. TEST CASES
-- ============================================

-- Test phone validation function
DO $$
DECLARE
  v_result RECORD;
BEGIN
  RAISE NOTICE '=== PHONE VALIDATION TESTS ===';

  -- Test Cape Verde number
  SELECT * INTO v_result FROM validate_phone_number('+238 999 1234');
  RAISE NOTICE 'CV +238 999 1234: valid=%, cleaned=%, country=%',
    v_result.is_valid, v_result.cleaned_number, v_result.country_name;

  -- Test with dashes
  SELECT * INTO v_result FROM validate_phone_number('+238-999-1234');
  RAISE NOTICE 'CV +238-999-1234: valid=%, cleaned=%, country=%',
    v_result.is_valid, v_result.cleaned_number, v_result.country_name;

  -- Test Portugal number
  SELECT * INTO v_result FROM validate_phone_number('+351 912 345 678');
  RAISE NOTICE 'PT +351 912 345 678: valid=%, cleaned=%, country=%',
    v_result.is_valid, v_result.cleaned_number, v_result.country_name;

  -- Test US number
  SELECT * INTO v_result FROM validate_phone_number('+1 (234) 567-8900');
  RAISE NOTICE 'US +1 (234) 567-8900: valid=%, cleaned=%, country=%',
    v_result.is_valid, v_result.cleaned_number, v_result.country_name;

  -- Test number without +
  SELECT * INTO v_result FROM validate_phone_number('2389991234');
  RAISE NOTICE 'No plus 2389991234: valid=%, cleaned=%, country=%',
    v_result.is_valid, v_result.cleaned_number, v_result.country_name;

  -- Test too short
  SELECT * INTO v_result FROM validate_phone_number('+238 123');
  RAISE NOTICE 'Too short +238 123: valid=%, error=%',
    v_result.is_valid, v_result.error_message;

  -- Test 00 prefix
  SELECT * INTO v_result FROM validate_phone_number('00238 999 1234');
  RAISE NOTICE '00 prefix 00238 999 1234: valid=%, cleaned=%, country=%',
    v_result.is_valid, v_result.cleaned_number, v_result.country_name;
END $$;

-- Test URL formatting (simulate insert)
DO $$
DECLARE
  v_test_cases TEXT[][] := ARRAY[
    ARRAY['whatsapp', '+238 999 1234', 'https://wa.me/2389991234'],
    ARRAY['whatsapp', '+1-234-567-8900', 'https://wa.me/12345678900'],
    ARRAY['whatsapp', '00351 912 345 678', 'https://wa.me/351912345678'],
    ARRAY['messenger', 'johndoe', 'https://m.me/johndoe'],
    ARRAY['messenger', '@johndoe', 'https://m.me/johndoe'],
    ARRAY['messenger', 'https://facebook.com/johndoe', 'https://m.me/johndoe'],
    ARRAY['instagram', '@procv_cv', 'https://instagram.com/procv_cv'],
    ARRAY['email', 'test@example.com', 'mailto:test@example.com']
  ];
  v_case TEXT[];
  v_formatted TEXT;
BEGIN
  RAISE NOTICE '=== URL FORMATTING TESTS ===';

  FOREACH v_case SLICE 1 IN ARRAY v_test_cases
  LOOP
    -- We can't easily test the trigger without a real user, so just log expected
    RAISE NOTICE 'Platform: %, Input: %, Expected: %',
      v_case[1], v_case[2], v_case[3];
  END LOOP;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT
  'SETUP COMPLETE!' as status,
  (SELECT COUNT(*) FROM country_codes) as country_codes_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_links') as rls_policies_count,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%user_link%') as triggers_count;

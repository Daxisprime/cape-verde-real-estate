-- ============================================
-- ProCV User Links - URL Auto-Formatter Trigger
--
-- Automatically formats URLs for specific platforms:
-- - WhatsApp: Strips spaces, dashes, '+' → https://wa.me/{number}
-- - Messenger: Formats to https://m.me/{username}
--
-- Runs BEFORE INSERT OR UPDATE on user_links
-- ============================================

-- ============================================
-- DROP EXISTING TRIGGER AND FUNCTION (clean slate)
-- ============================================
DROP TRIGGER IF EXISTS trigger_format_user_link_url ON user_links;
DROP FUNCTION IF EXISTS format_user_link_url_trigger();

-- ============================================
-- URL FORMATTER TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION format_user_link_url_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_clean_input TEXT;
  v_formatted_url TEXT;
BEGIN
  -- Get the raw input and trim whitespace
  v_clean_input := TRIM(COALESCE(NEW.raw_input, ''));

  -- Skip if raw_input is empty
  IF v_clean_input = '' THEN
    RAISE EXCEPTION 'raw_input cannot be empty';
  END IF;

  -- Format based on platform
  CASE NEW.platform
    -- ==========================================
    -- WHATSAPP FORMATTING
    -- ==========================================
    -- Strip all spaces, dashes, parentheses, dots, and leading '+'
    -- Result: https://wa.me/1234567890
    WHEN 'whatsapp' THEN
      -- Remove all non-numeric characters except leading +
      v_clean_input := REGEXP_REPLACE(v_clean_input, '[^0-9+]', '', 'g');

      -- Remove the leading + sign
      v_clean_input := LTRIM(v_clean_input, '+');

      -- Validate: must have at least 7 digits (shortest valid phone number)
      IF LENGTH(v_clean_input) < 7 THEN
        RAISE EXCEPTION 'Invalid WhatsApp number: must have at least 7 digits';
      END IF;

      -- Validate: must only contain digits now
      IF v_clean_input !~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'Invalid WhatsApp number: must contain only digits';
      END IF;

      -- Format the URL
      v_formatted_url := 'https://wa.me/' || v_clean_input;

    -- ==========================================
    -- MESSENGER FORMATTING
    -- ==========================================
    -- Accepts username or full URL
    -- Result: https://m.me/{username}
    WHEN 'messenger' THEN
      -- If already a valid m.me or messenger URL, extract username
      IF v_clean_input ~* '^https?://(www\.)?(m\.me|messenger\.com)/(.+)$' THEN
        -- Extract the username/ID from the URL
        v_clean_input := REGEXP_REPLACE(
          v_clean_input,
          '^https?://(www\.)?(m\.me|messenger\.com)/',
          '',
          'i'
        );
        -- Remove trailing slashes and query params
        v_clean_input := REGEXP_REPLACE(v_clean_input, '[/?].*$', '');
      -- If it's a Facebook URL, try to extract the username
      ELSIF v_clean_input ~* '^https?://(www\.)?facebook\.com/(.+)$' THEN
        v_clean_input := REGEXP_REPLACE(
          v_clean_input,
          '^https?://(www\.)?facebook\.com/',
          '',
          'i'
        );
        -- Remove trailing slashes and query params
        v_clean_input := REGEXP_REPLACE(v_clean_input, '[/?].*$', '');
      END IF;

      -- Remove @ prefix if present
      v_clean_input := LTRIM(v_clean_input, '@');

      -- Trim any remaining whitespace
      v_clean_input := TRIM(v_clean_input);

      -- Validate: username must not be empty
      IF v_clean_input = '' THEN
        RAISE EXCEPTION 'Invalid Messenger username: cannot be empty';
      END IF;

      -- Validate: username should be alphanumeric with dots and underscores
      IF v_clean_input !~ '^[a-zA-Z0-9._]+$' THEN
        RAISE WARNING 'Messenger username contains special characters: %', v_clean_input;
        -- Still allow it but warn (some usernames may have special chars)
      END IF;

      -- Format the URL
      v_formatted_url := 'https://m.me/' || v_clean_input;

    -- ==========================================
    -- OTHER PLATFORMS - Use existing logic
    -- ==========================================
    WHEN 'facebook' THEN
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_clean_input := LTRIM(v_clean_input, '@');
        v_formatted_url := 'https://facebook.com/' || v_clean_input;
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

    WHEN 'phone' THEN
      v_clean_input := REGEXP_REPLACE(v_clean_input, '[^0-9+]', '', 'g');
      v_formatted_url := 'tel:' || v_clean_input;

    ELSE
      -- For 'other' or unknown platforms
      IF v_clean_input ~* '^https?://' THEN
        v_formatted_url := v_clean_input;
      ELSE
        v_formatted_url := 'https://' || v_clean_input;
      END IF;
  END CASE;

  -- Set the formatted URL
  NEW.formatted_url := v_formatted_url;

  -- Log the transformation (for debugging - can be removed in production)
  RAISE NOTICE 'URL formatted: platform=%, raw=%, formatted=%',
    NEW.platform, NEW.raw_input, NEW.formatted_url;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE THE TRIGGER
-- ============================================
CREATE TRIGGER trigger_format_user_link_url
  BEFORE INSERT OR UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION format_user_link_url_trigger();

-- ============================================
-- TEST CASES (run these to verify)
-- ============================================
/*
-- Test WhatsApp formatting
SELECT format_user_link_url('whatsapp', '+1 (234) 567-8900');
-- Expected: https://wa.me/12345678900

SELECT format_user_link_url('whatsapp', '+238-999-1234');
-- Expected: https://wa.me/2389991234

SELECT format_user_link_url('whatsapp', '00351 912 345 678');
-- Expected: https://wa.me/00351912345678

-- Test Messenger formatting
SELECT format_user_link_url('messenger', 'john.doe');
-- Expected: https://m.me/john.doe

SELECT format_user_link_url('messenger', '@johndoe');
-- Expected: https://m.me/johndoe

SELECT format_user_link_url('messenger', 'https://m.me/johndoe');
-- Expected: https://m.me/johndoe

SELECT format_user_link_url('messenger', 'https://www.facebook.com/johndoe');
-- Expected: https://m.me/johndoe

-- Test with actual INSERT (requires auth context)
-- INSERT INTO user_links (user_id, platform, raw_input, formatted_url)
-- VALUES ('your-user-id', 'whatsapp', '+1-234-567-8900', '');
-- Check: formatted_url should be 'https://wa.me/12345678900'
*/

-- ============================================
-- STANDALONE TEST FUNCTION (for testing without insert)
-- ============================================
CREATE OR REPLACE FUNCTION test_url_format(
  p_platform link_platform,
  p_raw_input TEXT
) RETURNS TABLE (
  platform link_platform,
  raw_input TEXT,
  formatted_url TEXT
) AS $$
DECLARE
  v_clean TEXT;
  v_url TEXT;
BEGIN
  v_clean := TRIM(p_raw_input);

  IF p_platform = 'whatsapp' THEN
    v_clean := REGEXP_REPLACE(v_clean, '[^0-9+]', '', 'g');
    v_clean := LTRIM(v_clean, '+');
    v_url := 'https://wa.me/' || v_clean;
  ELSIF p_platform = 'messenger' THEN
    IF v_clean ~* '^https?://(www\.)?(m\.me|messenger\.com|facebook\.com)/(.+)$' THEN
      v_clean := REGEXP_REPLACE(v_clean, '^https?://(www\.)?(m\.me|messenger\.com|facebook\.com)/', '', 'i');
      v_clean := REGEXP_REPLACE(v_clean, '[/?].*$', '');
    END IF;
    v_clean := LTRIM(v_clean, '@');
    v_url := 'https://m.me/' || v_clean;
  ELSE
    v_url := v_clean;
  END IF;

  RETURN QUERY SELECT p_platform, p_raw_input, v_url;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Test the standalone function
SELECT * FROM test_url_format('whatsapp', '+1 (234) 567-8900');
SELECT * FROM test_url_format('whatsapp', '+238-999-1234');
SELECT * FROM test_url_format('messenger', 'john.doe');
SELECT * FROM test_url_format('messenger', '@johndoe');
SELECT * FROM test_url_format('messenger', 'https://facebook.com/johndoe');

-- Verify trigger exists
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_format_user_link_url';

SELECT 'URL formatter trigger created successfully!' as status;

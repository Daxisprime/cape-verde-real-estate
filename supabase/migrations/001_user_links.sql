-- ============================================
-- ProCV User Links Migration
-- Creates user_links table for social/contact links
-- Linked to Supabase Auth (auth.users)
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE PLATFORM ENUM TYPE
-- ============================================
-- Drop if exists to allow re-running migration
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
-- 2. CREATE USER_LINKS TABLE
-- ============================================
DROP TABLE IF EXISTS user_links CASCADE;

CREATE TABLE user_links (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign key to Supabase Auth
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform type (enum)
  platform link_platform NOT NULL,

  -- Raw input from user (e.g., phone number, username, URL)
  raw_input TEXT NOT NULL,

  -- Formatted clickable URL
  formatted_url TEXT NOT NULL,

  -- Display label (optional, for custom display text)
  display_label TEXT,

  -- Visibility settings
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,

  -- Priority for ordering (lower = higher priority)
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one link per platform per user
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

-- ============================================
-- 3. CREATE INDEXES
-- ============================================
-- Index for fast user lookups
CREATE INDEX idx_user_links_user_id ON user_links(user_id);

-- Index for platform queries
CREATE INDEX idx_user_links_platform ON user_links(platform);

-- Index for public links (for profile display)
CREATE INDEX idx_user_links_public ON user_links(user_id, is_public)
  WHERE is_public = true;

-- ============================================
-- 4. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_user_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_links_updated_at ON user_links;
CREATE TRIGGER trigger_user_links_updated_at
  BEFORE UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION update_user_links_updated_at();

-- ============================================
-- 5. URL FORMATTING HELPER FUNCTION
-- ============================================
-- This function helps format raw input into proper URLs
CREATE OR REPLACE FUNCTION format_user_link_url(
  p_platform link_platform,
  p_raw_input TEXT
) RETURNS TEXT AS $$
DECLARE
  v_formatted TEXT;
  v_clean_input TEXT;
BEGIN
  -- Clean input (trim whitespace)
  v_clean_input := TRIM(p_raw_input);

  CASE p_platform
    WHEN 'whatsapp' THEN
      -- Remove non-numeric characters for phone number
      v_clean_input := REGEXP_REPLACE(v_clean_input, '[^0-9+]', '', 'g');
      -- Remove leading + if present for wa.me format
      v_clean_input := LTRIM(v_clean_input, '+');
      v_formatted := 'https://wa.me/' || v_clean_input;

    WHEN 'messenger' THEN
      -- Handle Facebook Messenger links
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://m.me/' || v_clean_input;
      END IF;

    WHEN 'facebook' THEN
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://facebook.com/' || v_clean_input;
      END IF;

    WHEN 'instagram' THEN
      -- Remove @ if present
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://instagram.com/' || v_clean_input;
      END IF;

    WHEN 'twitter' THEN
      -- Remove @ if present
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://twitter.com/' || v_clean_input;
      END IF;

    WHEN 'linkedin' THEN
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://linkedin.com/in/' || v_clean_input;
      END IF;

    WHEN 'telegram' THEN
      -- Remove @ if present
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://t.me/' || v_clean_input;
      END IF;

    WHEN 'youtube' THEN
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSIF v_clean_input LIKE '@%' THEN
        v_formatted := 'https://youtube.com/' || v_clean_input;
      ELSE
        v_formatted := 'https://youtube.com/@' || v_clean_input;
      END IF;

    WHEN 'tiktok' THEN
      -- Remove @ if present
      v_clean_input := LTRIM(v_clean_input, '@');
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://tiktok.com/@' || v_clean_input;
      END IF;

    WHEN 'website' THEN
      -- Ensure URL has protocol
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://' || v_clean_input;
      END IF;

    WHEN 'email' THEN
      -- mailto: link
      IF v_clean_input LIKE 'mailto:%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'mailto:' || v_clean_input;
      END IF;

    WHEN 'phone' THEN
      -- tel: link
      v_clean_input := REGEXP_REPLACE(v_clean_input, '[^0-9+]', '', 'g');
      v_formatted := 'tel:' || v_clean_input;

    ELSE
      -- For 'other' or unknown platforms, use as-is or add https
      IF v_clean_input LIKE 'http%' THEN
        v_formatted := v_clean_input;
      ELSE
        v_formatted := 'https://' || v_clean_input;
      END IF;
  END CASE;

  RETURN v_formatted;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 6. AUTO-FORMAT URL TRIGGER
-- ============================================
-- Automatically format URL on insert/update if not provided
CREATE OR REPLACE FUNCTION auto_format_user_link()
RETURNS TRIGGER AS $$
BEGIN
  -- If formatted_url is empty or equals raw_input, auto-format it
  IF NEW.formatted_url IS NULL OR NEW.formatted_url = '' OR NEW.formatted_url = NEW.raw_input THEN
    NEW.formatted_url := format_user_link_url(NEW.platform, NEW.raw_input);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_format_user_link ON user_links;
CREATE TRIGGER trigger_auto_format_user_link
  BEFORE INSERT OR UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION auto_format_user_link();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

-- Public links are readable by everyone
CREATE POLICY "Public links are viewable by everyone"
  ON user_links FOR SELECT
  USING (is_public = true);

-- Users can view all their own links (public and private)
CREATE POLICY "Users can view own links"
  ON user_links FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own links
CREATE POLICY "Users can insert own links"
  ON user_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own links
CREATE POLICY "Users can update own links"
  ON user_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own links
CREATE POLICY "Users can delete own links"
  ON user_links FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. HELPER FUNCTIONS FOR API
-- ============================================

-- Get all public links for a user (for profile display)
CREATE OR REPLACE FUNCTION get_public_user_links(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  platform link_platform,
  formatted_url TEXT,
  display_label TEXT,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.id,
    ul.platform,
    ul.formatted_url,
    ul.display_label,
    ul.display_order
  FROM user_links ul
  WHERE ul.user_id = p_user_id
    AND ul.is_public = true
  ORDER BY ul.display_order ASC, ul.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upsert a user link (insert or update)
CREATE OR REPLACE FUNCTION upsert_user_link(
  p_user_id UUID,
  p_platform link_platform,
  p_raw_input TEXT,
  p_display_label TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT true,
  p_display_order INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_link_id UUID;
BEGIN
  INSERT INTO user_links (user_id, platform, raw_input, formatted_url, display_label, is_public, display_order)
  VALUES (
    p_user_id,
    p_platform,
    p_raw_input,
    p_raw_input, -- Will be auto-formatted by trigger
    p_display_label,
    p_is_public,
    p_display_order
  )
  ON CONFLICT (user_id, platform) DO UPDATE SET
    raw_input = EXCLUDED.raw_input,
    formatted_url = EXCLUDED.raw_input, -- Will be auto-formatted by trigger
    display_label = EXCLUDED.display_label,
    is_public = EXCLUDED.is_public,
    display_order = EXCLUDED.display_order,
    updated_at = NOW()
  RETURNING id INTO v_link_id;

  RETURN v_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a user link
CREATE OR REPLACE FUNCTION delete_user_link(
  p_user_id UUID,
  p_platform link_platform
) RETURNS BOOLEAN AS $$
DECLARE
  v_deleted BOOLEAN;
BEGIN
  DELETE FROM user_links
  WHERE user_id = p_user_id AND platform = p_platform;

  v_deleted := FOUND;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. VERIFICATION STATUS
-- ============================================
SELECT
  'USER_LINKS TABLE CREATED' as status,
  (SELECT COUNT(*) FROM pg_type WHERE typname = 'link_platform') as enum_created,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'user_links') as table_created;

-- ============================================
-- 10. EXAMPLE USAGE (commented out)
-- ============================================
/*
-- Insert a WhatsApp link for a user
INSERT INTO user_links (user_id, platform, raw_input, formatted_url)
VALUES (
  'user-uuid-here',
  'whatsapp',
  '+238 999 1234',
  '+238 999 1234' -- Will be auto-formatted to https://wa.me/2389991234
);

-- Or use the upsert function
SELECT upsert_user_link(
  'user-uuid-here',
  'whatsapp',
  '+238 999 1234',
  'Chat on WhatsApp',
  true,
  1
);

-- Get all public links for a user
SELECT * FROM get_public_user_links('user-uuid-here');

-- Delete a link
SELECT delete_user_link('user-uuid-here', 'whatsapp');
*/

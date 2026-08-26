/*
# Create user_links table

1. New Tables
  - `user_links`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `platform` (text, not null)
    - `raw_input` (text, not null)
    - `formatted_url` (text, not null)
    - `display_label` (text, nullable)
    - `is_public` (boolean, default true)
    - `is_verified` (boolean, default false)
    - `display_order` (integer, default 0)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
2. Security
  - Enable RLS on `user_links`.
  - Public links viewable by everyone (anon + authenticated).
  - Users can manage their own links.
3. Indexes
  - user_id, platform, public links composite
*/

CREATE TABLE IF NOT EXISTS user_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  raw_input TEXT NOT NULL,
  formatted_url TEXT NOT NULL,
  display_label TEXT,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_public ON user_links(user_id, is_public) WHERE is_public = true;

ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public links viewable by everyone" ON user_links;
CREATE POLICY "Public links viewable by everyone"
  ON user_links FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own links" ON user_links;
CREATE POLICY "Users can view own links"
  ON user_links FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own links" ON user_links;
CREATE POLICY "Users can insert own links"
  ON user_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own links" ON user_links;
CREATE POLICY "Users can update own links"
  ON user_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own links" ON user_links;
CREATE POLICY "Users can delete own links"
  ON user_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- ProCV User Links - Row Level Security (RLS) Policies
--
-- Access Rules:
-- - SELECT: Anyone (authenticated or anonymous) can read all links
-- - INSERT: Only authenticated users can insert their own links
-- - UPDATE: Only the link owner can update their links
-- - DELETE: Only the link owner can delete their links
-- ============================================

-- Enable RLS on the table (if not already enabled)
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Anyone can view all links" ON user_links;
DROP POLICY IF EXISTS "Public links are viewable by everyone" ON user_links;
DROP POLICY IF EXISTS "Users can view own links" ON user_links;
DROP POLICY IF EXISTS "Users can insert own links" ON user_links;
DROP POLICY IF EXISTS "Users can update own links" ON user_links;
DROP POLICY IF EXISTS "Users can delete own links" ON user_links;
DROP POLICY IF EXISTS "Authenticated users can insert own links" ON user_links;
DROP POLICY IF EXISTS "Link owners can update their links" ON user_links;
DROP POLICY IF EXISTS "Link owners can delete their links" ON user_links;

-- ============================================
-- SELECT POLICY - Public Read Access
-- ============================================
-- Anyone (authenticated or anonymous) can read all links
-- This allows public profile pages to display user links
CREATE POLICY "Anyone can view all links"
  ON user_links
  FOR SELECT
  USING (true);

-- ============================================
-- INSERT POLICY - Authenticated Owner Only
-- ============================================
-- Only authenticated users can insert links
-- They can only insert links for their own user_id
CREATE POLICY "Authenticated users can insert own links"
  ON user_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATE POLICY - Owner Only
-- ============================================
-- Only the link owner can update their links
-- Must be authenticated and the user_id must match
CREATE POLICY "Link owners can update their links"
  ON user_links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DELETE POLICY - Owner Only
-- ============================================
-- Only the link owner can delete their links
-- Must be authenticated and the user_id must match
CREATE POLICY "Link owners can delete their links"
  ON user_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================
-- List all policies on user_links table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_links';

-- ============================================
-- USAGE EXAMPLES & TESTING
-- ============================================
/*
-- Test as anonymous user (should work for SELECT only):
-- Can read all links
SELECT * FROM user_links;

-- Cannot insert (will fail)
INSERT INTO user_links (user_id, platform, raw_input, formatted_url)
VALUES ('some-uuid', 'whatsapp', '+123', 'https://wa.me/123');

-- Test as authenticated user:
-- Set the auth context (for testing in SQL Editor)
-- SELECT set_config('request.jwt.claims', '{"sub": "your-user-uuid"}', true);

-- Can read all links
SELECT * FROM user_links;

-- Can insert own links
INSERT INTO user_links (user_id, platform, raw_input, formatted_url)
VALUES (auth.uid(), 'whatsapp', '+123', 'https://wa.me/123');

-- Can update own links
UPDATE user_links
SET raw_input = '+456', formatted_url = 'https://wa.me/456'
WHERE user_id = auth.uid() AND platform = 'whatsapp';

-- Can delete own links
DELETE FROM user_links
WHERE user_id = auth.uid() AND platform = 'whatsapp';

-- Cannot modify other users' links (will affect 0 rows)
UPDATE user_links
SET raw_input = 'hacked'
WHERE user_id != auth.uid();
*/

-- ============================================
-- OPTIONAL: Public-only read policy
-- ============================================
-- If you want anonymous users to only see public links,
-- uncomment this and comment out the "Anyone can view all links" policy above

/*
DROP POLICY IF EXISTS "Anyone can view all links" ON user_links;

-- Anonymous users can only see public links
CREATE POLICY "Anonymous can view public links"
  ON user_links
  FOR SELECT
  TO anon
  USING (is_public = true);

-- Authenticated users can see all links (including private ones on their own profile)
CREATE POLICY "Authenticated can view all links"
  ON user_links
  FOR SELECT
  TO authenticated
  USING (true);
*/

SELECT 'RLS policies created successfully' as status;

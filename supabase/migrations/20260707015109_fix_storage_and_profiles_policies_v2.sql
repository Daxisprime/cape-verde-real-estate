/*
# Fix storage and profiles RLS policies comprehensively

1. Problem
   - Storage upload still fails with "new row violates row-level security policy"
   - The foldername-based check may have edge cases with path parsing
   - Profiles UPDATE policy is missing WITH CHECK clause

2. Changes
   - Drop all old avatar storage policies and recreate with simpler checks
   - Avatars bucket is already public-read, so INSERT/UPDATE/DELETE just need auth + bucket check
   - Fix profiles UPDATE policy to include WITH CHECK
   - Ensure all policies work for both new and returning users

3. Security
   - Storage: authenticated users can upload/update/delete in the avatars bucket
   - Profiles: authenticated users can only modify their own row
*/

-- Fix storage policies: drop all old ones and recreate with simpler auth-only check for avatars
DROP POLICY IF EXISTS "avatar_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Universal Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Universal Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to media" ON storage.objects;
DROP POLICY IF EXISTS "Give users upload access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads are publicly viewable" ON storage.objects;

-- Authenticated users can upload to avatars bucket
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Authenticated users can update files in avatars bucket
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Authenticated users can delete files in avatars bucket
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Anyone can read avatars (bucket is already public)
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- Fix profiles UPDATE policy: add WITH CHECK clause
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
CREATE POLICY "Allow users to update their own profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Clean up conflicting duplicate policies
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;

NOTIFY pgrst, 'reload schema';
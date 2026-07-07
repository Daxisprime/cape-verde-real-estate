/*
# Fix storage.buckets RLS - allow authenticated users to see buckets

1. Problem
   - RLS is enabled on storage.buckets but there are ZERO policies
   - This means the Supabase client cannot find any bucket, causing all uploads to fail silently
   - The storage.objects policies exist but are useless because the bucket lookup fails first

2. Fix
   - Add a SELECT policy on storage.buckets allowing authenticated and anon users
     to see public buckets (needed for the upload client to resolve bucket references)

3. Security
   - Only SELECT (read bucket metadata) is allowed - not INSERT/UPDATE/DELETE
   - This is standard Supabase configuration for public buckets
*/

DROP POLICY IF EXISTS "allow_public_bucket_select" ON storage.buckets;
CREATE POLICY "allow_public_bucket_select" ON storage.buckets
FOR SELECT
TO authenticated, anon
USING (true);

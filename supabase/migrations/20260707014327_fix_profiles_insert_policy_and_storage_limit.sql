/*
# Fix profiles INSERT policy and storage bucket limit

1. Problem
   - The profiles table has RLS enabled with SELECT and UPDATE policies only.
   - Upsert operations require INSERT permission when no row exists yet.
   - This causes "new row violates row-level security policy" for new users.
   - Storage bucket file_size_limit is 1MB which is too tight.

2. Changes
   - Add INSERT policy: authenticated users can insert their own profile (id = auth.uid()).
   - Add DELETE policy for completeness.
   - Increase avatars bucket file_size_limit to 5MB as safety net.

3. Security
   - INSERT restricted to authenticated users writing their own row only.
   - DELETE restricted to authenticated users deleting their own row only.
*/

-- Add INSERT policy for profiles (required for upsert when row doesn't exist)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add DELETE policy for profiles
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Increase avatars bucket file size limit to 5MB (safety net if compression is slow)
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'avatars';

NOTIFY pgrst, 'reload schema';
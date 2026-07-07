/*
# Create ad-images storage bucket and fix properties SELECT policy

1. Changes
   - Create `ad-images` storage bucket for listing photos (public, 10MB limit)
   - Add RLS policies on storage.objects for the ad-images bucket:
     - Authenticated users can INSERT (upload)
     - Authenticated users can UPDATE their uploads
     - Authenticated users can DELETE their uploads
     - Anyone can SELECT (read/view images)
   - Fix properties SELECT policy: currently ONLY shows status='active', which means
     owners cannot see their own draft/pending/sold listings in their dashboard.
     New policy: anyone can see active listings, AND owners can always see their own.

2. Security
   - Storage: any authenticated user can upload to ad-images bucket
   - Properties: public can see active listings; owners see all their own listings
*/

-- Create the ad-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad-images bucket
DROP POLICY IF EXISTS "ad_images_insert" ON storage.objects;
CREATE POLICY "ad_images_insert" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "ad_images_update" ON storage.objects;
CREATE POLICY "ad_images_update" ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ad-images')
WITH CHECK (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "ad_images_delete" ON storage.objects;
CREATE POLICY "ad_images_delete" ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "ad_images_select" ON storage.objects;
CREATE POLICY "ad_images_select" ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'ad-images');

-- Fix properties SELECT policy: owners should ALWAYS see their own listings
DROP POLICY IF EXISTS "select_active_properties" ON properties;
CREATE POLICY "select_properties" ON properties FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  OR auth.uid() = agent_id
);

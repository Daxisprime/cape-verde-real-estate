/*
# Create ad-images storage bucket

1. Changes
   - Creates a public storage bucket called 'ad-images' for listing photos.
   - RLS policies for this bucket already exist on storage.objects from a previous migration.

2. Notes
   - The bucket is public so images can be served directly via URL.
   - Uses IF NOT EXISTS via DO block since INSERT into storage.buckets doesn't support it natively.
*/

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'ad-images',
    'ad-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

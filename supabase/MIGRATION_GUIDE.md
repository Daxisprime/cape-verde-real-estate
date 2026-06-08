# Supabase Migration Guide

## Step 1: Run the Complete Setup Migration

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `complete_user_links_setup.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see output like:
```
status                  | country_codes_count | rls_policies_count | triggers_count
------------------------|---------------------|--------------------|--------------
SETUP COMPLETE!         | 17                  | 4                  | 2
```

## Step 2: Verify the Setup

Run these test queries:

```sql
-- Test phone validation
SELECT * FROM validate_phone_number('+238 999 1234');
-- Expected: is_valid=true, country_name='Cape Verde'

SELECT * FROM validate_phone_number('+1 (234) 567-8900');
-- Expected: is_valid=true, country_name='USA/Canada'

-- Test URL formatting
SELECT * FROM test_url_format('whatsapp', '+238-999-1234');
-- Expected: formatted_url='https://wa.me/2389991234'
```

## Step 3: Configure Storage for Images

Run this in SQL Editor:

```sql
-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for property images - public read, authenticated write
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS for avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 4: Enable Auth Providers (Optional)

1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - Email (enabled by default)
   - Google
   - Facebook
   - GitHub

## Step 5: Configure Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in: **Settings** → **API** → **Project URL** and **anon public** key

## Troubleshooting

### "relation does not exist" error
Run the migrations in order or use the complete setup file.

### RLS blocking inserts
Make sure you're authenticated. Test with:
```sql
SELECT auth.uid(); -- Should return your user ID when authenticated
```

### Phone validation failing
Check the country_codes table has entries:
```sql
SELECT * FROM country_codes ORDER BY code;
```

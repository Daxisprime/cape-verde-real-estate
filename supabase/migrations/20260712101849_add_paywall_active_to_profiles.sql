/*
# Add paywall_active column to profiles

1. Modified Tables
   - `profiles`
     - `paywall_active` (boolean, default false) — master toggle controlling whether category listing limits are enforced for this user

2. Purpose
   - Allows admin to globally activate/deactivate the freemium paywall
   - When false (default), listing limits are NOT enforced — users can post freely
   - When true, the category-based quotas (10/3/1) are enforced

3. Security
   - No RLS changes needed; existing profile policies cover this column
   - Only admins should toggle this field (enforced in the UI layer)

4. Important Notes
   - Column added idempotently with DO block
   - Default is false so existing users are unaffected until admin activates
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'paywall_active') THEN
    ALTER TABLE public.profiles ADD COLUMN paywall_active boolean NOT NULL DEFAULT false;
  END IF;
END $$;
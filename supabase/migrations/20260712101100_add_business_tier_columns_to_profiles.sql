/*
# Add Business Tier Columns to Profiles

1. Modified Tables
   - `profiles`
     - `is_business` (boolean, default false) — whether the user has activated business mode
     - `business_name` (text, nullable) — custom shop/business display name
     - `business_logo` (text, nullable) — URL to business logo image
     - `business_banner` (text, nullable) — URL to business banner/cover image

2. Purpose
   - Enables hybrid C2C/B2B marketplace model
   - All users start as casual sellers (is_business = false)
   - Users can freely upgrade to business mode to display custom branding

3. Security
   - No RLS changes needed; existing profile policies already cover these columns
   - Authenticated users can update their own profile row

4. Important Notes
   - Columns are added idempotently with DO blocks
   - No data loss — all columns are nullable with safe defaults
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_business') THEN
    ALTER TABLE public.profiles ADD COLUMN is_business boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'business_name') THEN
    ALTER TABLE public.profiles ADD COLUMN business_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'business_logo') THEN
    ALTER TABLE public.profiles ADD COLUMN business_logo text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'business_banner') THEN
    ALTER TABLE public.profiles ADD COLUMN business_banner text;
  END IF;
END $$;
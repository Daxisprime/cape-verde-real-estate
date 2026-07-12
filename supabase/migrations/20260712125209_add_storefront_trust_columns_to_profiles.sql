/*
# Add Professional Storefront & Trust columns to profiles

1. Modified Tables
   - `profiles`
     - `store_name` (text) — public display name for the vendor's storefront
     - `store_description` (text) — short bio/description for the storefront
     - `store_logo` (text) — URL of the store's logo image
     - `store_banner` (text) — URL of the store's banner/cover image
     - `rating_average` (numeric(2,1), default 0) — aggregate star rating
     - `review_count` (integer, default 0) — total number of reviews received
     - `verified_at` (timestamptz, nullable) — timestamp when professional verification was granted

2. Important Notes
   - No RLS changes: existing profiles policies already cover these new columns
   - rating_average and review_count are denormalized for fast display
   - verified_at null = unverified, non-null = verified professional
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='store_name') THEN
    ALTER TABLE public.profiles ADD COLUMN store_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='store_description') THEN
    ALTER TABLE public.profiles ADD COLUMN store_description text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='store_logo') THEN
    ALTER TABLE public.profiles ADD COLUMN store_logo text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='store_banner') THEN
    ALTER TABLE public.profiles ADD COLUMN store_banner text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='rating_average') THEN
    ALTER TABLE public.profiles ADD COLUMN rating_average numeric(2,1) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='review_count') THEN
    ALTER TABLE public.profiles ADD COLUMN review_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='verified_at') THEN
    ALTER TABLE public.profiles ADD COLUMN verified_at timestamptz;
  END IF;
END $$;
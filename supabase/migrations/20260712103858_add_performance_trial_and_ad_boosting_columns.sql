/*
# Phase 2: Performance-Based Trial & Ad Boosting Engine

1. Modified Tables
   - `profiles`
     - `accumulated_leads_count` (integer, default 0) — tracks vendor success via phone reveals, WhatsApp clicks, and new chat threads

   - `properties`
     - `is_featured` (boolean, default false) — whether listing is in paid featured placement
     - `featured_until` (timestamptz, nullable) — expiry time for featured status
     - `last_bumped_at` (timestamptz, default now()) — controls organic ranking; reset on bump

   - `marketplace_items`
     - `is_featured` (boolean, default false) — whether listing is in paid featured placement
     - `featured_until` (timestamptz, nullable) — expiry time for featured status
     - `last_bumped_at` (timestamptz, default now()) — controls organic ranking; reset on bump

2. Purpose
   - Enables performance-based trial: free trial expires only when store is 60+ days old AND has >= 15 accumulated leads
   - Ad Boosting: featured ads appear first in search, then organic results sorted by last_bumped_at DESC
   - Bump action resets last_bumped_at to now(), pushing ad to top of organic results

3. Security
   - No RLS changes needed; existing policies already cover these columns
   - accumulated_leads_count incremented via service-role or edge function

4. Important Notes
   - All columns added idempotently with DO blocks
   - No data loss — all columns are nullable or have safe defaults
   - Indexes added on ranking columns for query performance
*/

-- profiles: accumulated_leads_count
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'accumulated_leads_count') THEN
    ALTER TABLE public.profiles ADD COLUMN accumulated_leads_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- properties: is_featured, featured_until, last_bumped_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'is_featured') THEN
    ALTER TABLE public.properties ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'featured_until') THEN
    ALTER TABLE public.properties ADD COLUMN featured_until timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'last_bumped_at') THEN
    ALTER TABLE public.properties ADD COLUMN last_bumped_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- marketplace_items: is_featured, featured_until, last_bumped_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'is_featured') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'featured_until') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN featured_until timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'last_bumped_at') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN last_bumped_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Indexes for ranking queries
CREATE INDEX IF NOT EXISTS idx_properties_featured_bumped ON public.properties (is_featured DESC, last_bumped_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_featured_bumped ON public.marketplace_items (is_featured DESC, last_bumped_at DESC);
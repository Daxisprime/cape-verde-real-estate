/*
# Add Featured & Bumping Columns to Properties and Marketplace Items

1. Modified Tables
   - `properties`
     - `is_featured` (boolean, default false) — marks a listing as premium/featured
     - `featured_until` (timestamptz, nullable) — expiration time for featured status
     - `last_bumped_at` (timestamptz, default now()) — timestamp of last bump action for organic ranking
   - `marketplace_items`
     - `is_featured` (boolean, default false) — marks an item as premium/featured
     - `featured_until` (timestamptz, nullable) — expiration time for featured status
     - `last_bumped_at` (timestamptz, default now()) — timestamp of last bump action for organic ranking

2. Indexes
   - Composite index on properties (is_featured, featured_until, last_bumped_at) for efficient sorted queries
   - Composite index on marketplace_items (is_featured, featured_until, last_bumped_at) for efficient sorted queries

3. Important Notes
   - Discovery queries should ORDER BY:
     1st: (is_featured = true AND featured_until > now()) DESC
     2nd: last_bumped_at DESC
   - This ensures featured listings always appear at the top, and bumped listings rank above stale ones
   - No RLS changes needed — existing policies cover these new columns
*/

-- properties: is_featured
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'is_featured') THEN
    ALTER TABLE public.properties ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- properties: featured_until
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'featured_until') THEN
    ALTER TABLE public.properties ADD COLUMN featured_until timestamptz;
  END IF;
END $$;

-- properties: last_bumped_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'last_bumped_at') THEN
    ALTER TABLE public.properties ADD COLUMN last_bumped_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- marketplace_items: is_featured
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'is_featured') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- marketplace_items: featured_until
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'featured_until') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN featured_until timestamptz;
  END IF;
END $$;

-- marketplace_items: last_bumped_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'last_bumped_at') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN last_bumped_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Composite indexes for discovery sort queries
CREATE INDEX IF NOT EXISTS idx_properties_featured_bumped
  ON public.properties (is_featured DESC, featured_until DESC NULLS LAST, last_bumped_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_items_featured_bumped
  ON public.marketplace_items (is_featured DESC, featured_until DESC NULLS LAST, last_bumped_at DESC);
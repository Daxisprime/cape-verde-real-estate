/*
# Add rating constraint and unique buyer-vendor pair to vendor_reviews

1. Modified Tables
   - `vendor_reviews`
     - Add CHECK constraint: rating must be between 1 and 5
     - Add unique constraint: one review per buyer per vendor (vendor_id + reviewer_id)
     - Add index on vendor_id for fast aggregate queries (average rating)

2. Important Notes
   - Prevents duplicate reviews from same buyer to same vendor
   - Enforces valid rating range at database level
   - Index speeds up storefront profile rating calculations
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vendor_reviews_rating_range'
  ) THEN
    ALTER TABLE public.vendor_reviews ADD CONSTRAINT vendor_reviews_rating_range CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vendor_reviews_unique_buyer_vendor'
  ) THEN
    ALTER TABLE public.vendor_reviews ADD CONSTRAINT vendor_reviews_unique_buyer_vendor UNIQUE (vendor_id, reviewer_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON public.vendor_reviews (vendor_id);
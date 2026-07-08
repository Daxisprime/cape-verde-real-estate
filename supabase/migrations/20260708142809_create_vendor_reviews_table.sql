/*
# Create vendor_reviews table for storefront feedback/rating system

1. New Tables
   - `vendor_reviews`
     - `id` (uuid, primary key)
     - `vendor_id` (uuid, not null) - the profile being reviewed
     - `reviewer_id` (uuid, not null, defaults to auth.uid()) - who wrote the review
     - `rating` (integer, 1-5) - star rating
     - `comment` (text, nullable) - review text
     - `created_at` (timestamptz)

2. Security
   - Enable RLS on `vendor_reviews`
   - Anyone (anon + authenticated) can SELECT reviews (publicly visible on storefronts)
   - Authenticated users can INSERT their own reviews (reviewer_id = auth.uid())
   - Authenticated users can UPDATE their own reviews
   - Authenticated users can DELETE their own reviews

3. Indexes
   - Index on vendor_id for fast lookups per store
   - Unique constraint on (vendor_id, reviewer_id) to prevent duplicate reviews

4. Important Notes
   - Rating is constrained to 1-5 via CHECK constraint
   - reviewer_id defaults to auth.uid() so frontend doesn't need to pass it
   - One review per user per vendor enforced at DB level
*/

CREATE TABLE IF NOT EXISTS vendor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON vendor_reviews (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_created_at ON vendor_reviews (created_at DESC);

ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public storefront data)
DROP POLICY IF EXISTS "select_vendor_reviews" ON vendor_reviews;
CREATE POLICY "select_vendor_reviews" ON vendor_reviews FOR SELECT
TO anon, authenticated USING (true);

-- Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "insert_own_vendor_reviews" ON vendor_reviews;
CREATE POLICY "insert_own_vendor_reviews" ON vendor_reviews FOR INSERT
TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Authenticated users can update their own reviews
DROP POLICY IF EXISTS "update_own_vendor_reviews" ON vendor_reviews;
CREATE POLICY "update_own_vendor_reviews" ON vendor_reviews FOR UPDATE
TO authenticated USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

-- Authenticated users can delete their own reviews
DROP POLICY IF EXISTS "delete_own_vendor_reviews" ON vendor_reviews;
CREATE POLICY "delete_own_vendor_reviews" ON vendor_reviews FOR DELETE
TO authenticated USING (auth.uid() = reviewer_id);

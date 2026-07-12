/*
# Phase 5: Vendor Reviews Table & Identity Verification Status

1. New Tables
   - `vendor_reviews`
     - `id` (uuid, primary key) — unique review identifier
     - `vendor_id` (uuid, FK to profiles.id) — the vendor being reviewed
     - `reviewer_id` (uuid, FK to profiles.id, defaults to auth.uid()) — who left the review
     - `rating` (integer, 1-5, constrained with CHECK) — star rating
     - `comment` (text, nullable) — optional review text
     - `created_at` (timestamptz) — when the review was posted

2. Modified Tables
   - `profiles`
     - `verification_status` (text, default 'unverified') — tracks identity verification pipeline
       Allowed values: 'unverified', 'pending_review', 'verified'
     - `verification_document_url` (text, nullable) — path to uploaded NIF/BI document in storage

3. Security
   - RLS enabled on `vendor_reviews`
   - Anyone authenticated can SELECT reviews (public for storefront display)
   - Authenticated users can INSERT reviews for vendors they are not (no self-reviews)
   - Only the reviewer can UPDATE their own review
   - Only the reviewer can DELETE their own review

4. Important Notes
   - rating has CHECK constraint enforcing 1-5 range
   - unique constraint on (vendor_id, reviewer_id) prevents duplicate reviews
   - Chat history verification is enforced at the API layer, not RLS
   - verification_status uses text with application-level validation (not enum to avoid migration issues)
   - Index on vendor_id for fast aggregation queries (AVG rating, COUNT)
*/

-- vendor_reviews table
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, reviewer_id)
);

ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews (public storefront display)
DROP POLICY IF EXISTS "select_reviews" ON public.vendor_reviews;
CREATE POLICY "select_reviews" ON public.vendor_reviews FOR SELECT
  TO anon, authenticated USING (true);

-- Authenticated users can insert reviews (no self-reviews)
DROP POLICY IF EXISTS "insert_own_review" ON public.vendor_reviews;
CREATE POLICY "insert_own_review" ON public.vendor_reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != vendor_id);

-- Only the reviewer can update their review
DROP POLICY IF EXISTS "update_own_review" ON public.vendor_reviews;
CREATE POLICY "update_own_review" ON public.vendor_reviews FOR UPDATE
  TO authenticated USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

-- Only the reviewer can delete their review
DROP POLICY IF EXISTS "delete_own_review" ON public.vendor_reviews;
CREATE POLICY "delete_own_review" ON public.vendor_reviews FOR DELETE
  TO authenticated USING (auth.uid() = reviewer_id);

-- Index for fast rating aggregation per vendor
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON public.vendor_reviews (vendor_id);

-- profiles: verification_status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status text NOT NULL DEFAULT 'unverified';
  END IF;
END $$;

-- profiles: verification_document_url
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'verification_document_url') THEN
    ALTER TABLE public.profiles ADD COLUMN verification_document_url text;
  END IF;
END $$;
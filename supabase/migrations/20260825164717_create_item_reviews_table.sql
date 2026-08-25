/*
# Create item_reviews table (item-level peer-to-peer review system)

1. New Tables
   - `item_reviews`
     - `id` (uuid, primary key)
     - `item_id` (uuid, references marketplace_items, cascading delete)
     - `reviewer_id` (uuid, references auth.users, defaults to auth.uid())
     - `vendor_id` (uuid, references profiles, cascading delete)
     - `rating` (integer, 1-5)
     - `comment` (text, optional)
     - `vendor_reply` (text, nullable - vendor can respond)
     - `created_at` (timestamptz)
   - Unique constraint: one review per buyer per item

2. Security
   - RLS enabled
   - SELECT: public (anon + authenticated) - transparency
   - INSERT: authenticated users only, must be the reviewer
   - UPDATE: only the vendor can update (restricted to vendor_reply via trigger)
   - DELETE: no policy (admin only via service role)

3. Trigger
   - `fn_item_reviews_restrict_update`: prevents changes to any column
     except vendor_reply on UPDATE

4. Important Notes
   - The 45-day time window is enforced in the API route, not in the database
   - Existing vendor_reviews table is untouched
   - vendor_id is denormalized from marketplace_items.user_id for efficient queries
*/

-- Create the table
CREATE TABLE IF NOT EXISTS public.item_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  vendor_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT item_reviews_unique_reviewer_item UNIQUE (item_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.item_reviews ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone can read reviews (public transparency)
DROP POLICY IF EXISTS "select_item_reviews" ON public.item_reviews;
CREATE POLICY "select_item_reviews" ON public.item_reviews
  FOR SELECT TO anon, authenticated USING (true);

-- INSERT: authenticated users only, must be the reviewer
DROP POLICY IF EXISTS "insert_item_reviews" ON public.item_reviews;
CREATE POLICY "insert_item_reviews" ON public.item_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- UPDATE: only the vendor can update (for vendor_reply)
DROP POLICY IF EXISTS "update_item_reviews_vendor_reply" ON public.item_reviews;
CREATE POLICY "update_item_reviews_vendor_reply" ON public.item_reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = vendor_id)
  WITH CHECK (auth.uid() = vendor_id);

-- Trigger to restrict UPDATE to only vendor_reply column
CREATE OR REPLACE FUNCTION public.fn_item_reviews_restrict_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.rating != OLD.rating
     OR NEW.comment IS DISTINCT FROM OLD.comment
     OR NEW.item_id != OLD.item_id
     OR NEW.reviewer_id != OLD.reviewer_id
     OR NEW.vendor_id != OLD.vendor_id
  THEN
    RAISE EXCEPTION 'Only vendor_reply can be updated';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_item_reviews_restrict_update ON public.item_reviews;
CREATE TRIGGER trg_item_reviews_restrict_update
  BEFORE UPDATE ON public.item_reviews
  FOR EACH ROW EXECUTE FUNCTION public.fn_item_reviews_restrict_update();

-- Index for fast lookups by item and by vendor
CREATE INDEX IF NOT EXISTS idx_item_reviews_item_id ON public.item_reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_item_reviews_vendor_id ON public.item_reviews(vendor_id);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

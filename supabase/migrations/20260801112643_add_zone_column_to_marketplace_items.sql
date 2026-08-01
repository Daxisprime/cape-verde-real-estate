/*
# Add zone column to marketplace_items

1. Modified Tables
   - `marketplace_items`
     - Added `zone` (text, nullable) — sub-area within an island for the listing

2. Important Notes
   - Uses IF NOT EXISTS pattern for idempotency
   - Forces PostgREST schema cache reload
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'marketplace_items'
      AND column_name = 'zone'
  ) THEN
    ALTER TABLE public.marketplace_items ADD COLUMN zone text;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

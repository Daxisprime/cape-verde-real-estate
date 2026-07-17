/*
# Fix marketplace_items user_id default

1. Modified Tables
   - `marketplace_items`
     - Set `user_id` column default to `auth.uid()` so inserts succeed without
       the client explicitly providing user_id.
     - Set `user_id` to NOT NULL for data integrity.
2. Schema Cache
   - Notify PostgREST to reload schema cache so recently added columns
     (contact_whatsapp, store_id) are recognized.
3. Security
   - No RLS policy changes (existing policies are correct).
*/

-- Set default for user_id so RLS INSERT WITH CHECK (auth.uid() = user_id) passes
ALTER TABLE marketplace_items ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Make user_id NOT NULL (all existing rows should already have a value)
DO $$ BEGIN
  -- Only set NOT NULL if there are no null user_ids
  IF NOT EXISTS (SELECT 1 FROM marketplace_items WHERE user_id IS NULL) THEN
    ALTER TABLE marketplace_items ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Reload PostgREST schema cache to pick up contact_whatsapp and store_id columns
NOTIFY pgrst, 'reload schema';

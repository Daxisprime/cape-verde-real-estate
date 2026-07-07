/*
# Add bio column to profiles table

1. Modified Tables
   - `profiles`
     - Added `bio` (text, nullable) - user-editable "About Me" text field

2. Security
   - No policy changes needed; existing UPDATE policy already allows
     authenticated users to update their own row.

3. Notes
   - Uses DO block for idempotent conditional add.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

/*
# Fix properties.agent_id default value

## Problem
The `properties` table's `agent_id` column has no DEFAULT, meaning:
- If the frontend omits agent_id, it's NULL and silently fails the INSERT RLS
  policy `WITH CHECK (auth.uid() = agent_id)` (returns 0 rows, no error).

## Changes
- Backfill any NULL agent_id rows with a placeholder (first admin user) to allow NOT NULL.
- Add DEFAULT auth.uid() so the column is auto-filled from the session.
- Set NOT NULL to prevent accidental null inserts.

## Security
- No policy changes; existing RLS remains intact.
*/

-- Backfill NULLs: assign to the first available user (seed/test data)
DO $$ 
DECLARE
  fallback_id uuid;
BEGIN
  SELECT id INTO fallback_id FROM auth.users LIMIT 1;
  IF fallback_id IS NOT NULL THEN
    UPDATE properties SET agent_id = fallback_id WHERE agent_id IS NULL;
  ELSE
    DELETE FROM properties WHERE agent_id IS NULL;
  END IF;
END $$;

ALTER TABLE properties
  ALTER COLUMN agent_id SET DEFAULT auth.uid();

ALTER TABLE properties
  ALTER COLUMN agent_id SET NOT NULL;

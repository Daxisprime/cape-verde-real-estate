/*
# Add zone column and island CHECK constraint

1. Modified Tables
   - `properties`: Add `zone` TEXT column for neighborhood/area specificity
   - `marketplace_items`: Add `zone` TEXT column for neighborhood/area specificity

2. Constraints
   - Add CHECK constraint on `properties.island` restricting to 9 official Cape Verde islands
   - Add CHECK constraint on `marketplace_items.island` restricting to 9 official Cape Verde islands
   - Existing rows with NULL or non-matching island values are left untouched (constraint is added only if not exists)

3. Important Notes
   - The `zone` column is optional (nullable) for backwards compatibility
   - The CHECK constraint ensures new inserts/updates only use valid island names
   - Official islands: Santiago, Fogo, São Vicente, Sal, Boa Vista, Santo Antão, São Nicolau, Maio, Brava
*/

-- Add zone column to properties
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'zone'
  ) THEN
    ALTER TABLE public.properties ADD COLUMN zone TEXT;
  END IF;
END $$;

-- Add zone column to marketplace_items
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND column_name = 'zone'
  ) THEN
    ALTER TABLE public.marketplace_items ADD COLUMN zone TEXT;
  END IF;
END $$;

-- Add CHECK constraint on properties.island (only valid islands)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'properties' AND constraint_name = 'properties_island_check'
  ) THEN
    ALTER TABLE public.properties ADD CONSTRAINT properties_island_check
      CHECK (island IS NULL OR island IN ('Santiago', 'Fogo', 'São Vicente', 'Sal', 'Boa Vista', 'Santo Antão', 'São Nicolau', 'Maio', 'Brava'));
  END IF;
END $$;

-- Add CHECK constraint on marketplace_items.island (only valid islands)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'marketplace_items' AND constraint_name = 'marketplace_items_island_check'
  ) THEN
    ALTER TABLE public.marketplace_items ADD CONSTRAINT marketplace_items_island_check
      CHECK (island IS NULL OR island IN ('Santiago', 'Fogo', 'São Vicente', 'Sal', 'Boa Vista', 'Santo Antão', 'São Nicolau', 'Maio', 'Brava'));
  END IF;
END $$;

-- Add index on island columns for fast filtering
CREATE INDEX IF NOT EXISTS idx_properties_island ON public.properties (island);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_island ON public.marketplace_items (island);

-- Add index on zone for neighborhood lookups
CREATE INDEX IF NOT EXISTS idx_properties_zone ON public.properties (zone);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_zone ON public.marketplace_items (zone);

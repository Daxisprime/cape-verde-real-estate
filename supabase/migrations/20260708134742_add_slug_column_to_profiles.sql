/*
# Add slug column to profiles for storefront URLs

1. Changes
   - Add `slug` column to `profiles` table (unique, nullable)
   - Auto-generate slug from the user's name on INSERT/UPDATE via a trigger
   - Create unique index for URL lookups

2. Security
   - Slug is publicly visible (used in URLs)
   - No RLS change needed (profiles already have public SELECT)
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles (slug);

CREATE OR REPLACE FUNCTION generate_profile_slug()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.name IS NOT NULL AND (NEW.slug IS NULL OR TG_OP = 'INSERT') THEN
    base_slug := lower(regexp_replace(trim(NEW.name), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    LOOP
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE slug = final_slug AND id != NEW.id);
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_profile_slug ON profiles;
CREATE TRIGGER trigger_generate_profile_slug
  BEFORE INSERT OR UPDATE OF name ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_profile_slug();

-- Backfill existing profiles that have a name but no slug
UPDATE profiles SET slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL AND name IS NOT NULL;

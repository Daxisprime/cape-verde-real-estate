-- Add promotion tracking columns to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_until timestamptz DEFAULT null;

-- Add promotion tracking columns to marketplace_items
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS featured_until timestamptz DEFAULT null;
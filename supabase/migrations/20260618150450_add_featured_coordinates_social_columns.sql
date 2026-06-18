-- Add is_featured flag for premium listing prioritization
ALTER TABLE vendor_ads ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Add landmark and coordinate fields for location pin-dropping
ALTER TABLE vendor_ads ADD COLUMN IF NOT EXISTS landmark text;
ALTER TABLE vendor_ads ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE vendor_ads ADD COLUMN IF NOT EXISTS longitude double precision;

-- Add social handle fields
ALTER TABLE vendor_ads ADD COLUMN IF NOT EXISTS facebook_handle text;
ALTER TABLE vendor_ads ADD COLUMN IF NOT EXISTS instagram_handle text;

-- Add social handles to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_handle text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle text;

-- Index for featured listings priority sort
CREATE INDEX IF NOT EXISTS idx_vendor_ads_featured ON vendor_ads (is_featured DESC, created_at DESC);

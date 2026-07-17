/*
# Add banner_style column to profiles

## Changes
- Adds `banner_style` text column to `profiles` table
- Allowed values: 'custom' (user-uploaded image), 'gradient' (CSS-only modern gradient), 'stock' (Cape Verde stock photo)
- Defaults to 'custom' to preserve existing behaviour for users who already set a banner URL

## Why
- Enables low-data-usage storefronts by offering zero-bandwidth CSS gradient banners
- Provides curated Cape Verde stock photos as a fallback for users without a custom image
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'banner_style'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN banner_style text NOT NULL DEFAULT 'custom';
  END IF;
END $$;

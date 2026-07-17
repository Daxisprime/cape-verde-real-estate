/*
# Add phone_verified and whatsapp_number columns to profiles

1. Modified Tables
   - `profiles`:
     - `whatsapp_number` (TEXT, nullable) — Full international WhatsApp number with country code prefix (e.g. +238912345678)
     - `phone_verified` (BOOLEAN, default false) — Whether the user has verified their WhatsApp number

2. Important Notes
   - Both columns are nullable/have defaults for backwards compatibility
   - phone_verified defaults to false; set to true only after successful verification
   - whatsapp_number stores the complete international format string including country code
   - Existing phone column is preserved for backwards compatibility
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN whatsapp_number TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

/*
# Add contact_whatsapp column to marketplace_items

1. Modified Tables
   - `marketplace_items`
     - Added `contact_whatsapp` (text, nullable) — seller WhatsApp number for buyer contact

2. Important Notes
   - Uses IF NOT EXISTS pattern via DO block for idempotency
   - Forces PostgREST schema cache reload so the column is immediately queryable
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'marketplace_items'
      AND column_name = 'contact_whatsapp'
  ) THEN
    ALTER TABLE public.marketplace_items ADD COLUMN contact_whatsapp text;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

/*
# Add performance-based trial columns to profiles

1. Modified Tables
   - `profiles`
     - `accumulated_leads_count` (integer, default 0) — counts unique buyer interactions (chats + WhatsApp clicks)
     - `paywall_active` column already exists (boolean) — used to freeze listing creation
     - `trial_extended` (boolean, default false) — indicates the free period was auto-extended due to low leads

2. New Function
   - `increment_store_leads(store_user_id uuid)` — safely increments accumulated_leads_count by 1

3. Important Notes
   - Paywall conditions: store age > 60 days AND accumulated_leads_count >= 15
   - If store > 60 days but < 15 leads, trial is auto-extended (paywall stays inactive)
   - Column additions are idempotent via DO blocks
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='accumulated_leads_count') THEN
    ALTER TABLE public.profiles ADD COLUMN accumulated_leads_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='trial_extended') THEN
    ALTER TABLE public.profiles ADD COLUMN trial_extended boolean NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.increment_store_leads(store_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.profiles
  SET accumulated_leads_count = accumulated_leads_count + 1
  WHERE id = store_user_id
  RETURNING accumulated_leads_count INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$$;
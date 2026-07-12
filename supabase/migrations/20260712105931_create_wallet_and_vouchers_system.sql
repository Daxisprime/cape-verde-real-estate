/*
# Phase 3: Internal Wallet & Voucher Redemption System

1. Modified Tables
   - `profiles`
     - `wallet_balance` (decimal(12,2), default 0.00) — user's internal wallet balance in CVE

2. New Tables
   - `vouchers`
     - `id` (uuid, primary key) — unique voucher identifier
     - `pin_code` (text, unique) — 12-digit PIN printed on physical/digital voucher cards
     - `value_amount` (decimal(12,2), not null) — CVE value the voucher adds to the wallet
     - `is_redeemed` (boolean, default false) — whether the voucher has been used
     - `redeemed_by_user_id` (uuid, nullable, references profiles.id) — who redeemed it
     - `redeemed_at` (timestamptz, nullable) — when it was redeemed
     - `created_at` (timestamptz, default now()) — when the voucher was generated

3. Security
   - RLS enabled on `vouchers`
   - Authenticated users can SELECT vouchers they redeemed (ownership check)
   - Authenticated users can UPDATE unredeemed vouchers to mark them as redeemed (controlled via app logic)
   - Only admin/service role can INSERT new vouchers (no INSERT policy for authenticated)

4. Important Notes
   - wallet_balance uses decimal(12,2) for precise currency handling
   - pin_code has a unique constraint to prevent duplicate voucher generation
   - Redemption is atomic: the API route checks + updates in a single operation
   - No DELETE policy — vouchers are permanent records for audit trail
*/

-- profiles: wallet_balance
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'wallet_balance') THEN
    ALTER TABLE public.profiles ADD COLUMN wallet_balance decimal(12,2) NOT NULL DEFAULT 0.00;
  END IF;
END $$;

-- vouchers table
CREATE TABLE IF NOT EXISTS public.vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_code text UNIQUE NOT NULL,
  value_amount decimal(12,2) NOT NULL,
  is_redeemed boolean NOT NULL DEFAULT false,
  redeemed_by_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Users can view vouchers they have redeemed
DROP POLICY IF EXISTS "select_own_vouchers" ON public.vouchers;
CREATE POLICY "select_own_vouchers" ON public.vouchers FOR SELECT
  TO authenticated USING (auth.uid() = redeemed_by_user_id);

-- Users can update unredeemed vouchers (to redeem them)
DROP POLICY IF EXISTS "redeem_voucher" ON public.vouchers;
CREATE POLICY "redeem_voucher" ON public.vouchers FOR UPDATE
  TO authenticated
  USING (is_redeemed = false)
  WITH CHECK (auth.uid() = redeemed_by_user_id AND is_redeemed = true);

-- Index on pin_code for fast lookup during redemption
CREATE INDEX IF NOT EXISTS idx_vouchers_pin_code ON public.vouchers (pin_code) WHERE is_redeemed = false;
/*
# Create merchant_onboardings table with PGP symmetric encryption

1. New Tables
   - `merchant_onboardings`
     - `id` (uuid, primary key)
     - `agent_id` (uuid, FK auth.users, defaults to auth.uid()) — the logged-in agent doing the onboarding
     - `merchant_name` (text, not null) — the store owner's full name
     - `merchant_phone` (text, not null) — WhatsApp/phone number
     - `store_name` (text, not null) — business/store name
     - `category` (text) — main product category
     - `region` (text) — neighborhood/island
     - `nif_encrypted` (bytea, not null) — NIF encrypted with pgp_sym_encrypt
     - `id_image_path` (text) — private storage bucket path to ID photo
     - `seed_product_title` (text) — first product listing title
     - `seed_product_price` (integer) — first product price in CVE
     - `product_image_path` (text) — path to compressed product photo
     - `created_at` (timestamptz)

2. Security
   - RLS enabled
   - Agents can INSERT their own onboarding records
   - Agents can SELECT their own records
   - Admins see all (via service role bypass)

3. New Functions
   - `insert_merchant_onboarding(...)` — RPC function that accepts plaintext NIF and
     encrypts it server-side using pgp_sym_encrypt before storing. The encryption key
     is a server-side constant so the client never handles raw crypto.

4. Important Notes
   - pgcrypto extension is already enabled
   - The encryption key is stored server-side in the function — clients pass plaintext NIF
     which gets encrypted at the database layer before storage
   - Decryption requires calling pgp_sym_decrypt with the same key (admin-only operation)
*/

CREATE TABLE IF NOT EXISTS public.merchant_onboardings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  merchant_name text NOT NULL,
  merchant_phone text NOT NULL,
  store_name text NOT NULL,
  category text,
  region text,
  nif_encrypted bytea NOT NULL,
  id_image_path text,
  seed_product_title text,
  seed_product_price integer,
  product_image_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.merchant_onboardings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_merchant_onboardings_agent_id ON public.merchant_onboardings (agent_id);

DROP POLICY IF EXISTS "agents_select_own_onboardings" ON public.merchant_onboardings;
CREATE POLICY "agents_select_own_onboardings" ON public.merchant_onboardings FOR SELECT
  TO authenticated USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "agents_insert_onboardings" ON public.merchant_onboardings;
CREATE POLICY "agents_insert_onboardings" ON public.merchant_onboardings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = agent_id);

-- Server-side RPC that encrypts NIF using pgp_sym_encrypt
-- The key never leaves the database — clients call this function with plaintext
CREATE OR REPLACE FUNCTION public.insert_merchant_onboarding(
  p_merchant_name text,
  p_merchant_phone text,
  p_store_name text,
  p_category text DEFAULT NULL,
  p_region text DEFAULT NULL,
  p_nif text DEFAULT '',
  p_id_image_path text DEFAULT NULL,
  p_seed_product_title text DEFAULT NULL,
  p_seed_product_price integer DEFAULT NULL,
  p_product_image_path text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id uuid;
  enc_key text := 'procv_secret_island_vault_key';
BEGIN
  INSERT INTO public.merchant_onboardings (
    agent_id, merchant_name, merchant_phone, store_name,
    category, region, nif_encrypted, id_image_path,
    seed_product_title, seed_product_price, product_image_path
  ) VALUES (
    auth.uid(),
    p_merchant_name,
    p_merchant_phone,
    p_store_name,
    p_category,
    p_region,
    pgp_sym_encrypt(p_nif, enc_key),
    p_id_image_path,
    p_seed_product_title,
    p_seed_product_price,
    p_product_image_path
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
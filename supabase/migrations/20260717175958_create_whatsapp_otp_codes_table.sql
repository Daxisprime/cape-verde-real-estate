/*
# Create WhatsApp OTP Codes Table

1. New Tables
   - `whatsapp_otp_codes`
     - `id` (uuid, primary key)
     - `phone` (text, not null) - normalized phone number with country code
     - `code_hash` (text, not null) - SHA-256 hash of the 6-digit OTP
     - `expires_at` (timestamptz, not null) - expiration timestamp (now + 5 minutes)
     - `verified` (boolean, default false) - whether this code was successfully verified
     - `attempts` (int, default 0) - brute-force protection counter
     - `created_at` (timestamptz, default now())

2. Security
   - Enable RLS on `whatsapp_otp_codes`.
   - No direct client access - only the service role (API routes) can read/write.
   - Policies deny all access to anon/authenticated (server-only table).

3. Indexes
   - Index on (phone, expires_at) for fast lookup of active codes.

4. Notes
   - This table is managed exclusively by the server-side API route.
   - Codes are hashed before storage for security.
   - Max 3 attempts per code to prevent brute-force.
*/

CREATE TABLE IF NOT EXISTS whatsapp_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_otp_codes ENABLE ROW LEVEL SECURITY;

-- No policies = locked down. Only service_role can access.
-- Add explicit deny policies for documentation clarity:
DROP POLICY IF EXISTS "deny_all_select_otp" ON whatsapp_otp_codes;
CREATE POLICY "deny_all_select_otp" ON whatsapp_otp_codes
  FOR SELECT TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_all_insert_otp" ON whatsapp_otp_codes;
CREATE POLICY "deny_all_insert_otp" ON whatsapp_otp_codes
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_update_otp" ON whatsapp_otp_codes;
CREATE POLICY "deny_all_update_otp" ON whatsapp_otp_codes
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_delete_otp" ON whatsapp_otp_codes;
CREATE POLICY "deny_all_delete_otp" ON whatsapp_otp_codes
  FOR DELETE TO anon, authenticated USING (false);

-- Index for fast lookup of active codes by phone
CREATE INDEX IF NOT EXISTS idx_whatsapp_otp_phone_expires
  ON whatsapp_otp_codes (phone, expires_at DESC);

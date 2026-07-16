/*
# Create merchant_verifications table for free store verification

1. New Tables
   - `merchant_verifications`
     - `id` (uuid, primary key) — unique verification request ID
     - `user_id` (uuid, FK to auth.users, defaults to auth.uid()) — the store owner requesting verification
     - `agent_id` (uuid, nullable) — tracks which agent assisted with onboarding, if any
     - `full_legal_name` (text, not null) — legal business/personal name
     - `nif_number` (text, not null) — NIF or BI document number (stored as text, encrypted at rest by Supabase)
     - `id_document_url` (text, nullable) — private storage path to uploaded ID/business document
     - `status` (text, default 'pending_review') — pending_review, verified, rejected
     - `admin_notes` (text, nullable) — internal notes from reviewing admin
     - `submitted_at` (timestamptz) — when the request was submitted
     - `verified_at` (timestamptz, nullable) — when admin approved

2. Security
   - RLS enabled
   - Users can SELECT their own verification records
   - Users can INSERT their own verification requests
   - Users CANNOT update or delete — only admins manage status changes via service role
   - Admins handle status transitions server-side (service_role bypasses RLS)

3. Storage
   - Creates a private 'verification-docs' bucket for document uploads (not publicly accessible)

4. Important Notes
   - This verification is 100% FREE — completely decoupled from payment/subscription
   - Once admin sets status='verified', the app reads profiles.verified=true on the public profile
   - The profiles.verified column already exists and is used for the checkmark badge display
*/

CREATE TABLE IF NOT EXISTS public.merchant_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id),
  full_legal_name text NOT NULL,
  nif_number text NOT NULL,
  id_document_url text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'rejected')),
  admin_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz
);

ALTER TABLE public.merchant_verifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_merchant_verifications_user_id ON public.merchant_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_verifications_status ON public.merchant_verifications (status);

-- Users can view their own verification requests
DROP POLICY IF EXISTS "select_own_verifications" ON public.merchant_verifications;
CREATE POLICY "select_own_verifications" ON public.merchant_verifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Users can submit their own verification requests
DROP POLICY IF EXISTS "insert_own_verifications" ON public.merchant_verifications;
CREATE POLICY "insert_own_verifications" ON public.merchant_verifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- No update/delete for regular users — admin uses service role

-- Create private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('verification-docs', 'verification-docs', false, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: users can upload to their own folder
DROP POLICY IF EXISTS "users_upload_own_docs" ON storage.objects;
CREATE POLICY "users_upload_own_docs" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policy: users can read their own docs
DROP POLICY IF EXISTS "users_read_own_docs" ON storage.objects;
CREATE POLICY "users_read_own_docs" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
/*
# Harden RLS policies on email_queue and merchant_onboardings

## Changes

### email_queue
- DROP the permissive `anon_insert_email_queue` policy that allows any user to insert
- Only `service_role` retains full access (existing policy stays)
- Authenticated/anon users cannot SELECT, INSERT, UPDATE, or DELETE

### merchant_onboardings
- Existing SELECT/INSERT policies for authenticated agents scoped to agent_id are preserved
- Explicitly deny UPDATE/DELETE for authenticated users — only service_role may modify rows after creation
- Add service_role full-access policy for admin operations

## Security Notes
- Zero-trust approach: public/authenticated roles get minimal access
- email_queue is fully locked to service_role (prevents user tampering)
- merchant_onboardings allows agents to create and view their own records only
*/

-- ============================================================
-- email_queue: remove public INSERT, lock to service_role only
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_email_queue" ON public.email_queue;

-- Ensure the service_role policy exists (idempotent recreation)
DROP POLICY IF EXISTS "service_role_full_access" ON public.email_queue;
CREATE POLICY "service_role_full_access" ON public.email_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- merchant_onboardings: tighten + add service_role access
-- ============================================================

-- Preserve existing agent policies (drop + recreate for idempotency)
DROP POLICY IF EXISTS "agents_select_own_onboardings" ON public.merchant_onboardings;
CREATE POLICY "agents_select_own_onboardings" ON public.merchant_onboardings
  FOR SELECT TO authenticated USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "agents_insert_onboardings" ON public.merchant_onboardings;
CREATE POLICY "agents_insert_onboardings" ON public.merchant_onboardings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);

-- No UPDATE/DELETE for authenticated users — agents cannot tamper after submission
DROP POLICY IF EXISTS "agents_update_onboardings" ON public.merchant_onboardings;
DROP POLICY IF EXISTS "agents_delete_onboardings" ON public.merchant_onboardings;

-- Service role gets full access for admin review workflows
DROP POLICY IF EXISTS "service_role_full_access_onboardings" ON public.merchant_onboardings;
CREATE POLICY "service_role_full_access_onboardings" ON public.merchant_onboardings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

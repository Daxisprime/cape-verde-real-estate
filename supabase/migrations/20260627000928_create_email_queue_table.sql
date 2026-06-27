CREATE TABLE email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  to_name text,
  from_email text NOT NULL DEFAULT 'noreply@procv.app',
  from_name text NOT NULL DEFAULT 'Pro.CV',
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  reference_type text,
  reference_id text,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  processed_at timestamptz,
  provider_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON email_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_email_queue" ON email_queue FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX idx_email_queue_pending ON email_queue (status, scheduled_for, attempts) WHERE status = 'pending';
CREATE TABLE IF NOT EXISTS property_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  full_name text NOT NULL,
  phone text,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous/unauthenticated) to insert inquiries
CREATE POLICY "anyone_can_insert_inquiries" ON property_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only authenticated admins/agents can read inquiries
CREATE POLICY "authenticated_can_read_inquiries" ON property_inquiries FOR SELECT
  TO authenticated USING (true);

-- Only authenticated can update status
CREATE POLICY "authenticated_can_update_inquiries" ON property_inquiries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Only authenticated can delete
CREATE POLICY "authenticated_can_delete_inquiries" ON property_inquiries FOR DELETE
  TO authenticated USING (true);
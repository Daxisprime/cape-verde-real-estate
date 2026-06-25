
CREATE TABLE IF NOT EXISTS marketplace_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guest inquiry)
CREATE POLICY "insert_marketplace_inquiries" ON marketplace_inquiries FOR INSERT
  WITH CHECK (true);

-- Sellers can read inquiries for their own items
CREATE POLICY "select_own_marketplace_inquiries" ON marketplace_inquiries FOR SELECT
  TO authenticated USING (seller_id = auth.uid());

-- Sellers can update status of their own inquiries
CREATE POLICY "update_own_marketplace_inquiries" ON marketplace_inquiries FOR UPDATE
  TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

-- Sellers can delete their own inquiries
CREATE POLICY "delete_own_marketplace_inquiries" ON marketplace_inquiries FOR DELETE
  TO authenticated USING (seller_id = auth.uid());

CREATE INDEX idx_marketplace_inquiries_item ON marketplace_inquiries(item_id);
CREATE INDEX idx_marketplace_inquiries_seller ON marketplace_inquiries(seller_id);

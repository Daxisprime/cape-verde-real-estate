-- Add whatsapp and social link fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_link text;

-- Add seller_id to property_inquiries so sellers get notified
ALTER TABLE property_inquiries ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id);

-- Add market_category to vendor_ads for marketplace listings
ALTER TABLE vendor_ads ADD COLUMN IF NOT EXISTS market_category text;

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies for property_inquiries (allow anyone to insert, sellers to read their own)
CREATE POLICY "anyone_can_insert_inquiry" ON property_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "sellers_read_own_inquiries" ON property_inquiries
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

-- Allow authenticated users to insert vendor_ads with their own id
DROP POLICY IF EXISTS "users_insert_own_ads" ON vendor_ads;
CREATE POLICY "users_insert_own_ads" ON vendor_ads
  FOR INSERT TO authenticated
  WITH CHECK (vendor_id = auth.uid());

DROP POLICY IF EXISTS "users_read_own_ads" ON vendor_ads;
CREATE POLICY "users_read_own_ads" ON vendor_ads
  FOR SELECT TO authenticated
  USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "anyone_read_active_ads" ON vendor_ads;
CREATE POLICY "anyone_read_active_ads" ON vendor_ads
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "users_update_own_ads" ON vendor_ads;
CREATE POLICY "users_update_own_ads" ON vendor_ads
  FOR UPDATE TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_ads" ON vendor_ads;
CREATE POLICY "users_delete_own_ads" ON vendor_ads
  FOR DELETE TO authenticated
  USING (vendor_id = auth.uid());

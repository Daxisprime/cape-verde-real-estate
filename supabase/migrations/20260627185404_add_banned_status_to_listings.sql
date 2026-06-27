-- Add 'banned' to properties status constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
  CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'sold'::text, 'rented'::text, 'archived'::text, 'banned'::text]));

-- Add 'vendor' to profiles role constraint to match app usage
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['user'::text, 'buyer'::text, 'vendor'::text, 'agent'::text, 'admin'::text]));

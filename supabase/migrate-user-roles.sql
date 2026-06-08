-- ============================================
-- ProCV: Migrate User Roles to Multi-Role Array
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop the existing CHECK constraint on role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Rename old role column temporarily
ALTER TABLE users RENAME COLUMN role TO role_old;

-- Step 3: Add new roles array column
ALTER TABLE users ADD COLUMN roles TEXT[] DEFAULT ARRAY['buyer']::TEXT[];

-- Step 4: Migrate existing role data to new array format
UPDATE users SET roles = ARRAY[role_old] WHERE role_old IS NOT NULL;

-- Step 5: Drop the old column
ALTER TABLE users DROP COLUMN role_old;

-- Step 6: Add a check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT valid_roles CHECK (
  roles <@ ARRAY['buyer', 'agent', 'vendor', 'admin']::TEXT[]
);

-- Step 7: Create index for role queries
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);

-- Step 8: Create helper function to check if user has a role
CREATE OR REPLACE FUNCTION user_has_role(user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND check_role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create function to add role to user
CREATE OR REPLACE FUNCTION add_user_role(user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET roles = array_append(roles, new_role)
  WHERE id = user_id
  AND NOT (new_role = ANY(roles));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to remove role from user
CREATE OR REPLACE FUNCTION remove_user_role(user_id UUID, role_to_remove TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET roles = array_remove(roles, role_to_remove)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the migration
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'roles';

SELECT '✅ User roles migration complete! Users can now have multiple roles.' as status;

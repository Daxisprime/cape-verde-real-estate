/*
# Fix marketplace_items SELECT policy for owners

1. Problem
   - Current SELECT policy only shows items where status = 'active'
   - This prevents owners from seeing their own sold/closed/draft items in their dashboard

2. Fix
   - Allow anyone to see active items
   - Allow owners to always see their own items regardless of status
*/

DROP POLICY IF EXISTS "select_active_marketplace_items" ON marketplace_items;
CREATE POLICY "select_marketplace_items" ON marketplace_items FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  OR auth.uid() = user_id
);

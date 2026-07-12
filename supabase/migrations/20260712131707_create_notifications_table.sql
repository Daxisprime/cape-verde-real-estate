/*
# Create notifications table and notification_preferences column

1. New Tables
   - `notifications`
     - `id` (uuid, primary key)
     - `user_id` (uuid, references profiles.id, NOT NULL, default auth.uid())
     - `type` (text, one of: 'system', 'chat', 'recommendation', 'sponsored')
     - `title` (text, NOT NULL)
     - `content` (text)
     - `image_url` (text, supports single or 2x2 mosaic image URLs)
     - `link_url` (text, deep-link into the app)
     - `is_read` (boolean, default false)
     - `created_at` (timestamptz, default now())

2. Modified Tables
   - `profiles`
     - `notification_preferences` (jsonb, default '{}') — user toggles for muting categories

3. Security
   - Enable RLS on `notifications`
   - Users can only read/update/delete their own notifications
   - Insert allowed for authenticated (system/edge functions insert via service role)

4. Indexes
   - user_id + is_read for unread count queries
   - user_id + created_at for chronological listing

5. Important Notes
   - The 'type' column uses a CHECK constraint rather than a Postgres ENUM to avoid migration pain
   - notification_preferences stores JSON like {"sponsored": false, "recommendation": true}
*/

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('system', 'chat', 'recommendation', 'sponsored')),
  title text NOT NULL,
  content text,
  image_url text,
  link_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

DROP POLICY IF EXISTS "select_own_notifications" ON public.notifications;
CREATE POLICY "select_own_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON public.notifications;
CREATE POLICY "insert_own_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON public.notifications;
CREATE POLICY "update_own_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON public.notifications;
CREATE POLICY "delete_own_notifications" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Add notification_preferences to profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='notification_preferences') THEN
    ALTER TABLE public.profiles ADD COLUMN notification_preferences jsonb NOT NULL DEFAULT '{}';
  END IF;
END $$;
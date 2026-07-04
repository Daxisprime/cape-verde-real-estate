-- Enable Row-Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow users to update their own profiles
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
CREATE POLICY "Allow users to update their own profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Flush the Supabase API schema cache
NOTIFY pgrst, 'reload schema';
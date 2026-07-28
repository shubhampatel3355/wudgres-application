-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.app_hero_content;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.app_hero_content;

-- Make sure RLS is enabled
ALTER TABLE public.app_hero_content ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
ON public.app_hero_content FOR SELECT
USING (true);

-- Create policy for authenticated users to update/insert
CREATE POLICY "Enable ALL access for authenticated users"
ON public.app_hero_content FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

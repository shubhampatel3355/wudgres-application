-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.app_hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type text NOT NULL CHECK (media_type IN ('video', 'carousel')),
  video_url text,
  poster_url text,
  carousel_images text[],
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Enable RLS
ALTER TABLE public.app_hero_content ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Anyone can read the hero content
CREATE POLICY "Enable read access for all users"
ON public.app_hero_content FOR SELECT
USING (true);

-- Allow authenticated users (Admins) to insert/update
CREATE POLICY "Enable write access for authenticated users"
ON public.app_hero_content FOR ALL
USING (auth.role() = 'authenticated');

-- 4. Insert default row if table is empty
INSERT INTO public.app_hero_content (id, media_type, video_url, poster_url, carousel_images)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid, 
  'video', 
  NULL, -- local fallback will be used
  NULL, -- local fallback will be used
  ARRAY[]::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.app_hero_content);

-- 5. Create storage bucket for app-content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-content', 'app-content', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Setup storage policies for the new bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'app-content' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'app-content' );

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'app-content' );

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'app-content' );

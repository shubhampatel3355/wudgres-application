-- 1. Allow public read access to the app-content bucket
CREATE POLICY "Public Access app-content"
ON storage.objects FOR SELECT
USING ( bucket_id = 'app-content' );

-- 2. Allow authenticated users (Admin) to upload files
CREATE POLICY "Authenticated users can upload app-content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'app-content' );

-- 3. Allow authenticated users to update files
CREATE POLICY "Authenticated users can update app-content"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'app-content' );

-- 4. Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete app-content"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'app-content' );

-- =============================================================================
-- STORAGE BUCKETS CONFIGURATION
-- =============================================================================

-- Create storage buckets for OnboardKit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('kit-logos', 'kit-logos', true, 5242880, '{"image/png","image/jpeg","image/gif","image/webp","image/svg+xml"}'), -- 5MB limit for logos
  ('kit-files', 'kit-files', false, 52428800, null), -- 50MB limit for client uploads, private
  ('user-avatars', 'user-avatars', true, 2097152, '{"image/png","image/jpeg","image/gif","image/webp"}'), -- 2MB limit for avatars
  ('kit-assets', 'kit-assets', true, 10485760, '{"image/png","image/jpeg","image/gif","image/webp","image/svg+xml","video/mp4","video/webm","application/pdf"}'); -- 10MB limit for kit assets

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Kit logos bucket policies
CREATE POLICY "Kit owners can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kit-logos' AND
    auth.uid() IN (
      SELECT user_id FROM public.kits WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Kit owners can update logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'kit-logos' AND
    auth.uid() IN (
      SELECT user_id FROM public.kits WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Kit owners can delete logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'kit-logos' AND
    auth.uid() IN (
      SELECT user_id FROM public.kits WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Everyone can view kit logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'kit-logos');

-- Kit files bucket policies (private)
CREATE POLICY "Kit owners can view uploaded files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kit-files' AND
    auth.uid() IN (
      SELECT user_id FROM public.kits WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Anyone can upload files to published kits" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kit-files' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.kits WHERE status = 'published'
    )
  );

CREATE POLICY "Kit owners can delete uploaded files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'kit-files' AND
    auth.uid() IN (
      SELECT user_id FROM public.kits WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- User avatars bucket policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Everyone can view user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

-- Kit assets bucket policies (public)
CREATE POLICY "Kit owners can manage assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'kit-assets' AND
    auth.uid() IN (
      SELECT user_id FROM public.kits WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Everyone can view kit assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'kit-assets');

-- =============================================================================
-- STORAGE HELPER FUNCTIONS
-- =============================================================================

-- Function to get signed URL for private files
CREATE OR REPLACE FUNCTION get_file_url(
  bucket_name TEXT,
  file_path TEXT,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Check if user has permission to access the file
  IF bucket_name = 'kit-files' THEN
    -- Check if user owns the kit or if it's a published kit file
    IF NOT EXISTS (
      SELECT 1 FROM public.kits 
      WHERE id::text = (string_to_array(file_path, '/'))[1] 
      AND (user_id = auth.uid() OR status = 'published')
    ) THEN
      RETURN NULL;
    END IF;
  END IF;

  -- Generate signed URL (this would be handled by Supabase Storage API in practice)
  RETURN format('https://your-project.supabase.co/storage/v1/object/sign/%s/%s', bucket_name, file_path);
END;
$$;

-- Function to validate file upload
CREATE OR REPLACE FUNCTION validate_file_upload(
  bucket_name TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_config RECORD;
  allowed_types TEXT[];
  max_size INTEGER;
BEGIN
  -- Get bucket configuration
  SELECT * INTO bucket_config
  FROM storage.buckets
  WHERE id = bucket_name;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check file size
  IF bucket_config.file_size_limit IS NOT NULL AND file_size > bucket_config.file_size_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Check mime type
  IF bucket_config.allowed_mime_types IS NOT NULL THEN
    SELECT bucket_config.allowed_mime_types INTO allowed_types;
    IF NOT (mime_type = ANY(allowed_types)) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;
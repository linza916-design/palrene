
-- ============================================================
-- Set storage bucket file size limits and allowed MIME types.
-- All buckets currently have NULL limits — no upload restrictions.
-- ============================================================

-- avatars: 5MB images only
UPDATE storage.buckets SET
  file_size_limit = 5242880,  -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'avatars';

-- banners: 10MB images only
UPDATE storage.buckets SET
  file_size_limit = 10485760,  -- 10MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'banners';

-- posts: 50MB — images + videos + GIFs
UPDATE storage.buckets SET
  file_size_limit = 52428800,  -- 50MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
WHERE id = 'posts';

-- groups: 10MB images for group banners and avatars
UPDATE storage.buckets SET
  file_size_limit = 10485760,  -- 10MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'groups';

-- ads: 20MB — images + short videos for ad media
UPDATE storage.buckets SET
  file_size_limit = 20971520,  -- 20MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
WHERE id = 'ads';

-- verification: 20MB — ID docs + selfie video. Keep private (already is).
UPDATE storage.buckets SET
  file_size_limit = 20971520,  -- 20MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'],
  public = false
WHERE id = 'verification';

-- ============================================================
-- Add storage SELECT policies so authenticated users can
-- access public bucket objects (currently no read policies)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for public buckets'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read for public buckets" ON storage.objects FOR SELECT TO public USING (bucket_id IN (''avatars'', ''banners'', ''posts'', ''groups'', ''ads''))';
  END IF;
END $$;

-- Verification bucket: owner-only read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner read verification'
  ) THEN
    EXECUTE 'CREATE POLICY "Owner read verification" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''verification'' AND (storage.foldername(name))[1] = auth.uid()::text)';
  END IF;
END $$;

-- Update upload policies to require auth (currently only checking bucket_id, not ownership)
DROP POLICY IF EXISTS "avatar_uploads" ON storage.objects;
DROP POLICY IF EXISTS "post_uploads" ON storage.objects;
DROP POLICY IF EXISTS "verification_uploads" ON storage.objects;

CREATE POLICY "authenticated_avatar_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "authenticated_post_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('posts', 'ads', 'groups')
  );

CREATE POLICY "authenticated_verification_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'verification'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own uploads
CREATE POLICY "delete_own_uploads" ON storage.objects
  FOR DELETE TO authenticated
  USING (owner = auth.uid());

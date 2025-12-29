-- ============================================
-- Storage Bucket Policies
-- ============================================
-- Run this script AFTER creating the 'doctor-images' bucket in Supabase Storage
-- ============================================
-- IMPORTANT: First create the bucket manually:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: doctor-images
-- 4. Public: Yes (checked)
-- 5. File size limit: 5MB (optional)
-- 6. Allowed MIME types: image/* (optional)
-- ============================================

-- ============================================
-- DOCTOR-IMAGES BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Staff and admins can upload doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Staff and admins can update doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Staff and admins can delete doctor images" ON storage.objects;

-- Public can view images (for displaying doctor profiles)
CREATE POLICY "Public can view doctor images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctor-images');

-- Staff and admins can upload images
CREATE POLICY "Staff and admins can upload doctor images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'doctor-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  );

-- Staff and admins can update images
CREATE POLICY "Staff and admins can update doctor images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'doctor-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  );

-- Staff and admins can delete images
CREATE POLICY "Staff and admins can delete doctor images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'doctor-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  );

-- ============================================
-- Storage Policies Setup Complete!
-- ============================================


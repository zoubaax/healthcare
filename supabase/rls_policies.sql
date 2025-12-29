-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Run this script AFTER setup.sql
-- This sets up security policies for all tables
-- ============================================

-- ============================================
-- HELPER FUNCTION (Prevents Infinite Recursion)
-- ============================================

-- Create helper function that bypasses RLS to check admin status
-- SECURITY DEFINER allows it to read staff table without RLS checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
END;
$$;

-- ============================================
-- STAFF TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all staff" ON staff;
DROP POLICY IF EXISTS "Staff can view their own record" ON staff;
DROP POLICY IF EXISTS "Service role can manage staff" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;
DROP POLICY IF EXISTS "Admins can insert staff" ON staff;
DROP POLICY IF EXISTS "Admins can update staff" ON staff;
DROP POLICY IF EXISTS "Admins can delete staff" ON staff;

-- Staff (or any authenticated user) can view their own record
-- This is used by the frontend to read the current user's role
-- No recursion because it doesn't query staff table
CREATE POLICY "Staff can view their own record"
  ON staff FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all staff records
-- Uses helper function to avoid recursion
CREATE POLICY "Admins can view all staff"
  ON staff FOR SELECT
  USING (is_admin());

-- Admins can insert new staff records
CREATE POLICY "Admins can insert staff"
  ON staff FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update staff records
CREATE POLICY "Admins can update staff"
  ON staff FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete staff records
CREATE POLICY "Admins can delete staff"
  ON staff FOR DELETE
  USING (is_admin());

-- Service role (backend / edge functions) can manage all staff
CREATE POLICY "Service role can manage staff"
  ON staff FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- DOCTORS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view doctors" ON doctors;
DROP POLICY IF EXISTS "Staff and admins can manage doctors" ON doctors;

-- Public can view doctors (for browsing)
CREATE POLICY "Public can view doctors"
  ON doctors FOR SELECT
  USING (true);

-- Staff and admins can insert, update, delete doctors
CREATE POLICY "Staff and admins can manage doctors"
  ON doctors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  );

-- ============================================
-- TIME_SLOTS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view time slots" ON time_slots;
DROP POLICY IF EXISTS "Staff and admins can manage time slots" ON time_slots;

-- Public can view time slots (for booking)
CREATE POLICY "Public can view time slots"
  ON time_slots FOR SELECT
  USING (true);

-- Staff and admins can insert, update, delete time slots
CREATE POLICY "Staff and admins can manage time slots"
  ON time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  );

-- ============================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Staff and admins can manage appointments" ON appointments;

-- Public can create appointments (for booking)
CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Staff and admins can view, update, delete appointments
CREATE POLICY "Staff and admins can manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() 
      AND (role = 'staff' OR role = 'admin') 
      AND is_active = true
    )
  );

-- ============================================
-- RLS Policies Setup Complete!
-- ============================================


-- ============================================
-- Fix Staff RLS Policies - No Infinite Recursion
-- ============================================
-- Run this to fix the RLS policies so admins can manage staff
-- Uses a helper function to prevent infinite recursion
-- ============================================

-- Create helper function that bypasses RLS
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

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all staff" ON staff;
DROP POLICY IF EXISTS "Staff can view their own record" ON staff;
DROP POLICY IF EXISTS "Service role can manage staff" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;
DROP POLICY IF EXISTS "Admins can insert staff" ON staff;
DROP POLICY IF EXISTS "Admins can update staff" ON staff;
DROP POLICY IF EXISTS "Admins can delete staff" ON staff;

-- Staff can view their own record (no recursion - direct check)
CREATE POLICY "Staff can view their own record"
  ON staff FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all staff records (uses helper function)
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

-- Service role can manage all staff
CREATE POLICY "Service role can manage staff"
  ON staff FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Done! No more infinite recursion!
-- ============================================

-- ============================================
-- Create Admin Account Helper Script
-- ============================================
-- This script helps you create an admin account
-- 
-- INSTRUCTIONS:
-- 1. First, create a user in Supabase Authentication dashboard
-- 2. Copy the user_id from Authentication → Users
-- 3. Replace <USER_ID> and <EMAIL> below with your values
-- 4. Run this script
-- ============================================

-- Example: Create admin account
-- Replace the values below with your actual user_id and email

INSERT INTO staff (user_id, email, role, is_active)
VALUES (
  '<USER_ID_FROM_AUTH>',  -- Replace with UUID from Authentication → Users
  '<YOUR_EMAIL>',         -- Replace with the email you used
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Verify the admin was created
SELECT id, email, role, is_active, created_at 
FROM staff 
WHERE role = 'admin';

-- ============================================
-- To create a staff account (non-admin), use:
-- ============================================
-- INSERT INTO staff (user_id, email, role, is_active)
-- VALUES (
--   '<USER_ID_FROM_AUTH>',
--   '<STAFF_EMAIL>',
--   'staff',
--   true
-- );


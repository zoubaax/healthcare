-- ============================================
-- Simple Staff CRUD - Optional Helper Functions
-- ============================================
-- These are optional. The frontend works without them.
-- They provide extra validation if you want it.
-- ============================================

-- Optional: Function to update staff (with validation)
-- Not required - frontend uses direct UPDATE
CREATE OR REPLACE FUNCTION update_staff(
  p_staff_id UUID,
  p_role TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM staff
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Validate role if provided
  IF p_role IS NOT NULL AND p_role NOT IN ('admin', 'staff') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role. Must be "admin" or "staff"'
    );
  END IF;

  -- Update staff record
  UPDATE staff
  SET 
    role = COALESCE(p_role, role),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_staff_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Staff record not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Staff updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION update_staff TO authenticated;


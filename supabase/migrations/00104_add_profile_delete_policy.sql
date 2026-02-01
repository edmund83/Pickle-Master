-- ============================================
-- Migration: Add DELETE policy for profiles table
-- Purpose: Allow owners to remove team members from their tenant
-- ============================================

-- Create a helper function to check if the current user is an owner
CREATE OR REPLACE FUNCTION is_tenant_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add DELETE policy: Owners can delete non-owner profiles in their tenant
CREATE POLICY "Owners can delete team members"
  ON profiles
  FOR DELETE
  USING (
    -- Target profile must be in the same tenant as the current user
    tenant_id = get_user_tenant_id()
    -- Target profile must NOT be an owner (can't delete owners)
    AND role != 'owner'
    -- Current user must be an owner
    AND is_tenant_owner()
    -- Can't delete yourself
    AND id != auth.uid()
  );

-- Add comment for documentation
COMMENT ON POLICY "Owners can delete team members" ON profiles IS
  'Allows tenant owners to remove non-owner team members. Cannot delete owners or self.';

COMMENT ON FUNCTION is_tenant_owner() IS
  'Helper function to check if the current authenticated user has owner role.';

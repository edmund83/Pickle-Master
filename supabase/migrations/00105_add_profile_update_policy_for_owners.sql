-- ============================================
-- Migration: Add UPDATE policy for profiles table (role changes)
-- Purpose: Allow owners to change team member roles
-- Bug Fix: Role change from Owner UI was silently failing due to missing RLS policy
-- ============================================

-- Add UPDATE policy: Owners can update non-owner profiles' role in their tenant
-- This is separate from the existing "Users can update own profile" policy
-- which only allows users to update their own profile data

DROP POLICY IF EXISTS "Owners can update team member roles" ON profiles;

CREATE POLICY "Owners can update team member roles"
  ON profiles
  FOR UPDATE
  USING (
    -- Target profile must be in the same tenant as the current user
    tenant_id = get_user_tenant_id()
    -- Target profile must NOT be an owner (can't demote owners)
    AND role != 'owner'
    -- Current user must be an owner
    AND is_tenant_owner()
    -- Can't update yourself via this policy (use "Users can update own profile" instead)
    AND id != auth.uid()
  )
  WITH CHECK (
    -- Ensure tenant_id cannot be changed
    tenant_id = get_user_tenant_id()
    -- New role must be valid (staff or viewer only - can't promote to owner)
    AND role IN ('staff', 'viewer')
    -- Current user must still be an owner after the update
    AND is_tenant_owner()
  );

-- Add comment for documentation
COMMENT ON POLICY "Owners can update team member roles" ON profiles IS
  'Allows tenant owners to change team member roles (staff/viewer). Cannot change owner roles or promote to owner.';

-- ============================================
-- Migration: Fix Orphaned Invitations
-- Purpose: Clean up invitations where user already exists as team member
--          Add trigger to auto-cleanup on profile creation
-- ============================================

-- 1. One-time cleanup: Mark orphaned invitations as accepted
-- This fixes existing invitations where the user has already joined
-- but the invitation wasn't properly marked as accepted
UPDATE team_invitations ti
SET accepted_at = NOW()
WHERE ti.accepted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.tenant_id = ti.tenant_id
      AND lower(p.email) = lower(ti.email)
  );

-- 2. Create trigger function to auto-cleanup invitations when a profile is created
-- This prevents future orphaned invitations regardless of how the profile was created
CREATE OR REPLACE FUNCTION cleanup_invitation_on_profile_create()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark any pending invitations for this email+tenant as accepted
  UPDATE team_invitations
  SET accepted_at = NOW()
  WHERE tenant_id = NEW.tenant_id
    AND lower(email) = lower(NEW.email)
    AND accepted_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_cleanup_invitation_on_profile ON profiles;

-- Create trigger that fires after a profile is inserted
CREATE TRIGGER trigger_cleanup_invitation_on_profile
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_invitation_on_profile_create();

-- 3. Add index for efficient lookup of pending invitations by email
-- This improves performance of both the cleanup query and the new trigger
CREATE INDEX IF NOT EXISTS idx_invitations_email_tenant_pending
  ON team_invitations(tenant_id, lower(email))
  WHERE accepted_at IS NULL;

-- Add comments for documentation
COMMENT ON FUNCTION cleanup_invitation_on_profile_create() IS
  'Auto-marks pending invitations as accepted when a profile is created for the same email/tenant. Prevents orphaned invitations.';

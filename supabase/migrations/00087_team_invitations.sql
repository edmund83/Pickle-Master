-- Team Invitations System
-- Enables owners to invite users to join their organization

-- ============================================================================
-- 1. CREATE TEAM INVITATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Can only invite as staff or viewer, not owner
  CONSTRAINT valid_invite_role CHECK (role IN ('staff', 'viewer'))
);

-- Add comment for documentation
COMMENT ON TABLE team_invitations IS 'Pending and accepted invitations for users to join organizations';
COMMENT ON COLUMN team_invitations.token IS 'Unique token for invitation link - expires after 7 days';
COMMENT ON COLUMN team_invitations.accepted_at IS 'When the invitation was accepted - NULL means pending';

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

-- Fast lookup by tenant for listing invitations
CREATE INDEX idx_invitations_tenant ON team_invitations(tenant_id);

-- Fast lookup by token for accepting invitations (only pending ones)
CREATE INDEX idx_invitations_token_pending ON team_invitations(token)
  WHERE accepted_at IS NULL;

-- Fast lookup by email for checking existing invitations
CREATE INDEX idx_invitations_email ON team_invitations(email);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Only owners can view invitations for their tenant
CREATE POLICY "Owner can view tenant invitations" ON team_invitations
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Only owners can create invitations
CREATE POLICY "Owner can create invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Only owners can delete/cancel invitations
CREATE POLICY "Owner can delete invitations" ON team_invitations
  FOR DELETE USING (
    tenant_id = get_user_tenant_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Only owners can update invitations (e.g., mark as accepted)
CREATE POLICY "Owner can update invitations" ON team_invitations
  FOR UPDATE USING (
    tenant_id = get_user_tenant_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- ============================================================================
-- 4. QUOTA ENFORCEMENT
-- ============================================================================

-- Check if tenant has capacity for new invitations
CREATE OR REPLACE FUNCTION check_invitation_quota()
RETURNS TRIGGER AS $$
DECLARE
  max_allowed INTEGER;
  current_users INTEGER;
  pending_invites INTEGER;
BEGIN
  -- Get tenant's max users from subscription
  SELECT max_users INTO max_allowed
  FROM tenants
  WHERE id = NEW.tenant_id;

  -- Count current team members
  SELECT COUNT(*) INTO current_users
  FROM profiles
  WHERE tenant_id = NEW.tenant_id;

  -- Count pending (not accepted, not expired) invitations
  SELECT COUNT(*) INTO pending_invites
  FROM team_invitations
  WHERE tenant_id = NEW.tenant_id
    AND accepted_at IS NULL
    AND expires_at > now()
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Check if adding this invitation would exceed quota
  IF (current_users + pending_invites + 1) > max_allowed THEN
    RAISE EXCEPTION 'Team size limit reached (% of % slots used). Upgrade your plan to invite more members.',
      current_users + pending_invites, max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check quota before inserting invitation
CREATE TRIGGER check_invitation_quota_trigger
  BEFORE INSERT ON team_invitations
  FOR EACH ROW EXECUTE FUNCTION check_invitation_quota();

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Generate a secure random token for invitations
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS VARCHAR(64) AS $$
  SELECT encode(gen_random_bytes(32), 'hex');
$$ LANGUAGE SQL;

-- Get invitation details by token (for accept-invite page)
-- This needs to be accessible without auth (for signup flow)
CREATE OR REPLACE FUNCTION get_invitation_by_token(p_token VARCHAR)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  tenant_name VARCHAR,
  email VARCHAR,
  role VARCHAR,
  invited_by_name VARCHAR,
  expires_at TIMESTAMPTZ,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.tenant_id,
    t.name as tenant_name,
    i.email,
    i.role,
    p.full_name as invited_by_name,
    i.expires_at,
    (i.accepted_at IS NULL AND i.expires_at > now()) as is_valid
  FROM team_invitations i
  JOIN tenants t ON t.id = i.tenant_id
  LEFT JOIN profiles p ON p.id = i.invited_by
  WHERE i.token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon for signup flow
GRANT EXECUTE ON FUNCTION get_invitation_by_token(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION get_invitation_by_token(VARCHAR) TO authenticated;

-- ============================================================================
-- 6. PREVENT DUPLICATE PENDING INVITATIONS
-- ============================================================================

-- Unique constraint on email per tenant for pending invitations
-- Note: Cannot use now() in index predicate (not immutable), so we check only accepted_at
-- Expiry validation is handled at the application/trigger level
CREATE UNIQUE INDEX idx_invitations_unique_pending
  ON team_invitations(tenant_id, lower(email))
  WHERE accepted_at IS NULL;

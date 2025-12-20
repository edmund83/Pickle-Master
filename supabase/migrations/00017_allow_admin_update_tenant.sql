-- ============================================
-- Migration: Allow admins to update tenant settings
-- Purpose: Enable admin users to manage feature flags and company settings
-- ============================================

-- Update the tenant update policy to include admin role
DROP POLICY IF EXISTS "Owners can update tenant" ON tenants;

CREATE POLICY "Owners and admins can update tenant" ON tenants
    FOR UPDATE USING (
        id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- Add helpful comment
COMMENT ON POLICY "Owners and admins can update tenant" ON tenants IS
    'Allows owners and admins to update tenant settings including feature flags';

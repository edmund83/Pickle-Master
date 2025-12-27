-- Migration: Custom Field Folder Associations
-- Purpose: Allow custom fields to be associated with specific folders
-- When a field has no folder associations, it shows for all items (global)
-- When a field has folder associations, it only shows for items in those folders

-- Create junction table for custom field to folder associations
CREATE TABLE IF NOT EXISTS custom_field_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_field_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_custom_field_folder UNIQUE (custom_field_id, folder_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_custom_field_folders_field ON custom_field_folders(custom_field_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_folders_folder ON custom_field_folders(folder_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_folders_tenant ON custom_field_folders(tenant_id);

-- Enable RLS
ALTER TABLE custom_field_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view custom field folder associations for their tenant
CREATE POLICY "Users can view custom field folders"
    ON custom_field_folders
    FOR SELECT
    USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Admins can manage custom field folder associations
CREATE POLICY "Admins can manage custom field folders"
    ON custom_field_folders
    FOR ALL
    USING (
        tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
        AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- Grant permissions
GRANT SELECT ON custom_field_folders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON custom_field_folders TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE custom_field_folders IS 'Junction table linking custom fields to specific folders. Fields with no associations are global (shown for all items).';
COMMENT ON COLUMN custom_field_folders.custom_field_id IS 'Reference to the custom field definition';
COMMENT ON COLUMN custom_field_folders.folder_id IS 'Reference to the folder this field applies to';
COMMENT ON COLUMN custom_field_folders.tenant_id IS 'Tenant isolation - must match both the field and folder tenant';

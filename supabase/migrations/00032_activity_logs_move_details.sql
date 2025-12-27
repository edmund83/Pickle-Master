-- ============================================
-- Migration: Activity Logs Move Details
-- Purpose: Add folder move details to get_activity_logs function return
-- ============================================

-- Update the get_activity_logs function to return folder move fields
CREATE OR REPLACE FUNCTION get_activity_logs(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_action_type TEXT DEFAULT NULL,
    p_from_date TIMESTAMPTZ DEFAULT NULL,
    p_to_date TIMESTAMPTZ DEFAULT NULL,
    p_include_archived BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_name VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id UUID,
    entity_name VARCHAR(500),
    action_type VARCHAR(50),
    changes JSONB,
    quantity_delta INTEGER,
    quantity_before INTEGER,
    quantity_after INTEGER,
    from_folder_id UUID,
    to_folder_id UUID,
    from_folder_name VARCHAR(255),
    to_folder_name VARCHAR(255),
    created_at TIMESTAMPTZ,
    is_archived BOOLEAN
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.user_id,
        al.user_name,
        al.entity_type,
        al.entity_id,
        al.entity_name,
        al.action_type,
        al.changes,
        al.quantity_delta,
        al.quantity_before,
        al.quantity_after,
        al.from_folder_id,
        al.to_folder_id,
        al.from_folder_name,
        al.to_folder_name,
        al.created_at,
        al.is_archived
    FROM all_activity_logs al
    WHERE al.tenant_id = tenant
    AND (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_entity_id IS NULL OR al.entity_id = p_entity_id)
    AND (p_action_type IS NULL OR al.action_type = p_action_type)
    AND (p_from_date IS NULL OR al.created_at >= p_from_date)
    AND (p_to_date IS NULL OR al.created_at <= p_to_date)
    AND (p_include_archived OR NOT al.is_archived)
    ORDER BY al.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

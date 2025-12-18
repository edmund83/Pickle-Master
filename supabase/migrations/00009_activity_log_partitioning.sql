-- ============================================
-- Migration: Activity Log Partitioning
-- Purpose: Enable efficient time-based queries and data lifecycle management
-- Note: This is a significant migration - run during maintenance window
-- ============================================

-- Skip partitioning for now as it requires table recreation
-- Instead, implement archival strategy with separate archive table

-- 1. Create archive table for old activity logs
CREATE TABLE IF NOT EXISTS activity_logs_archive (
    id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    user_id UUID,
    user_name VARCHAR(255),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_name VARCHAR(500),
    action_type VARCHAR(50) NOT NULL,
    changes JSONB,
    quantity_delta INTEGER,
    quantity_before INTEGER,
    quantity_after INTEGER,
    from_folder_id UUID,
    to_folder_id UUID,
    from_folder_name VARCHAR(255),
    to_folder_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for archive lookups
CREATE INDEX IF NOT EXISTS idx_activity_archive_tenant_created
ON activity_logs_archive(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_archive_created
ON activity_logs_archive(created_at);

-- 3. Function to archive old activity logs (run via cron)
CREATE OR REPLACE FUNCTION archive_old_activity_logs(
    retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

    -- Move old records to archive
    WITH moved AS (
        INSERT INTO activity_logs_archive
        SELECT *, NOW() as archived_at
        FROM activity_logs
        WHERE created_at < cutoff_date
        RETURNING 1
    )
    SELECT COUNT(*) INTO archived_count FROM moved;

    -- Delete archived records from main table
    DELETE FROM activity_logs
    WHERE created_at < cutoff_date;

    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to purge very old archives (run via cron)
CREATE OR REPLACE FUNCTION purge_old_archives(
    retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    purged_count INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

    DELETE FROM activity_logs_archive
    WHERE created_at < cutoff_date;

    GET DIAGNOSTICS purged_count = ROW_COUNT;
    RETURN purged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Unified view for querying both active and archived logs
CREATE OR REPLACE VIEW all_activity_logs AS
SELECT
    id, tenant_id, user_id, user_name,
    entity_type, entity_id, entity_name,
    action_type, changes,
    quantity_delta, quantity_before, quantity_after,
    from_folder_id, to_folder_id, from_folder_name, to_folder_name,
    ip_address, user_agent, created_at,
    FALSE as is_archived
FROM activity_logs
UNION ALL
SELECT
    id, tenant_id, user_id, user_name,
    entity_type, entity_id, entity_name,
    action_type, changes,
    quantity_delta, quantity_before, quantity_after,
    from_folder_id, to_folder_id, from_folder_name, to_folder_name,
    ip_address, user_agent, created_at,
    TRUE as is_archived
FROM activity_logs_archive;

-- 6. Function to get activity logs with pagination
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

-- 7. Function to get activity log count for pagination
CREATE OR REPLACE FUNCTION get_activity_logs_count(
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_action_type TEXT DEFAULT NULL,
    p_from_date TIMESTAMPTZ DEFAULT NULL,
    p_to_date TIMESTAMPTZ DEFAULT NULL,
    p_include_archived BOOLEAN DEFAULT FALSE
)
RETURNS BIGINT AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    total_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM all_activity_logs al
    WHERE al.tenant_id = tenant
    AND (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_entity_id IS NULL OR al.entity_id = p_entity_id)
    AND (p_action_type IS NULL OR al.action_type = p_action_type)
    AND (p_from_date IS NULL OR al.created_at >= p_from_date)
    AND (p_to_date IS NULL OR al.created_at <= p_to_date)
    AND (p_include_archived OR NOT al.is_archived);

    RETURN total_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. Improved activity logging function with better metadata
CREATE OR REPLACE FUNCTION log_activity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_name VARCHAR(500),
    p_action_type VARCHAR(50),
    p_changes JSONB DEFAULT NULL,
    p_quantity_delta INTEGER DEFAULT NULL,
    p_quantity_before INTEGER DEFAULT NULL,
    p_quantity_after INTEGER DEFAULT NULL,
    p_from_folder_id UUID DEFAULT NULL,
    p_to_folder_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    user_profile RECORD;
    new_log_id UUID;
    from_folder_name VARCHAR(255);
    to_folder_name VARCHAR(255);
BEGIN
    -- Get user profile
    SELECT id, full_name, email INTO user_profile
    FROM profiles WHERE id = auth.uid();

    -- Get folder names if applicable
    IF p_from_folder_id IS NOT NULL THEN
        SELECT name INTO from_folder_name FROM folders WHERE id = p_from_folder_id;
    END IF;

    IF p_to_folder_id IS NOT NULL THEN
        SELECT name INTO to_folder_name FROM folders WHERE id = p_to_folder_id;
    END IF;

    -- Insert activity log
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name,
        entity_type, entity_id, entity_name,
        action_type, changes,
        quantity_delta, quantity_before, quantity_after,
        from_folder_id, to_folder_id, from_folder_name, to_folder_name
    )
    VALUES (
        tenant, user_profile.id, COALESCE(user_profile.full_name, user_profile.email),
        p_entity_type, p_entity_id, p_entity_name,
        p_action_type, p_changes,
        p_quantity_delta, p_quantity_before, p_quantity_after,
        p_from_folder_id, p_to_folder_id, from_folder_name, to_folder_name
    )
    RETURNING id INTO new_log_id;

    RETURN new_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

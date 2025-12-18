-- ============================================
-- Migration: Tenant Statistics Materialized View
-- Purpose: Reduce API calls for dashboard stats
-- ============================================

-- 1. Create materialized view for tenant statistics
-- This caches expensive aggregation queries
CREATE MATERIALIZED VIEW IF NOT EXISTS tenant_stats AS
SELECT
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.subscription_tier,
    COUNT(DISTINCT i.id) FILTER (WHERE i.deleted_at IS NULL) AS total_items,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'in_stock' AND i.deleted_at IS NULL) AS in_stock_count,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'low_stock' AND i.deleted_at IS NULL) AS low_stock_count,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'out_of_stock' AND i.deleted_at IS NULL) AS out_of_stock_count,
    COUNT(DISTINCT f.id) AS folder_count,
    COUNT(DISTINCT p.id) AS team_size,
    COUNT(DISTINCT tg.id) AS tag_count,
    COUNT(DISTINCT v.id) AS vendor_count,
    COALESCE(SUM(i.quantity * i.price) FILTER (WHERE i.deleted_at IS NULL), 0)::DECIMAL(12,2) AS total_inventory_value,
    COALESCE(SUM(i.quantity) FILTER (WHERE i.deleted_at IS NULL), 0)::BIGINT AS total_quantity,
    MAX(i.updated_at) AS last_item_update,
    MAX(al.created_at) AS last_activity,
    NOW() AS refreshed_at
FROM tenants t
LEFT JOIN inventory_items i ON i.tenant_id = t.id
LEFT JOIN folders f ON f.tenant_id = t.id
LEFT JOIN profiles p ON p.tenant_id = t.id
LEFT JOIN tags tg ON tg.tenant_id = t.id
LEFT JOIN vendors v ON v.tenant_id = t.id
LEFT JOIN activity_logs al ON al.tenant_id = t.id
GROUP BY t.id, t.name, t.subscription_tier;

-- 2. Unique index for fast CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_stats_tenant_id
ON tenant_stats(tenant_id);

-- 3. Function to refresh stats for all tenants
CREATE OR REPLACE FUNCTION refresh_all_tenant_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY tenant_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to get current tenant stats (with optional force refresh)
CREATE OR REPLACE FUNCTION get_my_tenant_stats(force_refresh BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    tenant_id UUID,
    tenant_name VARCHAR(255),
    subscription_tier VARCHAR(50),
    total_items BIGINT,
    in_stock_count BIGINT,
    low_stock_count BIGINT,
    out_of_stock_count BIGINT,
    folder_count BIGINT,
    team_size BIGINT,
    tag_count BIGINT,
    vendor_count BIGINT,
    total_inventory_value DECIMAL(12,2),
    total_quantity BIGINT,
    last_item_update TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    refreshed_at TIMESTAMPTZ
) AS $$
DECLARE
    my_tenant UUID := get_user_tenant_id();
BEGIN
    -- Optional: Refresh if requested (expensive, use sparingly)
    IF force_refresh THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY tenant_stats;
    END IF;

    RETURN QUERY
    SELECT ts.*
    FROM tenant_stats ts
    WHERE ts.tenant_id = my_tenant;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. Real-time stats function (bypasses materialized view when needed)
CREATE OR REPLACE FUNCTION get_my_tenant_stats_realtime()
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_items', (
            SELECT COUNT(*) FROM inventory_items
            WHERE tenant_id = tenant AND deleted_at IS NULL
        ),
        'in_stock_count', (
            SELECT COUNT(*) FROM inventory_items
            WHERE tenant_id = tenant AND deleted_at IS NULL AND status = 'in_stock'
        ),
        'low_stock_count', (
            SELECT COUNT(*) FROM inventory_items
            WHERE tenant_id = tenant AND deleted_at IS NULL AND status = 'low_stock'
        ),
        'out_of_stock_count', (
            SELECT COUNT(*) FROM inventory_items
            WHERE tenant_id = tenant AND deleted_at IS NULL AND status = 'out_of_stock'
        ),
        'folder_count', (
            SELECT COUNT(*) FROM folders WHERE tenant_id = tenant
        ),
        'team_size', (
            SELECT COUNT(*) FROM profiles WHERE tenant_id = tenant
        ),
        'total_inventory_value', (
            SELECT COALESCE(SUM(quantity * price), 0)
            FROM inventory_items
            WHERE tenant_id = tenant AND deleted_at IS NULL
        ),
        'total_quantity', (
            SELECT COALESCE(SUM(quantity), 0)
            FROM inventory_items
            WHERE tenant_id = tenant AND deleted_at IS NULL
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Folder stats for secondary sidebar
CREATE OR REPLACE FUNCTION get_folder_stats()
RETURNS TABLE (
    folder_id UUID,
    folder_name VARCHAR(255),
    folder_color VARCHAR(7),
    item_count BIGINT,
    low_stock_count BIGINT,
    total_value DECIMAL(12,2)
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.name,
        f.color,
        COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL)::BIGINT,
        COUNT(i.id) FILTER (WHERE i.status IN ('low_stock', 'out_of_stock') AND i.deleted_at IS NULL)::BIGINT,
        COALESCE(SUM(i.quantity * i.price) FILTER (WHERE i.deleted_at IS NULL), 0)::DECIMAL(12,2)
    FROM folders f
    LEFT JOIN inventory_items i ON i.folder_id = f.id
    WHERE f.tenant_id = tenant
    GROUP BY f.id, f.name, f.color
    ORDER BY f.sort_order, f.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Status distribution for charts
CREATE OR REPLACE FUNCTION get_status_distribution()
RETURNS TABLE (
    status VARCHAR(50),
    count BIGINT,
    percentage DECIMAL(5,2)
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    total BIGINT;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total
    FROM inventory_items
    WHERE tenant_id = tenant AND deleted_at IS NULL;

    IF total = 0 THEN
        total := 1; -- Avoid division by zero
    END IF;

    RETURN QUERY
    SELECT
        i.status,
        COUNT(*)::BIGINT,
        (COUNT(*) * 100.0 / total)::DECIMAL(5,2)
    FROM inventory_items i
    WHERE i.tenant_id = tenant AND i.deleted_at IS NULL
    GROUP BY i.status
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. Recent activity summary
CREATE OR REPLACE FUNCTION get_recent_activity_summary(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    date DATE,
    action_type VARCHAR(50),
    count BIGINT
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN QUERY
    SELECT
        DATE(al.created_at),
        al.action_type,
        COUNT(*)::BIGINT
    FROM activity_logs al
    WHERE al.tenant_id = tenant
    AND al.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY DATE(al.created_at), al.action_type
    ORDER BY DATE(al.created_at) DESC, al.action_type;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 9. Subscription usage check
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS TABLE (
    resource_type TEXT,
    current_usage BIGINT,
    max_allowed INTEGER,
    is_exceeded BOOLEAN
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    tenant_record RECORD;
BEGIN
    -- Get tenant limits
    SELECT max_users, max_items INTO tenant_record
    FROM tenants WHERE id = tenant;

    -- Check users
    RETURN QUERY
    SELECT
        'users'::TEXT,
        (SELECT COUNT(*) FROM profiles WHERE tenant_id = tenant)::BIGINT,
        tenant_record.max_users,
        (SELECT COUNT(*) FROM profiles WHERE tenant_id = tenant) > tenant_record.max_users;

    -- Check items
    RETURN QUERY
    SELECT
        'items'::TEXT,
        (SELECT COUNT(*) FROM inventory_items WHERE tenant_id = tenant AND deleted_at IS NULL)::BIGINT,
        tenant_record.max_items,
        (SELECT COUNT(*) FROM inventory_items WHERE tenant_id = tenant AND deleted_at IS NULL) > tenant_record.max_items;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

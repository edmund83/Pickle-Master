-- ============================================
-- Migration: 00113_get_item_detail_full.sql
-- Purpose: Single RPC for item detail page - reduces 7-10 queries to 1
-- Performance: Eliminates multiple round-trips by fetching all data in one call
-- ============================================

-- Drop if exists for idempotency
DROP FUNCTION IF EXISTS get_item_detail_full(UUID);

-- Single RPC that returns all data needed for the item detail page
-- Note: Explicitly selects columns to avoid vector type (embedding) serialization issues
CREATE OR REPLACE FUNCTION get_item_detail_full(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_user_email TEXT;
    v_item JSON;
    v_folder JSON;
    v_tags JSON;
    v_activity_logs JSON;
    v_tenant_data RECORD;
    v_features JSON;
    v_serial_stats JSON;
    v_lot_stats JSON;
    v_tracking_mode TEXT;
    v_folder_id UUID;
    v_result JSON;
BEGIN
    -- Get current user and tenant (cached by get_user_tenant_id)
    v_user_id := auth.uid();
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('error', 'no_tenant', 'message', 'User has no tenant');
    END IF;

    -- Get user email
    SELECT email INTO v_user_email
    FROM auth.users WHERE id = v_user_id;

    -- Get item with explicit columns (avoid embedding vector column)
    SELECT json_build_object(
        'id', i.id,
        'tenant_id', i.tenant_id,
        'name', i.name,
        'description', i.description,
        'sku', i.sku,
        'barcode', i.barcode,
        'quantity', i.quantity,
        'min_quantity', i.min_quantity,
        'max_quantity', i.reorder_quantity,
        'unit', i.unit,
        'price', i.price,
        'cost_price', i.cost_price,
        'currency', i.currency,
        'status', i.status,
        'folder_id', i.folder_id,
        'location', i.location,
        'image_urls', i.image_urls,
        'notes', i.notes,
        'tracking_mode', i.tracking_mode,
        'weight', i.weight,
        'weight_unit', i.weight_unit,
        'length', i.length,
        'width', i.width,
        'height', i.height,
        'dimension_unit', i.dimension_unit,
        'display_id', i.display_id,
        'custom_fields', i.custom_fields,
        'created_at', i.created_at,
        'updated_at', i.updated_at
    ), i.tracking_mode, i.folder_id
    INTO v_item, v_tracking_mode, v_folder_id
    FROM inventory_items i
    WHERE i.id = p_item_id
      AND i.tenant_id = v_tenant_id
      AND i.deleted_at IS NULL;

    IF v_item IS NULL THEN
        RETURN json_build_object('error', 'not_found', 'message', 'Item not found');
    END IF;

    -- Get folder if exists
    IF v_folder_id IS NOT NULL THEN
        SELECT json_build_object(
            'id', f.id,
            'name', f.name,
            'color', f.color,
            'parent_id', f.parent_id,
            'item_count', f.item_count
        ) INTO v_folder
        FROM folders f
        WHERE f.id = v_folder_id;
    ELSE
        v_folder := NULL;
    END IF;

    -- Get tags via inline join
    SELECT COALESCE(json_agg(json_build_object(
        'id', t.id,
        'name', t.name,
        'color', t.color
    ) ORDER BY t.name), '[]'::json) INTO v_tags
    FROM tags t
    INNER JOIN item_tags it ON it.tag_id = t.id
    WHERE it.item_id = p_item_id;

    -- Get recent activity logs (limit 10)
    SELECT COALESCE(json_agg(json_build_object(
        'id', al.id,
        'action_type', al.action_type,
        'entity_name', al.entity_name,
        'quantity_delta', al.quantity_delta,
        'user_name', al.user_name,
        'created_at', al.created_at,
        'changes', al.changes
    ) ORDER BY al.created_at DESC), '[]'::json) INTO v_activity_logs
    FROM (
        SELECT id, action_type, entity_name, quantity_delta, user_name, created_at, changes
        FROM activity_logs
        WHERE entity_id = p_item_id
          AND entity_type = 'item'
          AND tenant_id = v_tenant_id
        ORDER BY created_at DESC
        LIMIT 10
    ) al;

    -- Get tenant settings
    SELECT subscription_tier, settings, logo_url INTO v_tenant_data
    FROM tenants
    WHERE id = v_tenant_id;

    -- Build features object
    v_features := json_build_object(
        'subscription_tier', v_tenant_data.subscription_tier,
        'settings', v_tenant_data.settings,
        'shipping_dimensions', COALESCE(
            (v_tenant_data.settings->'features_enabled'->>'shipping_dimensions')::boolean,
            false
        )
    );

    -- Get serial stats only if tracking_mode is 'serialized'
    IF v_tracking_mode = 'serialized' THEN
        SELECT json_build_object(
            'total', COUNT(*),
            'available', COUNT(*) FILTER (WHERE status = 'available'),
            'checked_out', COUNT(*) FILTER (WHERE status = 'checked_out'),
            'sold', COUNT(*) FILTER (WHERE status = 'sold'),
            'damaged', COUNT(*) FILTER (WHERE status = 'damaged'),
            'returned', COUNT(*) FILTER (WHERE status = 'returned')
        ) INTO v_serial_stats
        FROM serial_numbers
        WHERE item_id = p_item_id;
    ELSE
        v_serial_stats := NULL;
    END IF;

    -- Get lot stats only if tracking_mode is 'lot_expiry'
    IF v_tracking_mode = 'lot_expiry' THEN
        PERFORM update_expired_lots();

        SELECT json_build_object(
            'activeLots', COUNT(*) FILTER (WHERE status = 'active'),
            'totalQuantity', COALESCE(SUM(quantity) FILTER (WHERE status = 'active'), 0),
            'expiredCount', COUNT(*) FILTER (WHERE status = 'expired' OR expiry_date < CURRENT_DATE),
            'expiringSoonCount', COUNT(*) FILTER (WHERE status = 'active' AND expiry_date IS NOT NULL
                AND expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'),
            'expiringCount', COUNT(*) FILTER (WHERE status = 'active' AND expiry_date IS NOT NULL
                AND expiry_date > CURRENT_DATE + INTERVAL '7 days' AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'),
            'daysUntilNextExpiry', (
                SELECT MIN(expiry_date - CURRENT_DATE)
                FROM lots l2
                WHERE l2.item_id = p_item_id
                  AND l2.status = 'active'
                  AND l2.expiry_date IS NOT NULL
                  AND l2.expiry_date >= CURRENT_DATE
            )
        ) INTO v_lot_stats
        FROM lots
        WHERE item_id = p_item_id
          AND status != 'depleted';
    ELSE
        v_lot_stats := NULL;
    END IF;

    -- Build and return final result
    v_result := json_build_object(
        'item', v_item,
        'folder', v_folder,
        'tags', v_tags,
        'activityLogs', v_activity_logs,
        'features', v_features,
        'tenantLogo', v_tenant_data.logo_url,
        'userEmail', v_user_email,
        'userId', v_user_id,
        'serialStats', v_serial_stats,
        'lotStats', v_lot_stats
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_item_detail_full(UUID) IS
'Single RPC for item detail page. Returns item, folder, tags, activity logs, features, and tracking stats in one call.
Performance: Reduces 7-10 database round-trips to 1.
Security: Uses get_user_tenant_id() for RLS caching, SECURITY DEFINER for consistent access.';

-- Create index for activity_logs query if not exists
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_item
ON activity_logs(entity_id, entity_type, created_at DESC)
WHERE entity_type = 'item';

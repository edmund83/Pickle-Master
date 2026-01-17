-- ============================================
-- Migration: Zoe AI Context RPC Function
-- Purpose: Single RPC call to fetch all AI context
-- Impact: Reduces 7+ API calls to 1, server-side aggregation
-- ============================================

-- 1. Main function to get all context for Zoe AI in a single call
CREATE OR REPLACE FUNCTION get_zoe_context(
    p_query_keywords TEXT[] DEFAULT '{}',
    p_include_movements BOOLEAN DEFAULT FALSE,
    p_include_po BOOLEAN DEFAULT FALSE,
    p_include_pick_lists BOOLEAN DEFAULT FALSE,
    p_include_checkouts BOOLEAN DEFAULT FALSE,
    p_include_tasks BOOLEAN DEFAULT FALSE,
    p_include_team BOOLEAN DEFAULT FALSE,
    p_days_back INTEGER DEFAULT 30,
    p_item_limit INTEGER DEFAULT 25
) RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID := get_user_tenant_id();
    v_cutoff TIMESTAMPTZ := NOW() - (p_days_back || ' days')::INTERVAL;
    v_today DATE := CURRENT_DATE;
    v_result JSON;
BEGIN
    -- Return null if no tenant (unauthorized)
    IF v_tenant_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        -- Aggregates: Complete counts from entire database (fast SQL aggregation)
        'aggregates', (
            SELECT json_build_object(
                'totalItems', COUNT(*) FILTER (WHERE deleted_at IS NULL),
                'totalQuantity', COALESCE(SUM(quantity) FILTER (WHERE deleted_at IS NULL), 0),
                'totalValue', COALESCE(ROUND(SUM(quantity * COALESCE(price, 0)) FILTER (WHERE deleted_at IS NULL)::NUMERIC, 2), 0),
                'lowStockCount', COUNT(*) FILTER (WHERE status = 'low_stock' AND deleted_at IS NULL),
                'outOfStockCount', COUNT(*) FILTER (WHERE status = 'out_of_stock' AND deleted_at IS NULL),
                'inStockCount', COUNT(*) FILTER (WHERE status = 'in_stock' AND deleted_at IS NULL)
            ) FROM inventory_items WHERE tenant_id = v_tenant_id
        ),

        -- Folder breakdown: Top 10 folders by item count
        'folderCounts', (
            SELECT COALESCE(json_agg(fc ORDER BY fc.item_count DESC), '[]'::JSON)
            FROM (
                SELECT
                    COALESCE(f.name, 'Uncategorized') AS folder_name,
                    COUNT(i.id)::INT AS item_count
                FROM inventory_items i
                LEFT JOIN folders f ON f.id = i.folder_id
                WHERE i.tenant_id = v_tenant_id AND i.deleted_at IS NULL
                GROUP BY f.name
                ORDER BY COUNT(i.id) DESC
                LIMIT 10
            ) fc
        ),

        -- PO aggregates
        'poStats', (
            SELECT json_build_object(
                'totalPOs', COUNT(*),
                'pendingPOs', COUNT(*) FILTER (WHERE status IN ('draft', 'submitted', 'approved')),
                'pendingPOValue', COALESCE(ROUND(SUM(total_amount) FILTER (WHERE status IN ('draft', 'submitted', 'approved'))::NUMERIC, 2), 0)
            ) FROM purchase_orders WHERE tenant_id = v_tenant_id
        ),

        -- Pick list aggregates
        'pickListStats', (
            SELECT json_build_object(
                'totalPickLists', COUNT(*),
                'pendingPickLists', COUNT(*) FILTER (WHERE status = 'pending')
            ) FROM pick_lists WHERE tenant_id = v_tenant_id
        ),

        -- Checkout aggregates
        'checkoutStats', (
            SELECT json_build_object(
                'activeCheckouts', COUNT(*) FILTER (WHERE status = 'checked_out'),
                'overdueCheckouts', COUNT(*) FILTER (WHERE status = 'checked_out' AND due_date < v_today)
            ) FROM checkouts WHERE tenant_id = v_tenant_id
        ),

        -- Task aggregates
        'taskStats', (
            SELECT json_build_object(
                'totalTasks', COUNT(*),
                'pendingTasks', COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')),
                'overdueTasks', COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress') AND end_date < v_today)
            ) FROM jobs WHERE tenant_id = v_tenant_id
        ),

        -- Team activity count (last 30 days)
        'teamStats', (
            SELECT json_build_object(
                'activeUsersLast30Days', COUNT(DISTINCT user_id)
            ) FROM activity_logs
            WHERE tenant_id = v_tenant_id AND created_at >= v_cutoff
        ),

        -- Recent inventory items (samples)
        'recentItems', (
            SELECT COALESCE(json_agg(ri), '[]'::JSON)
            FROM (
                SELECT
                    i.id,
                    i.name,
                    i.sku,
                    i.quantity,
                    i.min_quantity,
                    i.price,
                    i.status,
                    f.name AS folder_name
                FROM inventory_items i
                LEFT JOIN folders f ON f.id = i.folder_id
                WHERE i.tenant_id = v_tenant_id AND i.deleted_at IS NULL
                ORDER BY i.updated_at DESC
                LIMIT p_item_limit
            ) ri
        ),

        -- Search results (if keywords provided)
        'searchResults', (
            CASE WHEN array_length(p_query_keywords, 1) > 0 THEN
                (SELECT COALESCE(json_agg(sr), '[]'::JSON)
                FROM (
                    SELECT
                        i.id,
                        i.name,
                        i.sku,
                        i.quantity,
                        i.status,
                        f.name AS folder_name
                    FROM inventory_items i
                    LEFT JOIN folders f ON f.id = i.folder_id
                    WHERE i.tenant_id = v_tenant_id
                      AND i.deleted_at IS NULL
                      AND (
                          i.name ILIKE '%' || p_query_keywords[1] || '%'
                          OR i.sku ILIKE '%' || p_query_keywords[1] || '%'
                      )
                    LIMIT 15
                ) sr)
            ELSE '[]'::JSON
            END
        ),

        -- Conditional: Recent movements/activity
        'movements', (
            CASE WHEN p_include_movements THEN
                (SELECT COALESCE(json_agg(m), '[]'::JSON)
                FROM (
                    SELECT
                        user_name,
                        action_type,
                        entity_type,
                        entity_name,
                        quantity_delta,
                        from_folder_name,
                        to_folder_name,
                        created_at
                    FROM activity_logs
                    WHERE tenant_id = v_tenant_id AND created_at >= v_cutoff
                    ORDER BY created_at DESC
                    LIMIT 20
                ) m)
            ELSE NULL
            END
        ),

        -- Conditional: Purchase orders
        'purchaseOrders', (
            CASE WHEN p_include_po THEN
                (SELECT COALESCE(json_agg(po), '[]'::JSON)
                FROM (
                    SELECT
                        p.order_number,
                        p.display_id,
                        v.name AS vendor_name,
                        p.status,
                        p.expected_date,
                        p.total_amount,
                        p.created_at,
                        (SELECT COUNT(*) FROM purchase_order_items poi WHERE poi.purchase_order_id = p.id)::INT AS item_count
                    FROM purchase_orders p
                    LEFT JOIN vendors v ON v.id = p.vendor_id
                    WHERE p.tenant_id = v_tenant_id AND p.created_at >= v_cutoff
                    ORDER BY p.created_at DESC
                    LIMIT 10
                ) po)
            ELSE NULL
            END
        ),

        -- Conditional: Pick lists
        'pickLists', (
            CASE WHEN p_include_pick_lists THEN
                (SELECT COALESCE(json_agg(pl), '[]'::JSON)
                FROM (
                    SELECT
                        p.name,
                        p.display_id,
                        p.status,
                        pr.full_name AS assigned_to_name,
                        p.due_date,
                        p.created_at,
                        (SELECT COUNT(*) FROM pick_list_items pli WHERE pli.pick_list_id = p.id)::INT AS item_count
                    FROM pick_lists p
                    LEFT JOIN profiles pr ON pr.id = p.assigned_to
                    WHERE p.tenant_id = v_tenant_id AND p.created_at >= v_cutoff
                    ORDER BY p.created_at DESC
                    LIMIT 10
                ) pl)
            ELSE NULL
            END
        ),

        -- Conditional: Checkouts
        'checkouts', (
            CASE WHEN p_include_checkouts THEN
                (SELECT COALESCE(json_agg(c), '[]'::JSON)
                FROM (
                    SELECT
                        i.name AS item_name,
                        c.quantity,
                        c.assignee_name,
                        c.status,
                        c.due_date,
                        c.checked_out_at
                    FROM checkouts c
                    JOIN inventory_items i ON i.id = c.item_id
                    WHERE c.tenant_id = v_tenant_id AND c.status = 'checked_out'
                    ORDER BY c.checked_out_at DESC
                    LIMIT 15
                ) c)
            ELSE NULL
            END
        ),

        -- Conditional: Tasks/Jobs
        'tasks', (
            CASE WHEN p_include_tasks THEN
                (SELECT COALESCE(json_agg(t), '[]'::JSON)
                FROM (
                    SELECT
                        j.name,
                        j.description,
                        j.status,
                        j.start_date,
                        j.end_date,
                        j.location,
                        pr.full_name AS created_by_name
                    FROM jobs j
                    LEFT JOIN profiles pr ON pr.id = j.created_by
                    WHERE j.tenant_id = v_tenant_id
                      AND j.status IN ('pending', 'in_progress', 'completed')
                    ORDER BY j.created_at DESC
                    LIMIT 10
                ) t)
            ELSE NULL
            END
        ),

        -- Conditional: Team activity breakdown
        'teamActivity', (
            CASE WHEN p_include_team THEN
                (SELECT COALESCE(json_agg(ta), '[]'::JSON)
                FROM (
                    SELECT
                        user_name,
                        COUNT(*)::INT AS action_count,
                        array_agg(DISTINCT action_type) AS recent_actions
                    FROM activity_logs
                    WHERE tenant_id = v_tenant_id
                      AND created_at >= v_cutoff
                      AND user_name IS NOT NULL
                    GROUP BY user_name
                    ORDER BY COUNT(*) DESC
                    LIMIT 10
                ) ta)
            ELSE NULL
            END
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Grant execute permission
GRANT EXECUTE ON FUNCTION get_zoe_context TO authenticated;

-- 3. Add comment for documentation
COMMENT ON FUNCTION get_zoe_context IS
'Fetches all context needed for Zoe AI assistant in a single RPC call.
Replaces 7+ individual queries with server-side aggregation.
Reduces data transfer from ~500KB to ~5KB.
Parameters:
- p_query_keywords: Search keywords extracted from user query
- p_include_*: Flags to conditionally include extended context
- p_days_back: How many days of historical data to include
- p_item_limit: Max number of recent items to return';

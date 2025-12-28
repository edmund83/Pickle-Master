-- Migration: Search optimization function
-- Provides unified search across all entity types by display_id
-- Uses trigram indexes for partial/fuzzy matching

-- ===================
-- Search by Display ID across all entity types
-- ===================
CREATE OR REPLACE FUNCTION search_by_display_id(
    p_query VARCHAR,
    p_entity_types VARCHAR[] DEFAULT ARRAY['pick_list', 'purchase_order', 'item', 'folder'],
    p_limit INTEGER DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_results JSONB := '[]'::JSONB;
    v_pick_lists JSONB;
    v_purchase_orders JSONB;
    v_items JSONB;
    v_folders JSONB;
BEGIN
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    -- Normalize query
    p_query := UPPER(TRIM(p_query));

    IF LENGTH(p_query) < 1 THEN
        RETURN json_build_object('success', true, 'results', '[]'::JSONB);
    END IF;

    -- Search pick lists
    IF 'pick_list' = ANY(p_entity_types) THEN
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB) INTO v_pick_lists
        FROM (
            SELECT
                'pick_list' as entity_type,
                id,
                display_id,
                name,
                status,
                created_at
            FROM pick_lists
            WHERE tenant_id = v_tenant_id
              AND display_id IS NOT NULL
              AND UPPER(display_id) LIKE '%' || p_query || '%'
            ORDER BY created_at DESC
            LIMIT p_limit
        ) t;

        v_results := v_results || v_pick_lists;
    END IF;

    -- Search purchase orders
    IF 'purchase_order' = ANY(p_entity_types) THEN
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB) INTO v_purchase_orders
        FROM (
            SELECT
                'purchase_order' as entity_type,
                id,
                display_id,
                order_number,
                status,
                created_at
            FROM purchase_orders
            WHERE tenant_id = v_tenant_id
              AND display_id IS NOT NULL
              AND UPPER(display_id) LIKE '%' || p_query || '%'
            ORDER BY created_at DESC
            LIMIT p_limit
        ) t;

        v_results := v_results || v_purchase_orders;
    END IF;

    -- Search inventory items
    IF 'item' = ANY(p_entity_types) THEN
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB) INTO v_items
        FROM (
            SELECT
                'item' as entity_type,
                id,
                display_id,
                name,
                sku,
                quantity,
                status,
                created_at
            FROM inventory_items
            WHERE tenant_id = v_tenant_id
              AND deleted_at IS NULL
              AND display_id IS NOT NULL
              AND UPPER(display_id) LIKE '%' || p_query || '%'
            ORDER BY created_at DESC
            LIMIT p_limit
        ) t;

        v_results := v_results || v_items;
    END IF;

    -- Search folders
    IF 'folder' = ANY(p_entity_types) THEN
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB) INTO v_folders
        FROM (
            SELECT
                'folder' as entity_type,
                id,
                display_id,
                name,
                parent_id,
                depth,
                created_at
            FROM folders
            WHERE tenant_id = v_tenant_id
              AND display_id IS NOT NULL
              AND UPPER(display_id) LIKE '%' || p_query || '%'
            ORDER BY created_at DESC
            LIMIT p_limit
        ) t;

        v_results := v_results || v_folders;
    END IF;

    RETURN json_build_object(
        'success', true,
        'query', p_query,
        'results', v_results,
        'count', jsonb_array_length(v_results)
    );
END;
$$;

COMMENT ON FUNCTION search_by_display_id IS 'Searches entities by display_id across pick_lists, purchase_orders, items, and folders. Supports partial matching.';

-- ===================
-- Get entity by exact Display ID
-- ===================
CREATE OR REPLACE FUNCTION get_entity_by_display_id(
    p_display_id VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_result JSONB;
    v_entity_type VARCHAR;
    v_prefix VARCHAR;
BEGIN
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    -- Normalize display_id
    p_display_id := UPPER(TRIM(p_display_id));

    -- Determine entity type from prefix
    v_prefix := SPLIT_PART(p_display_id, '-', 1);
    v_entity_type := CASE v_prefix
        WHEN 'PL' THEN 'pick_list'
        WHEN 'PO' THEN 'purchase_order'
        WHEN 'ITM' THEN 'item'
        WHEN 'FLD' THEN 'folder'
        ELSE NULL
    END;

    IF v_entity_type IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid display_id prefix. Expected PL-, PO-, ITM-, or FLD-'
        );
    END IF;

    -- Search based on entity type
    CASE v_entity_type
        WHEN 'pick_list' THEN
            SELECT row_to_json(t) INTO v_result
            FROM (
                SELECT
                    'pick_list' as entity_type,
                    pl.*,
                    p.full_name as assigned_to_name,
                    p.email as assigned_to_email
                FROM pick_lists pl
                LEFT JOIN profiles p ON p.id = pl.assigned_to
                WHERE pl.tenant_id = v_tenant_id
                  AND pl.display_id = p_display_id
            ) t;

        WHEN 'purchase_order' THEN
            SELECT row_to_json(t) INTO v_result
            FROM (
                SELECT
                    'purchase_order' as entity_type,
                    po.*,
                    v.name as vendor_name
                FROM purchase_orders po
                LEFT JOIN vendors v ON v.id = po.vendor_id
                WHERE po.tenant_id = v_tenant_id
                  AND po.display_id = p_display_id
            ) t;

        WHEN 'item' THEN
            SELECT row_to_json(t) INTO v_result
            FROM (
                SELECT
                    'item' as entity_type,
                    i.*,
                    f.name as folder_name
                FROM inventory_items i
                LEFT JOIN folders f ON f.id = i.folder_id
                WHERE i.tenant_id = v_tenant_id
                  AND i.display_id = p_display_id
                  AND i.deleted_at IS NULL
            ) t;

        WHEN 'folder' THEN
            SELECT row_to_json(t) INTO v_result
            FROM (
                SELECT
                    'folder' as entity_type,
                    f.*,
                    pf.name as parent_name
                FROM folders f
                LEFT JOIN folders pf ON pf.id = f.parent_id
                WHERE f.tenant_id = v_tenant_id
                  AND f.display_id = p_display_id
            ) t;
    END CASE;

    IF v_result IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Entity not found with display_id: ' || p_display_id
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'entity', v_result
    );
END;
$$;

COMMENT ON FUNCTION get_entity_by_display_id IS 'Retrieves a single entity by its exact display_id. Automatically determines entity type from prefix.';

-- ===================
-- Get tenant org code (for client-side caching)
-- ===================
CREATE OR REPLACE FUNCTION get_tenant_org_code()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_org_code VARCHAR(5);
    v_tenant_name VARCHAR;
BEGIN
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    SELECT org_code, name INTO v_org_code, v_tenant_name
    FROM tenants
    WHERE id = v_tenant_id;

    RETURN json_build_object(
        'success', true,
        'tenant_id', v_tenant_id,
        'org_code', v_org_code,
        'tenant_name', v_tenant_name
    );
END;
$$;

COMMENT ON FUNCTION get_tenant_org_code IS 'Returns the org_code for the current user''s tenant. Can be cached client-side as it is immutable.';

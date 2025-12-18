-- ============================================
-- Migration: Database Functions for API Reduction
-- Purpose: Minimize API calls with batch operations
-- ============================================

-- 1. Get complete dashboard data in single call
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS JSON AS $$
DECLARE
    result JSON;
    tenant UUID := get_user_tenant_id();
BEGIN
    SELECT json_build_object(
        'stats', (
            SELECT json_build_object(
                'total_items', COUNT(*) FILTER (WHERE deleted_at IS NULL),
                'in_stock', COUNT(*) FILTER (WHERE status = 'in_stock' AND deleted_at IS NULL),
                'low_stock', COUNT(*) FILTER (WHERE status = 'low_stock' AND deleted_at IS NULL),
                'out_of_stock', COUNT(*) FILTER (WHERE status = 'out_of_stock' AND deleted_at IS NULL),
                'total_value', COALESCE(SUM(quantity * price) FILTER (WHERE deleted_at IS NULL), 0),
                'total_quantity', COALESCE(SUM(quantity) FILTER (WHERE deleted_at IS NULL), 0)
            )
            FROM inventory_items WHERE tenant_id = tenant
        ),
        'recent_items', (
            SELECT COALESCE(json_agg(row_to_json(i)), '[]'::json)
            FROM (
                SELECT id, name, sku, quantity, status, price, updated_at
                FROM inventory_items
                WHERE tenant_id = tenant AND deleted_at IS NULL
                ORDER BY updated_at DESC
                LIMIT 5
            ) i
        ),
        'low_stock_items', (
            SELECT COALESCE(json_agg(row_to_json(i)), '[]'::json)
            FROM (
                SELECT id, name, sku, quantity, min_quantity, status
                FROM inventory_items
                WHERE tenant_id = tenant
                AND deleted_at IS NULL
                AND status IN ('low_stock', 'out_of_stock')
                ORDER BY quantity ASC
                LIMIT 10
            ) i
        ),
        'recent_activity', (
            SELECT COALESCE(json_agg(row_to_json(a)), '[]'::json)
            FROM (
                SELECT id, entity_type, entity_name, action_type, user_name, created_at
                FROM activity_logs
                WHERE tenant_id = tenant
                ORDER BY created_at DESC
                LIMIT 10
            ) a
        ),
        'folder_summary', (
            SELECT COALESCE(json_agg(row_to_json(f)), '[]'::json)
            FROM (
                SELECT
                    fl.id,
                    fl.name,
                    fl.color,
                    COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL) AS item_count,
                    COUNT(i.id) FILTER (WHERE i.status IN ('low_stock', 'out_of_stock') AND i.deleted_at IS NULL) AS alert_count
                FROM folders fl
                LEFT JOIN inventory_items i ON i.folder_id = fl.id
                WHERE fl.tenant_id = tenant
                GROUP BY fl.id, fl.name, fl.color
                ORDER BY fl.sort_order, fl.name
            ) f
        ),
        'tenant', (
            SELECT json_build_object(
                'name', name,
                'subscription_tier', subscription_tier,
                'max_items', max_items,
                'max_users', max_users
            )
            FROM tenants WHERE id = tenant
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Bulk adjust quantities (single API call for stock takes)
CREATE OR REPLACE FUNCTION bulk_adjust_quantities(
    adjustments JSONB -- Array of {item_id, delta, reason}
)
RETURNS JSON AS $$
DECLARE
    adj JSONB;
    item_id UUID;
    delta INTEGER;
    reason TEXT;
    current_qty INTEGER;
    new_qty INTEGER;
    item_name VARCHAR(500);
    results JSONB := '[]'::JSONB;
    tenant UUID := get_user_tenant_id();
    success_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    FOR adj IN SELECT * FROM jsonb_array_elements(adjustments)
    LOOP
        item_id := (adj->>'item_id')::UUID;
        delta := (adj->>'delta')::INTEGER;
        reason := adj->>'reason';

        -- Get current quantity and name
        SELECT quantity, name INTO current_qty, item_name
        FROM inventory_items
        WHERE id = item_id AND tenant_id = tenant AND deleted_at IS NULL;

        IF current_qty IS NOT NULL THEN
            new_qty := GREATEST(0, current_qty + delta);

            -- Update quantity
            UPDATE inventory_items
            SET quantity = new_qty,
                last_modified_by = auth.uid()
            WHERE id = item_id AND tenant_id = tenant;

            -- Log activity
            INSERT INTO activity_logs (
                tenant_id, user_id, entity_type, entity_id, entity_name,
                action_type, quantity_delta, quantity_before, quantity_after, changes
            )
            VALUES (
                tenant, auth.uid(), 'item', item_id, item_name,
                'adjust_quantity', delta, current_qty, new_qty,
                jsonb_build_object('reason', reason)
            );

            results := results || jsonb_build_object(
                'item_id', item_id,
                'success', true,
                'previous_qty', current_qty,
                'new_qty', new_qty
            );
            success_count := success_count + 1;
        ELSE
            results := results || jsonb_build_object(
                'item_id', item_id,
                'success', false,
                'error', 'Item not found'
            );
            error_count := error_count + 1;
        END IF;
    END LOOP;

    RETURN json_build_object(
        'success_count', success_count,
        'error_count', error_count,
        'results', results
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bulk move items between folders
CREATE OR REPLACE FUNCTION bulk_move_items(
    item_ids UUID[],
    target_folder_id UUID
)
RETURNS JSON AS $$
DECLARE
    moved_count INTEGER;
    tenant UUID := get_user_tenant_id();
    source_folders JSONB;
    target_folder_name VARCHAR(255);
BEGIN
    -- Verify target folder belongs to tenant (NULL is allowed for uncategorized)
    IF target_folder_id IS NOT NULL THEN
        SELECT name INTO target_folder_name
        FROM folders
        WHERE id = target_folder_id AND tenant_id = tenant;

        IF target_folder_name IS NULL THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Target folder not found'
            );
        END IF;
    END IF;

    -- Get source folder distribution for logging
    SELECT jsonb_agg(DISTINCT jsonb_build_object('folder_id', folder_id))
    INTO source_folders
    FROM inventory_items
    WHERE id = ANY(item_ids) AND tenant_id = tenant;

    -- Update items
    UPDATE inventory_items
    SET folder_id = target_folder_id,
        last_modified_by = auth.uid()
    WHERE id = ANY(item_ids)
    AND tenant_id = tenant
    AND deleted_at IS NULL;

    GET DIAGNOSTICS moved_count = ROW_COUNT;

    -- Log bulk move
    INSERT INTO activity_logs (tenant_id, user_id, entity_type, action_type, changes)
    VALUES (
        tenant, auth.uid(), 'item', 'move',
        jsonb_build_object(
            'item_count', moved_count,
            'target_folder_id', target_folder_id,
            'target_folder_name', target_folder_name,
            'source_folders', source_folders
        )
    );

    RETURN json_build_object(
        'success', true,
        'moved_count', moved_count,
        'target_folder', target_folder_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Bulk delete items (soft delete)
CREATE OR REPLACE FUNCTION bulk_delete_items(item_ids UUID[])
RETURNS JSON AS $$
DECLARE
    deleted_count INTEGER;
    tenant UUID := get_user_tenant_id();
BEGIN
    UPDATE inventory_items
    SET deleted_at = NOW(),
        last_modified_by = auth.uid()
    WHERE id = ANY(item_ids)
    AND tenant_id = tenant
    AND deleted_at IS NULL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Log bulk delete
    INSERT INTO activity_logs (tenant_id, user_id, entity_type, action_type, changes)
    VALUES (
        tenant, auth.uid(), 'item', 'delete',
        jsonb_build_object('item_count', deleted_count, 'item_ids', item_ids)
    );

    RETURN json_build_object(
        'success', true,
        'deleted_count', deleted_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Bulk restore items
CREATE OR REPLACE FUNCTION bulk_restore_items(item_ids UUID[])
RETURNS JSON AS $$
DECLARE
    restored_count INTEGER;
    tenant UUID := get_user_tenant_id();
BEGIN
    UPDATE inventory_items
    SET deleted_at = NULL,
        last_modified_by = auth.uid()
    WHERE id = ANY(item_ids)
    AND tenant_id = tenant
    AND deleted_at IS NOT NULL;

    GET DIAGNOSTICS restored_count = ROW_COUNT;

    -- Log bulk restore
    INSERT INTO activity_logs (tenant_id, user_id, entity_type, action_type, changes)
    VALUES (
        tenant, auth.uid(), 'item', 'restore',
        jsonb_build_object('item_count', restored_count, 'item_ids', item_ids)
    );

    RETURN json_build_object(
        'success', true,
        'restored_count', restored_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Get inventory list with pagination and filters
CREATE OR REPLACE FUNCTION get_inventory_list(
    p_folder_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'updated_at',
    p_sort_dir TEXT DEFAULT 'desc',
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    total_count BIGINT;
    items JSON;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM inventory_items i
    WHERE i.tenant_id = tenant
    AND i.deleted_at IS NULL
    AND (p_folder_id IS NULL OR i.folder_id = p_folder_id)
    AND (p_status IS NULL OR i.status = p_status)
    AND (p_search IS NULL OR i.search_vector @@ plainto_tsquery('english', p_search));

    -- Get items
    SELECT COALESCE(json_agg(row_to_json(item)), '[]'::json) INTO items
    FROM (
        SELECT
            i.id, i.name, i.sku, i.description, i.quantity, i.min_quantity,
            i.unit, i.price, i.status, i.location, i.folder_id,
            i.image_urls, i.updated_at, i.created_at,
            f.name as folder_name, f.color as folder_color
        FROM inventory_items i
        LEFT JOIN folders f ON f.id = i.folder_id
        WHERE i.tenant_id = tenant
        AND i.deleted_at IS NULL
        AND (p_folder_id IS NULL OR i.folder_id = p_folder_id)
        AND (p_status IS NULL OR i.status = p_status)
        AND (p_search IS NULL OR i.search_vector @@ plainto_tsquery('english', p_search))
        ORDER BY
            CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'asc' THEN i.name END ASC,
            CASE WHEN p_sort_by = 'name' AND p_sort_dir = 'desc' THEN i.name END DESC,
            CASE WHEN p_sort_by = 'quantity' AND p_sort_dir = 'asc' THEN i.quantity END ASC,
            CASE WHEN p_sort_by = 'quantity' AND p_sort_dir = 'desc' THEN i.quantity END DESC,
            CASE WHEN p_sort_by = 'price' AND p_sort_dir = 'asc' THEN i.price END ASC,
            CASE WHEN p_sort_by = 'price' AND p_sort_dir = 'desc' THEN i.price END DESC,
            CASE WHEN p_sort_by = 'updated_at' AND p_sort_dir = 'asc' THEN i.updated_at END ASC,
            CASE WHEN p_sort_by = 'updated_at' AND p_sort_dir = 'desc' THEN i.updated_at END DESC,
            i.updated_at DESC
        LIMIT p_limit
        OFFSET p_offset
    ) item;

    RETURN json_build_object(
        'items', items,
        'total', total_count,
        'limit', p_limit,
        'offset', p_offset,
        'has_more', (p_offset + p_limit) < total_count
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Create item with optional tags
CREATE OR REPLACE FUNCTION create_item_with_tags(
    p_item JSONB,
    p_tag_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    new_item_id UUID;
    item_name VARCHAR(500);
BEGIN
    -- Insert item
    INSERT INTO inventory_items (
        tenant_id, folder_id, name, sku, serial_number, description,
        quantity, min_quantity, unit, price, currency,
        image_urls, barcode, qr_code, location, notes, custom_fields,
        created_by, last_modified_by
    )
    VALUES (
        tenant,
        (p_item->>'folder_id')::UUID,
        p_item->>'name',
        p_item->>'sku',
        p_item->>'serial_number',
        p_item->>'description',
        COALESCE((p_item->>'quantity')::INTEGER, 0),
        COALESCE((p_item->>'min_quantity')::INTEGER, 0),
        COALESCE(p_item->>'unit', 'units'),
        COALESCE((p_item->>'price')::DECIMAL, 0),
        COALESCE(p_item->>'currency', 'MYR'),
        COALESCE((p_item->'image_urls')::TEXT[], '{}'),
        p_item->>'barcode',
        p_item->>'qr_code',
        p_item->>'location',
        p_item->>'notes',
        COALESCE(p_item->'custom_fields', '{}'::JSONB),
        auth.uid(),
        auth.uid()
    )
    RETURNING id, name INTO new_item_id, item_name;

    -- Add tags if provided
    IF p_tag_ids IS NOT NULL AND array_length(p_tag_ids, 1) > 0 THEN
        INSERT INTO item_tags (item_id, tag_id, created_by)
        SELECT new_item_id, t.id, auth.uid()
        FROM unnest(p_tag_ids) AS tid
        INNER JOIN tags t ON t.id = tid AND t.tenant_id = tenant
        ON CONFLICT DO NOTHING;
    END IF;

    -- Log creation
    INSERT INTO activity_logs (tenant_id, user_id, entity_type, entity_id, entity_name, action_type)
    VALUES (tenant, auth.uid(), 'item', new_item_id, item_name, 'create');

    RETURN json_build_object(
        'success', true,
        'item_id', new_item_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Update item with tags
CREATE OR REPLACE FUNCTION update_item_with_tags(
    p_item_id UUID,
    p_updates JSONB,
    p_tag_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    current_item RECORD;
    changes JSONB := '{}'::JSONB;
BEGIN
    -- Get current item
    SELECT * INTO current_item
    FROM inventory_items
    WHERE id = p_item_id AND tenant_id = tenant AND deleted_at IS NULL;

    IF current_item IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Build changes log
    IF p_updates ? 'name' AND p_updates->>'name' != current_item.name THEN
        changes := changes || jsonb_build_object('name', jsonb_build_object('old', current_item.name, 'new', p_updates->>'name'));
    END IF;
    IF p_updates ? 'quantity' AND (p_updates->>'quantity')::INTEGER != current_item.quantity THEN
        changes := changes || jsonb_build_object('quantity', jsonb_build_object('old', current_item.quantity, 'new', (p_updates->>'quantity')::INTEGER));
    END IF;

    -- Update item
    UPDATE inventory_items
    SET
        name = COALESCE(p_updates->>'name', name),
        sku = COALESCE(p_updates->>'sku', sku),
        description = COALESCE(p_updates->>'description', description),
        quantity = COALESCE((p_updates->>'quantity')::INTEGER, quantity),
        min_quantity = COALESCE((p_updates->>'min_quantity')::INTEGER, min_quantity),
        unit = COALESCE(p_updates->>'unit', unit),
        price = COALESCE((p_updates->>'price')::DECIMAL, price),
        location = COALESCE(p_updates->>'location', location),
        notes = COALESCE(p_updates->>'notes', notes),
        folder_id = COALESCE((p_updates->>'folder_id')::UUID, folder_id),
        last_modified_by = auth.uid()
    WHERE id = p_item_id AND tenant_id = tenant;

    -- Update tags if provided
    IF p_tag_ids IS NOT NULL THEN
        -- Remove existing tags
        DELETE FROM item_tags WHERE item_id = p_item_id;

        -- Add new tags
        IF array_length(p_tag_ids, 1) > 0 THEN
            INSERT INTO item_tags (item_id, tag_id, created_by)
            SELECT p_item_id, t.id, auth.uid()
            FROM unnest(p_tag_ids) AS tid
            INNER JOIN tags t ON t.id = tid AND t.tenant_id = tenant
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- Log update
    INSERT INTO activity_logs (tenant_id, user_id, entity_type, entity_id, entity_name, action_type, changes)
    VALUES (tenant, auth.uid(), 'item', p_item_id, current_item.name, 'update', changes);

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Get item details with related data
CREATE OR REPLACE FUNCTION get_item_details(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    result JSON;
BEGIN
    SELECT json_build_object(
        'item', (
            SELECT row_to_json(i)
            FROM (
                SELECT
                    inv.*,
                    f.name as folder_name,
                    f.color as folder_color,
                    cp.full_name as created_by_name,
                    mp.full_name as modified_by_name
                FROM inventory_items inv
                LEFT JOIN folders f ON f.id = inv.folder_id
                LEFT JOIN profiles cp ON cp.id = inv.created_by
                LEFT JOIN profiles mp ON mp.id = inv.last_modified_by
                WHERE inv.id = p_item_id AND inv.tenant_id = tenant AND inv.deleted_at IS NULL
            ) i
        ),
        'tags', (
            SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
            FROM (
                SELECT tg.id, tg.name, tg.color
                FROM item_tags it
                INNER JOIN tags tg ON tg.id = it.tag_id
                WHERE it.item_id = p_item_id
                ORDER BY tg.name
            ) t
        ),
        'recent_activity', (
            SELECT COALESCE(json_agg(row_to_json(a)), '[]'::json)
            FROM (
                SELECT id, action_type, user_name, changes, quantity_delta, created_at
                FROM activity_logs
                WHERE entity_id = p_item_id AND entity_type = 'item'
                ORDER BY created_at DESC
                LIMIT 10
            ) a
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 10. Export inventory data
CREATE OR REPLACE FUNCTION export_inventory_data(
    p_folder_id UUID DEFAULT NULL,
    p_format TEXT DEFAULT 'json'
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Log export
    INSERT INTO activity_logs (tenant_id, user_id, entity_type, action_type, changes)
    VALUES (tenant, auth.uid(), 'item', 'export', jsonb_build_object('folder_id', p_folder_id, 'format', p_format));

    RETURN (
        SELECT json_agg(row_to_json(i))
        FROM (
            SELECT
                name, sku, description, quantity, min_quantity, unit,
                price, currency, status, location,
                f.name as folder_name,
                created_at, updated_at
            FROM inventory_items inv
            LEFT JOIN folders f ON f.id = inv.folder_id
            WHERE inv.tenant_id = tenant
            AND inv.deleted_at IS NULL
            AND (p_folder_id IS NULL OR inv.folder_id = p_folder_id)
            ORDER BY inv.name
        ) i
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

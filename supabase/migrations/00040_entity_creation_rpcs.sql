-- Migration: Entity creation RPC functions
-- These functions provide atomic entity creation with auto-generated display_ids
-- All operations are wrapped in transactions to ensure data consistency

-- ===================
-- Create Pick List with Auto Display ID
-- ===================
CREATE OR REPLACE FUNCTION create_pick_list_v2(
    p_name VARCHAR DEFAULT NULL,
    p_assigned_to UUID DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_item_outcome VARCHAR DEFAULT 'decrement',
    p_ship_to_name VARCHAR DEFAULT NULL,
    p_ship_to_address1 VARCHAR DEFAULT NULL,
    p_ship_to_address2 VARCHAR DEFAULT NULL,
    p_ship_to_city VARCHAR DEFAULT NULL,
    p_ship_to_state VARCHAR DEFAULT NULL,
    p_ship_to_postal_code VARCHAR DEFAULT NULL,
    p_ship_to_country VARCHAR DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_display_id VARCHAR(20);
    v_pick_list_id UUID;
    v_item RECORD;
    v_items_added INTEGER := 0;
BEGIN
    -- Get tenant and user IDs
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    -- Generate display ID (atomic)
    v_display_id := generate_display_id(v_tenant_id, 'pick_list');

    -- Create pick list
    INSERT INTO pick_lists (
        tenant_id,
        display_id,
        pick_list_number,
        name,
        assigned_to,
        assigned_at,
        due_date,
        notes,
        item_outcome,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        status,
        created_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        v_display_id, -- Also set pick_list_number for backward compatibility
        COALESCE(p_name, v_display_id),
        p_assigned_to,
        CASE WHEN p_assigned_to IS NOT NULL THEN NOW() ELSE NULL END,
        p_due_date,
        p_notes,
        p_item_outcome,
        p_ship_to_name,
        p_ship_to_address1,
        p_ship_to_address2,
        p_ship_to_city,
        p_ship_to_state,
        p_ship_to_postal_code,
        p_ship_to_country,
        'draft',
        v_user_id
    ) RETURNING id INTO v_pick_list_id;

    -- Add items if provided
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id UUID, requested_quantity INTEGER)
    LOOP
        INSERT INTO pick_list_items (pick_list_id, item_id, requested_quantity)
        VALUES (v_pick_list_id, v_item.item_id, COALESCE(v_item.requested_quantity, 1));
        v_items_added := v_items_added + 1;
    END LOOP;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        entity_name,
        action_type
    ) VALUES (
        v_tenant_id,
        v_user_id,
        'pick_list',
        v_pick_list_id,
        v_display_id,
        'create'
    );

    RETURN json_build_object(
        'success', true,
        'pick_list_id', v_pick_list_id,
        'display_id', v_display_id,
        'items_added', v_items_added
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION create_pick_list_v2 IS 'Creates a pick list with auto-generated display_id in format PL-ORGCODE-00000';

-- ===================
-- Create Purchase Order with Auto Display ID
-- ===================
CREATE OR REPLACE FUNCTION create_purchase_order_v2(
    p_vendor_id UUID DEFAULT NULL,
    p_expected_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_currency VARCHAR DEFAULT 'MYR',
    p_ship_to_name VARCHAR DEFAULT NULL,
    p_ship_to_address1 VARCHAR DEFAULT NULL,
    p_ship_to_address2 VARCHAR DEFAULT NULL,
    p_ship_to_city VARCHAR DEFAULT NULL,
    p_ship_to_state VARCHAR DEFAULT NULL,
    p_ship_to_postal_code VARCHAR DEFAULT NULL,
    p_ship_to_country VARCHAR DEFAULT NULL,
    p_bill_to_name VARCHAR DEFAULT NULL,
    p_bill_to_address1 VARCHAR DEFAULT NULL,
    p_bill_to_address2 VARCHAR DEFAULT NULL,
    p_bill_to_city VARCHAR DEFAULT NULL,
    p_bill_to_state VARCHAR DEFAULT NULL,
    p_bill_to_postal_code VARCHAR DEFAULT NULL,
    p_bill_to_country VARCHAR DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_display_id VARCHAR(20);
    v_po_id UUID;
    v_item RECORD;
    v_items_added INTEGER := 0;
    v_subtotal DECIMAL(12,2) := 0;
BEGIN
    -- Get tenant and user IDs
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    -- Generate display ID (atomic)
    v_display_id := generate_display_id(v_tenant_id, 'purchase_order');

    -- Create purchase order
    INSERT INTO purchase_orders (
        tenant_id,
        display_id,
        order_number,
        vendor_id,
        expected_date,
        notes,
        currency,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        bill_to_name,
        bill_to_address1,
        bill_to_address2,
        bill_to_city,
        bill_to_state,
        bill_to_postal_code,
        bill_to_country,
        status,
        subtotal,
        tax,
        shipping,
        total_amount,
        created_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        v_display_id, -- Also set order_number for backward compatibility
        p_vendor_id,
        p_expected_date,
        p_notes,
        p_currency,
        p_ship_to_name,
        p_ship_to_address1,
        p_ship_to_address2,
        p_ship_to_city,
        p_ship_to_state,
        p_ship_to_postal_code,
        p_ship_to_country,
        p_bill_to_name,
        p_bill_to_address1,
        p_bill_to_address2,
        p_bill_to_city,
        p_bill_to_state,
        p_bill_to_postal_code,
        p_bill_to_country,
        'draft',
        0,
        0,
        0,
        0,
        v_user_id
    ) RETURNING id INTO v_po_id;

    -- Add items if provided
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items)
        AS x(item_id UUID, item_name VARCHAR, sku VARCHAR, ordered_quantity INTEGER, unit_price DECIMAL)
    LOOP
        INSERT INTO purchase_order_items (
            purchase_order_id,
            item_id,
            item_name,
            sku,
            ordered_quantity,
            unit_price,
            received_quantity
        ) VALUES (
            v_po_id,
            v_item.item_id,
            v_item.item_name,
            v_item.sku,
            COALESCE(v_item.ordered_quantity, 1),
            COALESCE(v_item.unit_price, 0),
            0
        );
        v_items_added := v_items_added + 1;
        v_subtotal := v_subtotal + (COALESCE(v_item.ordered_quantity, 1) * COALESCE(v_item.unit_price, 0));
    END LOOP;

    -- Update totals
    IF v_items_added > 0 THEN
        UPDATE purchase_orders
        SET subtotal = v_subtotal,
            total_amount = v_subtotal
        WHERE id = v_po_id;
    END IF;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        entity_name,
        action_type
    ) VALUES (
        v_tenant_id,
        v_user_id,
        'purchase_order',
        v_po_id,
        v_display_id,
        'create'
    );

    RETURN json_build_object(
        'success', true,
        'purchase_order_id', v_po_id,
        'display_id', v_display_id,
        'items_added', v_items_added
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION create_purchase_order_v2 IS 'Creates a purchase order with auto-generated display_id in format PO-ORGCODE-00000';

-- ===================
-- Create Inventory Item with Auto Display ID
-- ===================
CREATE OR REPLACE FUNCTION create_inventory_item_v2(
    p_name VARCHAR,
    p_folder_id UUID DEFAULT NULL,
    p_sku VARCHAR DEFAULT NULL,
    p_serial_number VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_quantity INTEGER DEFAULT 0,
    p_min_quantity INTEGER DEFAULT 0,
    p_unit VARCHAR DEFAULT 'units',
    p_price DECIMAL DEFAULT 0,
    p_cost_price DECIMAL DEFAULT NULL,
    p_currency VARCHAR DEFAULT 'MYR',
    p_barcode VARCHAR DEFAULT NULL,
    p_tags TEXT[] DEFAULT '{}',
    p_image_urls TEXT[] DEFAULT '{}',
    p_custom_fields JSONB DEFAULT '{}'::JSONB,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_display_id VARCHAR(20);
    v_item_id UUID;
    v_status VARCHAR(50);
BEGIN
    -- Get tenant and user IDs
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    -- Generate display ID (atomic)
    v_display_id := generate_display_id(v_tenant_id, 'item');

    -- Calculate status
    v_status := CASE
        WHEN p_quantity <= 0 THEN 'out_of_stock'
        WHEN p_quantity <= p_min_quantity THEN 'low_stock'
        ELSE 'in_stock'
    END;

    -- Create inventory item
    INSERT INTO inventory_items (
        tenant_id,
        display_id,
        folder_id,
        name,
        sku,
        serial_number,
        description,
        quantity,
        min_quantity,
        unit,
        price,
        cost_price,
        currency,
        barcode,
        tags,
        image_urls,
        custom_fields,
        notes,
        status,
        created_by,
        last_modified_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        p_folder_id,
        p_name,
        p_sku,
        p_serial_number,
        p_description,
        p_quantity,
        p_min_quantity,
        p_unit,
        p_price,
        p_cost_price,
        p_currency,
        p_barcode,
        p_tags,
        p_image_urls,
        p_custom_fields,
        p_notes,
        v_status,
        v_user_id,
        v_user_id
    ) RETURNING id INTO v_item_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        entity_name,
        action_type
    ) VALUES (
        v_tenant_id,
        v_user_id,
        'item',
        v_item_id,
        v_display_id,
        'create'
    );

    RETURN json_build_object(
        'success', true,
        'item_id', v_item_id,
        'display_id', v_display_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION create_inventory_item_v2 IS 'Creates an inventory item with auto-generated display_id in format ITM-ORGCODE-00000';

-- ===================
-- Create Folder with Auto Display ID
-- ===================
CREATE OR REPLACE FUNCTION create_folder_v2(
    p_name VARCHAR,
    p_parent_id UUID DEFAULT NULL,
    p_color VARCHAR DEFAULT '#4f46e5',
    p_icon VARCHAR DEFAULT 'folder'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_display_id VARCHAR(20);
    v_folder_id UUID;
    v_parent_path TEXT[];
    v_parent_depth INTEGER;
    v_new_path TEXT[];
    v_new_depth INTEGER;
    v_sort_order INTEGER;
BEGIN
    -- Get tenant and user IDs
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    -- Generate display ID (atomic)
    v_display_id := generate_display_id(v_tenant_id, 'folder');

    -- Get parent path and depth if parent exists
    IF p_parent_id IS NOT NULL THEN
        SELECT path, depth INTO v_parent_path, v_parent_depth
        FROM folders
        WHERE id = p_parent_id AND tenant_id = v_tenant_id;

        IF v_parent_path IS NULL THEN
            v_parent_path := ARRAY[]::TEXT[];
            v_parent_depth := 0;
        END IF;
    ELSE
        v_parent_path := ARRAY[]::TEXT[];
        v_parent_depth := -1;
    END IF;

    -- Calculate new path and depth
    v_new_depth := v_parent_depth + 1;

    -- Calculate sort order
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_sort_order
    FROM folders
    WHERE tenant_id = v_tenant_id
      AND parent_id IS NOT DISTINCT FROM p_parent_id;

    -- Generate folder ID first
    v_folder_id := uuid_generate_v4();

    -- Calculate path including new folder ID
    IF p_parent_id IS NOT NULL THEN
        v_new_path := v_parent_path || p_parent_id::TEXT;
    ELSE
        v_new_path := ARRAY[]::TEXT[];
    END IF;

    -- Create folder
    INSERT INTO folders (
        id,
        tenant_id,
        display_id,
        name,
        parent_id,
        color,
        icon,
        path,
        depth,
        sort_order,
        created_by
    ) VALUES (
        v_folder_id,
        v_tenant_id,
        v_display_id,
        p_name,
        p_parent_id,
        p_color,
        p_icon,
        v_new_path,
        v_new_depth,
        v_sort_order,
        v_user_id
    );

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        entity_name,
        action_type
    ) VALUES (
        v_tenant_id,
        v_user_id,
        'folder',
        v_folder_id,
        v_display_id,
        'create'
    );

    RETURN json_build_object(
        'success', true,
        'folder_id', v_folder_id,
        'display_id', v_display_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION create_folder_v2 IS 'Creates a folder with auto-generated display_id in format FLD-ORGCODE-00000';

-- ===================
-- Batch Create Items with Auto Display IDs
-- ===================
CREATE OR REPLACE FUNCTION batch_create_items(
    p_items JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_item JSONB;
    v_display_id VARCHAR(20);
    v_item_id UUID;
    v_results JSONB := '[]'::JSONB;
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
BEGIN
    -- Get tenant and user IDs
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        BEGIN
            -- Generate display ID
            v_display_id := generate_display_id(v_tenant_id, 'item');

            -- Insert item
            INSERT INTO inventory_items (
                tenant_id,
                display_id,
                name,
                sku,
                description,
                quantity,
                min_quantity,
                unit,
                price,
                folder_id,
                created_by,
                last_modified_by
            ) VALUES (
                v_tenant_id,
                v_display_id,
                v_item->>'name',
                v_item->>'sku',
                v_item->>'description',
                COALESCE((v_item->>'quantity')::INTEGER, 0),
                COALESCE((v_item->>'min_quantity')::INTEGER, 0),
                COALESCE(v_item->>'unit', 'units'),
                COALESCE((v_item->>'price')::DECIMAL, 0),
                (v_item->>'folder_id')::UUID,
                v_user_id,
                v_user_id
            ) RETURNING id INTO v_item_id;

            v_results := v_results || jsonb_build_object(
                'success', true,
                'item_id', v_item_id,
                'display_id', v_display_id,
                'name', v_item->>'name'
            );
            v_success_count := v_success_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                v_results := v_results || jsonb_build_object(
                    'success', false,
                    'name', v_item->>'name',
                    'error', SQLERRM
                );
                v_error_count := v_error_count + 1;
        END;
    END LOOP;

    RETURN json_build_object(
        'success', v_error_count = 0,
        'created_count', v_success_count,
        'error_count', v_error_count,
        'items', v_results
    );
END;
$$;

COMMENT ON FUNCTION batch_create_items IS 'Creates multiple inventory items in a single transaction with auto-generated display_ids';

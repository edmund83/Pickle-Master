-- ============================================
-- Migration: 00054_fix_pick_list_item_outcome_cast.sql
-- Purpose: Fix VARCHAR to enum cast for item_outcome in create_pick_list_v2
-- ============================================

-- Update create_pick_list_v2 to properly cast item_outcome VARCHAR to enum
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

    -- Create pick list (cast VARCHAR to enum)
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
        v_display_id,
        COALESCE(p_name, v_display_id),
        p_assigned_to,
        CASE WHEN p_assigned_to IS NOT NULL THEN NOW() ELSE NULL END,
        p_due_date,
        p_notes,
        p_item_outcome::pick_list_item_outcome,  -- Cast to enum type
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
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION create_pick_list_v2 IS 'Creates a pick list with auto-generated display_id in format PL-ORGCODE-00000';

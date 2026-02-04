-- ============================================
-- Migration: 00122_tracking_allocation_validation.sql
-- Purpose: Add quantity and status validation to allocation RPC functions
-- - Prevent over-allocation of lots (allocated quantity <= available quantity)
-- - Prevent allocation of unavailable serials (only status='available' allowed)
-- ============================================

-- ============================================================================
-- 1. allocate_pick_list_item_lots (updated with quantity validation)
-- ============================================================================

CREATE OR REPLACE FUNCTION allocate_pick_list_item_lots(
    p_pick_list_item_id UUID,
    p_allocations JSONB  -- Array of {lot_id: UUID, quantity: INTEGER}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_item_id UUID;
    v_alloc JSONB;
    v_lot_id UUID;
    v_quantity INTEGER;
    v_available_quantity INTEGER;
    v_total_allocated INTEGER := 0;
    v_requested INTEGER;
BEGIN
    -- Get tenant_id from user profile (wrapped for planner optimization)
    v_tenant_id := (SELECT get_user_tenant_id());

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no tenant');
    END IF;

    -- Verify pick list item exists and belongs to tenant
    SELECT pli.item_id, pli.requested_quantity
    INTO v_item_id, v_requested
    FROM pick_list_items pli
    JOIN pick_lists pl ON pl.id = pli.pick_list_id
    WHERE pli.id = p_pick_list_item_id
    AND pl.tenant_id = v_tenant_id;

    IF v_item_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pick list item not found or access denied');
    END IF;

    -- Clear existing lot allocations for this pick list item
    DELETE FROM pick_list_item_lots
    WHERE pick_list_item_id = p_pick_list_item_id
    AND tenant_id = v_tenant_id;

    -- Insert new allocations
    IF p_allocations IS NOT NULL AND jsonb_array_length(p_allocations) > 0 THEN
        FOR v_alloc IN SELECT * FROM jsonb_array_elements(p_allocations)
        LOOP
            v_lot_id := (v_alloc->>'lot_id')::UUID;
            v_quantity := (v_alloc->>'quantity')::INTEGER;

            -- Validate lot belongs to the same item and tenant, and get available quantity
            SELECT quantity
            INTO v_available_quantity
            FROM lots
            WHERE id = v_lot_id
            AND item_id = v_item_id
            AND tenant_id = v_tenant_id
            AND status = 'active';

            IF v_available_quantity IS NULL THEN
                RAISE EXCEPTION 'Lot % does not belong to item, tenant, or is not active', v_lot_id;
            END IF;

            -- Validate allocation quantity does not exceed available quantity
            IF v_quantity > v_available_quantity THEN
                RAISE EXCEPTION 'Cannot allocate % from lot %. Only % available.', v_quantity, v_lot_id, v_available_quantity;
            END IF;

            -- Insert allocation
            INSERT INTO pick_list_item_lots (
                pick_list_item_id,
                lot_id,
                quantity,
                tenant_id,
                created_by
            ) VALUES (
                p_pick_list_item_id,
                v_lot_id,
                v_quantity,
                v_tenant_id,
                auth.uid()
            );

            v_total_allocated := v_total_allocated + v_quantity;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'total_allocated', v_total_allocated,
        'requested', v_requested
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- 2. allocate_pick_list_item_serials (updated with status validation)
-- ============================================================================

CREATE OR REPLACE FUNCTION allocate_pick_list_item_serials(
    p_pick_list_item_id UUID,
    p_serial_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_item_id UUID;
    v_requested INTEGER;
    v_serial_id UUID;
    v_serial_status TEXT;
    v_total_allocated INTEGER := 0;
BEGIN
    -- Get tenant_id from user profile (wrapped for planner optimization)
    v_tenant_id := (SELECT get_user_tenant_id());

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no tenant');
    END IF;

    -- Verify pick list item exists and belongs to tenant
    SELECT pli.item_id, pli.requested_quantity
    INTO v_item_id, v_requested
    FROM pick_list_items pli
    JOIN pick_lists pl ON pl.id = pli.pick_list_id
    WHERE pli.id = p_pick_list_item_id
    AND pl.tenant_id = v_tenant_id;

    IF v_item_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pick list item not found or access denied');
    END IF;

    -- Clear existing serial allocations for this pick list item
    DELETE FROM pick_list_item_serials
    WHERE pick_list_item_id = p_pick_list_item_id
    AND tenant_id = v_tenant_id;

    -- Insert new allocations
    IF p_serial_ids IS NOT NULL AND array_length(p_serial_ids, 1) > 0 THEN
        FOREACH v_serial_id IN ARRAY p_serial_ids
        LOOP
            -- Validate serial belongs to the same item and tenant, and check status
            SELECT status
            INTO v_serial_status
            FROM serial_numbers
            WHERE id = v_serial_id
            AND item_id = v_item_id
            AND tenant_id = v_tenant_id;

            IF v_serial_status IS NULL THEN
                RAISE EXCEPTION 'Serial % does not belong to item or tenant', v_serial_id;
            END IF;

            -- Validate serial is available (not sold, checked_out, etc.)
            IF v_serial_status != 'available' THEN
                RAISE EXCEPTION 'Serial % is not available (current status: %)', v_serial_id, v_serial_status;
            END IF;

            -- Insert allocation
            INSERT INTO pick_list_item_serials (
                pick_list_item_id,
                serial_id,
                tenant_id,
                created_by
            ) VALUES (
                p_pick_list_item_id,
                v_serial_id,
                v_tenant_id,
                auth.uid()
            );

            v_total_allocated := v_total_allocated + 1;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'total_allocated', v_total_allocated,
        'requested', v_requested
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- COMMENTS (updated)
-- ============================================================================

COMMENT ON FUNCTION allocate_pick_list_item_lots IS 'Allocates lots to a pick list item. Validates lot belongs to item/tenant, is active, and has sufficient quantity. Clears existing and inserts new allocations.';
COMMENT ON FUNCTION allocate_pick_list_item_serials IS 'Allocates serial numbers to a pick list item. Validates serial belongs to item/tenant and has status=available. Clears existing and inserts new allocations.';

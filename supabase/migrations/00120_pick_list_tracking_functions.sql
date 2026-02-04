-- ============================================
-- Migration: 00120_pick_list_tracking_functions.sql
-- Purpose: RPC functions for managing lot/serial allocations on pick list items
-- ============================================

-- ============================================================================
-- 1. allocate_pick_list_item_lots
-- Allocates lots to a pick list item. Clears existing and inserts new allocations.
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

            -- Validate lot belongs to the same item and tenant
            IF NOT EXISTS (
                SELECT 1 FROM lots
                WHERE id = v_lot_id
                AND item_id = v_item_id
                AND tenant_id = v_tenant_id
            ) THEN
                -- Rollback and return error
                RAISE EXCEPTION 'Lot % does not belong to item or tenant', v_lot_id;
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
-- 2. allocate_pick_list_item_serials
-- Allocates serial numbers to a pick list item. Clears existing and inserts new.
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
            -- Validate serial belongs to the same item and tenant
            IF NOT EXISTS (
                SELECT 1 FROM serial_numbers
                WHERE id = v_serial_id
                AND item_id = v_item_id
                AND tenant_id = v_tenant_id
            ) THEN
                RAISE EXCEPTION 'Serial % does not belong to item or tenant', v_serial_id;
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
-- 3. get_pick_list_item_tracking
-- Returns allocated lots and serials for a pick list item
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pick_list_item_tracking(
    p_pick_list_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_item_id UUID;
    v_lots JSONB;
    v_serials JSONB;
BEGIN
    -- Get tenant_id from user profile (wrapped for planner optimization)
    v_tenant_id := (SELECT get_user_tenant_id());

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no tenant');
    END IF;

    -- Verify pick list item exists and belongs to tenant
    SELECT pli.item_id
    INTO v_item_id
    FROM pick_list_items pli
    JOIN pick_lists pl ON pl.id = pli.pick_list_id
    WHERE pli.id = p_pick_list_item_id
    AND pl.tenant_id = v_tenant_id;

    IF v_item_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pick list item not found or access denied');
    END IF;

    -- Get allocated lots with details
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', plil.id,
            'lot_id', plil.lot_id,
            'lot_number', l.lot_number,
            'batch_code', l.batch_code,
            'expiry_date', l.expiry_date,
            'quantity', plil.quantity,
            'available', l.quantity
        ) ORDER BY l.expiry_date ASC NULLS LAST
    ), '[]'::jsonb)
    INTO v_lots
    FROM pick_list_item_lots plil
    JOIN lots l ON l.id = plil.lot_id
    WHERE plil.pick_list_item_id = p_pick_list_item_id
    AND plil.tenant_id = v_tenant_id;

    -- Get allocated serials with details
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', plis.id,
            'serial_id', plis.serial_id,
            'serial_number', s.serial_number,
            'status', s.status
        ) ORDER BY s.serial_number ASC
    ), '[]'::jsonb)
    INTO v_serials
    FROM pick_list_item_serials plis
    JOIN serial_numbers s ON s.id = plis.serial_id
    WHERE plis.pick_list_item_id = p_pick_list_item_id
    AND plis.tenant_id = v_tenant_id;

    RETURN jsonb_build_object(
        'success', true,
        'lots', v_lots,
        'serials', v_serials
    );
END;
$$;

-- ============================================================================
-- 4. auto_allocate_lots_fefo
-- Auto-assigns lots using First-Expired-First-Out (earliest expiry first)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_allocate_lots_fefo(
    p_pick_list_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_item_id UUID;
    v_requested_quantity INTEGER;
    v_remaining INTEGER;
    v_lot RECORD;
    v_alloc_qty INTEGER;
    v_allocations JSONB := '[]'::jsonb;
BEGIN
    -- Get tenant_id from user profile (wrapped for planner optimization)
    v_tenant_id := (SELECT get_user_tenant_id());

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no tenant');
    END IF;

    -- Get pick list item details
    SELECT pli.item_id, pli.requested_quantity
    INTO v_item_id, v_requested_quantity
    FROM pick_list_items pli
    JOIN pick_lists pl ON pl.id = pli.pick_list_id
    WHERE pli.id = p_pick_list_item_id
    AND pl.tenant_id = v_tenant_id;

    IF v_item_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pick list item not found or access denied');
    END IF;

    v_remaining := v_requested_quantity;

    -- Loop through lots in FEFO order (earliest expiry first, then oldest received)
    FOR v_lot IN
        SELECT id, quantity
        FROM lots
        WHERE item_id = v_item_id
        AND tenant_id = v_tenant_id
        AND status = 'active'
        AND quantity > 0
        ORDER BY expiry_date ASC NULLS LAST, received_at ASC, created_at ASC
    LOOP
        EXIT WHEN v_remaining <= 0;

        -- Calculate allocation quantity
        v_alloc_qty := LEAST(v_lot.quantity, v_remaining);

        -- Add to allocations array
        v_allocations := v_allocations || jsonb_build_object(
            'lot_id', v_lot.id,
            'quantity', v_alloc_qty
        );

        v_remaining := v_remaining - v_alloc_qty;
    END LOOP;

    -- If no lots available
    IF jsonb_array_length(v_allocations) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No available lots found for this item'
        );
    END IF;

    -- Call allocate_pick_list_item_lots with the computed allocations
    RETURN allocate_pick_list_item_lots(p_pick_list_item_id, v_allocations);
END;
$$;

-- ============================================================================
-- 5. auto_allocate_serials_fifo
-- Auto-assigns serials using First-In-First-Out (oldest created first)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_allocate_serials_fifo(
    p_pick_list_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_item_id UUID;
    v_requested_quantity INTEGER;
    v_serial_ids UUID[];
BEGIN
    -- Get tenant_id from user profile (wrapped for planner optimization)
    v_tenant_id := (SELECT get_user_tenant_id());

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no tenant');
    END IF;

    -- Get pick list item details
    SELECT pli.item_id, pli.requested_quantity
    INTO v_item_id, v_requested_quantity
    FROM pick_list_items pli
    JOIN pick_lists pl ON pl.id = pli.pick_list_id
    WHERE pli.id = p_pick_list_item_id
    AND pl.tenant_id = v_tenant_id;

    IF v_item_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pick list item not found or access denied');
    END IF;

    -- Select available serials in FIFO order (oldest created first)
    SELECT ARRAY_AGG(id ORDER BY created_at ASC)
    INTO v_serial_ids
    FROM (
        SELECT id, created_at
        FROM serial_numbers
        WHERE item_id = v_item_id
        AND tenant_id = v_tenant_id
        AND status = 'available'
        ORDER BY created_at ASC
        LIMIT v_requested_quantity
    ) sub;

    -- If no serials available
    IF v_serial_ids IS NULL OR array_length(v_serial_ids, 1) IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No available serials found for this item'
        );
    END IF;

    -- Call allocate_pick_list_item_serials with the selected IDs
    RETURN allocate_pick_list_item_serials(p_pick_list_item_id, v_serial_ids);
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION allocate_pick_list_item_lots TO authenticated;
GRANT EXECUTE ON FUNCTION allocate_pick_list_item_serials TO authenticated;
GRANT EXECUTE ON FUNCTION get_pick_list_item_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION auto_allocate_lots_fefo TO authenticated;
GRANT EXECUTE ON FUNCTION auto_allocate_serials_fifo TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION allocate_pick_list_item_lots IS 'Allocates lots to a pick list item. Takes pick list item ID and array of {lot_id, quantity}. Clears existing and inserts new allocations.';
COMMENT ON FUNCTION allocate_pick_list_item_serials IS 'Allocates serial numbers to a pick list item. Takes pick list item ID and array of serial IDs. Clears existing and inserts new allocations.';
COMMENT ON FUNCTION get_pick_list_item_tracking IS 'Returns JSONB with lots and serials allocated to a pick list item, including lot/serial details.';
COMMENT ON FUNCTION auto_allocate_lots_fefo IS 'Auto-assigns lots to a pick list item using FEFO strategy (First-Expired-First-Out). Earliest expiry dates are allocated first.';
COMMENT ON FUNCTION auto_allocate_serials_fifo IS 'Auto-assigns serials to a pick list item using FIFO strategy (First-In-First-Out). Oldest created serials are allocated first.';

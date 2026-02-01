-- Migration: 00107_fix_tracking_mode_enum_value.sql
-- Purpose: Fix incorrect enum value 'serial' -> 'serialized' in validate_receive function
-- Issue: BUG-004 - The validate_receive function uses 'serial' but the enum item_tracking_mode
--        only has values: 'none', 'serialized', 'lot_expiry'

-- ===========================================
-- RECREATE VALIDATE_RECEIVE FUNCTION WITH CORRECT ENUM VALUE
-- ===========================================
CREATE OR REPLACE FUNCTION validate_receive(p_receive_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_receive_status VARCHAR;
    v_validation_errors TEXT[] := ARRAY[]::TEXT[];
    v_item RECORD;
    v_serial_count INTEGER;
    v_ordered_qty INTEGER;
    v_already_received INTEGER;
    v_po_item_id UUID;
BEGIN
    -- Get receive info
    SELECT r.tenant_id, r.status
    INTO v_tenant_id, v_receive_status
    FROM receives r
    WHERE r.id = p_receive_id AND r.tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('valid', false, 'errors', ARRAY['Receive not found']);
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('valid', false, 'errors', ARRAY['Receive must be in draft status']);
    END IF;

    -- Check each receive item
    FOR v_item IN
        SELECT
            ri.id as receive_item_id,
            ri.purchase_order_item_id,
            ri.item_id,
            ri.quantity_received,
            ii.name as item_name,
            ii.tracking_mode,
            poi.ordered_quantity,
            COALESCE(poi.received_quantity, 0) as already_received
        FROM receive_items ri
        LEFT JOIN inventory_items ii ON ii.id = ri.item_id
        LEFT JOIN purchase_order_items poi ON poi.id = ri.purchase_order_item_id
        WHERE ri.receive_id = p_receive_id
    LOOP
        -- Check 1: Serial count validation for serialized items
        -- FIX: Changed 'serial' to 'serialized' to match the enum value
        IF v_item.tracking_mode = 'serialized' THEN
            SELECT COUNT(*) INTO v_serial_count
            FROM receive_item_serials
            WHERE receive_item_id = v_item.receive_item_id;

            IF v_serial_count != v_item.quantity_received THEN
                v_validation_errors := array_append(
                    v_validation_errors,
                    format('Item "%s": Serial count (%s) does not match quantity received (%s)',
                        v_item.item_name, v_serial_count, v_item.quantity_received)
                );
            END IF;
        END IF;

        -- Check 2: Over-receipt prevention
        IF v_item.purchase_order_item_id IS NOT NULL THEN
            -- Calculate remaining quantity that can be received
            v_ordered_qty := COALESCE(v_item.ordered_quantity, 0);
            v_already_received := COALESCE(v_item.already_received, 0);

            IF (v_already_received + v_item.quantity_received) > v_ordered_qty THEN
                v_validation_errors := array_append(
                    v_validation_errors,
                    format('Item "%s": Would exceed ordered quantity (ordered: %s, already received: %s, this receive: %s)',
                        v_item.item_name, v_ordered_qty, v_already_received, v_item.quantity_received)
                );
            END IF;
        END IF;
    END LOOP;

    IF array_length(v_validation_errors, 1) > 0 THEN
        RETURN json_build_object('valid', false, 'errors', v_validation_errors);
    END IF;

    RETURN json_build_object('valid', true, 'errors', ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- VERIFICATION
-- ===========================================
DO $$
BEGIN
    -- Verify the function was updated by checking it doesn't contain 'serial' (only 'serialized')
    IF EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'validate_receive'
        AND prosrc LIKE '%tracking_mode = ''serial''%'
        AND prosrc NOT LIKE '%tracking_mode = ''serialized''%'
    ) THEN
        RAISE EXCEPTION 'Migration failed: validate_receive still contains incorrect enum value';
    END IF;

    RAISE NOTICE 'Migration 00107 completed: Fixed tracking_mode enum value from serial to serialized';
END $$;

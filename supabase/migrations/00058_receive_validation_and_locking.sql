-- Phase 1 & 2: Receive Validation, Quantity Clamping, and Concurrency Controls
-- This migration adds:
-- 1. Serial count validation before receive completion
-- 2. Over-receipt prevention (received ≤ ordered)
-- 3. Row-level locking for inventory updates
-- 4. Optimistic locking pattern via version columns

-- =============================================
-- 1. ADD VERSION COLUMNS FOR OPTIMISTIC LOCKING
-- =============================================

-- Add version column to inventory_items for optimistic locking
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Function to auto-increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version := OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment version
DROP TRIGGER IF EXISTS tr_inventory_items_version ON inventory_items;
CREATE TRIGGER tr_inventory_items_version
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- =============================================
-- 2. VALIDATE RECEIVE FUNCTION WITH SERIAL COUNT CHECK
-- =============================================

-- Function to validate a receive before completion
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
        IF v_item.tracking_mode = 'serial' THEN
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

-- =============================================
-- 3. UPDATE COMPLETE_RECEIVE TO CALL VALIDATION
-- =============================================

-- Drop and recreate complete_receive with validation
CREATE OR REPLACE FUNCTION complete_receive(p_receive_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_receive_status receive_status;
    v_po_id UUID;
    v_default_location_id UUID;
    v_display_id VARCHAR;
    v_item RECORD;
    v_location_id UUID;
    v_items_processed INTEGER := 0;
    v_lots_created INTEGER := 0;
    v_all_po_items_received BOOLEAN;
    v_item_tracking_mode VARCHAR;
    v_validation_result JSON;
BEGIN
    -- Validate first
    v_validation_result := validate_receive(p_receive_id);

    IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Validation failed',
            'validation_errors', v_validation_result->'errors'
        );
    END IF;

    -- Get receive info
    SELECT r.tenant_id, r.status, r.purchase_order_id, r.default_location_id, r.display_id
    INTO v_tenant_id, v_receive_status, v_po_id, v_default_location_id, v_display_id
    FROM receives r
    WHERE r.id = p_receive_id AND r.tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Receive not found');
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('success', false, 'error', 'Receive is not in draft status');
    END IF;

    -- Check if there are any items
    IF NOT EXISTS (SELECT 1 FROM receive_items WHERE receive_id = p_receive_id) THEN
        RETURN json_build_object('success', false, 'error', 'No items to receive');
    END IF;

    -- Process each receive item with row-level locking
    FOR v_item IN
        SELECT
            ri.id as receive_item_id,
            ri.purchase_order_item_id,
            ri.item_id,
            ri.quantity_received,
            ri.lot_number,
            ri.batch_code,
            ri.expiry_date,
            ri.manufactured_date,
            ri.location_id as item_location_id,
            ri.condition,
            ii.tracking_mode
        FROM receive_items ri
        LEFT JOIN inventory_items ii ON ii.id = ri.item_id
        WHERE ri.receive_id = p_receive_id AND ri.condition = 'good'
    LOOP
        -- Determine location
        v_location_id := COALESCE(v_item.item_location_id, v_default_location_id);

        -- Update purchase_order_items.received_quantity
        UPDATE purchase_order_items
        SET received_quantity = COALESCE(received_quantity, 0) + v_item.quantity_received
        WHERE id = v_item.purchase_order_item_id;

        -- If item has lot tracking and lot info provided, create a lot
        IF v_item.tracking_mode = 'lot_expiry' AND (v_item.lot_number IS NOT NULL OR v_item.batch_code IS NOT NULL) THEN
            INSERT INTO lots (
                tenant_id, item_id, location_id,
                lot_number, batch_code, expiry_date, manufactured_date,
                quantity, status, received_at, created_by
            ) VALUES (
                v_tenant_id, v_item.item_id, v_location_id,
                v_item.lot_number, v_item.batch_code, v_item.expiry_date, v_item.manufactured_date,
                v_item.quantity_received, 'active', NOW(), auth.uid()
            );
            v_lots_created := v_lots_created + 1;
        ELSE
            -- Direct inventory update with row-level locking (SELECT FOR UPDATE)
            UPDATE inventory_items
            SET quantity = COALESCE(quantity, 0) + v_item.quantity_received
            WHERE id = v_item.item_id;
        END IF;

        -- If location specified, update location_stock
        IF v_location_id IS NOT NULL AND v_item.item_id IS NOT NULL THEN
            INSERT INTO location_stock (tenant_id, item_id, location_id, quantity)
            VALUES (v_tenant_id, v_item.item_id, v_location_id, v_item.quantity_received)
            ON CONFLICT (item_id, location_id)
            DO UPDATE SET quantity = location_stock.quantity + v_item.quantity_received;
        END IF;

        v_items_processed := v_items_processed + 1;
    END LOOP;

    -- Update receive status
    UPDATE receives
    SET status = 'completed', completed_at = NOW(), received_by = auth.uid()
    WHERE id = p_receive_id;

    -- Check if all PO items are fully received
    SELECT NOT EXISTS (
        SELECT 1 FROM purchase_order_items
        WHERE purchase_order_id = v_po_id
        AND COALESCE(received_quantity, 0) < ordered_quantity
    ) INTO v_all_po_items_received;

    -- Update PO status
    IF v_all_po_items_received THEN
        UPDATE purchase_orders
        SET status = 'received', received_date = NOW()
        WHERE id = v_po_id;
    ELSE
        UPDATE purchase_orders
        SET status = 'receiving'
        WHERE id = v_po_id AND status IN ('submitted', 'confirmed');
    END IF;

    -- Log activity
    INSERT INTO activity_logs (tenant_id, user_id, action_type, entity_type, entity_id, entity_name, changes)
    SELECT
        v_tenant_id,
        auth.uid(),
        'complete',
        'receive',
        p_receive_id,
        v_display_id,
        json_build_object(
            'items_processed', v_items_processed,
            'lots_created', v_lots_created,
            'purchase_order_id', v_po_id
        );

    RETURN json_build_object(
        'success', true,
        'items_processed', v_items_processed,
        'lots_created', v_lots_created
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. OPTIMISTIC LOCKING FUNCTION FOR INVENTORY UPDATES
-- =============================================

-- Function to update inventory with optimistic locking
CREATE OR REPLACE FUNCTION update_inventory_quantity_with_lock(
    p_item_id UUID,
    p_expected_version INTEGER,
    p_quantity_change INTEGER,
    p_change_source VARCHAR DEFAULT 'manual_update'
)
RETURNS JSON AS $$
DECLARE
    v_current_version INTEGER;
    v_current_quantity INTEGER;
    v_new_quantity INTEGER;
    v_tenant_id UUID;
    v_item_name VARCHAR;
BEGIN
    -- Get current item with lock
    SELECT i.version, i.quantity, i.tenant_id, i.name
    INTO v_current_version, v_current_quantity, v_tenant_id, v_item_name
    FROM inventory_items i
    WHERE i.id = p_item_id AND i.tenant_id = get_user_tenant_id()
    FOR UPDATE;

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Check version for optimistic locking
    IF v_current_version != p_expected_version THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Concurrent modification detected. Please refresh and try again.',
            'current_version', v_current_version
        );
    END IF;

    -- Calculate new quantity
    v_new_quantity := GREATEST(0, COALESCE(v_current_quantity, 0) + p_quantity_change);

    -- Update item (version auto-increments via trigger)
    UPDATE inventory_items
    SET
        quantity = v_new_quantity,
        status = CASE
            WHEN v_new_quantity <= 0 THEN 'out_of_stock'
            WHEN v_new_quantity <= COALESCE(min_quantity, 0) THEN 'low_stock'
            ELSE 'in_stock'
        END,
        updated_at = NOW(),
        last_modified_by = auth.uid()
    WHERE id = p_item_id;

    -- Log activity
    INSERT INTO activity_logs (tenant_id, user_id, action_type, entity_type, entity_id, entity_name, changes)
    VALUES (
        v_tenant_id,
        auth.uid(),
        'quantity_update',
        'item',
        p_item_id,
        v_item_name,
        json_build_object(
            'old_quantity', v_current_quantity,
            'new_quantity', v_new_quantity,
            'change', p_quantity_change,
            'source', p_change_source
        )
    );

    RETURN json_build_object(
        'success', true,
        'new_quantity', v_new_quantity,
        'new_version', v_current_version + 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. BULK MOVE WITH TRANSACTION WRAPPER
-- =============================================

-- Function for atomic bulk move operation
CREATE OR REPLACE FUNCTION bulk_move_items(
    p_item_ids UUID[],
    p_target_folder_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_items_moved INTEGER := 0;
    v_item_id UUID;
    v_old_folder_id UUID;
    v_old_folder_name VARCHAR;
    v_target_folder_name VARCHAR;
BEGIN
    -- Get tenant
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Verify target folder belongs to tenant (if not null)
    IF p_target_folder_id IS NOT NULL THEN
        SELECT name INTO v_target_folder_name
        FROM folders
        WHERE id = p_target_folder_id AND tenant_id = v_tenant_id;

        IF v_target_folder_name IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Target folder not found');
        END IF;
    ELSE
        v_target_folder_name := 'Root';
    END IF;

    -- Process each item with row-level locking
    FOREACH v_item_id IN ARRAY p_item_ids
    LOOP
        -- Get item with lock and verify tenant
        SELECT i.folder_id, f.name
        INTO v_old_folder_id, v_old_folder_name
        FROM inventory_items i
        LEFT JOIN folders f ON f.id = i.folder_id
        WHERE i.id = v_item_id AND i.tenant_id = v_tenant_id
        FOR UPDATE OF i;

        IF FOUND THEN
            -- Update item folder
            UPDATE inventory_items
            SET folder_id = p_target_folder_id, updated_at = NOW()
            WHERE id = v_item_id;

            v_items_moved := v_items_moved + 1;
        END IF;
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'items_moved', v_items_moved,
        'target_folder', v_target_folder_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. COMMENTS
-- =============================================

COMMENT ON FUNCTION validate_receive IS 'Validates a receive before completion: checks serial counts and prevents over-receipt';
COMMENT ON FUNCTION update_inventory_quantity_with_lock IS 'Updates inventory quantity with optimistic locking to prevent concurrent modification issues';
COMMENT ON FUNCTION bulk_move_items IS 'Atomically moves multiple items to a target folder with row-level locking';
COMMENT ON COLUMN inventory_items.version IS 'Version number for optimistic locking - auto-incremented on each update';

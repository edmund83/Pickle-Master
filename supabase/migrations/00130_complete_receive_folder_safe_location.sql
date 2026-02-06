-- ============================================
-- Migration: 00130_complete_receive_folder_safe_location.sql
-- Purpose: Make complete_receive safe when receives use folder IDs (post-00109).
--          location_stock and lots.location_id reference locations(id); receive
--          default_location_id and receive_items.location_id now reference folders(id).
--          Only update location_stock and set lots.location_id when the ID is in locations.
-- ============================================

CREATE OR REPLACE FUNCTION complete_receive(p_receive_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_receive_status receive_status;
    v_po_id UUID;
    v_source_type VARCHAR;
    v_default_location_id UUID;
    v_display_id VARCHAR;
    v_item RECORD;
    v_location_id UUID;
    v_location_id_for_stock UUID;  -- Only set when location_id exists in locations table (folder IDs must be skipped)
    v_items_processed INTEGER := 0;
    v_lots_created INTEGER := 0;
    v_all_po_items_received BOOLEAN;
    v_item_tracking_mode VARCHAR;
    v_validation_result JSON;
BEGIN
    SELECT r.tenant_id, r.status, r.purchase_order_id, r.source_type, r.default_location_id, r.display_id
    INTO v_tenant_id, v_receive_status, v_po_id, v_source_type, v_default_location_id, v_display_id
    FROM receives r
    WHERE r.id = p_receive_id AND r.tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Receive not found');
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('success', false, 'error', 'Receive is not in draft status');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM receive_items WHERE receive_id = p_receive_id) THEN
        RETURN json_build_object('success', false, 'error', 'No items to receive');
    END IF;

    IF v_po_id IS NOT NULL THEN
        v_validation_result := validate_receive(p_receive_id);
        IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Validation failed',
                'validation_errors', v_validation_result->'errors'
            );
        END IF;
    END IF;

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
        v_location_id := COALESCE(v_item.item_location_id, v_default_location_id);
        -- Receives may store folder IDs (00109); location_stock and lots.location_id reference locations(id). Use only when it's a real location.
        SELECT id INTO v_location_id_for_stock FROM locations WHERE id = v_location_id AND tenant_id = v_tenant_id LIMIT 1;

        IF v_item.purchase_order_item_id IS NOT NULL THEN
            UPDATE purchase_order_items
            SET received_quantity = COALESCE(received_quantity, 0) + v_item.quantity_received
            WHERE id = v_item.purchase_order_item_id;
        END IF;

        IF v_item.tracking_mode = 'lot_expiry' AND (v_item.lot_number IS NOT NULL OR v_item.batch_code IS NOT NULL) THEN
            INSERT INTO lots (
                tenant_id, item_id, location_id,
                lot_number, batch_code, expiry_date, manufactured_date,
                quantity, status, received_at, created_by
            ) VALUES (
                v_tenant_id, v_item.item_id, v_location_id_for_stock,
                v_item.lot_number, v_item.batch_code, v_item.expiry_date, v_item.manufactured_date,
                v_item.quantity_received, 'active', NOW(), auth.uid()
            );
            v_lots_created := v_lots_created + 1;
        ELSE
            UPDATE inventory_items
            SET quantity = COALESCE(quantity, 0) + v_item.quantity_received
            WHERE id = v_item.item_id;
        END IF;

        -- Only update location_stock when the receive location is a valid location (not a folder)
        IF v_location_id_for_stock IS NOT NULL AND v_item.item_id IS NOT NULL THEN
            INSERT INTO location_stock (tenant_id, item_id, location_id, quantity)
            VALUES (v_tenant_id, v_item.item_id, v_location_id_for_stock, v_item.quantity_received)
            ON CONFLICT (item_id, location_id)
            DO UPDATE SET quantity = location_stock.quantity + v_item.quantity_received;
        END IF;

        v_items_processed := v_items_processed + 1;
    END LOOP;

    UPDATE receives
    SET status = 'completed', completed_at = NOW(), received_by = auth.uid()
    WHERE id = p_receive_id;

    IF v_po_id IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM purchase_order_items
            WHERE purchase_order_id = v_po_id
            AND COALESCE(received_quantity, 0) < ordered_quantity
        ) INTO v_all_po_items_received;

        IF v_all_po_items_received THEN
            UPDATE purchase_orders
            SET status = 'received', received_date = CURRENT_DATE
            WHERE id = v_po_id;
        ELSE
            UPDATE purchase_orders
            SET status = 'partial'
            WHERE id = v_po_id AND status NOT IN ('received', 'cancelled');
        END IF;
    END IF;

    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        user_name,
        action_type,
        entity_type,
        entity_id,
        entity_name,
        changes
    ) VALUES (
        v_tenant_id,
        auth.uid(),
        (SELECT full_name FROM profiles WHERE id = auth.uid()),
        'completed',
        'receive',
        p_receive_id,
        v_display_id,
        json_build_object(
            'items_processed', v_items_processed,
            'lots_created', v_lots_created,
            'po_fully_received', COALESCE(v_all_po_items_received, false)
        )
    );

    PERFORM notify_receive_completed(p_receive_id);

    RETURN json_build_object(
        'success', true,
        'items_processed', v_items_processed,
        'lots_created', v_lots_created,
        'po_fully_received', COALESCE(v_all_po_items_received, false)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION complete_receive IS 'Completes a receive: updates PO received qty, inventory, lots. Only updates location_stock and sets lots.location_id when the receive location ID exists in locations (folder IDs are skipped after receives moved to folders).';

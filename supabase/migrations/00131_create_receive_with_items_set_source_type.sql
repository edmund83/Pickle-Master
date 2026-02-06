-- ============================================
-- Migration: 00131_create_receive_with_items_set_source_type.sql
-- Purpose: Set source_type = 'purchase_order' when creating a receive from a PO.
-- ============================================

CREATE OR REPLACE FUNCTION create_receive_with_items(
    p_purchase_order_id UUID,
    p_delivery_note_number VARCHAR DEFAULT NULL,
    p_carrier VARCHAR DEFAULT NULL,
    p_tracking_number VARCHAR DEFAULT NULL,
    p_default_location_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_receive_id UUID;
    v_tenant_id UUID;
    v_display_id VARCHAR(25);
    v_po_status VARCHAR;
    v_po_item RECORD;
    v_remaining_qty INTEGER;
    v_items_added INTEGER := 0;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();
    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User has no tenant');
    END IF;

    SELECT status INTO v_po_status
    FROM purchase_orders
    WHERE id = p_purchase_order_id AND tenant_id = v_tenant_id;

    IF v_po_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Purchase order not found');
    END IF;

    IF v_po_status NOT IN ('submitted', 'confirmed', 'partial') THEN
        RETURN json_build_object('success', false, 'error', 'Purchase order is not in a receivable status');
    END IF;

    v_display_id := generate_display_id(v_tenant_id, 'receive');

    INSERT INTO receives (
        tenant_id,
        display_id,
        purchase_order_id,
        source_type,
        delivery_note_number,
        carrier,
        tracking_number,
        default_location_id,
        notes,
        created_by,
        status,
        received_date
    ) VALUES (
        v_tenant_id,
        v_display_id,
        p_purchase_order_id,
        'purchase_order',
        p_delivery_note_number,
        p_carrier,
        p_tracking_number,
        p_default_location_id,
        p_notes,
        auth.uid(),
        'draft',
        CURRENT_DATE
    ) RETURNING id INTO v_receive_id;

    FOR v_po_item IN
        SELECT
            poi.id as po_item_id,
            poi.item_id,
            poi.ordered_quantity,
            COALESCE(poi.received_quantity, 0) as received_qty
        FROM purchase_order_items poi
        WHERE poi.purchase_order_id = p_purchase_order_id
    LOOP
        v_remaining_qty := v_po_item.ordered_quantity - v_po_item.received_qty;

        IF v_remaining_qty > 0 THEN
            INSERT INTO receive_items (
                receive_id,
                purchase_order_item_id,
                item_id,
                quantity_received,
                condition,
                location_id
            ) VALUES (
                v_receive_id,
                v_po_item.po_item_id,
                v_po_item.item_id,
                v_remaining_qty,
                'good',
                p_default_location_id
            );
            v_items_added := v_items_added + 1;
        END IF;
    END LOOP;

    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        entity_name,
        action_type
    ) VALUES (
        v_tenant_id,
        auth.uid(),
        'receive',
        v_receive_id,
        v_display_id,
        'create'
    );

    RETURN json_build_object(
        'success', true,
        'id', v_receive_id,
        'display_id', v_display_id,
        'items_added', v_items_added
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_receive_with_items TO authenticated;

COMMENT ON FUNCTION create_receive_with_items IS 'Creates a receive from a PO with items pre-populated. Sets source_type = purchase_order.';

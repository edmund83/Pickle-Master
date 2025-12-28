-- Migration: Create receive with pre-populated items from PO
-- This function atomically creates a receive document and pre-populates it with all PO items

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
    -- Get tenant ID from current user's profile
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();
    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User has no tenant');
    END IF;

    -- Verify PO exists and belongs to tenant
    SELECT status INTO v_po_status
    FROM purchase_orders
    WHERE id = p_purchase_order_id AND tenant_id = v_tenant_id;

    IF v_po_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Purchase order not found');
    END IF;

    -- Verify PO is in a receivable status
    IF v_po_status NOT IN ('submitted', 'confirmed', 'partial') THEN
        RETURN json_build_object('success', false, 'error', 'Purchase order is not in a receivable status');
    END IF;

    -- Generate display ID for the receive document
    v_display_id := generate_display_id(v_tenant_id, 'receive');

    -- Create receive header
    INSERT INTO receives (
        tenant_id,
        display_id,
        purchase_order_id,
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
        p_delivery_note_number,
        p_carrier,
        p_tracking_number,
        p_default_location_id,
        p_notes,
        auth.uid(),
        'draft',
        CURRENT_DATE
    ) RETURNING id INTO v_receive_id;

    -- Pre-populate receive items from PO items
    FOR v_po_item IN
        SELECT
            poi.id as po_item_id,
            poi.item_id,
            poi.ordered_quantity,
            COALESCE(poi.received_quantity, 0) as received_qty
        FROM purchase_order_items poi
        WHERE poi.purchase_order_id = p_purchase_order_id
    LOOP
        -- Calculate remaining quantity to receive
        v_remaining_qty := v_po_item.ordered_quantity - v_po_item.received_qty;

        -- Only add items with remaining quantity > 0
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_receive_with_items TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION create_receive_with_items IS 'Creates a receive document with all PO items pre-populated. Items are added with their remaining quantities (ordered - already received).';

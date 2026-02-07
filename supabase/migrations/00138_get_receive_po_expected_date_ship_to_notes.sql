-- Migration: 00138_get_receive_po_expected_date_ship_to_notes.sql
-- Purpose: Expose PO expected_date, notes, and ship_to summary on receive for warehouse context (see docs/po-to-receiving-workflow-audit.md)

CREATE OR REPLACE FUNCTION get_receive_with_items(p_receive_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'receive', json_build_object(
            'id', r.id,
            'display_id', r.display_id,
            'status', r.status,
            'source_type', r.source_type,
            'received_date', r.received_date,
            'delivery_note_number', r.delivery_note_number,
            'carrier', r.carrier,
            'tracking_number', r.tracking_number,
            'default_location_id', r.default_location_id,
            'default_location_name', (SELECT name FROM folders WHERE id = r.default_location_id),
            'notes', r.notes,
            'completed_at', r.completed_at,
            'created_at', r.created_at,
            'received_by_name', (SELECT full_name FROM profiles WHERE id = r.received_by),
            'created_by_name', (SELECT full_name FROM profiles WHERE id = r.created_by)
        ),
        'purchase_order', CASE
            WHEN po.id IS NOT NULL THEN json_build_object(
                'id', po.id,
                'display_id', po.display_id,
                'order_number', po.order_number,
                'status', po.status,
                'vendor_name', (SELECT name FROM vendors WHERE id = po.vendor_id),
                'expected_date', po.expected_date,
                'notes', po.notes,
                'ship_to_name', po.ship_to_name,
                'ship_to_address1', po.ship_to_address1,
                'ship_to_city', po.ship_to_city,
                'ship_to_country', po.ship_to_country
            )
            ELSE NULL
        END,
        'items', COALESCE((
            SELECT json_agg(
                json_build_object(
                    'id', ri.id,
                    'purchase_order_item_id', ri.purchase_order_item_id,
                    'item_id', ri.item_id,
                    'item_name', COALESCE(poi.item_name, ii.name),
                    'item_sku', COALESCE(poi.sku, ii.sku),
                    'ordered_quantity', poi.ordered_quantity,
                    'already_received', CASE
                        WHEN r.status = 'completed' THEN COALESCE(poi.received_quantity, 0) - ri.quantity_received
                        ELSE COALESCE(poi.received_quantity, 0)
                    END,
                    'quantity_received', ri.quantity_received,
                    'lot_number', ri.lot_number,
                    'batch_code', ri.batch_code,
                    'expiry_date', ri.expiry_date,
                    'manufactured_date', ri.manufactured_date,
                    'location_id', ri.location_id,
                    'location_name', (SELECT name FROM folders WHERE id = ri.location_id),
                    'condition', ri.condition,
                    'return_reason', ri.return_reason,
                    'notes', ri.notes,
                    'item_image', ii.image_urls[1],
                    'item_tracking_mode', ii.tracking_mode
                ) ORDER BY COALESCE(poi.item_name, ii.name)
            )
            FROM receive_items ri
            LEFT JOIN purchase_order_items poi ON poi.id = ri.purchase_order_item_id
            LEFT JOIN inventory_items ii ON ii.id = ri.item_id
            WHERE ri.receive_id = r.id
        ), '[]'::json)
    ) INTO v_result
    FROM receives r
    LEFT JOIN purchase_orders po ON po.id = r.purchase_order_id
    WHERE r.id = p_receive_id
    AND r.tenant_id = get_user_tenant_id();

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_receive_with_items IS 'Gets receive details with items and PO context (expected_date, notes, ship_to) for warehouse receiving.';

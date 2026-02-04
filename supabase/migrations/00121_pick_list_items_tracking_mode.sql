-- ============================================
-- Migration: 00121_pick_list_items_tracking_mode.sql
-- Purpose: Update get_pick_list_with_items RPC to include tracking_mode
-- This enables the UI to know which items require serial/lot allocation
-- ============================================

-- ===================
-- UPDATE get_pick_list_with_items RPC
-- Now includes tracking_mode from inventory_items table
-- ===================
CREATE OR REPLACE FUNCTION get_pick_list_with_items(p_pick_list_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'pick_list', row_to_json(pl),
            'items', (
                SELECT COALESCE(json_agg(json_build_object(
                    'id', pli.id,
                    'item_id', pli.item_id,
                    'item_name', i.name,
                    'item_sku', i.sku,
                    'item_image', i.image_urls[1],
                    'available_quantity', i.quantity,
                    'requested_quantity', pli.requested_quantity,
                    'picked_quantity', pli.picked_quantity,
                    'picked_at', pli.picked_at,
                    'notes', pli.notes,
                    -- NEW: Include tracking_mode so UI knows if serial/lot allocation is needed
                    'tracking_mode', COALESCE(i.tracking_mode::text, 'none'),
                    -- Location data for each item
                    'locations', (
                        SELECT COALESCE(json_agg(json_build_object(
                            'location_id', ls.location_id,
                            'location_name', l.name,
                            'location_type', l.type,
                            'quantity', ls.quantity
                        ) ORDER BY ls.quantity DESC), '[]'::json)
                        FROM location_stock ls
                        JOIN locations l ON l.id = ls.location_id
                        WHERE ls.item_id = pli.item_id
                        AND ls.quantity > 0
                        AND l.is_active = true
                    )
                ) ORDER BY i.name), '[]'::json)
                FROM pick_list_items pli
                JOIN inventory_items i ON i.id = pli.item_id
                WHERE pli.pick_list_id = p_pick_list_id
            ),
            'assigned_to_name', (
                SELECT full_name FROM profiles WHERE id = pl.assigned_to
            )
        )
        FROM pick_lists pl
        WHERE pl.id = p_pick_list_id
        AND pl.tenant_id = get_user_tenant_id()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_pick_list_with_items(UUID) IS
'Returns pick list with items including tracking_mode and location data.
tracking_mode values: "none", "serialized", "lot_expiry"
Location data helps pickers know where to find items in the warehouse.
Items without location_stock entries will have an empty locations array.';

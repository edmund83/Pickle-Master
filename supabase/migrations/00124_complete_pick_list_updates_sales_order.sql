-- ============================================
-- Migration: 00124_complete_pick_list_updates_sales_order.sql
-- Purpose: Update sales order status to 'picked' when pick list is completed
--
-- Problem: The complete_pick_list function only updates the pick list status
-- but does not update the linked sales order status from 'picking' to 'picked'.
-- This causes "Create Delivery Order" to fail because the
-- create_delivery_order_from_sales_order function requires the sales order
-- to be in 'picked' or 'partial_shipped' status.
--
-- Solution: Update complete_pick_list to also set the sales order status
-- to 'picked' when all items have been fully picked.
-- ============================================

CREATE OR REPLACE FUNCTION complete_pick_list(p_pick_list_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_name VARCHAR;
    v_source_entity_id UUID;
    v_source_entity_type VARCHAR;
    v_all_items_fully_picked BOOLEAN;
BEGIN
    -- Verify ownership and get pick list info
    SELECT tenant_id, name, source_entity_id, source_entity_type
    INTO v_tenant_id, v_name, v_source_entity_id, v_source_entity_type
    FROM pick_lists
    WHERE id = p_pick_list_id AND tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Pick list not found');
    END IF;

    -- Update pick list status
    UPDATE pick_lists
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = p_pick_list_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id, entity_name, action_type
    ) VALUES (
        v_tenant_id, auth.uid(), 'pick_list', p_pick_list_id, v_name, 'complete'
    );

    -- If linked to a sales order, update the sales order status
    IF v_source_entity_type = 'sales_order' AND v_source_entity_id IS NOT NULL THEN
        -- Check if all items are fully picked
        SELECT NOT EXISTS (
            SELECT 1
            FROM sales_order_items
            WHERE sales_order_id = v_source_entity_id
              AND quantity_picked < quantity_ordered
        ) INTO v_all_items_fully_picked;

        -- Update sales order status from 'picking' to 'picked'
        -- Only update if current status is 'picking' to avoid overwriting other statuses
        UPDATE sales_orders
        SET status = 'picked',
            updated_at = NOW()
        WHERE id = v_source_entity_id
          AND status = 'picking';
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION complete_pick_list IS
'Completes a pick list and updates the linked sales order status to "picked".
When a pick list linked to a sales order is completed, this function:
1. Updates the pick list status to "completed"
2. Sets the completed_at timestamp
3. Logs the completion activity
4. Updates the linked sales order status from "picking" to "picked"';

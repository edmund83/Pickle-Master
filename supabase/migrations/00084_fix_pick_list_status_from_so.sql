-- Fix: Change pick list status from 'pending' to 'draft' when creating from sales order
-- The check constraint chk_pick_list_status only allows: draft, in_progress, completed, cancelled
-- Previously the RPC was using 'pending' which violated this constraint

CREATE OR REPLACE FUNCTION generate_pick_list_from_sales_order(
    p_sales_order_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_sales_order RECORD;
    v_pick_list_id UUID;
    v_tenant_id UUID;
    v_display_id TEXT;
BEGIN
    -- Get sales order details
    SELECT
        so.*,
        c.name as customer_name
    INTO v_sales_order
    FROM sales_orders so
    LEFT JOIN customers c ON c.id = so.customer_id
    WHERE so.id = p_sales_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sales order not found: %', p_sales_order_id;
    END IF;

    -- Verify user has access to this tenant
    v_tenant_id := v_sales_order.tenant_id;

    -- Check if pick list already exists for this SO
    IF EXISTS (
        SELECT 1 FROM pick_lists
        WHERE source_entity_type = 'sales_order'
        AND source_entity_id = p_sales_order_id
        AND status != 'cancelled'
    ) THEN
        RAISE EXCEPTION 'Pick list already exists for this sales order';
    END IF;

    -- Generate display ID for pick list
    v_display_id := generate_display_id(v_tenant_id, 'pick_list');

    -- Create pick list with 'draft' status (not 'pending' which violated constraint)
    INSERT INTO pick_lists (
        tenant_id,
        display_id,
        name,
        status,
        source_entity_type,
        source_entity_id,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        due_date,
        assigned_to,
        created_by,
        notes
    ) VALUES (
        v_tenant_id,
        v_display_id,
        'Pick for ' || v_sales_order.display_id,
        'draft',  -- Fixed: was 'pending' which violated chk_pick_list_status constraint
        'sales_order',
        p_sales_order_id,
        v_sales_order.ship_to_name,
        v_sales_order.ship_to_address1,
        v_sales_order.ship_to_address2,
        v_sales_order.ship_to_city,
        v_sales_order.ship_to_state,
        v_sales_order.ship_to_postal_code,
        v_sales_order.ship_to_country,
        v_sales_order.promised_date,
        v_sales_order.assigned_to,
        auth.uid(),
        'Auto-generated from ' || v_sales_order.display_id
    )
    RETURNING id INTO v_pick_list_id;

    -- Add pick list items from sales order items
    INSERT INTO pick_list_items (
        pick_list_id,
        item_id,
        source_item_id,
        source_type,
        requested_quantity,
        picked_quantity,
        notes
    )
    SELECT
        v_pick_list_id,
        soi.item_id,
        soi.id,
        'sales_order',
        soi.quantity_ordered,
        0,
        'From SO item: ' || COALESCE(soi.item_name, 'Unknown')
    FROM sales_order_items soi
    WHERE soi.sales_order_id = p_sales_order_id
    AND soi.item_id IS NOT NULL;

    -- Update sales order status to 'picking'
    UPDATE sales_orders
    SET status = 'picking',
        updated_at = NOW()
    WHERE id = p_sales_order_id;

    -- Log activity (using correct column names: action_type and changes)
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        action_type,
        entity_type,
        entity_id,
        changes
    ) VALUES (
        v_tenant_id,
        auth.uid(),
        'create',
        'pick_list',
        v_pick_list_id,
        jsonb_build_object(
            'display_id', v_display_id,
            'source_type', 'sales_order',
            'source_id', p_sales_order_id,
            'source_display_id', v_sales_order.display_id
        )
    );

    RETURN v_pick_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

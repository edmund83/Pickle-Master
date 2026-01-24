-- ============================================
-- Migration: Extend Standalone Receive Creation
-- Purpose: Add more fields to create_standalone_receive RPC
--          to match the fields available on the detail page
-- ============================================

-- Update the RPC function to accept additional parameters
CREATE OR REPLACE FUNCTION create_standalone_receive(
    p_source_type VARCHAR DEFAULT 'customer_return',
    p_notes TEXT DEFAULT NULL,
    p_default_location_id UUID DEFAULT NULL,
    p_received_date DATE DEFAULT NULL,
    p_delivery_note_number VARCHAR DEFAULT NULL,
    p_carrier VARCHAR DEFAULT NULL,
    p_tracking_number VARCHAR DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_receive_id UUID;
    v_display_id VARCHAR;
BEGIN
    -- Get tenant ID
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not authenticated or not in a tenant');
    END IF;

    -- Validate source_type
    IF p_source_type NOT IN ('customer_return', 'stock_adjustment') THEN
        RETURN json_build_object('success', false, 'error', 'Invalid source type. Use customer_return or stock_adjustment');
    END IF;

    -- Validate location if provided
    IF p_default_location_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM locations
            WHERE id = p_default_location_id AND tenant_id = v_tenant_id
        ) THEN
            RETURN json_build_object('success', false, 'error', 'Location not found');
        END IF;
    END IF;

    -- Generate display ID
    v_display_id := generate_display_id(v_tenant_id, 'receive');

    -- Create the receive with all provided fields
    INSERT INTO receives (
        tenant_id,
        display_id,
        purchase_order_id,
        source_type,
        received_date,
        status,
        default_location_id,
        notes,
        delivery_note_number,
        carrier,
        tracking_number,
        created_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        NULL,  -- No PO for standalone
        p_source_type,
        COALESCE(p_received_date, CURRENT_DATE),
        'draft',
        p_default_location_id,
        p_notes,
        p_delivery_note_number,
        p_carrier,
        p_tracking_number,
        auth.uid()
    )
    RETURNING id INTO v_receive_id;

    -- Log activity (using 'changes' column, not 'metadata')
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
        'created',
        'receive',
        v_receive_id,
        v_display_id,
        json_build_object(
            'source_type', p_source_type,
            'standalone', true
        )
    );

    RETURN json_build_object(
        'success', true,
        'receive_id', v_receive_id,
        'display_id', v_display_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

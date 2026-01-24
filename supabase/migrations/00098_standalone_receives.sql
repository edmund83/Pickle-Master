-- ============================================
-- Migration: Standalone Receives (Dual-Mode)
-- Purpose: Allow receives to work without a Purchase Order
--          for customer returns and stock adjustments
-- ============================================

-- ===================
-- SCHEMA CHANGES
-- ===================

-- 1. Add source_type to distinguish PO receives from standalone receives
ALTER TABLE receives ADD COLUMN IF NOT EXISTS source_type VARCHAR(20)
    DEFAULT 'purchase_order';

-- Add check constraint for valid source types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'receives_source_type_check'
    ) THEN
        ALTER TABLE receives ADD CONSTRAINT receives_source_type_check
            CHECK (source_type IN ('purchase_order', 'customer_return', 'stock_adjustment'));
    END IF;
END $$;

-- 2. Make purchase_order_id optional (nullable)
ALTER TABLE receives ALTER COLUMN purchase_order_id DROP NOT NULL;

-- 3. Make purchase_order_item_id optional in receive_items
ALTER TABLE receive_items ALTER COLUMN purchase_order_item_id DROP NOT NULL;

-- 4. Add return_reason for standalone items
ALTER TABLE receive_items ADD COLUMN IF NOT EXISTS return_reason VARCHAR(50);

-- Add check constraint for valid return reasons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'receive_items_return_reason_check'
    ) THEN
        ALTER TABLE receive_items ADD CONSTRAINT receive_items_return_reason_check
            CHECK (return_reason IS NULL OR return_reason IN (
                'defective', 'wrong_item', 'changed_mind', 'damaged_in_transit', 'other'
            ));
    END IF;
END $$;

-- 5. Add constraint: PO required only when source_type = 'purchase_order'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'receives_source_po_check'
    ) THEN
        ALTER TABLE receives ADD CONSTRAINT receives_source_po_check
            CHECK (
                source_type != 'purchase_order'
                OR (source_type = 'purchase_order' AND purchase_order_id IS NOT NULL)
            );
    END IF;
END $$;

-- 6. Index for filtering by source_type
CREATE INDEX IF NOT EXISTS idx_receives_source_type ON receives(tenant_id, source_type);

-- 7. Update existing receives to have source_type = 'purchase_order'
UPDATE receives SET source_type = 'purchase_order' WHERE source_type IS NULL;

-- ===================
-- RPC: Create Standalone Receive
-- ===================
CREATE OR REPLACE FUNCTION create_standalone_receive(
    p_source_type VARCHAR DEFAULT 'customer_return',
    p_notes TEXT DEFAULT NULL,
    p_default_location_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_receive_id UUID;
    v_display_id VARCHAR;
    v_org_code VARCHAR;
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

    -- Create the receive
    INSERT INTO receives (
        tenant_id,
        display_id,
        purchase_order_id,
        source_type,
        received_date,
        status,
        default_location_id,
        notes,
        created_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        NULL,  -- No PO for standalone
        p_source_type,
        CURRENT_DATE,
        'draft',
        p_default_location_id,
        p_notes,
        auth.uid()
    )
    RETURNING id INTO v_receive_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        user_name,
        action_type,
        entity_type,
        entity_id,
        entity_name,
        metadata
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

-- ===================
-- RPC: Add Standalone Receive Item
-- ===================
CREATE OR REPLACE FUNCTION add_standalone_receive_item(
    p_receive_id UUID,
    p_item_id UUID,
    p_quantity_received INTEGER,
    p_return_reason VARCHAR DEFAULT NULL,
    p_lot_number VARCHAR DEFAULT NULL,
    p_batch_code VARCHAR DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL,
    p_manufactured_date DATE DEFAULT NULL,
    p_location_id UUID DEFAULT NULL,
    p_condition receive_item_condition DEFAULT 'good',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_receive_item_id UUID;
    v_tenant_id UUID;
    v_receive_status receive_status;
    v_receive_source_type VARCHAR;
    v_item_name VARCHAR;
BEGIN
    -- Get receive info and verify access
    SELECT r.tenant_id, r.status, r.source_type
    INTO v_tenant_id, v_receive_status, v_receive_source_type
    FROM receives r
    WHERE r.id = p_receive_id AND r.tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Receive not found');
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('success', false, 'error', 'Can only add items to draft receives');
    END IF;

    -- Only allow for standalone receives
    IF v_receive_source_type = 'purchase_order' THEN
        RETURN json_build_object('success', false, 'error', 'Use add_receive_item for PO-linked receives');
    END IF;

    -- Validate item exists and belongs to tenant
    SELECT name INTO v_item_name
    FROM inventory_items
    WHERE id = p_item_id AND tenant_id = v_tenant_id;

    IF v_item_name IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Validate quantity
    IF p_quantity_received <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Quantity must be greater than 0');
    END IF;

    -- Validate location if provided
    IF p_location_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM locations
            WHERE id = p_location_id AND tenant_id = v_tenant_id
        ) THEN
            RETURN json_build_object('success', false, 'error', 'Location not found');
        END IF;
    END IF;

    -- Validate return reason for customer returns
    IF v_receive_source_type = 'customer_return' AND p_return_reason IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Return reason is required for customer returns');
    END IF;

    -- Insert receive item
    INSERT INTO receive_items (
        receive_id,
        purchase_order_item_id,  -- NULL for standalone
        item_id,
        quantity_received,
        return_reason,
        lot_number,
        batch_code,
        expiry_date,
        manufactured_date,
        location_id,
        condition,
        notes
    ) VALUES (
        p_receive_id,
        NULL,
        p_item_id,
        p_quantity_received,
        p_return_reason,
        p_lot_number,
        p_batch_code,
        p_expiry_date,
        p_manufactured_date,
        p_location_id,
        p_condition,
        p_notes
    )
    RETURNING id INTO v_receive_item_id;

    RETURN json_build_object(
        'success', true,
        'receive_item_id', v_receive_item_id,
        'item_id', p_item_id,
        'item_name', v_item_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- RPC: Update complete_receive to handle standalone
-- ===================
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
    v_items_processed INTEGER := 0;
    v_lots_created INTEGER := 0;
    v_all_po_items_received BOOLEAN;
    v_item_tracking_mode VARCHAR;
    v_validation_result JSON;
BEGIN
    -- Validate first (only for PO-linked receives)
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

    -- Check if there are any items
    IF NOT EXISTS (SELECT 1 FROM receive_items WHERE receive_id = p_receive_id) THEN
        RETURN json_build_object('success', false, 'error', 'No items to receive');
    END IF;

    -- Run validation only for PO-linked receives (has over-receipt checks)
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

    -- Process each receive item with good condition
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

        -- Update purchase_order_items.received_quantity (only for PO-linked items)
        IF v_item.purchase_order_item_id IS NOT NULL THEN
            UPDATE purchase_order_items
            SET received_quantity = COALESCE(received_quantity, 0) + v_item.quantity_received
            WHERE id = v_item.purchase_order_item_id;
        END IF;

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
            -- Note: lots trigger will sync quantity to inventory_items
        ELSE
            -- Direct inventory update (non-lot items)
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

    -- Update PO status (only for PO-linked receives)
    IF v_po_id IS NOT NULL THEN
        -- Check if all PO items are fully received
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

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        user_name,
        action_type,
        entity_type,
        entity_id,
        entity_name,
        metadata
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
            'source_type', v_source_type,
            'po_fully_received', CASE WHEN v_po_id IS NOT NULL THEN v_all_po_items_received ELSE NULL END
        )
    );

    -- Send notification
    PERFORM notify_receive_completed(p_receive_id);

    RETURN json_build_object(
        'success', true,
        'items_processed', v_items_processed,
        'lots_created', v_lots_created,
        'po_fully_received', CASE WHEN v_po_id IS NOT NULL THEN v_all_po_items_received ELSE NULL END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- RPC: Get Standalone Receives
-- ===================
CREATE OR REPLACE FUNCTION get_standalone_receives(
    p_source_type VARCHAR DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_result JSON;
BEGIN
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not authenticated');
    END IF;

    SELECT json_build_object(
        'success', true,
        'receives', COALESCE(json_agg(row_to_json(r)), '[]'::json),
        'total', (
            SELECT COUNT(*) FROM receives
            WHERE tenant_id = v_tenant_id
            AND purchase_order_id IS NULL
            AND (p_source_type IS NULL OR source_type = p_source_type)
            AND (p_status IS NULL OR status::text = p_status)
        )
    )
    INTO v_result
    FROM (
        SELECT
            r.id,
            r.display_id,
            r.source_type,
            r.received_date,
            r.status,
            r.notes,
            r.created_at,
            r.completed_at,
            l.name as default_location_name,
            (SELECT COUNT(*) FROM receive_items WHERE receive_id = r.id) as item_count,
            (SELECT SUM(quantity_received) FROM receive_items WHERE receive_id = r.id) as total_quantity
        FROM receives r
        LEFT JOIN locations l ON l.id = r.default_location_id
        WHERE r.tenant_id = v_tenant_id
        AND r.purchase_order_id IS NULL
        AND (p_source_type IS NULL OR r.source_type = p_source_type)
        AND (p_status IS NULL OR r.status::text = p_status)
        ORDER BY r.created_at DESC
        LIMIT p_limit
        OFFSET p_offset
    ) r;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- GRANT PERMISSIONS
-- ===================
GRANT EXECUTE ON FUNCTION create_standalone_receive TO authenticated;
GRANT EXECUTE ON FUNCTION add_standalone_receive_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_standalone_receives TO authenticated;

-- ============================================
-- Migration: Goods Received Notes (GRN) / Receives Workflow
-- Purpose: Formal receiving documents for purchase orders with lot tracking and location assignment
-- ============================================

-- ===================
-- ENUM TYPES
-- ===================

-- Receive status
CREATE TYPE receive_status AS ENUM ('draft', 'completed', 'cancelled');

-- Receive item condition
CREATE TYPE receive_item_condition AS ENUM ('good', 'damaged', 'rejected');

-- ===================
-- RECEIVES TABLE (GRN Header)
-- ===================
CREATE TABLE IF NOT EXISTS receives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Display ID (e.g., RCV-ACM01-00001)
    display_id VARCHAR(25),

    -- Link to source PO
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,

    -- Receive metadata
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Status workflow
    status receive_status NOT NULL DEFAULT 'draft',

    -- Reference info from vendor
    delivery_note_number VARCHAR(100),
    carrier VARCHAR(255),
    tracking_number VARCHAR(255),

    -- Default location for all items (can be overridden per line)
    default_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    -- Timestamps
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receives_tenant ON receives(tenant_id);
CREATE INDEX IF NOT EXISTS idx_receives_po ON receives(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_receives_status ON receives(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_receives_date ON receives(received_date);
CREATE INDEX IF NOT EXISTS idx_receives_display_id ON receives(display_id);

-- ===================
-- RECEIVE ITEMS TABLE (GRN Lines)
-- ===================
CREATE TABLE IF NOT EXISTS receive_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receive_id UUID NOT NULL REFERENCES receives(id) ON DELETE CASCADE,

    -- Link to PO item
    purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items(id) ON DELETE RESTRICT,

    -- Link to inventory item (for direct updates)
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,

    -- Quantities
    quantity_received INTEGER NOT NULL CHECK (quantity_received > 0),

    -- Lot/Batch tracking (optional - creates lot record on completion)
    lot_number VARCHAR(100),
    batch_code VARCHAR(100),
    expiry_date DATE,
    manufactured_date DATE,

    -- Location override (if different from receive default)
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- Item condition
    condition receive_item_condition NOT NULL DEFAULT 'good',

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receive_items_receive ON receive_items(receive_id);
CREATE INDEX IF NOT EXISTS idx_receive_items_po_item ON receive_items(purchase_order_item_id);
CREATE INDEX IF NOT EXISTS idx_receive_items_item ON receive_items(item_id);

-- ===================
-- RLS POLICIES
-- ===================

-- Enable RLS
ALTER TABLE receives ENABLE ROW LEVEL SECURITY;
ALTER TABLE receive_items ENABLE ROW LEVEL SECURITY;

-- RECEIVES POLICIES
DROP POLICY IF EXISTS "Users can view tenant receives" ON receives;
CREATE POLICY "Users can view tenant receives" ON receives
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert receives" ON receives;
CREATE POLICY "Editors can insert receives" ON receives
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update receives" ON receives;
CREATE POLICY "Editors can update receives" ON receives
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete receives" ON receives;
CREATE POLICY "Admins can delete receives" ON receives
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- RECEIVE ITEMS POLICIES (based on parent receive access)
DROP POLICY IF EXISTS "Users can view receive items" ON receive_items;
CREATE POLICY "Users can view receive items" ON receive_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM receives r
            WHERE r.id = receive_items.receive_id
            AND r.tenant_id = get_user_tenant_id()
        )
    );

DROP POLICY IF EXISTS "Editors can insert receive items" ON receive_items;
CREATE POLICY "Editors can insert receive items" ON receive_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM receives r
            WHERE r.id = receive_items.receive_id
            AND r.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update receive items" ON receive_items;
CREATE POLICY "Editors can update receive items" ON receive_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM receives r
            WHERE r.id = receive_items.receive_id
            AND r.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can delete receive items" ON receive_items;
CREATE POLICY "Editors can delete receive items" ON receive_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM receives r
            WHERE r.id = receive_items.receive_id
            AND r.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- ===================
-- TRIGGER: Update updated_at on receives
-- ===================
CREATE OR REPLACE FUNCTION update_receives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_receives_updated_at ON receives;
CREATE TRIGGER trigger_receives_updated_at
    BEFORE UPDATE ON receives
    FOR EACH ROW
    EXECUTE FUNCTION update_receives_updated_at();

DROP TRIGGER IF EXISTS trigger_receive_items_updated_at ON receive_items;
CREATE TRIGGER trigger_receive_items_updated_at
    BEFORE UPDATE ON receive_items
    FOR EACH ROW
    EXECUTE FUNCTION update_receives_updated_at();

-- ===================
-- RPC FUNCTIONS
-- ===================

-- Create a new receive from a PO
CREATE OR REPLACE FUNCTION create_receive(
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
BEGIN
    -- Get tenant ID
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User has no associated tenant');
    END IF;

    -- Verify PO exists and is in a receivable status
    SELECT status INTO v_po_status
    FROM purchase_orders
    WHERE id = p_purchase_order_id AND tenant_id = v_tenant_id;

    IF v_po_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Purchase order not found');
    END IF;

    IF v_po_status NOT IN ('submitted', 'confirmed', 'partial') THEN
        RETURN json_build_object('success', false, 'error', 'Purchase order is not in a receivable status');
    END IF;

    -- Generate display ID
    v_display_id := generate_display_id(v_tenant_id, 'receive');

    -- Create receive
    INSERT INTO receives (
        tenant_id, display_id, purchase_order_id,
        delivery_note_number, carrier, tracking_number,
        default_location_id, notes, created_by
    ) VALUES (
        v_tenant_id, v_display_id, p_purchase_order_id,
        p_delivery_note_number, p_carrier, p_tracking_number,
        p_default_location_id, p_notes, auth.uid()
    ) RETURNING id INTO v_receive_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id, entity_name, action_type
    ) VALUES (
        v_tenant_id, auth.uid(), 'receive', v_receive_id, v_display_id, 'create'
    );

    RETURN json_build_object(
        'success', true,
        'id', v_receive_id,
        'display_id', v_display_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add item to a receive
CREATE OR REPLACE FUNCTION add_receive_item(
    p_receive_id UUID,
    p_purchase_order_item_id UUID,
    p_quantity_received INTEGER,
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
    v_item_id UUID;
    v_tenant_id UUID;
    v_receive_status receive_status;
    v_remaining_qty INTEGER;
    v_ordered_qty INTEGER;
    v_already_received INTEGER;
BEGIN
    -- Get tenant ID and verify receive access
    SELECT r.tenant_id, r.status INTO v_tenant_id, v_receive_status
    FROM receives r
    WHERE r.id = p_receive_id AND r.tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Receive not found');
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('success', false, 'error', 'Can only add items to draft receives');
    END IF;

    -- Get PO item info
    SELECT poi.item_id, poi.ordered_quantity, poi.received_quantity
    INTO v_item_id, v_ordered_qty, v_already_received
    FROM purchase_order_items poi
    WHERE poi.id = p_purchase_order_item_id;

    IF v_ordered_qty IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Purchase order item not found');
    END IF;

    -- Calculate remaining quantity
    v_remaining_qty := v_ordered_qty - COALESCE(v_already_received, 0);

    -- Validate quantity (allow over-receiving with warning)
    IF p_quantity_received <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Quantity must be greater than 0');
    END IF;

    -- Insert receive item
    INSERT INTO receive_items (
        receive_id, purchase_order_item_id, item_id,
        quantity_received, lot_number, batch_code,
        expiry_date, manufactured_date, location_id,
        condition, notes
    ) VALUES (
        p_receive_id, p_purchase_order_item_id, v_item_id,
        p_quantity_received, p_lot_number, p_batch_code,
        p_expiry_date, p_manufactured_date, p_location_id,
        p_condition, p_notes
    ) RETURNING id INTO v_receive_item_id;

    RETURN json_build_object(
        'success', true,
        'id', v_receive_item_id,
        'item_id', v_item_id,
        'over_received', p_quantity_received > v_remaining_qty
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update receive item
CREATE OR REPLACE FUNCTION update_receive_item(
    p_receive_item_id UUID,
    p_quantity_received INTEGER DEFAULT NULL,
    p_lot_number VARCHAR DEFAULT NULL,
    p_batch_code VARCHAR DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL,
    p_manufactured_date DATE DEFAULT NULL,
    p_location_id UUID DEFAULT NULL,
    p_condition receive_item_condition DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_receive_status receive_status;
BEGIN
    -- Verify receive is in draft status
    SELECT r.status INTO v_receive_status
    FROM receive_items ri
    JOIN receives r ON r.id = ri.receive_id
    WHERE ri.id = p_receive_item_id AND r.tenant_id = get_user_tenant_id();

    IF v_receive_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Receive item not found');
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('success', false, 'error', 'Can only update items in draft receives');
    END IF;

    -- Update the item
    UPDATE receive_items
    SET
        quantity_received = COALESCE(p_quantity_received, quantity_received),
        lot_number = COALESCE(p_lot_number, lot_number),
        batch_code = COALESCE(p_batch_code, batch_code),
        expiry_date = COALESCE(p_expiry_date, expiry_date),
        manufactured_date = COALESCE(p_manufactured_date, manufactured_date),
        location_id = COALESCE(p_location_id, location_id),
        condition = COALESCE(p_condition, condition),
        notes = COALESCE(p_notes, notes)
    WHERE id = p_receive_item_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove receive item
CREATE OR REPLACE FUNCTION remove_receive_item(p_receive_item_id UUID)
RETURNS JSON AS $$
DECLARE
    v_receive_status receive_status;
BEGIN
    -- Verify receive is in draft status
    SELECT r.status INTO v_receive_status
    FROM receive_items ri
    JOIN receives r ON r.id = ri.receive_id
    WHERE ri.id = p_receive_item_id AND r.tenant_id = get_user_tenant_id();

    IF v_receive_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Receive item not found');
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('success', false, 'error', 'Can only remove items from draft receives');
    END IF;

    DELETE FROM receive_items WHERE id = p_receive_item_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete receive - updates inventory
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
BEGIN
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

    -- Process each receive item
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

    -- Check if all PO items are fully received
    SELECT NOT EXISTS (
        SELECT 1 FROM purchase_order_items
        WHERE purchase_order_id = v_po_id
        AND COALESCE(received_quantity, 0) < ordered_quantity
    ) INTO v_all_po_items_received;

    -- Update PO status
    IF v_all_po_items_received THEN
        UPDATE purchase_orders
        SET status = 'received', received_date = CURRENT_DATE
        WHERE id = v_po_id;
    ELSE
        UPDATE purchase_orders
        SET status = 'partial'
        WHERE id = v_po_id AND status IN ('submitted', 'confirmed');
    END IF;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id, entity_name, action_type,
        changes
    ) VALUES (
        v_tenant_id, auth.uid(), 'receive', p_receive_id, v_display_id, 'complete',
        jsonb_build_object(
            'items_processed', v_items_processed,
            'lots_created', v_lots_created,
            'purchase_order_id', v_po_id
        )
    );

    RETURN json_build_object(
        'success', true,
        'items_processed', v_items_processed,
        'lots_created', v_lots_created,
        'po_fully_received', v_all_po_items_received
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel receive
CREATE OR REPLACE FUNCTION cancel_receive(p_receive_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_receive_status receive_status;
    v_display_id VARCHAR;
BEGIN
    SELECT r.tenant_id, r.status, r.display_id
    INTO v_tenant_id, v_receive_status, v_display_id
    FROM receives r
    WHERE r.id = p_receive_id AND r.tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Receive not found');
    END IF;

    IF v_receive_status != 'draft' THEN
        RETURN json_build_object('success', false, 'error', 'Can only cancel draft receives');
    END IF;

    UPDATE receives
    SET status = 'cancelled', cancelled_at = NOW()
    WHERE id = p_receive_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id, entity_name, action_type
    ) VALUES (
        v_tenant_id, auth.uid(), 'receive', p_receive_id, v_display_id, 'cancel'
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get receives for a PO
CREATE OR REPLACE FUNCTION get_po_receives(p_purchase_order_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', r.id,
            'display_id', r.display_id,
            'status', r.status,
            'received_date', r.received_date,
            'delivery_note_number', r.delivery_note_number,
            'carrier', r.carrier,
            'tracking_number', r.tracking_number,
            'items_count', (SELECT COUNT(*) FROM receive_items ri WHERE ri.receive_id = r.id),
            'total_quantity', (SELECT COALESCE(SUM(quantity_received), 0) FROM receive_items ri WHERE ri.receive_id = r.id),
            'received_by_name', (SELECT full_name FROM profiles WHERE id = r.received_by),
            'completed_at', r.completed_at,
            'created_at', r.created_at
        ) ORDER BY r.created_at DESC
    ) INTO v_result
    FROM receives r
    WHERE r.purchase_order_id = p_purchase_order_id
    AND r.tenant_id = get_user_tenant_id();

    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get receive with items
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
            'received_date', r.received_date,
            'delivery_note_number', r.delivery_note_number,
            'carrier', r.carrier,
            'tracking_number', r.tracking_number,
            'default_location_id', r.default_location_id,
            'default_location_name', (SELECT name FROM locations WHERE id = r.default_location_id),
            'notes', r.notes,
            'completed_at', r.completed_at,
            'created_at', r.created_at,
            'received_by_name', (SELECT full_name FROM profiles WHERE id = r.received_by),
            'created_by_name', (SELECT full_name FROM profiles WHERE id = r.created_by)
        ),
        'purchase_order', json_build_object(
            'id', po.id,
            'display_id', po.display_id,
            'order_number', po.order_number,
            'status', po.status,
            'vendor_name', (SELECT name FROM vendors WHERE id = po.vendor_id)
        ),
        'items', COALESCE((
            SELECT json_agg(
                json_build_object(
                    'id', ri.id,
                    'purchase_order_item_id', ri.purchase_order_item_id,
                    'item_id', ri.item_id,
                    'item_name', poi.item_name,
                    'item_sku', poi.sku,
                    'ordered_quantity', poi.ordered_quantity,
                    'already_received', COALESCE(poi.received_quantity, 0) - ri.quantity_received,
                    'quantity_received', ri.quantity_received,
                    'lot_number', ri.lot_number,
                    'batch_code', ri.batch_code,
                    'expiry_date', ri.expiry_date,
                    'manufactured_date', ri.manufactured_date,
                    'location_id', ri.location_id,
                    'location_name', (SELECT name FROM locations WHERE id = ri.location_id),
                    'condition', ri.condition,
                    'notes', ri.notes,
                    'item_image', ii.image_urls[1],
                    'item_tracking_mode', ii.tracking_mode
                ) ORDER BY poi.item_name
            )
            FROM receive_items ri
            JOIN purchase_order_items poi ON poi.id = ri.purchase_order_item_id
            LEFT JOIN inventory_items ii ON ii.id = ri.item_id
            WHERE ri.receive_id = r.id
        ), '[]'::json)
    ) INTO v_result
    FROM receives r
    JOIN purchase_orders po ON po.id = r.purchase_order_id
    WHERE r.id = p_receive_id
    AND r.tenant_id = get_user_tenant_id();

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- Initialize counters for existing tenants
-- ===================
INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
SELECT t.id, 'receive', 0
FROM tenants t
ON CONFLICT (tenant_id, entity_type) DO NOTHING;

-- ===================
-- Update generate_display_id to handle receive entity type
-- ===================
CREATE OR REPLACE FUNCTION generate_display_id(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_code VARCHAR(5);
    v_prefix VARCHAR(4);
    v_sequence BIGINT;
BEGIN
    -- Get org code for tenant
    SELECT org_code INTO v_org_code
    FROM tenants
    WHERE id = p_tenant_id;

    IF v_org_code IS NULL THEN
        RAISE EXCEPTION 'Tenant org_code not found for tenant_id %', p_tenant_id;
    END IF;

    -- Determine prefix based on entity type
    v_prefix := CASE p_entity_type
        WHEN 'pick_list' THEN 'PL'
        WHEN 'purchase_order' THEN 'PO'
        WHEN 'stock_count' THEN 'SC'
        WHEN 'receive' THEN 'RCV'
        WHEN 'item' THEN 'ITM'
        WHEN 'folder' THEN 'FLD'
        ELSE UPPER(LEFT(p_entity_type, 3))
    END;

    -- Get next sequence number (atomically)
    v_sequence := get_next_entity_number(p_tenant_id, p_entity_type);

    -- Format: PREFIX-ORGCODE-SEQUENCE (e.g., RCV-ACM01-00001)
    RETURN v_prefix || '-' || v_org_code || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$;

-- ===================
-- Comments
-- ===================
COMMENT ON TABLE receives IS 'Goods Received Notes (GRN) - formal receiving documents for purchase orders';
COMMENT ON TABLE receive_items IS 'Line items in a receive document with lot tracking and location assignment';
COMMENT ON FUNCTION create_receive IS 'Creates a new receive document from a purchase order';
COMMENT ON FUNCTION add_receive_item IS 'Adds an item to a draft receive';
COMMENT ON FUNCTION update_receive_item IS 'Updates an item in a draft receive';
COMMENT ON FUNCTION remove_receive_item IS 'Removes an item from a draft receive';
COMMENT ON FUNCTION complete_receive IS 'Completes a receive: updates inventory, creates lots, updates PO status';
COMMENT ON FUNCTION cancel_receive IS 'Cancels a draft receive';
COMMENT ON FUNCTION get_po_receives IS 'Gets all receives for a purchase order';
COMMENT ON FUNCTION get_receive_with_items IS 'Gets receive details with all items and related info';

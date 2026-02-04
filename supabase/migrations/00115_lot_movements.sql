-- ============================================
-- Migration: 00115_lot_movements.sql
-- Purpose: Add lot_movements table for tracking lot quantity changes
-- Required by: stock_out_fifo function (00110)
-- ============================================

-- ===================
-- LOT MOVEMENTS TABLE
-- Tracks all quantity changes for lots (stock in, stock out, adjustments)
-- ===================
CREATE TABLE IF NOT EXISTS lot_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,

    -- Movement details
    movement_type VARCHAR(50) NOT NULL,  -- 'stock_in', 'stock_out', 'adjustment', 'transfer'
    quantity INTEGER NOT NULL,           -- Positive for in, negative for out
    reason TEXT,

    -- Reference to source document (optional)
    reference_type VARCHAR(50),          -- 'receive', 'sales_order', 'adjustment', etc.
    reference_id UUID,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lot_movements_lot ON lot_movements(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_movements_type ON lot_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_lot_movements_created ON lot_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lot_movements_reference ON lot_movements(reference_type, reference_id)
    WHERE reference_id IS NOT NULL;

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE lot_movements ENABLE ROW LEVEL SECURITY;

-- View: Users can view movements for lots in their tenant
DROP POLICY IF EXISTS "Users can view tenant lot_movements" ON lot_movements;
CREATE POLICY "Users can view tenant lot_movements" ON lot_movements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lots l
            WHERE l.id = lot_movements.lot_id
            AND l.tenant_id = get_user_tenant_id()
        )
    );

-- Insert: Editors can insert movements
DROP POLICY IF EXISTS "Editors can insert lot_movements" ON lot_movements;
CREATE POLICY "Editors can insert lot_movements" ON lot_movements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lots l
            WHERE l.id = lot_movements.lot_id
            AND l.tenant_id = get_user_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- No update/delete - movements are immutable audit records

-- ===================
-- HELPER FUNCTION: Get lot movement history
-- ===================
CREATE OR REPLACE FUNCTION get_lot_movements(
    p_lot_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.created_at DESC), '[]'::json)
        FROM (
            SELECT
                lm.id,
                lm.movement_type,
                lm.quantity,
                lm.reason,
                lm.reference_type,
                lm.reference_id,
                lm.created_at,
                p.full_name as created_by_name
            FROM lot_movements lm
            LEFT JOIN profiles p ON p.id = lm.created_by
            JOIN lots l ON l.id = lm.lot_id
            WHERE lm.lot_id = p_lot_id
            AND l.tenant_id = get_user_tenant_id()
            LIMIT p_limit
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- UPDATE create_lot TO LOG MOVEMENT
-- ===================
CREATE OR REPLACE FUNCTION create_lot(
    p_item_id UUID,
    p_quantity INTEGER,
    p_lot_number VARCHAR DEFAULT NULL,
    p_batch_code VARCHAR DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL,
    p_manufactured_date DATE DEFAULT NULL,
    p_location_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_lot_id UUID;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
BEGIN
    -- Get tenant and user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Get item name
    SELECT name INTO v_item_name
    FROM inventory_items WHERE id = p_item_id AND tenant_id = v_tenant_id;

    IF v_item_name IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Create lot
    INSERT INTO lots (
        tenant_id, item_id, location_id, lot_number, batch_code,
        expiry_date, manufactured_date, quantity, notes, created_by
    ) VALUES (
        v_tenant_id, p_item_id, p_location_id, p_lot_number, p_batch_code,
        p_expiry_date, p_manufactured_date, p_quantity, p_notes, auth.uid()
    ) RETURNING id INTO v_lot_id;

    -- Log movement
    INSERT INTO lot_movements (
        lot_id,
        movement_type,
        quantity,
        reason,
        reference_type,
        created_by,
        created_at
    ) VALUES (
        v_lot_id,
        'stock_in',
        p_quantity,
        'Initial lot creation',
        'receive',
        auth.uid(),
        NOW()
    );

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, quantity_delta, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
        'receive_lot',
        p_quantity,
        jsonb_build_object(
            'lot_id', v_lot_id,
            'lot_number', p_lot_number,
            'batch_code', p_batch_code,
            'expiry_date', p_expiry_date,
            'location_id', p_location_id
        )
    );

    RETURN json_build_object(
        'success', true,
        'lot_id', v_lot_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- UPDATE adjust_lot_quantity TO LOG MOVEMENT
-- ===================
CREATE OR REPLACE FUNCTION adjust_lot_quantity(
    p_lot_id UUID,
    p_quantity_delta INTEGER,
    p_reason VARCHAR DEFAULT 'adjustment'
)
RETURNS JSON AS $$
DECLARE
    v_lot RECORD;
    v_new_quantity INTEGER;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
BEGIN
    -- Get lot details
    SELECT l.*, i.name as item_name INTO v_lot
    FROM lots l
    JOIN inventory_items i ON i.id = l.item_id
    WHERE l.id = p_lot_id AND l.tenant_id = get_user_tenant_id();

    IF v_lot IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Lot not found');
    END IF;

    -- Calculate new quantity
    v_new_quantity := v_lot.quantity + p_quantity_delta;

    IF v_new_quantity < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient quantity in lot');
    END IF;

    -- Get user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Update lot
    UPDATE lots
    SET
        quantity = v_new_quantity,
        status = CASE WHEN v_new_quantity = 0 THEN 'depleted'::lot_status ELSE status END
    WHERE id = p_lot_id;

    -- Log movement
    INSERT INTO lot_movements (
        lot_id,
        movement_type,
        quantity,
        reason,
        reference_type,
        created_by,
        created_at
    ) VALUES (
        p_lot_id,
        CASE WHEN p_quantity_delta > 0 THEN 'stock_in' ELSE 'stock_out' END,
        p_quantity_delta,
        p_reason,
        'adjustment',
        auth.uid(),
        NOW()
    );

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, quantity_delta, quantity_before, quantity_after, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', v_lot.item_id, v_lot.item_name,
        'adjust_lot',
        p_quantity_delta,
        v_lot.quantity,
        v_new_quantity,
        jsonb_build_object(
            'lot_id', p_lot_id,
            'lot_number', v_lot.lot_number,
            'reason', p_reason
        )
    );

    RETURN json_build_object('success', true, 'new_quantity', v_new_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

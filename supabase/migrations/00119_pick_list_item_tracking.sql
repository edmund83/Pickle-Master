-- ============================================
-- Migration: 00119_pick_list_item_tracking.sql
-- Purpose: Add serial/lot tracking tables for pick list items
-- Links picked items to specific lots and serial numbers
-- ============================================

-- ============================================================================
-- PICK_LIST_ITEM_LOTS TABLE
-- Tracks which lots are allocated to each pick list item
-- ============================================================================

CREATE TABLE IF NOT EXISTS pick_list_item_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pick_list_item_id UUID NOT NULL REFERENCES pick_list_items(id) ON DELETE CASCADE,
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Ensure unique lot per pick list item
    CONSTRAINT unique_lot_per_pick_list_item UNIQUE (pick_list_item_id, lot_id)
);

-- Indexes for performance
-- Note: idx on pick_list_item_id is not needed - unique constraint already provides it
CREATE INDEX IF NOT EXISTS idx_pick_list_item_lots_lot
    ON pick_list_item_lots(lot_id);
CREATE INDEX IF NOT EXISTS idx_pick_list_item_lots_tenant
    ON pick_list_item_lots(tenant_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_pick_list_item_lots_updated_at ON pick_list_item_lots;
CREATE TRIGGER trigger_pick_list_item_lots_updated_at
    BEFORE UPDATE ON pick_list_item_lots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- PICK_LIST_ITEM_SERIALS TABLE
-- Tracks which serial numbers are allocated to each pick list item
-- ============================================================================

CREATE TABLE IF NOT EXISTS pick_list_item_serials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pick_list_item_id UUID NOT NULL REFERENCES pick_list_items(id) ON DELETE CASCADE,
    serial_id UUID NOT NULL REFERENCES serial_numbers(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Ensure unique serial per pick list item
    CONSTRAINT unique_serial_per_pick_list_item UNIQUE (pick_list_item_id, serial_id)
);

-- Indexes for performance
-- Note: idx on pick_list_item_id is not needed - unique constraint already provides it
CREATE INDEX IF NOT EXISTS idx_pick_list_item_serials_serial
    ON pick_list_item_serials(serial_id);
CREATE INDEX IF NOT EXISTS idx_pick_list_item_serials_tenant
    ON pick_list_item_serials(tenant_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_pick_list_item_serials_updated_at ON pick_list_item_serials;
CREATE TRIGGER trigger_pick_list_item_serials_updated_at
    BEFORE UPDATE ON pick_list_item_serials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- RLS POLICIES FOR PICK_LIST_ITEM_LOTS
-- ============================================================================

ALTER TABLE pick_list_item_lots ENABLE ROW LEVEL SECURITY;

-- Editors can manage lot allocations in their tenant
DROP POLICY IF EXISTS "Users can view tenant pick_list_item_lots" ON pick_list_item_lots;
DROP POLICY IF EXISTS "Editors can insert pick_list_item_lots" ON pick_list_item_lots;
DROP POLICY IF EXISTS "Editors can update pick_list_item_lots" ON pick_list_item_lots;
DROP POLICY IF EXISTS "Editors can delete pick_list_item_lots" ON pick_list_item_lots;
DROP POLICY IF EXISTS "Editors can manage pick_list_item_lots" ON pick_list_item_lots;
CREATE POLICY "Editors can manage pick_list_item_lots" ON pick_list_item_lots
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND can_edit()
    );

-- ============================================================================
-- RLS POLICIES FOR PICK_LIST_ITEM_SERIALS
-- ============================================================================

ALTER TABLE pick_list_item_serials ENABLE ROW LEVEL SECURITY;

-- Editors can manage serial allocations in their tenant
DROP POLICY IF EXISTS "Users can view tenant pick_list_item_serials" ON pick_list_item_serials;
DROP POLICY IF EXISTS "Editors can insert pick_list_item_serials" ON pick_list_item_serials;
DROP POLICY IF EXISTS "Editors can update pick_list_item_serials" ON pick_list_item_serials;
DROP POLICY IF EXISTS "Editors can delete pick_list_item_serials" ON pick_list_item_serials;
DROP POLICY IF EXISTS "Editors can manage pick_list_item_serials" ON pick_list_item_serials;
CREATE POLICY "Editors can manage pick_list_item_serials" ON pick_list_item_serials
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND can_edit()
    );

-- ============================================================================
-- ADD QUANTITY COLUMN TO DELIVERY_ORDER_ITEM_SERIALS
-- For lot quantity support (serials are always quantity=1)
-- ============================================================================

ALTER TABLE delivery_order_item_serials
    ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON pick_list_item_lots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pick_list_item_serials TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE pick_list_item_lots IS 'Tracks which lots are allocated to each pick list item. Quantity indicates how many units from each lot.';
COMMENT ON TABLE pick_list_item_serials IS 'Tracks which serial numbers are allocated to each pick list item. Each row represents one serialized unit.';
COMMENT ON COLUMN delivery_order_item_serials.quantity IS 'Quantity from this lot/serial. Always 1 for serials, variable for lots.';

-- ============================================
-- Migration: 00015_multi_location_inventory.sql
-- Purpose: Multi-location inventory tracking for small-business logistics
-- Feature-flagged: Only enabled when tenant.settings.features_enabled.multi_location = true
-- ============================================

-- ===================
-- ENUM TYPES
-- ===================

-- Location types for small business
CREATE TYPE location_type AS ENUM ('warehouse', 'van', 'store', 'job_site');

-- Transfer status
CREATE TYPE transfer_status AS ENUM ('pending', 'in_transit', 'completed', 'cancelled');

-- ===================
-- LOCATIONS TABLE
-- Physical storage locations: warehouses, vans, stores, job sites
-- ===================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    type location_type NOT NULL DEFAULT 'warehouse',
    description TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_location_name_per_tenant UNIQUE (tenant_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_locations_tenant ON locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(tenant_id) WHERE is_active = true;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_locations_updated_at ON locations;
CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- LOCATION_STOCK TABLE
-- Tracks quantity of each item at each location
-- ===================
CREATE TABLE IF NOT EXISTS location_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- The item and where it is
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- How many at this location
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),

    -- Per-location min stock (optional - for location-specific alerts)
    min_quantity INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One record per item-location pair
    CONSTRAINT unique_item_per_location UNIQUE (item_id, location_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_location_stock_tenant ON location_stock(tenant_id);
CREATE INDEX IF NOT EXISTS idx_location_stock_item ON location_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_location_stock_location ON location_stock(location_id);
CREATE INDEX IF NOT EXISTS idx_location_stock_low ON location_stock(location_id)
    WHERE quantity > 0 AND quantity <= min_quantity;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_location_stock_updated_at ON location_stock;
CREATE TRIGGER trigger_location_stock_updated_at
    BEFORE UPDATE ON location_stock
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- STOCK_TRANSFERS TABLE
-- Tracks movement of items between locations
-- ===================
CREATE TABLE IF NOT EXISTS stock_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- What's being transferred
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    -- From where to where
    from_location_id UUID NOT NULL REFERENCES locations(id),
    to_location_id UUID NOT NULL REFERENCES locations(id),

    -- Status tracking
    status transfer_status DEFAULT 'pending',

    -- AI suggestion tracking
    is_ai_suggested BOOLEAN DEFAULT FALSE,
    ai_suggestion_reason TEXT,

    -- User actions
    requested_by UUID REFERENCES profiles(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),

    completed_by UUID REFERENCES profiles(id),
    completed_at TIMESTAMPTZ,

    -- Optional notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Can't transfer to same location
    CONSTRAINT different_locations CHECK (from_location_id != to_location_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transfers_tenant ON stock_transfers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transfers_item ON stock_transfers(item_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from ON stock_transfers(from_location_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON stock_transfers(to_location_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON stock_transfers(status) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_transfers_pending ON stock_transfers(tenant_id, status) WHERE status = 'pending';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_stock_transfers_updated_at ON stock_transfers;
CREATE TRIGGER trigger_stock_transfers_updated_at
    BEFORE UPDATE ON stock_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- RLS POLICIES
-- ===================

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;

-- LOCATIONS POLICIES
DROP POLICY IF EXISTS "Users can view tenant locations" ON locations;
CREATE POLICY "Users can view tenant locations" ON locations
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert locations" ON locations;
CREATE POLICY "Editors can insert locations" ON locations
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update locations" ON locations;
CREATE POLICY "Editors can update locations" ON locations
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete locations" ON locations;
CREATE POLICY "Admins can delete locations" ON locations
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- LOCATION_STOCK POLICIES
DROP POLICY IF EXISTS "Users can view tenant stock" ON location_stock;
CREATE POLICY "Users can view tenant stock" ON location_stock
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert stock" ON location_stock;
CREATE POLICY "Editors can insert stock" ON location_stock
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update stock" ON location_stock;
CREATE POLICY "Editors can update stock" ON location_stock
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete stock" ON location_stock;
CREATE POLICY "Admins can delete stock" ON location_stock
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- STOCK_TRANSFERS POLICIES
DROP POLICY IF EXISTS "Users can view tenant transfers" ON stock_transfers;
CREATE POLICY "Users can view tenant transfers" ON stock_transfers
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert transfers" ON stock_transfers;
CREATE POLICY "Editors can insert transfers" ON stock_transfers
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update transfers" ON stock_transfers;
CREATE POLICY "Editors can update transfers" ON stock_transfers
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete transfers" ON stock_transfers;
CREATE POLICY "Admins can delete transfers" ON stock_transfers
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- SYNC TRIGGER
-- Keep inventory_items.quantity in sync with sum of location_stock
-- ===================
CREATE OR REPLACE FUNCTION sync_item_total_quantity()
RETURNS TRIGGER AS $$
DECLARE
    v_total INTEGER;
    v_item_id UUID;
BEGIN
    -- Get the item_id from either NEW or OLD
    v_item_id := COALESCE(NEW.item_id, OLD.item_id);

    -- Calculate new total from all locations
    SELECT COALESCE(SUM(quantity), 0) INTO v_total
    FROM location_stock
    WHERE item_id = v_item_id;

    -- Update the master item quantity
    UPDATE inventory_items
    SET quantity = v_total
    WHERE id = v_item_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_item_quantity ON location_stock;
CREATE TRIGGER trigger_sync_item_quantity
    AFTER INSERT OR UPDATE OR DELETE ON location_stock
    FOR EACH ROW
    EXECUTE FUNCTION sync_item_total_quantity();

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Execute a transfer (atomically move stock between locations)
CREATE OR REPLACE FUNCTION execute_transfer(p_transfer_id UUID)
RETURNS JSON AS $$
DECLARE
    v_transfer RECORD;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
    v_from_location_name VARCHAR;
    v_to_location_name VARCHAR;
    v_from_qty INTEGER;
BEGIN
    -- Get transfer details
    SELECT * INTO v_transfer FROM stock_transfers WHERE id = p_transfer_id;

    IF v_transfer IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Transfer not found');
    END IF;

    IF v_transfer.status != 'pending' AND v_transfer.status != 'in_transit' THEN
        RETURN json_build_object('success', false, 'error', 'Transfer already processed');
    END IF;

    -- Verify tenant access
    IF v_transfer.tenant_id != get_user_tenant_id() THEN
        RETURN json_build_object('success', false, 'error', 'Access denied');
    END IF;

    -- Get names for logging
    SELECT name INTO v_item_name FROM inventory_items WHERE id = v_transfer.item_id;
    SELECT name INTO v_from_location_name FROM locations WHERE id = v_transfer.from_location_id;
    SELECT name INTO v_to_location_name FROM locations WHERE id = v_transfer.to_location_id;

    -- Get current from-location stock
    SELECT quantity INTO v_from_qty
    FROM location_stock
    WHERE item_id = v_transfer.item_id AND location_id = v_transfer.from_location_id;

    IF v_from_qty IS NULL OR v_from_qty < v_transfer.quantity THEN
        RETURN json_build_object(
            'success', false,
            'error', format('Insufficient stock at %s (have %s, need %s)',
                v_from_location_name, COALESCE(v_from_qty, 0), v_transfer.quantity)
        );
    END IF;

    -- Get user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Decrease from-location
    UPDATE location_stock
    SET quantity = quantity - v_transfer.quantity
    WHERE item_id = v_transfer.item_id AND location_id = v_transfer.from_location_id;

    -- Increase to-location (upsert)
    INSERT INTO location_stock (tenant_id, item_id, location_id, quantity)
    VALUES (v_tenant_id, v_transfer.item_id, v_transfer.to_location_id, v_transfer.quantity)
    ON CONFLICT (item_id, location_id)
    DO UPDATE SET quantity = location_stock.quantity + v_transfer.quantity;

    -- Mark transfer complete
    UPDATE stock_transfers
    SET status = 'completed', completed_by = auth.uid(), completed_at = NOW()
    WHERE id = p_transfer_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, quantity_delta, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', v_transfer.item_id, v_item_name,
        'transfer',
        v_transfer.quantity,
        jsonb_build_object(
            'transfer_id', p_transfer_id,
            'from_location', v_from_location_name,
            'to_location', v_to_location_name,
            'quantity', v_transfer.quantity
        )
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get inventory at a specific location
CREATE OR REPLACE FUNCTION get_location_inventory(
    p_location_id UUID,
    p_include_zero BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                ls.item_id,
                i.name as item_name,
                i.sku,
                ls.quantity,
                ls.min_quantity,
                i.image_urls[1] as item_image,
                CASE
                    WHEN ls.quantity <= 0 THEN 'out_of_stock'
                    WHEN ls.min_quantity > 0 AND ls.quantity <= ls.min_quantity THEN 'low_stock'
                    ELSE 'in_stock'
                END as location_status
            FROM location_stock ls
            JOIN inventory_items i ON i.id = ls.item_id
            WHERE ls.location_id = p_location_id
            AND ls.tenant_id = get_user_tenant_id()
            AND (p_include_zero OR ls.quantity > 0)
            ORDER BY i.name
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get all locations for an item (where is this item distributed?)
CREATE OR REPLACE FUNCTION get_item_locations(p_item_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                ls.location_id,
                l.name as location_name,
                l.type as location_type,
                ls.quantity,
                ls.min_quantity,
                CASE
                    WHEN ls.quantity <= 0 THEN 'out_of_stock'
                    WHEN ls.min_quantity > 0 AND ls.quantity <= ls.min_quantity THEN 'low_stock'
                    ELSE 'in_stock'
                END as status
            FROM location_stock ls
            JOIN locations l ON l.id = ls.location_id
            WHERE ls.item_id = p_item_id
            AND ls.tenant_id = get_user_tenant_id()
            AND l.is_active = true
            ORDER BY ls.quantity DESC
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- AI Transfer Suggestions - find items low at one location but available elsewhere
CREATE OR REPLACE FUNCTION get_transfer_suggestions()
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                ls_low.item_id,
                i.name as item_name,
                i.sku,
                i.image_urls[1] as item_image,
                ls_low.location_id as to_location_id,
                l_low.name as to_location_name,
                l_low.type as to_location_type,
                ls_low.quantity as current_qty,
                ls_low.min_quantity,
                ls_high.location_id as from_location_id,
                l_high.name as from_location_name,
                l_high.type as from_location_type,
                ls_high.quantity as available_qty,
                -- Suggest transferring enough to reach min + 50% buffer, but don't deplete source
                LEAST(
                    ls_high.quantity - COALESCE(ls_high.min_quantity, 0),
                    GREATEST(ls_low.min_quantity - ls_low.quantity + (ls_low.min_quantity / 2), 1)
                ) as suggested_qty,
                format('%s is low on %s (%s left, min %s). %s has %s available.',
                    l_low.name, i.name, ls_low.quantity, ls_low.min_quantity,
                    l_high.name, ls_high.quantity
                ) as reason
            FROM location_stock ls_low
            JOIN locations l_low ON l_low.id = ls_low.location_id
            JOIN inventory_items i ON i.id = ls_low.item_id
            -- Find same item with higher stock elsewhere
            JOIN location_stock ls_high ON ls_high.item_id = ls_low.item_id
                AND ls_high.location_id != ls_low.location_id
                AND ls_high.quantity > COALESCE(ls_high.min_quantity, 0) + 5
            JOIN locations l_high ON l_high.id = ls_high.location_id
            WHERE ls_low.tenant_id = tenant
            AND ls_low.min_quantity > 0
            AND ls_low.quantity <= ls_low.min_quantity
            AND l_low.is_active = true
            AND l_high.is_active = true
            ORDER BY
                (ls_low.min_quantity - ls_low.quantity) DESC,
                ls_high.quantity DESC
            LIMIT 10
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get all locations for tenant
CREATE OR REPLACE FUNCTION get_locations(p_include_inactive BOOLEAN DEFAULT FALSE)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                l.id,
                l.name,
                l.type,
                l.description,
                l.is_active,
                l.created_at,
                (
                    SELECT COUNT(DISTINCT ls.item_id)
                    FROM location_stock ls
                    WHERE ls.location_id = l.id AND ls.quantity > 0
                ) as item_count,
                (
                    SELECT COALESCE(SUM(ls.quantity), 0)
                    FROM location_stock ls
                    WHERE ls.location_id = l.id
                ) as total_quantity
            FROM locations l
            WHERE l.tenant_id = get_user_tenant_id()
            AND (p_include_inactive OR l.is_active = true)
            ORDER BY l.name
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a new location
CREATE OR REPLACE FUNCTION create_location(
    p_name VARCHAR,
    p_type location_type DEFAULT 'warehouse',
    p_description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_location_id UUID;
    v_tenant_id UUID;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    INSERT INTO locations (tenant_id, name, type, description, created_by)
    VALUES (v_tenant_id, p_name, p_type, p_description, auth.uid())
    RETURNING id INTO v_location_id;

    RETURN json_build_object(
        'success', true,
        'location_id', v_location_id
    );
EXCEPTION WHEN unique_violation THEN
    RETURN json_build_object(
        'success', false,
        'error', format('Location "%s" already exists', p_name)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Request a transfer (creates pending transfer)
CREATE OR REPLACE FUNCTION request_transfer(
    p_item_id UUID,
    p_quantity INTEGER,
    p_from_location_id UUID,
    p_to_location_id UUID,
    p_notes TEXT DEFAULT NULL,
    p_is_ai_suggested BOOLEAN DEFAULT FALSE,
    p_ai_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_transfer_id UUID;
    v_tenant_id UUID;
    v_from_qty INTEGER;
    v_from_name VARCHAR;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    -- Check from-location has enough stock
    SELECT ls.quantity, l.name INTO v_from_qty, v_from_name
    FROM location_stock ls
    JOIN locations l ON l.id = ls.location_id
    WHERE ls.item_id = p_item_id AND ls.location_id = p_from_location_id;

    IF v_from_qty IS NULL OR v_from_qty < p_quantity THEN
        RETURN json_build_object(
            'success', false,
            'error', format('Insufficient stock at %s (have %s, need %s)',
                COALESCE(v_from_name, 'source'), COALESCE(v_from_qty, 0), p_quantity)
        );
    END IF;

    INSERT INTO stock_transfers (
        tenant_id, item_id, quantity, from_location_id, to_location_id,
        notes, is_ai_suggested, ai_suggestion_reason, requested_by
    ) VALUES (
        v_tenant_id, p_item_id, p_quantity, p_from_location_id, p_to_location_id,
        p_notes, p_is_ai_suggested, p_ai_reason, auth.uid()
    ) RETURNING id INTO v_transfer_id;

    RETURN json_build_object(
        'success', true,
        'transfer_id', v_transfer_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending transfers
CREATE OR REPLACE FUNCTION get_pending_transfers()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                t.id,
                t.item_id,
                i.name as item_name,
                i.sku,
                i.image_urls[1] as item_image,
                t.quantity,
                t.from_location_id,
                fl.name as from_location_name,
                fl.type as from_location_type,
                t.to_location_id,
                tl.name as to_location_name,
                tl.type as to_location_type,
                t.status,
                t.is_ai_suggested,
                t.ai_suggestion_reason,
                t.notes,
                t.requested_at,
                p.full_name as requested_by_name
            FROM stock_transfers t
            JOIN inventory_items i ON i.id = t.item_id
            JOIN locations fl ON fl.id = t.from_location_id
            JOIN locations tl ON tl.id = t.to_location_id
            LEFT JOIN profiles p ON p.id = t.requested_by
            WHERE t.tenant_id = get_user_tenant_id()
            AND t.status IN ('pending', 'in_transit')
            ORDER BY t.requested_at DESC
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Cancel a pending transfer
CREATE OR REPLACE FUNCTION cancel_transfer(p_transfer_id UUID)
RETURNS JSON AS $$
BEGIN
    UPDATE stock_transfers
    SET status = 'cancelled'
    WHERE id = p_transfer_id
    AND tenant_id = get_user_tenant_id()
    AND status IN ('pending', 'in_transit');

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Transfer not found or already processed');
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set stock level at a location (for receiving/adjustments)
CREATE OR REPLACE FUNCTION set_location_stock(
    p_item_id UUID,
    p_location_id UUID,
    p_quantity INTEGER,
    p_min_quantity INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_old_qty INTEGER;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
    v_location_name VARCHAR;
BEGIN
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    SELECT name INTO v_item_name FROM inventory_items WHERE id = p_item_id;
    SELECT name INTO v_location_name FROM locations WHERE id = p_location_id;

    -- Get old quantity
    SELECT quantity INTO v_old_qty
    FROM location_stock
    WHERE item_id = p_item_id AND location_id = p_location_id;

    -- Upsert stock
    INSERT INTO location_stock (tenant_id, item_id, location_id, quantity, min_quantity)
    VALUES (v_tenant_id, p_item_id, p_location_id, p_quantity, COALESCE(p_min_quantity, 0))
    ON CONFLICT (item_id, location_id)
    DO UPDATE SET
        quantity = p_quantity,
        min_quantity = COALESCE(p_min_quantity, location_stock.min_quantity);

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, quantity_delta, quantity_before, quantity_after, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
        'adjust_quantity',
        p_quantity - COALESCE(v_old_qty, 0),
        COALESCE(v_old_qty, 0),
        p_quantity,
        jsonb_build_object('location', v_location_name, 'location_id', p_location_id)
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

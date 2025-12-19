-- ============================================
-- Migration: 00016_lots_and_shipping.sql
-- Purpose: Lot/Expiry tracking and shipping dimensions
-- Feature-flagged via tenant.settings.features_enabled
-- ============================================

-- ===================
-- ENUM TYPES
-- ===================

-- Tracking mode for items
CREATE TYPE item_tracking_mode AS ENUM ('none', 'serialized', 'lot_expiry');

-- Lot status
CREATE TYPE lot_status AS ENUM ('active', 'expired', 'depleted', 'blocked');

-- ===================
-- EXTEND INVENTORY_ITEMS TABLE
-- ===================

-- Add tracking mode
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS tracking_mode item_tracking_mode DEFAULT 'none';

-- Add shipping dimensions
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3) NULL,
ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg',
ADD COLUMN IF NOT EXISTS length DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS width DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS height DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS dimension_unit VARCHAR(10) DEFAULT 'cm';

-- Index for tracking mode queries
CREATE INDEX IF NOT EXISTS idx_items_tracking_mode ON inventory_items(tracking_mode)
    WHERE tracking_mode != 'none';

-- ===================
-- LOTS TABLE
-- Tracks multiple batches/lots per item with different expiry dates
-- ===================
CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- Lot identification
    lot_number VARCHAR(100),
    batch_code VARCHAR(100),

    -- Dates
    expiry_date DATE,
    manufactured_date DATE,
    received_at TIMESTAMPTZ DEFAULT NOW(),

    -- Quantity in this lot
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),

    -- Status
    status lot_status DEFAULT 'active',

    -- Notes
    notes TEXT,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lots_tenant ON lots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lots_item ON lots(item_id);
CREATE INDEX IF NOT EXISTS idx_lots_location ON lots(location_id);
CREATE INDEX IF NOT EXISTS idx_lots_expiry ON lots(expiry_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);
CREATE INDEX IF NOT EXISTS idx_lots_lot_number ON lots(tenant_id, lot_number);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_lots_updated_at ON lots;
CREATE TRIGGER trigger_lots_updated_at
    BEFORE UPDATE ON lots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- RLS POLICIES
-- ===================

ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tenant lots" ON lots;
CREATE POLICY "Users can view tenant lots" ON lots
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert lots" ON lots;
CREATE POLICY "Editors can insert lots" ON lots
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update lots" ON lots;
CREATE POLICY "Editors can update lots" ON lots
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete lots" ON lots;
CREATE POLICY "Admins can delete lots" ON lots
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- SYNC TRIGGER
-- Keep inventory_items.quantity in sync with sum of lots (for lot-tracked items)
-- ===================
CREATE OR REPLACE FUNCTION sync_item_quantity_from_lots()
RETURNS TRIGGER AS $$
DECLARE
    v_total INTEGER;
    v_item_id UUID;
    v_tracking_mode item_tracking_mode;
BEGIN
    -- Get the item_id from either NEW or OLD
    v_item_id := COALESCE(NEW.item_id, OLD.item_id);

    -- Check if item uses lot tracking
    SELECT tracking_mode INTO v_tracking_mode
    FROM inventory_items WHERE id = v_item_id;

    -- Only sync if item is lot-tracked
    IF v_tracking_mode = 'lot_expiry' THEN
        -- Calculate new total from all active lots
        SELECT COALESCE(SUM(quantity), 0) INTO v_total
        FROM lots
        WHERE item_id = v_item_id AND status = 'active';

        -- Update the master item quantity
        UPDATE inventory_items
        SET quantity = v_total
        WHERE id = v_item_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_item_from_lots ON lots;
CREATE TRIGGER trigger_sync_item_from_lots
    AFTER INSERT OR UPDATE OR DELETE ON lots
    FOR EACH ROW
    EXECUTE FUNCTION sync_item_quantity_from_lots();

-- ===================
-- AUTO-EXPIRE LOTS FUNCTION
-- ===================
CREATE OR REPLACE FUNCTION update_expired_lots()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE lots
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
    AND expiry_date IS NOT NULL
    AND expiry_date < CURRENT_DATE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Get all lots for an item
CREATE OR REPLACE FUNCTION get_item_lots(
    p_item_id UUID,
    p_include_depleted BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
BEGIN
    -- Update expired lots first
    PERFORM update_expired_lots();

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.expiry_date ASC NULLS LAST), '[]'::json)
        FROM (
            SELECT
                l.id,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.manufactured_date,
                l.received_at,
                l.quantity,
                l.status,
                l.location_id,
                loc.name as location_name,
                CASE
                    WHEN l.expiry_date IS NULL THEN NULL
                    WHEN l.expiry_date < CURRENT_DATE THEN 0
                    ELSE l.expiry_date - CURRENT_DATE
                END as days_until_expiry,
                CASE
                    WHEN l.expiry_date IS NULL THEN 'no_expiry'
                    WHEN l.expiry_date < CURRENT_DATE THEN 'expired'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_month'
                    ELSE 'ok'
                END as expiry_status
            FROM lots l
            LEFT JOIN locations loc ON loc.id = l.location_id
            WHERE l.item_id = p_item_id
            AND l.tenant_id = get_user_tenant_id()
            AND (p_include_depleted OR l.status NOT IN ('depleted'))
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get lots at a specific location
CREATE OR REPLACE FUNCTION get_location_lots(
    p_location_id UUID,
    p_expiring_only BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
BEGIN
    -- Update expired lots first
    PERFORM update_expired_lots();

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.expiry_date ASC NULLS LAST), '[]'::json)
        FROM (
            SELECT
                l.id,
                l.item_id,
                i.name as item_name,
                i.sku as item_sku,
                i.image_urls[1] as item_image,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.quantity,
                l.status,
                CASE
                    WHEN l.expiry_date IS NULL THEN NULL
                    WHEN l.expiry_date < CURRENT_DATE THEN 0
                    ELSE l.expiry_date - CURRENT_DATE
                END as days_until_expiry
            FROM lots l
            JOIN inventory_items i ON i.id = l.item_id
            WHERE l.location_id = p_location_id
            AND l.tenant_id = get_user_tenant_id()
            AND l.status = 'active'
            AND (NOT p_expiring_only OR (l.expiry_date IS NOT NULL AND l.expiry_date <= CURRENT_DATE + INTERVAL '30 days'))
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get expiring items report
CREATE OR REPLACE FUNCTION get_expiring_lots(
    p_days INTEGER DEFAULT 30,
    p_location_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Update expired lots first
    PERFORM update_expired_lots();

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.expiry_date ASC), '[]'::json)
        FROM (
            SELECT
                l.id as lot_id,
                l.item_id,
                i.name as item_name,
                i.sku as item_sku,
                i.image_urls[1] as item_image,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.quantity,
                l.status,
                l.location_id,
                loc.name as location_name,
                l.expiry_date - CURRENT_DATE as days_until_expiry,
                CASE
                    WHEN l.expiry_date < CURRENT_DATE THEN 'expired'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'critical'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '14 days' THEN 'warning'
                    ELSE 'upcoming'
                END as urgency
            FROM lots l
            JOIN inventory_items i ON i.id = l.item_id
            LEFT JOIN locations loc ON loc.id = l.location_id
            WHERE l.tenant_id = tenant
            AND l.status = 'active'
            AND l.expiry_date IS NOT NULL
            AND l.expiry_date <= CURRENT_DATE + (p_days || ' days')::INTERVAL
            AND l.quantity > 0
            AND (p_location_id IS NULL OR l.location_id = p_location_id)
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a new lot (receiving inventory)
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

-- Adjust lot quantity (consume, waste, etc.)
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

-- FEFO (First Expired First Out) picking suggestion
CREATE OR REPLACE FUNCTION get_fefo_suggestion(
    p_item_id UUID,
    p_quantity_needed INTEGER,
    p_location_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    -- Update expired lots first
    PERFORM update_expired_lots();

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                l.id as lot_id,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.quantity as available_quantity,
                l.location_id,
                loc.name as location_name,
                LEAST(l.quantity, p_quantity_needed - COALESCE(
                    (SELECT SUM(quantity) FROM lots l2
                     WHERE l2.item_id = p_item_id
                     AND l2.status = 'active'
                     AND l2.tenant_id = get_user_tenant_id()
                     AND (p_location_id IS NULL OR l2.location_id = p_location_id)
                     AND l2.quantity > 0
                     AND (l2.expiry_date < l.expiry_date OR (l2.expiry_date = l.expiry_date AND l2.id < l.id))),
                    0
                )) as pick_quantity
            FROM lots l
            LEFT JOIN locations loc ON loc.id = l.location_id
            WHERE l.item_id = p_item_id
            AND l.tenant_id = get_user_tenant_id()
            AND l.status = 'active'
            AND l.quantity > 0
            AND (p_location_id IS NULL OR l.location_id = p_location_id)
            ORDER BY l.expiry_date ASC NULLS LAST, l.received_at ASC
        ) r
        WHERE r.pick_quantity > 0
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get expiring lots summary for dashboard
CREATE OR REPLACE FUNCTION get_expiring_lots_summary()
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Update expired lots first
    PERFORM update_expired_lots();

    RETURN json_build_object(
        'expired_count', (
            SELECT COUNT(*)
            FROM lots
            WHERE tenant_id = tenant
            AND status = 'expired'
            AND quantity > 0
        ),
        'expiring_7_days', (
            SELECT COUNT(*)
            FROM lots
            WHERE tenant_id = tenant
            AND status = 'active'
            AND expiry_date IS NOT NULL
            AND expiry_date > CURRENT_DATE
            AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
            AND quantity > 0
        ),
        'expiring_30_days', (
            SELECT COUNT(*)
            FROM lots
            WHERE tenant_id = tenant
            AND status = 'active'
            AND expiry_date IS NOT NULL
            AND expiry_date > CURRENT_DATE + INTERVAL '7 days'
            AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            AND quantity > 0
        ),
        'total_value_at_risk', (
            SELECT COALESCE(SUM(l.quantity * COALESCE(i.cost_price, i.price, 0)), 0)
            FROM lots l
            JOIN inventory_items i ON i.id = l.item_id
            WHERE l.tenant_id = tenant
            AND l.status IN ('active', 'expired')
            AND l.expiry_date IS NOT NULL
            AND l.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            AND l.quantity > 0
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Transfer lot between locations
CREATE OR REPLACE FUNCTION transfer_lot(
    p_lot_id UUID,
    p_to_location_id UUID,
    p_quantity INTEGER DEFAULT NULL  -- NULL means transfer entire lot
)
RETURNS JSON AS $$
DECLARE
    v_lot RECORD;
    v_transfer_qty INTEGER;
    v_new_lot_id UUID;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_from_location_name VARCHAR;
    v_to_location_name VARCHAR;
BEGIN
    -- Get lot details
    SELECT * INTO v_lot FROM lots WHERE id = p_lot_id AND tenant_id = get_user_tenant_id();

    IF v_lot IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Lot not found');
    END IF;

    -- Determine transfer quantity
    v_transfer_qty := COALESCE(p_quantity, v_lot.quantity);

    IF v_transfer_qty > v_lot.quantity THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient quantity in lot');
    END IF;

    -- Get user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Get location names
    SELECT name INTO v_from_location_name FROM locations WHERE id = v_lot.location_id;
    SELECT name INTO v_to_location_name FROM locations WHERE id = p_to_location_id;

    IF v_transfer_qty = v_lot.quantity THEN
        -- Move entire lot
        UPDATE lots SET location_id = p_to_location_id WHERE id = p_lot_id;
        v_new_lot_id := p_lot_id;
    ELSE
        -- Split lot: reduce original, create new at destination
        UPDATE lots SET quantity = quantity - v_transfer_qty WHERE id = p_lot_id;

        INSERT INTO lots (
            tenant_id, item_id, location_id, lot_number, batch_code,
            expiry_date, manufactured_date, quantity, status, received_at, created_by
        ) VALUES (
            v_tenant_id, v_lot.item_id, p_to_location_id, v_lot.lot_number, v_lot.batch_code,
            v_lot.expiry_date, v_lot.manufactured_date, v_transfer_qty, v_lot.status, v_lot.received_at, auth.uid()
        ) RETURNING id INTO v_new_lot_id;
    END IF;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, quantity_delta, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'lot', p_lot_id, v_lot.lot_number,
        'transfer_lot',
        v_transfer_qty,
        jsonb_build_object(
            'from_location', v_from_location_name,
            'to_location', v_to_location_name,
            'quantity', v_transfer_qty,
            'new_lot_id', v_new_lot_id
        )
    );

    RETURN json_build_object('success', true, 'new_lot_id', v_new_lot_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- SHIPPING INFO FUNCTIONS
-- ===================

-- Get items with shipping dimensions
CREATE OR REPLACE FUNCTION get_items_with_shipping(
    p_missing_only BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                i.id,
                i.name,
                i.sku,
                i.weight,
                i.weight_unit,
                i.length,
                i.width,
                i.height,
                i.dimension_unit,
                CASE
                    WHEN i.weight IS NOT NULL AND i.length IS NOT NULL
                        AND i.width IS NOT NULL AND i.height IS NOT NULL
                    THEN true
                    ELSE false
                END as has_complete_shipping
            FROM inventory_items i
            WHERE i.tenant_id = get_user_tenant_id()
            AND i.deleted_at IS NULL
            AND (
                NOT p_missing_only
                OR i.weight IS NULL
                OR i.length IS NULL
                OR i.width IS NULL
                OR i.height IS NULL
            )
            ORDER BY i.name
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Calculate shipping volume
CREATE OR REPLACE FUNCTION calculate_item_volume(p_item_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_item RECORD;
    v_volume DECIMAL;
BEGIN
    SELECT length, width, height, dimension_unit INTO v_item
    FROM inventory_items
    WHERE id = p_item_id AND tenant_id = get_user_tenant_id();

    IF v_item.length IS NULL OR v_item.width IS NULL OR v_item.height IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate volume in cubic cm
    v_volume := v_item.length * v_item.width * v_item.height;

    -- Convert if needed
    IF v_item.dimension_unit = 'in' THEN
        v_volume := v_volume * 16.387;  -- cubic inches to cubic cm
    ELSIF v_item.dimension_unit = 'mm' THEN
        v_volume := v_volume / 1000;    -- cubic mm to cubic cm
    END IF;

    RETURN v_volume;
END;
$$ LANGUAGE plpgsql STABLE;

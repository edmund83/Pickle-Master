-- ============================================
-- Migration: 00020_serial_numbers.sql
-- Purpose: Serial number tracking for serialized items
-- Feature-flagged via tenant.settings.features_enabled.lot_tracking
-- ============================================

-- ===================
-- SERIAL STATUS ENUM
-- ===================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'serial_status') THEN
        CREATE TYPE serial_status AS ENUM ('available', 'checked_out', 'sold', 'damaged', 'returned');
    END IF;
END$$;

-- ===================
-- SERIAL NUMBERS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS serial_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    location_id UUID,

    -- Serial identification
    serial_number VARCHAR(100) NOT NULL,

    -- Status
    status serial_status DEFAULT 'available',

    -- Notes
    notes TEXT,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: serial must be unique per tenant+item
    UNIQUE(tenant_id, item_id, serial_number)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_serial_numbers_tenant ON serial_numbers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_item ON serial_numbers(item_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_location ON serial_numbers(location_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_lookup ON serial_numbers(tenant_id, serial_number);

-- Note: updated_at trigger requires update_updated_at() function to exist

-- ===================
-- RLS POLICIES
-- ===================

ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tenant serials" ON serial_numbers;
CREATE POLICY "Users can view tenant serials" ON serial_numbers
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert serials" ON serial_numbers;
CREATE POLICY "Editors can insert serials" ON serial_numbers
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update serials" ON serial_numbers;
CREATE POLICY "Editors can update serials" ON serial_numbers
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete serials" ON serial_numbers;
CREATE POLICY "Admins can delete serials" ON serial_numbers
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- SYNC TRIGGER
-- Keep inventory_items.quantity in sync with count of available serials (for serialized items)
-- ===================
CREATE OR REPLACE FUNCTION sync_item_quantity_from_serials()
RETURNS TRIGGER AS $$
DECLARE
    v_total INTEGER;
    v_item_id UUID;
    v_tracking_mode TEXT;
BEGIN
    -- Get the item_id from either NEW or OLD
    v_item_id := COALESCE(NEW.item_id, OLD.item_id);

    -- Check if item uses serialized tracking
    SELECT tracking_mode::TEXT INTO v_tracking_mode
    FROM inventory_items WHERE id = v_item_id;

    -- Only sync if item is serialized
    IF v_tracking_mode = 'serialized' THEN
        -- Calculate new total from all available serials
        SELECT COUNT(*) INTO v_total
        FROM serial_numbers
        WHERE item_id = v_item_id AND status = 'available';

        -- Update the master item quantity
        UPDATE inventory_items
        SET quantity = v_total
        WHERE id = v_item_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_item_from_serials ON serial_numbers;
CREATE TRIGGER trigger_sync_item_from_serials
    AFTER INSERT OR UPDATE OR DELETE ON serial_numbers
    FOR EACH ROW
    EXECUTE FUNCTION sync_item_quantity_from_serials();

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Get all serials for an item
CREATE OR REPLACE FUNCTION get_item_serials(
    p_item_id UUID,
    p_include_unavailable BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.serial_number), '[]'::json)
        FROM (
            SELECT
                s.id,
                s.serial_number,
                s.status,
                s.location_id,
                s.notes,
                s.created_at
            FROM serial_numbers s
            WHERE s.item_id = p_item_id
            AND s.tenant_id = get_user_tenant_id()
            AND (p_include_unavailable OR s.status = 'available')
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Bulk upsert serials (for edit form)
CREATE OR REPLACE FUNCTION upsert_item_serials(
    p_item_id UUID,
    p_serials TEXT[]
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
    v_serial TEXT;
    v_inserted INTEGER := 0;
    v_deleted INTEGER := 0;
    v_existing TEXT[];
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

    -- Get existing serials
    SELECT ARRAY_AGG(serial_number) INTO v_existing
    FROM serial_numbers
    WHERE item_id = p_item_id AND tenant_id = v_tenant_id;

    -- Delete serials not in the new list
    DELETE FROM serial_numbers
    WHERE item_id = p_item_id
    AND tenant_id = v_tenant_id
    AND serial_number != ALL(p_serials);

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    -- Insert new serials (ignore duplicates)
    FOREACH v_serial IN ARRAY p_serials
    LOOP
        IF v_serial IS NOT NULL AND TRIM(v_serial) != '' THEN
            INSERT INTO serial_numbers (tenant_id, item_id, serial_number, created_by)
            VALUES (v_tenant_id, p_item_id, TRIM(v_serial), auth.uid())
            ON CONFLICT (tenant_id, item_id, serial_number) DO NOTHING;

            IF FOUND THEN
                v_inserted := v_inserted + 1;
            END IF;
        END IF;
    END LOOP;

    -- Log activity if there were changes
    IF v_inserted > 0 OR v_deleted > 0 THEN
        INSERT INTO activity_logs (
            tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
            action_type, changes
        ) VALUES (
            v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
            'update_serials',
            jsonb_build_object(
                'serials_added', v_inserted,
                'serials_removed', v_deleted,
                'total_serials', array_length(p_serials, 1)
            )
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'inserted', v_inserted,
        'deleted', v_deleted,
        'total', (SELECT COUNT(*) FROM serial_numbers WHERE item_id = p_item_id AND tenant_id = v_tenant_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a single serial
CREATE OR REPLACE FUNCTION delete_serial(
    p_serial_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_serial RECORD;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
BEGIN
    -- Get serial details
    SELECT s.*, i.name as item_name INTO v_serial
    FROM serial_numbers s
    JOIN inventory_items i ON i.id = s.item_id
    WHERE s.id = p_serial_id AND s.tenant_id = get_user_tenant_id();

    IF v_serial IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Serial not found');
    END IF;

    -- Get user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Delete serial
    DELETE FROM serial_numbers WHERE id = p_serial_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', v_serial.item_id, v_serial.item_name,
        'delete_serial',
        jsonb_build_object('serial_number', v_serial.serial_number)
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check for duplicate serial across items (for validation)
CREATE OR REPLACE FUNCTION check_serial_exists(
    p_serial_number VARCHAR,
    p_exclude_item_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_existing RECORD;
BEGIN
    SELECT s.serial_number, i.id as item_id, i.name as item_name
    INTO v_existing
    FROM serial_numbers s
    JOIN inventory_items i ON i.id = s.item_id
    WHERE s.tenant_id = get_user_tenant_id()
    AND s.serial_number = p_serial_number
    AND (p_exclude_item_id IS NULL OR s.item_id != p_exclude_item_id)
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
        RETURN json_build_object(
            'exists', true,
            'item_id', v_existing.item_id,
            'item_name', v_existing.item_name
        );
    END IF;

    RETURN json_build_object('exists', false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update serial status (e.g., when checked out or sold)
CREATE OR REPLACE FUNCTION update_serial_status(
    p_serial_id UUID,
    p_status serial_status,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_serial RECORD;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_old_status VARCHAR;
BEGIN
    -- Get serial details
    SELECT s.*, i.name as item_name INTO v_serial
    FROM serial_numbers s
    JOIN inventory_items i ON i.id = s.item_id
    WHERE s.id = p_serial_id AND s.tenant_id = get_user_tenant_id();

    IF v_serial IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Serial not found');
    END IF;

    v_old_status := v_serial.status;

    -- Get user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Update serial
    UPDATE serial_numbers
    SET status = p_status,
        notes = COALESCE(p_notes, notes)
    WHERE id = p_serial_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', v_serial.item_id, v_serial.item_name,
        'update_serial_status',
        jsonb_build_object(
            'serial_number', v_serial.serial_number,
            'old_status', v_old_status,
            'new_status', p_status
        )
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

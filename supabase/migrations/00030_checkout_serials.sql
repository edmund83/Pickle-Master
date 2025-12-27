-- ============================================
-- Migration: 00030_checkout_serials.sql
-- Purpose: Link checkouts to specific serial numbers
-- Enables serial-aware picking workflow
-- ============================================

-- ===================
-- CHECKOUT_SERIALS JUNCTION TABLE
-- ===================
CREATE TABLE IF NOT EXISTS checkout_serials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
    serial_id UUID NOT NULL REFERENCES serial_numbers(id) ON DELETE RESTRICT,

    -- Return condition per serial (filled in on return)
    return_condition item_condition,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Each serial can only be in one checkout at a time
    UNIQUE(checkout_id, serial_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkout_serials_checkout ON checkout_serials(checkout_id);
CREATE INDEX IF NOT EXISTS idx_checkout_serials_serial ON checkout_serials(serial_id);

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE checkout_serials ENABLE ROW LEVEL SECURITY;

-- View: Users can view checkout_serials for their tenant's checkouts
DROP POLICY IF EXISTS "Users can view tenant checkout_serials" ON checkout_serials;
CREATE POLICY "Users can view tenant checkout_serials" ON checkout_serials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM checkouts c
            WHERE c.id = checkout_serials.checkout_id
            AND c.tenant_id = get_user_tenant_id()
        )
    );

-- Insert: Editors can insert checkout_serials
DROP POLICY IF EXISTS "Editors can insert checkout_serials" ON checkout_serials;
CREATE POLICY "Editors can insert checkout_serials" ON checkout_serials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM checkouts c
            WHERE c.id = checkout_serials.checkout_id
            AND c.tenant_id = get_user_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Update: Editors can update checkout_serials
DROP POLICY IF EXISTS "Editors can update checkout_serials" ON checkout_serials;
CREATE POLICY "Editors can update checkout_serials" ON checkout_serials
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM checkouts c
            WHERE c.id = checkout_serials.checkout_id
            AND c.tenant_id = get_user_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Delete: Admins can delete checkout_serials
DROP POLICY IF EXISTS "Admins can delete checkout_serials" ON checkout_serials;
CREATE POLICY "Admins can delete checkout_serials" ON checkout_serials
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM checkouts c
            WHERE c.id = checkout_serials.checkout_id
            AND c.tenant_id = get_user_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ===================
-- CHECKOUT WITH SERIALS FUNCTION
-- Atomically creates checkout and updates serial statuses
-- ===================
CREATE OR REPLACE FUNCTION checkout_with_serials(
    p_item_id UUID,
    p_serial_ids UUID[],
    p_assignee_type checkout_assignee_type,
    p_assignee_id UUID DEFAULT NULL,
    p_assignee_name VARCHAR DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_checkout_id UUID;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
    v_serial_id UUID;
    v_serial_count INTEGER;
    v_serial_numbers TEXT[];
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

    -- Validate all serials exist, belong to this item, and are available
    SELECT COUNT(*), ARRAY_AGG(serial_number)
    INTO v_serial_count, v_serial_numbers
    FROM serial_numbers
    WHERE id = ANY(p_serial_ids)
    AND item_id = p_item_id
    AND tenant_id = v_tenant_id
    AND status = 'available';

    IF v_serial_count != array_length(p_serial_ids, 1) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'One or more serials are not available or do not belong to this item'
        );
    END IF;

    -- Create checkout record
    INSERT INTO checkouts (
        tenant_id, item_id, quantity, assignee_type, assignee_id,
        assignee_name, due_date, notes, checked_out_by
    ) VALUES (
        v_tenant_id, p_item_id, array_length(p_serial_ids, 1), p_assignee_type, p_assignee_id,
        p_assignee_name, p_due_date, p_notes, auth.uid()
    ) RETURNING id INTO v_checkout_id;

    -- Link serials to checkout and update their status
    FOREACH v_serial_id IN ARRAY p_serial_ids
    LOOP
        -- Insert link record
        INSERT INTO checkout_serials (checkout_id, serial_id)
        VALUES (v_checkout_id, v_serial_id);

        -- Update serial status to checked_out
        UPDATE serial_numbers
        SET status = 'checked_out', updated_at = NOW()
        WHERE id = v_serial_id;
    END LOOP;

    -- Note: inventory_items.quantity will auto-update via sync_item_quantity_from_serials trigger

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
        'check_out',
        jsonb_build_object(
            'checkout_id', v_checkout_id,
            'assignee_type', p_assignee_type,
            'assignee_name', p_assignee_name,
            'quantity', array_length(p_serial_ids, 1),
            'serial_numbers', v_serial_numbers,
            'due_date', p_due_date
        )
    );

    RETURN json_build_object(
        'success', true,
        'checkout_id', v_checkout_id,
        'serials_checked_out', array_length(p_serial_ids, 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- RETURN CHECKOUT SERIALS FUNCTION
-- Handles returning serialized items with per-serial condition
-- ===================
CREATE OR REPLACE FUNCTION return_checkout_serials(
    p_checkout_id UUID,
    p_serial_returns JSONB,  -- Array of {serial_id: UUID, condition: 'good'|'damaged'|'lost'}
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_item_id UUID;
    v_item_name VARCHAR;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_assignee_name VARCHAR;
    v_return RECORD;
    v_serial_number VARCHAR;
    v_returned_serials TEXT[] := '{}';
    v_conditions JSONB := '{}';
BEGIN
    -- Get checkout details
    SELECT c.item_id, c.assignee_name, c.tenant_id, i.name
    INTO v_item_id, v_assignee_name, v_tenant_id, v_item_name
    FROM checkouts c
    JOIN inventory_items i ON i.id = c.item_id
    WHERE c.id = p_checkout_id AND c.tenant_id = get_user_tenant_id();

    IF v_item_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Checkout not found');
    END IF;

    -- Get user name
    SELECT full_name INTO v_user_name FROM profiles WHERE id = auth.uid();

    -- Process each serial return
    FOR v_return IN SELECT * FROM jsonb_to_recordset(p_serial_returns) AS x(serial_id UUID, condition TEXT)
    LOOP
        -- Get serial number for logging
        SELECT serial_number INTO v_serial_number
        FROM serial_numbers WHERE id = v_return.serial_id;

        -- Update checkout_serials with return condition
        UPDATE checkout_serials
        SET return_condition = v_return.condition::item_condition
        WHERE checkout_id = p_checkout_id AND serial_id = v_return.serial_id;

        -- Update serial status based on condition
        UPDATE serial_numbers
        SET
            status = CASE
                WHEN v_return.condition = 'good' THEN 'available'::serial_status
                WHEN v_return.condition = 'damaged' THEN 'damaged'::serial_status
                WHEN v_return.condition = 'needs_repair' THEN 'damaged'::serial_status
                WHEN v_return.condition = 'lost' THEN 'sold'::serial_status  -- Using 'sold' for lost items
                ELSE 'available'::serial_status
            END,
            updated_at = NOW()
        WHERE id = v_return.serial_id;

        v_returned_serials := array_append(v_returned_serials, v_serial_number);
        v_conditions := v_conditions || jsonb_build_object(v_serial_number, v_return.condition);
    END LOOP;

    -- Update checkout record
    UPDATE checkouts
    SET
        status = 'returned',
        returned_at = NOW(),
        returned_by = auth.uid(),
        return_notes = p_notes
    WHERE id = p_checkout_id
    AND tenant_id = get_user_tenant_id();

    -- Note: inventory_items.quantity will auto-update via sync_item_quantity_from_serials trigger

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', v_item_id, v_item_name,
        'check_in',
        jsonb_build_object(
            'checkout_id', p_checkout_id,
            'returned_from', v_assignee_name,
            'serial_numbers', v_returned_serials,
            'conditions', v_conditions,
            'notes', p_notes
        )
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- GET CHECKOUT SERIALS
-- Returns serials linked to a checkout
-- ===================
CREATE OR REPLACE FUNCTION get_checkout_serials(p_checkout_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                cs.id,
                cs.serial_id,
                s.serial_number,
                s.status as current_status,
                cs.return_condition,
                s.notes
            FROM checkout_serials cs
            JOIN serial_numbers s ON s.id = cs.serial_id
            JOIN checkouts c ON c.id = cs.checkout_id
            WHERE cs.checkout_id = p_checkout_id
            AND c.tenant_id = get_user_tenant_id()
            ORDER BY s.serial_number
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- UPDATE get_item_checkout_history TO INCLUDE SERIALS
-- ===================
CREATE OR REPLACE FUNCTION get_item_checkout_history(
    p_item_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
        FROM (
            SELECT
                ch.id,
                ch.quantity,
                ch.assignee_type,
                ch.assignee_name,
                ch.checked_out_at,
                ch.due_date,
                ch.status,
                ch.returned_at,
                ch.return_condition,
                ch.return_notes,
                co.full_name as checked_out_by_name,
                ri.full_name as returned_by_name,
                -- Include linked serials
                (
                    SELECT COALESCE(json_agg(json_build_object(
                        'serial_number', s.serial_number,
                        'return_condition', cs.return_condition
                    ) ORDER BY s.serial_number), '[]'::json)
                    FROM checkout_serials cs
                    JOIN serial_numbers s ON s.id = cs.serial_id
                    WHERE cs.checkout_id = ch.id
                ) as serials
            FROM checkouts ch
            LEFT JOIN profiles co ON co.id = ch.checked_out_by
            LEFT JOIN profiles ri ON ri.id = ch.returned_by
            WHERE ch.item_id = p_item_id
            AND ch.tenant_id = get_user_tenant_id()
            ORDER BY ch.checked_out_at DESC
            LIMIT p_limit
        ) c
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

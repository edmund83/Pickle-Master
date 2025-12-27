-- ============================================
-- Migration: 00031_pick_list_enhancements.sql
-- Purpose: Add ship-to address and item outcome fields to pick lists
-- ============================================

-- ===================
-- ITEM OUTCOME ENUM
-- ===================
DO $$ BEGIN
    CREATE TYPE pick_list_item_outcome AS ENUM ('decrement', 'checkout', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===================
-- ADD NEW COLUMNS TO PICK_LISTS
-- ===================

-- Item outcome when picked
ALTER TABLE pick_lists
ADD COLUMN IF NOT EXISTS item_outcome pick_list_item_outcome DEFAULT 'decrement';

-- Ship To address fields
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS ship_to_name VARCHAR(255);
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS ship_to_address1 VARCHAR(500);
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS ship_to_address2 VARCHAR(500);
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS ship_to_city VARCHAR(255);
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS ship_to_state VARCHAR(255);
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS ship_to_postal_code VARCHAR(50);
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS ship_to_country VARCHAR(100);

-- ===================
-- RLS POLICIES FOR PICK_LISTS
-- ===================
ALTER TABLE pick_lists ENABLE ROW LEVEL SECURITY;

-- View: Users can view their tenant's pick lists
DROP POLICY IF EXISTS "Users can view tenant pick_lists" ON pick_lists;
CREATE POLICY "Users can view tenant pick_lists" ON pick_lists
    FOR SELECT USING (tenant_id = get_user_tenant_id());

-- Insert: Editors can create pick lists
DROP POLICY IF EXISTS "Editors can insert pick_lists" ON pick_lists;
CREATE POLICY "Editors can insert pick_lists" ON pick_lists
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Update: Editors can update pick lists
DROP POLICY IF EXISTS "Editors can update pick_lists" ON pick_lists;
CREATE POLICY "Editors can update pick_lists" ON pick_lists
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Delete: Admins can delete pick lists
DROP POLICY IF EXISTS "Admins can delete pick_lists" ON pick_lists;
CREATE POLICY "Admins can delete pick_lists" ON pick_lists
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ===================
-- RLS POLICIES FOR PICK_LIST_ITEMS
-- ===================
ALTER TABLE pick_list_items ENABLE ROW LEVEL SECURITY;

-- View: Users can view pick list items for their tenant's pick lists
DROP POLICY IF EXISTS "Users can view tenant pick_list_items" ON pick_list_items;
CREATE POLICY "Users can view tenant pick_list_items" ON pick_list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
    );

-- Insert: Editors can add items to pick lists
DROP POLICY IF EXISTS "Editors can insert pick_list_items" ON pick_list_items;
CREATE POLICY "Editors can insert pick_list_items" ON pick_list_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Update: Editors can update pick list items
DROP POLICY IF EXISTS "Editors can update pick_list_items" ON pick_list_items;
CREATE POLICY "Editors can update pick_list_items" ON pick_list_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Delete: Editors can remove items from pick lists
DROP POLICY IF EXISTS "Editors can delete pick_list_items" ON pick_list_items;
CREATE POLICY "Editors can delete pick_list_items" ON pick_list_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- ===================
-- INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_pick_lists_tenant ON pick_lists(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pick_lists_status ON pick_lists(status);
CREATE INDEX IF NOT EXISTS idx_pick_lists_assigned_to ON pick_lists(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pick_list_items_pick_list ON pick_list_items(pick_list_id);
CREATE INDEX IF NOT EXISTS idx_pick_list_items_item ON pick_list_items(item_id);

-- ===================
-- RPC: CREATE PICK LIST WITH ITEMS
-- ===================
CREATE OR REPLACE FUNCTION create_pick_list_with_items(
    p_name VARCHAR,
    p_assigned_to UUID DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_item_outcome pick_list_item_outcome DEFAULT 'decrement',
    p_notes TEXT DEFAULT NULL,
    p_ship_to_name VARCHAR DEFAULT NULL,
    p_ship_to_address1 VARCHAR DEFAULT NULL,
    p_ship_to_address2 VARCHAR DEFAULT NULL,
    p_ship_to_city VARCHAR DEFAULT NULL,
    p_ship_to_state VARCHAR DEFAULT NULL,
    p_ship_to_postal_code VARCHAR DEFAULT NULL,
    p_ship_to_country VARCHAR DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb  -- Array of {item_id, requested_quantity}
)
RETURNS JSON AS $$
DECLARE
    v_pick_list_id UUID;
    v_tenant_id UUID;
    v_item RECORD;
BEGIN
    -- Get tenant
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Create pick list
    INSERT INTO pick_lists (
        tenant_id, name, assigned_to, due_date, item_outcome, notes,
        ship_to_name, ship_to_address1, ship_to_address2, ship_to_city,
        ship_to_state, ship_to_postal_code, ship_to_country,
        created_by, status
    ) VALUES (
        v_tenant_id, p_name, p_assigned_to, p_due_date, p_item_outcome, p_notes,
        p_ship_to_name, p_ship_to_address1, p_ship_to_address2, p_ship_to_city,
        p_ship_to_state, p_ship_to_postal_code, p_ship_to_country,
        auth.uid(), 'draft'
    ) RETURNING id INTO v_pick_list_id;

    -- Add items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id UUID, requested_quantity INTEGER)
    LOOP
        INSERT INTO pick_list_items (pick_list_id, item_id, requested_quantity)
        VALUES (v_pick_list_id, v_item.item_id, v_item.requested_quantity);
    END LOOP;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id, entity_name, action_type
    ) VALUES (
        v_tenant_id, auth.uid(), 'pick_list', v_pick_list_id, p_name, 'create'
    );

    RETURN json_build_object(
        'success', true,
        'pick_list_id', v_pick_list_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- RPC: PICK ITEM (mark as picked and update inventory)
-- ===================
CREATE OR REPLACE FUNCTION pick_pick_list_item(
    p_pick_list_item_id UUID,
    p_picked_quantity INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_pick_list_id UUID;
    v_item_id UUID;
    v_item_outcome pick_list_item_outcome;
    v_tenant_id UUID;
    v_current_qty INTEGER;
    v_item_name VARCHAR;
BEGIN
    -- Get pick list item details
    SELECT pli.pick_list_id, pli.item_id, pl.item_outcome, pl.tenant_id
    INTO v_pick_list_id, v_item_id, v_item_outcome, v_tenant_id
    FROM pick_list_items pli
    JOIN pick_lists pl ON pl.id = pli.pick_list_id
    WHERE pli.id = p_pick_list_item_id
    AND pl.tenant_id = get_user_tenant_id();

    IF v_pick_list_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Pick list item not found');
    END IF;

    -- Get current item quantity
    SELECT quantity, name INTO v_current_qty, v_item_name
    FROM inventory_items WHERE id = v_item_id;

    IF v_current_qty < p_picked_quantity THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient stock');
    END IF;

    -- Update pick list item
    UPDATE pick_list_items
    SET picked_quantity = p_picked_quantity,
        picked_at = NOW(),
        picked_by = auth.uid()
    WHERE id = p_pick_list_item_id;

    -- Handle item outcome
    IF v_item_outcome = 'decrement' THEN
        -- Decrement inventory
        UPDATE inventory_items
        SET quantity = quantity - p_picked_quantity,
            updated_at = NOW(),
            last_modified_by = auth.uid()
        WHERE id = v_item_id;

        -- Log activity
        INSERT INTO activity_logs (
            tenant_id, user_id, entity_type, entity_id, entity_name,
            action_type, quantity_before, quantity_after, quantity_delta
        ) VALUES (
            v_tenant_id, auth.uid(), 'item', v_item_id, v_item_name,
            'pick', v_current_qty, v_current_qty - p_picked_quantity, -p_picked_quantity
        );
    END IF;
    -- Note: 'checkout' and 'transfer' outcomes would be handled separately

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- RPC: COMPLETE PICK LIST
-- ===================
CREATE OR REPLACE FUNCTION complete_pick_list(p_pick_list_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_name VARCHAR;
BEGIN
    -- Verify ownership
    SELECT tenant_id, name INTO v_tenant_id, v_name
    FROM pick_lists
    WHERE id = p_pick_list_id AND tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Pick list not found');
    END IF;

    -- Update status
    UPDATE pick_lists
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = p_pick_list_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id, entity_name, action_type
    ) VALUES (
        v_tenant_id, auth.uid(), 'pick_list', p_pick_list_id, v_name, 'complete'
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- RPC: GET PICK LIST WITH ITEMS
-- ===================
CREATE OR REPLACE FUNCTION get_pick_list_with_items(p_pick_list_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'pick_list', row_to_json(pl),
            'items', (
                SELECT COALESCE(json_agg(json_build_object(
                    'id', pli.id,
                    'item_id', pli.item_id,
                    'item_name', i.name,
                    'item_sku', i.sku,
                    'item_image', i.image_urls[1],
                    'available_quantity', i.quantity,
                    'requested_quantity', pli.requested_quantity,
                    'picked_quantity', pli.picked_quantity,
                    'picked_at', pli.picked_at,
                    'notes', pli.notes
                ) ORDER BY i.name), '[]'::json)
                FROM pick_list_items pli
                JOIN inventory_items i ON i.id = pli.item_id
                WHERE pli.pick_list_id = p_pick_list_id
            ),
            'assigned_to_name', (
                SELECT full_name FROM profiles WHERE id = pl.assigned_to
            )
        )
        FROM pick_lists pl
        WHERE pl.id = p_pick_list_id
        AND pl.tenant_id = get_user_tenant_id()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

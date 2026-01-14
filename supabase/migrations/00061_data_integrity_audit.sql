-- ============================================
-- Migration: 00061_data_integrity_audit.sql
-- Purpose: Data integrity improvements from audit
-- - Atomic checkout operations
-- - Receive status validation
-- - Quantity constraints
-- - Activity logging helper
-- ============================================

-- ===========================================
-- PART 1: ATOMIC CHECKOUT FUNCTION
-- Ensures checkout + inventory update happen atomically
-- ===========================================

CREATE OR REPLACE FUNCTION checkout_item_atomic(
    p_item_id UUID,
    p_quantity INTEGER,
    p_assignee_type checkout_assignee_type,
    p_assignee_name VARCHAR,
    p_due_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_checkout_id UUID;
    v_item RECORD;
    v_new_quantity INTEGER;
    v_new_status VARCHAR;
    v_user_name VARCHAR;
BEGIN
    -- Get user context
    SELECT p.tenant_id, p.full_name INTO v_tenant_id, v_user_name
    FROM profiles p WHERE p.id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Lock and get item (prevents race conditions)
    SELECT * INTO v_item
    FROM inventory_items
    WHERE id = p_item_id
      AND tenant_id = v_tenant_id
      AND deleted_at IS NULL
    FOR UPDATE;

    IF v_item IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    IF v_item.quantity < p_quantity THEN
        RETURN json_build_object('success', false, 'error',
            format('Insufficient stock. Available: %s', v_item.quantity));
    END IF;

    -- Calculate new quantity and status
    v_new_quantity := v_item.quantity - p_quantity;

    IF v_new_quantity <= 0 THEN
        v_new_status := 'out_of_stock';
    ELSIF v_item.min_quantity IS NOT NULL AND v_new_quantity <= v_item.min_quantity THEN
        v_new_status := 'low_stock';
    ELSE
        v_new_status := 'in_stock';
    END IF;

    -- Create checkout record
    INSERT INTO checkouts (
        tenant_id,
        item_id,
        quantity,
        assignee_type,
        assignee_name,
        status,
        checked_out_at,
        checked_out_by,
        due_date,
        notes
    ) VALUES (
        v_tenant_id,
        p_item_id,
        p_quantity,
        p_assignee_type,
        p_assignee_name,
        'checked_out',
        NOW(),
        auth.uid(),
        p_due_date,
        p_notes
    )
    RETURNING id INTO v_checkout_id;

    -- Update inventory (atomic with checkout)
    UPDATE inventory_items
    SET
        quantity = v_new_quantity,
        status = v_new_status,
        updated_at = NOW(),
        last_modified_by = auth.uid()
    WHERE id = p_item_id AND tenant_id = v_tenant_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        user_name,
        action_type,
        entity_type,
        entity_id,
        entity_name,
        quantity_before,
        quantity_after,
        quantity_delta,
        changes
    ) VALUES (
        v_tenant_id,
        auth.uid(),
        v_user_name,
        'checkout',
        'item',
        p_item_id,
        v_item.name,
        v_item.quantity,
        v_new_quantity,
        -p_quantity,
        jsonb_build_object(
            'checkout_id', v_checkout_id,
            'assignee', p_assignee_name,
            'notes', p_notes
        )
    );

    RETURN json_build_object(
        'success', true,
        'checkout_id', v_checkout_id,
        'new_quantity', v_new_quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION checkout_item_atomic(UUID, INTEGER, checkout_assignee_type, VARCHAR, DATE, TEXT) TO authenticated;


-- ===========================================
-- PART 2: ATOMIC RETURN FUNCTION
-- Ensures return + inventory update happen atomically
-- ===========================================

CREATE OR REPLACE FUNCTION return_item_atomic(
    p_checkout_id UUID,
    p_notes TEXT DEFAULT NULL,
    p_condition item_condition DEFAULT 'good'
)
RETURNS JSON AS $$
DECLARE
    v_checkout RECORD;
    v_item RECORD;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_new_quantity INTEGER;
    v_new_status VARCHAR;
    v_quantity_delta INTEGER := 0;
BEGIN
    -- Get user context
    SELECT p.tenant_id, p.full_name INTO v_tenant_id, v_user_name
    FROM profiles p WHERE p.id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Lock and get checkout
    SELECT * INTO v_checkout
    FROM checkouts
    WHERE id = p_checkout_id
      AND tenant_id = v_tenant_id
    FOR UPDATE;

    IF v_checkout IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Checkout not found');
    END IF;

    IF v_checkout.status = 'returned' THEN
        RETURN json_build_object('success', false, 'error', 'Already returned');
    END IF;

    -- Lock and get item
    SELECT * INTO v_item
    FROM inventory_items
    WHERE id = v_checkout.item_id
      AND tenant_id = v_tenant_id
    FOR UPDATE;

    IF v_item IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Update checkout record
    UPDATE checkouts
    SET
        status = 'returned',
        returned_at = NOW(),
        returned_by = auth.uid(),
        return_condition = p_condition,
        return_notes = p_notes
    WHERE id = p_checkout_id AND tenant_id = v_tenant_id;

    -- Increment inventory (unless lost)
    IF p_condition != 'lost' THEN
        v_quantity_delta := v_checkout.quantity;
        v_new_quantity := v_item.quantity + v_quantity_delta;

        IF v_new_quantity <= 0 THEN
            v_new_status := 'out_of_stock';
        ELSIF v_item.min_quantity IS NOT NULL AND v_new_quantity <= v_item.min_quantity THEN
            v_new_status := 'low_stock';
        ELSE
            v_new_status := 'in_stock';
        END IF;

        UPDATE inventory_items
        SET
            quantity = v_new_quantity,
            status = v_new_status,
            updated_at = NOW(),
            last_modified_by = auth.uid()
        WHERE id = v_checkout.item_id AND tenant_id = v_tenant_id;
    ELSE
        v_new_quantity := v_item.quantity;
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
        quantity_delta,
        changes
    ) VALUES (
        v_tenant_id,
        auth.uid(),
        v_user_name,
        'check_in',
        'item',
        v_checkout.item_id,
        v_item.name,
        v_quantity_delta,
        jsonb_build_object(
            'checkout_id', p_checkout_id,
            'condition', p_condition,
            'notes', p_notes
        )
    );

    RETURN json_build_object(
        'success', true,
        'new_quantity', v_new_quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION return_item_atomic(UUID, TEXT, item_condition) TO authenticated;


-- ===========================================
-- PART 3: RECEIVE STATUS VALIDATION TRIGGER
-- Prevents modifications to completed receives
-- ===========================================

CREATE OR REPLACE FUNCTION prevent_receive_item_modification()
RETURNS TRIGGER AS $$
DECLARE
    v_status receive_status;
BEGIN
    -- Get the parent receive status
    SELECT status INTO v_status
    FROM receives
    WHERE id = COALESCE(NEW.receive_id, OLD.receive_id);

    -- Block modifications to completed receives
    IF v_status = 'completed' THEN
        RAISE EXCEPTION 'Cannot modify items on a completed receive';
    END IF;

    -- For inserts and updates, return NEW
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        RETURN NEW;
    END IF;

    -- For deletes, return OLD
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS tr_prevent_receive_item_mod ON receive_items;

-- Create trigger on receive_items
CREATE TRIGGER tr_prevent_receive_item_mod
BEFORE INSERT OR UPDATE OR DELETE ON receive_items
FOR EACH ROW
EXECUTE FUNCTION prevent_receive_item_modification();


-- ===========================================
-- PART 4: QUANTITY CONSTRAINTS
-- Prevent over-receiving, over-picking, invalid quantities
-- ===========================================

-- Fix any existing violations before adding constraints
-- (Run these as data cleanup)

-- Fix over-picked items
UPDATE pick_list_items
SET picked_quantity = requested_quantity
WHERE picked_quantity IS NOT NULL
  AND picked_quantity > requested_quantity;

-- Fix over-received items
UPDATE purchase_order_items
SET received_quantity = ordered_quantity
WHERE received_quantity IS NOT NULL
  AND received_quantity > ordered_quantity;

-- Fix negative or zero checkout quantities (set to 1 as minimum)
UPDATE checkouts
SET quantity = 1
WHERE quantity IS NULL OR quantity <= 0;

-- Fix negative stock count quantities
UPDATE stock_count_items
SET counted_quantity = 0
WHERE counted_quantity IS NOT NULL AND counted_quantity < 0;


-- Now add the constraints

-- 1. Prevent over-picking on pick lists
ALTER TABLE pick_list_items
DROP CONSTRAINT IF EXISTS pick_list_items_quantity_check;

ALTER TABLE pick_list_items
ADD CONSTRAINT pick_list_items_quantity_check
CHECK (
    picked_quantity IS NULL
    OR (picked_quantity >= 0 AND picked_quantity <= requested_quantity)
);

-- 2. Prevent over-receiving on PO items
ALTER TABLE purchase_order_items
DROP CONSTRAINT IF EXISTS po_items_received_check;

ALTER TABLE purchase_order_items
ADD CONSTRAINT po_items_received_check
CHECK (
    received_quantity IS NULL
    OR (received_quantity >= 0 AND received_quantity <= ordered_quantity)
);

-- 3. Require positive checkout quantities
ALTER TABLE checkouts
DROP CONSTRAINT IF EXISTS checkouts_quantity_positive;

ALTER TABLE checkouts
ADD CONSTRAINT checkouts_quantity_positive
CHECK (quantity > 0);

-- 4. Stock count item quantities non-negative
ALTER TABLE stock_count_items
DROP CONSTRAINT IF EXISTS stock_count_items_quantity_check;

ALTER TABLE stock_count_items
ADD CONSTRAINT stock_count_items_quantity_check
CHECK (counted_quantity IS NULL OR counted_quantity >= 0);


-- ===========================================
-- PART 5: ACTIVITY LOGGING HELPER FUNCTION
-- Standardized logging across all modules
-- ===========================================

CREATE OR REPLACE FUNCTION log_activity(
    p_tenant_id UUID,
    p_user_id UUID,
    p_action_type VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_entity_name VARCHAR DEFAULT NULL,
    p_changes JSONB DEFAULT NULL,
    p_quantity_delta INTEGER DEFAULT NULL,
    p_quantity_before INTEGER DEFAULT NULL,
    p_quantity_after INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_name VARCHAR;
    v_log_id UUID;
BEGIN
    -- Get user name
    SELECT full_name INTO v_user_name FROM profiles WHERE id = p_user_id;

    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        user_name,
        action_type,
        entity_type,
        entity_id,
        entity_name,
        changes,
        quantity_delta,
        quantity_before,
        quantity_after
    ) VALUES (
        p_tenant_id,
        p_user_id,
        v_user_name,
        p_action_type,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_changes,
        p_quantity_delta,
        p_quantity_before,
        p_quantity_after
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION log_activity(UUID, UUID, VARCHAR, VARCHAR, UUID, VARCHAR, JSONB, INTEGER, INTEGER, INTEGER) TO authenticated;


-- ===========================================
-- ROLLBACK SCRIPT (for reference, run manually if needed)
-- ===========================================
-- DROP FUNCTION IF EXISTS checkout_item_atomic(UUID, INTEGER, checkout_assignee_type, VARCHAR, DATE, TEXT);
-- DROP FUNCTION IF EXISTS return_item_atomic(UUID, TEXT, item_condition);
-- DROP TRIGGER IF EXISTS tr_prevent_receive_item_mod ON receive_items;
-- DROP FUNCTION IF EXISTS prevent_receive_item_modification();
-- ALTER TABLE checkouts DROP CONSTRAINT IF EXISTS checkouts_quantity_positive;
-- ALTER TABLE pick_list_items DROP CONSTRAINT IF EXISTS pick_list_items_quantity_check;
-- ALTER TABLE purchase_order_items DROP CONSTRAINT IF EXISTS po_items_received_check;
-- ALTER TABLE stock_count_items DROP CONSTRAINT IF EXISTS stock_count_items_quantity_check;
-- DROP FUNCTION IF EXISTS log_activity(UUID, UUID, VARCHAR, VARCHAR, UUID, VARCHAR, JSONB, INTEGER, INTEGER, INTEGER);

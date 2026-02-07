-- ============================================
-- Migration: 00139_checkout_from_lot.sql
-- Purpose: Allow checkout from a specific lot (batch) for lot-expiry items
-- ============================================

-- Add optional lot reference to checkouts (which lot was used for this checkout)
ALTER TABLE checkouts
ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES lots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_checkouts_lot ON checkouts(lot_id) WHERE lot_id IS NOT NULL;

COMMENT ON COLUMN checkouts.lot_id IS 'When set, this checkout deducted from this specific lot (batch).';

-- RPC: Checkout from a specific lot (deduct from that lot, create checkout record)
CREATE OR REPLACE FUNCTION perform_checkout_from_lot(
    p_item_id UUID,
    p_lot_id UUID,
    p_quantity INTEGER,
    p_assignee_type checkout_assignee_type DEFAULT 'person',
    p_assignee_id UUID DEFAULT NULL,
    p_assignee_name VARCHAR DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
    v_lot_quantity INTEGER;
    v_checkout_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Lot must exist, belong to item and tenant, be active, and have enough quantity
    SELECT l.quantity, i.name INTO v_lot_quantity, v_item_name
    FROM lots l
    JOIN inventory_items i ON i.id = l.item_id
    WHERE l.id = p_lot_id
      AND l.item_id = p_item_id
      AND l.tenant_id = v_tenant_id
      AND l.status = 'active';

    IF v_lot_quantity IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Lot not found or not available');
    END IF;

    IF v_lot_quantity < p_quantity THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient quantity in selected batch');
    END IF;

    SELECT full_name INTO v_user_name FROM profiles WHERE id = auth.uid();

    -- Deduct from lot (trigger will sync inventory_items.quantity)
    UPDATE lots
    SET
        quantity = quantity - p_quantity,
        status = CASE WHEN quantity - p_quantity <= 0 THEN 'depleted'::lot_status ELSE status END,
        updated_at = NOW()
    WHERE id = p_lot_id;

    INSERT INTO lot_movements (lot_id, movement_type, quantity, reason, created_by, created_at)
    VALUES (p_lot_id, 'stock_out', -p_quantity, 'Checkout from lot', auth.uid(), NOW());

    -- Create checkout record linked to this lot
    INSERT INTO checkouts (
        tenant_id, item_id, quantity, lot_id, assignee_type, assignee_id,
        assignee_name, due_date, notes, checked_out_by
    ) VALUES (
        v_tenant_id, p_item_id, p_quantity, p_lot_id, p_assignee_type, p_assignee_id,
        p_assignee_name, p_due_date, p_notes, auth.uid()
    ) RETURNING id INTO v_checkout_id;

    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
        'check_out',
        jsonb_build_object(
            'checkout_id', v_checkout_id,
            'lot_id', p_lot_id,
            'assignee_type', p_assignee_type,
            'assignee_name', p_assignee_name,
            'quantity', p_quantity,
            'due_date', p_due_date
        )
    );

    RETURN json_build_object('success', true, 'checkout_id', v_checkout_id);
END;
$$;

COMMENT ON FUNCTION perform_checkout_from_lot IS 'Checkout quantity from a specific lot (batch). Deducts from that lot and creates a checkout record with lot_id.';

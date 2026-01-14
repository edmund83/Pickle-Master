-- Phase 2: Workflow Integrity Improvements
-- This migration adds:
-- 1. Unique constraints for vendor names and order numbers (tenant-scoped)
-- 2. Composite indexes for common query patterns
-- 3. Status validation constraints

-- =============================================
-- 1. UNIQUE CONSTRAINTS (tenant-scoped)
-- =============================================

-- Unique vendor names within a tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendors_tenant_name_unique
ON vendors (tenant_id, LOWER(name))
WHERE deleted_at IS NULL;

-- Unique order numbers within a tenant for purchase orders
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_orders_tenant_order_number_unique
ON purchase_orders (tenant_id, LOWER(order_number))
WHERE order_number IS NOT NULL;

-- Unique pick list numbers within a tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_pick_lists_tenant_number_unique
ON pick_lists (tenant_id, LOWER(pick_list_number))
WHERE pick_list_number IS NOT NULL;

-- =============================================
-- 2. COMPOSITE INDEXES for common query patterns
-- =============================================

-- Purchase orders list queries (tenant + status + date sorting)
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_status_date
ON purchase_orders (tenant_id, status, created_at DESC);

-- Pick lists list queries (tenant + status + date sorting)
CREATE INDEX IF NOT EXISTS idx_pick_lists_tenant_status_date
ON pick_lists (tenant_id, status, created_at DESC);

-- Pick lists assigned to user
CREATE INDEX IF NOT EXISTS idx_pick_lists_tenant_assigned
ON pick_lists (tenant_id, assigned_to, status)
WHERE assigned_to IS NOT NULL;

-- Receives list queries (tenant + status + date sorting)
CREATE INDEX IF NOT EXISTS idx_receives_tenant_status_date
ON receives (tenant_id, status, created_at DESC);

-- Activity logs for entity lookups
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_entity_date
ON activity_logs (tenant_id, entity_type, entity_id, created_at DESC);

-- Inventory items by folder with status
CREATE INDEX IF NOT EXISTS idx_inventory_items_folder_status
ON inventory_items (tenant_id, folder_id, status)
WHERE deleted_at IS NULL;

-- =============================================
-- 3. STATUS VALIDATION CONSTRAINTS
-- =============================================

-- Ensure purchase order status is valid
ALTER TABLE purchase_orders
DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

ALTER TABLE purchase_orders
ADD CONSTRAINT purchase_orders_status_check
CHECK (status IN ('draft', 'submitted', 'confirmed', 'receiving', 'received', 'cancelled'));

-- Ensure pick list status is valid
ALTER TABLE pick_lists
DROP CONSTRAINT IF EXISTS pick_lists_status_check;

ALTER TABLE pick_lists
ADD CONSTRAINT pick_lists_status_check
CHECK (status IN ('draft', 'pending', 'in_progress', 'completed', 'cancelled'));

-- Ensure receive status is valid
ALTER TABLE receives
DROP CONSTRAINT IF EXISTS receives_status_check;

ALTER TABLE receives
ADD CONSTRAINT receives_status_check
CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled'));

-- =============================================
-- 4. IMMUTABILITY TRIGGERS (defense-in-depth)
-- =============================================

-- Trigger to prevent changing display_id once set (belt-and-suspenders)
CREATE OR REPLACE FUNCTION prevent_display_id_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.display_id IS NOT NULL AND NEW.display_id IS DISTINCT FROM OLD.display_id THEN
        RAISE EXCEPTION 'display_id cannot be changed once set';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to purchase_orders
DROP TRIGGER IF EXISTS tr_prevent_po_display_id_change ON purchase_orders;
CREATE TRIGGER tr_prevent_po_display_id_change
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION prevent_display_id_change();

-- Apply to pick_lists
DROP TRIGGER IF EXISTS tr_prevent_pl_display_id_change ON pick_lists;
CREATE TRIGGER tr_prevent_pl_display_id_change
BEFORE UPDATE ON pick_lists
FOR EACH ROW
EXECUTE FUNCTION prevent_display_id_change();

-- Apply to receives
DROP TRIGGER IF EXISTS tr_prevent_receive_display_id_change ON receives;
CREATE TRIGGER tr_prevent_receive_display_id_change
BEFORE UPDATE ON receives
FOR EACH ROW
EXECUTE FUNCTION prevent_display_id_change();

-- =============================================
-- 5. STATUS TRANSITION VALIDATION TRIGGERS
-- =============================================

-- Trigger to enforce PO status state machine
CREATE OR REPLACE FUNCTION validate_po_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions text[];
BEGIN
    -- If status isn't changing, allow
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Define valid transitions
    CASE OLD.status
        WHEN 'draft' THEN valid_transitions := ARRAY['submitted', 'cancelled'];
        WHEN 'submitted' THEN valid_transitions := ARRAY['confirmed', 'cancelled', 'draft'];
        WHEN 'confirmed' THEN valid_transitions := ARRAY['receiving', 'cancelled'];
        WHEN 'receiving' THEN valid_transitions := ARRAY['received', 'cancelled'];
        WHEN 'received' THEN valid_transitions := ARRAY[]::text[]; -- Terminal state
        WHEN 'cancelled' THEN valid_transitions := ARRAY['draft'];
        ELSE valid_transitions := ARRAY[]::text[];
    END CASE;

    IF NOT NEW.status = ANY(valid_transitions) THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validate_po_status ON purchase_orders;
CREATE TRIGGER tr_validate_po_status
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION validate_po_status_transition();

-- Trigger to enforce pick list status state machine
CREATE OR REPLACE FUNCTION validate_pick_list_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions text[];
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    CASE OLD.status
        WHEN 'draft' THEN valid_transitions := ARRAY['pending', 'cancelled'];
        WHEN 'pending' THEN valid_transitions := ARRAY['in_progress', 'cancelled', 'draft'];
        WHEN 'in_progress' THEN valid_transitions := ARRAY['completed', 'cancelled'];
        WHEN 'completed' THEN valid_transitions := ARRAY[]::text[];
        WHEN 'cancelled' THEN valid_transitions := ARRAY['draft'];
        ELSE valid_transitions := ARRAY[]::text[];
    END CASE;

    IF NOT NEW.status = ANY(valid_transitions) THEN
        RAISE EXCEPTION 'Invalid pick list status transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validate_pick_list_status ON pick_lists;
CREATE TRIGGER tr_validate_pick_list_status
BEFORE UPDATE ON pick_lists
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION validate_pick_list_status_transition();

-- =============================================
-- 6. COMMENTS
-- =============================================

COMMENT ON INDEX idx_vendors_tenant_name_unique IS 'Ensures vendor names are unique within a tenant';
COMMENT ON INDEX idx_purchase_orders_tenant_order_number_unique IS 'Ensures PO order numbers are unique within a tenant';
COMMENT ON INDEX idx_pick_lists_tenant_number_unique IS 'Ensures pick list numbers are unique within a tenant';
COMMENT ON FUNCTION prevent_display_id_change IS 'Prevents modification of display_id after initial set';
COMMENT ON FUNCTION validate_po_status_transition IS 'Enforces valid PO status transitions';
COMMENT ON FUNCTION validate_pick_list_status_transition IS 'Enforces valid pick list status transitions';

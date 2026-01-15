-- Migration: 00077_fix_po_status_constraint.sql
-- Purpose: Fix PO status constraint to use 'partial' instead of 'receiving'
-- The complete_receive function sets status to 'partial' when not all items are received,
-- but the constraint was incorrectly using 'receiving'. This aligns the constraint with
-- the actual business logic.

-- ===========================================
-- 1. FIX PURCHASE ORDER STATUS CONSTRAINT
-- ===========================================

-- Drop existing constraint
ALTER TABLE purchase_orders
DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

-- Add corrected constraint with 'partial' instead of 'receiving'
-- Valid statuses: draft, submitted, pending_approval, confirmed, partial, received, cancelled
ALTER TABLE purchase_orders
ADD CONSTRAINT purchase_orders_status_check
CHECK (status IN ('draft', 'submitted', 'pending_approval', 'confirmed', 'partial', 'received', 'cancelled'));

-- ===========================================
-- 2. UPDATE VALIDATION FUNCTION
-- ===========================================

-- Update the validation function to match
CREATE OR REPLACE FUNCTION validate_po_status(status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN status IN ('draft', 'submitted', 'pending_approval', 'confirmed', 'partial', 'received', 'cancelled');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===========================================
-- 3. UPDATE STATUS TRANSITION TRIGGER
-- ===========================================

-- Drop and recreate the PO status transition trigger with correct status values
CREATE OR REPLACE FUNCTION validate_po_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions TEXT[];
BEGIN
    -- If status hasn't changed, allow
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Define valid transitions (with 'partial' instead of 'receiving')
    CASE OLD.status
        WHEN 'draft' THEN valid_transitions := ARRAY['submitted', 'pending_approval', 'cancelled'];
        WHEN 'submitted' THEN valid_transitions := ARRAY['pending_approval', 'confirmed', 'cancelled', 'draft'];
        WHEN 'pending_approval' THEN valid_transitions := ARRAY['confirmed', 'draft', 'cancelled'];
        WHEN 'confirmed' THEN valid_transitions := ARRAY['partial', 'received', 'cancelled'];
        WHEN 'partial' THEN valid_transitions := ARRAY['partial', 'received', 'cancelled'];
        WHEN 'received' THEN valid_transitions := ARRAY[]::TEXT[]; -- Terminal state
        WHEN 'cancelled' THEN valid_transitions := ARRAY['draft'];
        ELSE valid_transitions := ARRAY[]::TEXT[];
    END CASE;

    -- Check if transition is valid
    IF NOT (NEW.status = ANY(valid_transitions)) THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger if it doesn't exist
DROP TRIGGER IF EXISTS validate_po_status_transition_trigger ON purchase_orders;
CREATE TRIGGER validate_po_status_transition_trigger
    BEFORE UPDATE OF status ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_po_status_transition();

-- ===========================================
-- 4. MIGRATE ANY EXISTING 'receiving' TO 'partial'
-- ===========================================

-- In case there are any existing records with 'receiving' status, update them
-- (This should be safe as the constraint is dropped above)
UPDATE purchase_orders
SET status = 'partial'
WHERE status = 'receiving';

-- ===========================================
-- 5. ADD COMMENT
-- ===========================================

COMMENT ON CONSTRAINT purchase_orders_status_check ON purchase_orders IS
'Valid PO statuses: draft (being created), submitted (sent for approval), pending_approval (waiting manager), confirmed (approved and sent to vendor), partial (some items received), received (all items received, terminal), cancelled';

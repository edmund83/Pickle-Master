-- ============================================
-- Migration: 00123_fix_pick_list_status_transitions.sql
-- Purpose: Fix pick list status transition trigger to allow draft -> in_progress
--
-- Problem: The original trigger required draft -> pending -> in_progress,
-- but 'pending' is not a valid status in the chk_pick_list_status constraint.
-- The valid statuses are: draft, in_progress, completed, cancelled
--
-- Solution: Update the trigger to allow direct draft -> in_progress transition
-- ============================================

-- Update the pick list status transition trigger
CREATE OR REPLACE FUNCTION validate_pick_list_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions text[];
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    CASE OLD.status
        -- Allow draft to go directly to in_progress (for starting a pick)
        WHEN 'draft' THEN valid_transitions := ARRAY['in_progress', 'cancelled'];
        -- in_progress can complete or be cancelled
        WHEN 'in_progress' THEN valid_transitions := ARRAY['completed', 'cancelled'];
        -- completed is terminal
        WHEN 'completed' THEN valid_transitions := ARRAY[]::text[];
        -- cancelled can be reverted to draft
        WHEN 'cancelled' THEN valid_transitions := ARRAY['draft'];
        ELSE valid_transitions := ARRAY[]::text[];
    END CASE;

    IF NOT NEW.status = ANY(valid_transitions) THEN
        RAISE EXCEPTION 'Invalid pick list status transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION validate_pick_list_status_transition IS
'Enforces valid pick list status transitions:
- draft -> in_progress (start picking), cancelled
- in_progress -> completed, cancelled
- completed -> (terminal state)
- cancelled -> draft (reopen)';

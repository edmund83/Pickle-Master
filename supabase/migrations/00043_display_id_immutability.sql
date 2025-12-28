-- Migration: Make display_id immutable on all entity tables
-- Prevents any modification to display_id once set (similar to org_code protection)
-- This ensures display IDs remain stable identifiers for external references

-- ===================
-- Trigger Function (reusable across all tables)
-- ===================
CREATE OR REPLACE FUNCTION prevent_display_id_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.display_id IS NOT NULL AND NEW.display_id IS DISTINCT FROM OLD.display_id THEN
        RAISE EXCEPTION 'display_id is immutable and cannot be changed once set';
    END IF;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION prevent_display_id_modification() IS 'Prevents modification of display_id column once it has been set. Applied to pick_lists, purchase_orders, inventory_items, and folders tables.';

-- ===================
-- Pick Lists
-- ===================
DROP TRIGGER IF EXISTS trg_pick_lists_display_id_immutable ON pick_lists;
CREATE TRIGGER trg_pick_lists_display_id_immutable
    BEFORE UPDATE OF display_id ON pick_lists
    FOR EACH ROW
    EXECUTE FUNCTION prevent_display_id_modification();

-- ===================
-- Purchase Orders
-- ===================
DROP TRIGGER IF EXISTS trg_purchase_orders_display_id_immutable ON purchase_orders;
CREATE TRIGGER trg_purchase_orders_display_id_immutable
    BEFORE UPDATE OF display_id ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION prevent_display_id_modification();

-- ===================
-- Inventory Items
-- ===================
DROP TRIGGER IF EXISTS trg_inventory_items_display_id_immutable ON inventory_items;
CREATE TRIGGER trg_inventory_items_display_id_immutable
    BEFORE UPDATE OF display_id ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_display_id_modification();

-- ===================
-- Folders
-- ===================
DROP TRIGGER IF EXISTS trg_folders_display_id_immutable ON folders;
CREATE TRIGGER trg_folders_display_id_immutable
    BEFORE UPDATE OF display_id ON folders
    FOR EACH ROW
    EXECUTE FUNCTION prevent_display_id_modification();

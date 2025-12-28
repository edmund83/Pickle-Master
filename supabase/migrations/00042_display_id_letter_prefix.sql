-- Migration: Restructure display_id format with ORG_CODE first + 2-letter prefix
-- New format: {ORG_CODE}-{TYPE}-{LETTERS}{NUMBER}
-- Example: ACM01-PL-AA00001, ACM01-PO-AB00001, ..., ACM01-ITM-ZZ99999
--
-- Benefits:
-- - ORG_CODE at front for easy filtering by organization
-- - 2-letter prefix (AA-ZZ) for increased capacity
-- - Capacity: 676 batches × 99,999 IDs = ~67.6 million per entity type per tenant

-- ===================
-- Step 1: Helper function - Convert sequence number to letter prefix
-- ===================
-- Logic:
--   Sequence 1-99999 → AA
--   Sequence 100000-199999 → AB
--   Sequence 200000-299999 → AC
--   ...
--   Sequence 67,500,000+ → ZZ (last batch)
CREATE OR REPLACE FUNCTION get_letter_prefix(p_sequence BIGINT)
RETURNS VARCHAR(2) AS $$
DECLARE
    v_batch INTEGER;
    v_first_letter CHAR(1);
    v_second_letter CHAR(1);
BEGIN
    -- Calculate which batch (0-675) this sequence falls into
    -- Each batch = 99,999 IDs
    v_batch := ((p_sequence - 1) / 99999)::INTEGER;

    -- Clamp to max 675 (ZZ)
    IF v_batch > 675 THEN
        v_batch := 675;
    END IF;

    -- First letter: A-Z (batch / 26)
    v_first_letter := CHR(65 + (v_batch / 26));

    -- Second letter: A-Z (batch % 26)
    v_second_letter := CHR(65 + (v_batch % 26));

    RETURN v_first_letter || v_second_letter;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===================
-- Step 2: Update generate_display_id function
-- ===================
CREATE OR REPLACE FUNCTION generate_display_id(p_tenant_id UUID, p_entity_type VARCHAR(20))
RETURNS VARCHAR(25) AS $$
DECLARE
    v_org_code VARCHAR(5);
    v_type_prefix VARCHAR(4);
    v_sequence BIGINT;
    v_display_number INTEGER;
    v_letter_prefix VARCHAR(2);
BEGIN
    -- Get org_code
    SELECT org_code INTO v_org_code FROM tenants WHERE id = p_tenant_id;
    IF v_org_code IS NULL THEN
        RAISE EXCEPTION 'Tenant org_code not found for tenant_id: %', p_tenant_id;
    END IF;

    -- Determine entity type prefix
    v_type_prefix := CASE p_entity_type
        WHEN 'pick_list' THEN 'PL'
        WHEN 'purchase_order' THEN 'PO'
        WHEN 'item' THEN 'ITM'
        WHEN 'folder' THEN 'FLD'
        ELSE 'UNK'
    END;

    -- Get next sequence number (1, 2, 3, ...)
    v_sequence := get_next_entity_number(p_tenant_id, p_entity_type);

    -- Calculate display number (1-99999, cycles)
    v_display_number := ((v_sequence - 1) % 99999) + 1;

    -- Get letter prefix based on total sequence
    v_letter_prefix := get_letter_prefix(v_sequence);

    -- Build final display_id: ACM01-PL-AA00001 (ORG_CODE first!)
    RETURN v_org_code || '-' || v_type_prefix || '-' ||
           v_letter_prefix || LPAD(v_display_number::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ===================
-- Step 3: Update generate_display_id_for_current_user function
-- ===================
CREATE OR REPLACE FUNCTION generate_display_id_for_current_user(p_entity_type VARCHAR(20))
RETURNS VARCHAR(25) AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found for current user';
    END IF;
    RETURN generate_display_id(v_tenant_id, p_entity_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- Step 4: Backfill existing display_ids to new format
-- ===================
-- Transform: PL-ACM01-00001 → ACM01-PL-AA00001
-- Pattern:   {TYPE}-{ORG}-{NUM} → {ORG}-{TYPE}-AA{NUM}

-- Pick Lists (PL-ACM01-00001 → ACM01-PL-AA00001)
UPDATE pick_lists
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z]{3}\d{2})-(\d{5})$',
    '\2-\1-AA\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z]{3}\d{2}-\d{5}$';

-- Purchase Orders (PO-ACM01-00001 → ACM01-PO-AA00001)
UPDATE purchase_orders
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z]{3}\d{2})-(\d{5})$',
    '\2-\1-AA\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z]{3}\d{2}-\d{5}$';

-- Inventory Items (ITM-ACM01-00001 → ACM01-ITM-AA00001)
UPDATE inventory_items
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z]{3}\d{2})-(\d{5})$',
    '\2-\1-AA\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z]{3}\d{2}-\d{5}$';

-- Folders (FLD-ACM01-00001 → ACM01-FLD-AA00001)
UPDATE folders
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z]{3}\d{2})-(\d{5})$',
    '\2-\1-AA\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z]{3}\d{2}-\d{5}$';

-- ===================
-- Step 5: Log migration summary
-- ===================
DO $$
DECLARE
    pl_count INTEGER;
    po_count INTEGER;
    item_count INTEGER;
    folder_count INTEGER;
BEGIN
    -- Count records with new format (ORG_CODE-TYPE-LETTERS+NUMBER)
    SELECT COUNT(*) INTO pl_count FROM pick_lists WHERE display_id ~ '^[A-Z]{3}\d{2}-[A-Z]+-[A-Z]{2}\d{5}$';
    SELECT COUNT(*) INTO po_count FROM purchase_orders WHERE display_id ~ '^[A-Z]{3}\d{2}-[A-Z]+-[A-Z]{2}\d{5}$';
    SELECT COUNT(*) INTO item_count FROM inventory_items WHERE display_id ~ '^[A-Z]{3}\d{2}-[A-Z]+-[A-Z]{2}\d{5}$' AND deleted_at IS NULL;
    SELECT COUNT(*) INTO folder_count FROM folders WHERE display_id ~ '^[A-Z]{3}\d{2}-[A-Z]+-[A-Z]{2}\d{5}$';

    RAISE NOTICE 'Migration 00042 complete - Display IDs updated to new format (ORG_CODE-TYPE-LETTERS+NUMBER):';
    RAISE NOTICE '  Pick Lists: %', pl_count;
    RAISE NOTICE '  Purchase Orders: %', po_count;
    RAISE NOTICE '  Inventory Items: %', item_count;
    RAISE NOTICE '  Folders: %', folder_count;
    RAISE NOTICE '';
    RAISE NOTICE 'New format examples:';
    RAISE NOTICE '  ACM01-PL-AA00001 (Pick List)';
    RAISE NOTICE '  ACM01-PO-AA00001 (Purchase Order)';
    RAISE NOTICE '  ACM01-ITM-AA00001 (Item)';
    RAISE NOTICE '  ACM01-FLD-AA00001 (Folder)';
END;
$$;

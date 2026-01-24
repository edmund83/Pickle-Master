-- Migration: 00102_alphanumeric_display_id.sql
-- Description: Update display_id format to use alphanumeric prefix (A00001 → Z99999 → AA00001 → ZZ99999)
-- New format: {PREFIX}-{ORGCODE}-{LETTER(S)}{5-digit}
-- Examples: SO-ACM01-A00001, INV-ACM01-B00042, PO-ACM01-AA00001
--
-- Capacity:
--   Single letter (A-Z): 26 × 99,999 = 2,599,974 entries
--   Double letter (AA-ZZ): 676 × 99,999 = 67,599,324 entries
--   Total: ~70 million per entity type per tenant

-- ============================================================================
-- STEP 1: CREATE HELPER FUNCTION FOR ALPHANUMERIC PREFIX
-- ============================================================================
-- Logic:
--   Sequence 1-99999 → A
--   Sequence 100000-199998 → B
--   ...
--   Sequence 2,500,000-2,599,974 → Z
--   Sequence 2,599,975+ → AA, AB, ..., ZZ

CREATE OR REPLACE FUNCTION get_alphanumeric_prefix(p_sequence BIGINT)
RETURNS VARCHAR(2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_letter_index INTEGER;
    v_double_index INTEGER;
    v_first_letter CHAR(1);
    v_second_letter CHAR(1);
BEGIN
    -- Calculate which letter batch this sequence falls into
    -- Each batch = 99,999 entries (00001 to 99999)
    v_letter_index := ((p_sequence - 1) / 99999)::INTEGER;

    -- Single letter: A-Z (indices 0-25)
    IF v_letter_index < 26 THEN
        RETURN CHR(65 + v_letter_index);  -- 65 = ASCII 'A'
    END IF;

    -- Double letter: AA-ZZ (indices 26-701)
    v_double_index := v_letter_index - 26;

    -- Clamp to max ZZ (index 675 in double-letter space)
    IF v_double_index > 675 THEN
        v_double_index := 675;
    END IF;

    -- First letter: A-Z (double_index / 26)
    v_first_letter := CHR(65 + (v_double_index / 26));

    -- Second letter: A-Z (double_index % 26)
    v_second_letter := CHR(65 + (v_double_index % 26));

    RETURN v_first_letter || v_second_letter;
END;
$$;

COMMENT ON FUNCTION get_alphanumeric_prefix(BIGINT) IS
'Converts sequence number to alphanumeric prefix: 1→A, 100000→B, ..., 2599975→AA, ..., 70199298→ZZ';

-- ============================================================================
-- STEP 2: CAPACITY ALERT FUNCTION
-- ============================================================================
-- Triggers alert when approaching single-letter limit (entering Y = 92% capacity)
-- Alert thresholds:
--   Y (letter_index 24): sequences 2,399,977+ (~92% of single-letter)
--   Z (letter_index 25): sequences 2,499,976+ (~96% of single-letter)
--   AA+ (letter_index 26+): double-letter territory

CREATE OR REPLACE FUNCTION check_display_id_capacity_alert(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20),
    p_sequence BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_letter_index INTEGER;
    v_alert_key TEXT;
    v_existing_alert UUID;
    v_entity_label TEXT;
    v_capacity_pct INTEGER;
    v_admin_user_id UUID;
BEGIN
    -- Calculate letter index
    v_letter_index := ((p_sequence - 1) / 99999)::INTEGER;

    -- Only alert when entering Y territory (92%+) or Z territory (96%+) or AA+ (100%+)
    IF v_letter_index < 24 THEN
        RETURN; -- Not at threshold yet
    END IF;

    -- Create unique alert key per tenant + entity type + threshold
    v_alert_key := p_tenant_id::TEXT || ':' || p_entity_type || ':capacity:' ||
        CASE
            WHEN v_letter_index >= 26 THEN 'double_letter'
            WHEN v_letter_index >= 25 THEN 'z_territory'
            ELSE 'y_territory'
        END;

    -- Check if we already sent this alert (avoid duplicates)
    SELECT id INTO v_existing_alert
    FROM notifications
    WHERE tenant_id = p_tenant_id
      AND notification_type = 'capacity_warning'
      AND entity_type = p_entity_type
      AND message LIKE '%' ||
          CASE
              WHEN v_letter_index >= 26 THEN 'double-letter'
              WHEN v_letter_index >= 25 THEN '96%'
              ELSE '92%'
          END || '%'
    LIMIT 1;

    IF v_existing_alert IS NOT NULL THEN
        RETURN; -- Already alerted
    END IF;

    -- Get human-readable entity label
    v_entity_label := CASE p_entity_type
        WHEN 'pick_list' THEN 'Pick Lists'
        WHEN 'purchase_order' THEN 'Purchase Orders'
        WHEN 'item' THEN 'Inventory Items'
        WHEN 'folder' THEN 'Folders'
        WHEN 'stock_count' THEN 'Stock Counts'
        WHEN 'receive' THEN 'Receives'
        WHEN 'sales_order' THEN 'Sales Orders'
        WHEN 'delivery_order' THEN 'Delivery Orders'
        WHEN 'invoice' THEN 'Invoices'
        WHEN 'credit_note' THEN 'Credit Notes'
        WHEN 'customer' THEN 'Customers'
        ELSE INITCAP(REPLACE(p_entity_type, '_', ' '))
    END;

    -- Calculate capacity percentage
    v_capacity_pct := CASE
        WHEN v_letter_index >= 26 THEN 100
        ELSE ((v_letter_index + 1) * 100 / 26)
    END;

    -- Find an admin user to notify (first org admin or any admin)
    SELECT p.id INTO v_admin_user_id
    FROM profiles p
    WHERE p.tenant_id = p_tenant_id
      AND p.role IN ('admin', 'owner')
    ORDER BY p.role = 'owner' DESC
    LIMIT 1;

    -- Insert capacity warning notification
    INSERT INTO notifications (
        tenant_id,
        user_id,
        title,
        message,
        notification_type,
        entity_type
    ) VALUES (
        p_tenant_id,
        v_admin_user_id,
        'Display ID Capacity Warning: ' || v_entity_label,
        CASE
            WHEN v_letter_index >= 26 THEN
                v_entity_label || ' have exceeded single-letter capacity and are now using double-letter prefixes (AA, AB, etc.). ' ||
                'This is normal but may affect alphabetical sorting. Current sequence: ' || p_sequence || '.'
            WHEN v_letter_index >= 25 THEN
                v_entity_label || ' are at 96% of single-letter capacity (letter Z). ' ||
                'After Z99999, display IDs will use double-letter prefixes (AA00001). ' ||
                'Current sequence: ' || p_sequence || '. Remaining single-letter capacity: ~' ||
                (2599974 - p_sequence) || ' IDs.'
            ELSE
                v_entity_label || ' are at 92% of single-letter capacity (letter Y). ' ||
                'Current sequence: ' || p_sequence || '. Remaining single-letter capacity: ~' ||
                (2599974 - p_sequence) || ' IDs before switching to double-letter prefixes.'
        END,
        'capacity_warning',
        p_entity_type
    );
END;
$$;

COMMENT ON FUNCTION check_display_id_capacity_alert(UUID, VARCHAR, BIGINT) IS
'Creates notification when display ID sequence approaches single-letter limit (Y=92%, Z=96%, AA+=100%)';

-- ============================================================================
-- STEP 3: UPDATE GENERATE_DISPLAY_ID FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_display_id(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_org_code VARCHAR(5);
    v_prefix VARCHAR(4);
    v_sequence BIGINT;
    v_display_number INTEGER;
    v_alpha_prefix VARCHAR(2);
BEGIN
    -- Get org code for tenant
    SELECT org_code INTO v_org_code
    FROM tenants
    WHERE id = p_tenant_id;

    -- Default to random code if org_code not set
    IF v_org_code IS NULL THEN
        v_org_code := UPPER(LEFT(MD5(p_tenant_id::TEXT), 5));
    END IF;

    -- Determine prefix based on entity type
    v_prefix := CASE p_entity_type
        WHEN 'pick_list' THEN 'PL'
        WHEN 'purchase_order' THEN 'PO'
        WHEN 'item' THEN 'ITM'
        WHEN 'folder' THEN 'FLD'
        WHEN 'stock_count' THEN 'SC'
        WHEN 'receive' THEN 'RCV'
        WHEN 'sales_order' THEN 'SO'
        WHEN 'delivery_order' THEN 'DO'
        WHEN 'invoice' THEN 'INV'
        WHEN 'credit_note' THEN 'CN'
        WHEN 'customer' THEN 'CUS'
        ELSE UPPER(LEFT(p_entity_type, 3))
    END;

    -- Get next sequence number (atomically)
    v_sequence := get_next_entity_number(p_tenant_id, p_entity_type);

    -- Check if approaching capacity limit and send alert if needed
    PERFORM check_display_id_capacity_alert(p_tenant_id, p_entity_type, v_sequence);

    -- Calculate display number (1-99999, cycles per letter)
    v_display_number := ((v_sequence - 1) % 99999) + 1;

    -- Get alphanumeric prefix (A, B, ..., Z, AA, AB, ..., ZZ)
    v_alpha_prefix := get_alphanumeric_prefix(v_sequence);

    -- Format: PREFIX-ORGCODE-ALPHANUMBER (e.g., SO-ACM01-A00001)
    RETURN v_prefix || '-' || v_org_code || '-' ||
           v_alpha_prefix || LPAD(v_display_number::TEXT, 5, '0');
END;
$$;

-- ============================================================================
-- STEP 4: UPDATE HELPER FUNCTION FOR CURRENT USER
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_display_id_for_current_user(
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found for current user';
    END IF;

    RETURN generate_display_id(v_tenant_id, p_entity_type);
END;
$$;

-- ============================================================================
-- STEP 5: ADMIN RPC TO CHECK DISPLAY ID CAPACITY
-- ============================================================================
-- Returns capacity status for all entity types for the current tenant

CREATE OR REPLACE FUNCTION get_display_id_capacity()
RETURNS TABLE (
    entity_type TEXT,
    entity_label TEXT,
    current_sequence BIGINT,
    current_letter TEXT,
    single_letter_capacity BIGINT,
    used_percentage NUMERIC(5,2),
    remaining_single_letter BIGINT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found for current user';
    END IF;

    RETURN QUERY
    SELECT
        esc.entity_type::TEXT,
        CASE esc.entity_type
            WHEN 'pick_list' THEN 'Pick Lists'
            WHEN 'purchase_order' THEN 'Purchase Orders'
            WHEN 'item' THEN 'Inventory Items'
            WHEN 'folder' THEN 'Folders'
            WHEN 'stock_count' THEN 'Stock Counts'
            WHEN 'receive' THEN 'Receives'
            WHEN 'sales_order' THEN 'Sales Orders'
            WHEN 'delivery_order' THEN 'Delivery Orders'
            WHEN 'invoice' THEN 'Invoices'
            WHEN 'credit_note' THEN 'Credit Notes'
            WHEN 'customer' THEN 'Customers'
            ELSE INITCAP(REPLACE(esc.entity_type, '_', ' '))
        END::TEXT AS entity_label,
        esc.current_value AS current_sequence,
        get_alphanumeric_prefix(esc.current_value)::TEXT AS current_letter,
        2599974::BIGINT AS single_letter_capacity,
        ROUND((esc.current_value::NUMERIC / 2599974) * 100, 2) AS used_percentage,
        GREATEST(0, 2599974 - esc.current_value) AS remaining_single_letter,
        CASE
            WHEN esc.current_value >= 2599974 THEN 'DOUBLE_LETTER'
            WHEN esc.current_value >= 2499976 THEN 'CRITICAL'  -- Z territory (96%+)
            WHEN esc.current_value >= 2399977 THEN 'WARNING'   -- Y territory (92%+)
            WHEN esc.current_value >= 1299987 THEN 'MODERATE'  -- M territory (50%+)
            ELSE 'HEALTHY'
        END::TEXT AS status
    FROM entity_sequence_counters esc
    WHERE esc.tenant_id = v_tenant_id
    ORDER BY esc.current_value DESC;
END;
$$;

COMMENT ON FUNCTION get_display_id_capacity() IS
'Returns display ID capacity status for all entity types. Status: HEALTHY (<50%), MODERATE (50-92%), WARNING (92-96%), CRITICAL (96-100%), DOUBLE_LETTER (100%+)';

-- ============================================================================
-- STEP 6: BACKFILL EXISTING DISPLAY_IDS WITH 'A' PREFIX
-- ============================================================================
-- Transform: SO-ACM01-00001 → SO-ACM01-A00001
-- Pattern: {PREFIX}-{ORGCODE}-{5-digit} → {PREFIX}-{ORGCODE}-A{5-digit}

-- Disable user-defined triggers temporarily for backfill (not system triggers)
ALTER TABLE pick_lists DISABLE TRIGGER USER;
ALTER TABLE purchase_orders DISABLE TRIGGER USER;
ALTER TABLE inventory_items DISABLE TRIGGER USER;
ALTER TABLE folders DISABLE TRIGGER USER;
ALTER TABLE receives DISABLE TRIGGER USER;
ALTER TABLE sales_orders DISABLE TRIGGER USER;
ALTER TABLE delivery_orders DISABLE TRIGGER USER;
ALTER TABLE invoices DISABLE TRIGGER USER;
ALTER TABLE customers DISABLE TRIGGER USER;

-- Pick Lists
UPDATE pick_lists
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Purchase Orders
UPDATE purchase_orders
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Inventory Items
UPDATE inventory_items
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Folders
UPDATE folders
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Receives
UPDATE receives
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Sales Orders
UPDATE sales_orders
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Delivery Orders
UPDATE delivery_orders
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Invoices (includes credit notes)
UPDATE invoices
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Customers
UPDATE customers
SET display_id = REGEXP_REPLACE(
    display_id,
    '^([A-Z]+)-([A-Z0-9]{3,5})-(\d{5})$',
    '\1-\2-A\3'
)
WHERE display_id IS NOT NULL
  AND display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-\d{5}$';

-- Re-enable user-defined triggers
ALTER TABLE pick_lists ENABLE TRIGGER USER;
ALTER TABLE purchase_orders ENABLE TRIGGER USER;
ALTER TABLE inventory_items ENABLE TRIGGER USER;
ALTER TABLE folders ENABLE TRIGGER USER;
ALTER TABLE receives ENABLE TRIGGER USER;
ALTER TABLE sales_orders ENABLE TRIGGER USER;
ALTER TABLE delivery_orders ENABLE TRIGGER USER;
ALTER TABLE invoices ENABLE TRIGGER USER;
ALTER TABLE customers ENABLE TRIGGER USER;

-- ============================================================================
-- STEP 7: LOG MIGRATION SUMMARY
-- ============================================================================

DO $$
DECLARE
    v_pl_count INTEGER;
    v_po_count INTEGER;
    v_item_count INTEGER;
    v_folder_count INTEGER;
    v_rcv_count INTEGER;
    v_so_count INTEGER;
    v_do_count INTEGER;
    v_inv_count INTEGER;
    v_cus_count INTEGER;
BEGIN
    -- Count records with new alphanumeric format
    SELECT COUNT(*) INTO v_pl_count FROM pick_lists
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';
    SELECT COUNT(*) INTO v_po_count FROM purchase_orders
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';
    SELECT COUNT(*) INTO v_item_count FROM inventory_items
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$' AND deleted_at IS NULL;
    SELECT COUNT(*) INTO v_folder_count FROM folders
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';
    SELECT COUNT(*) INTO v_rcv_count FROM receives
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';
    SELECT COUNT(*) INTO v_so_count FROM sales_orders
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';
    SELECT COUNT(*) INTO v_do_count FROM delivery_orders
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';
    SELECT COUNT(*) INTO v_inv_count FROM invoices
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';
    SELECT COUNT(*) INTO v_cus_count FROM customers
        WHERE display_id ~ '^[A-Z]+-[A-Z0-9]{3,5}-[A-Z]{1,2}\d{5}$';

    RAISE NOTICE '';
    RAISE NOTICE '=== Migration 00102 Complete ===';
    RAISE NOTICE 'Display IDs updated to alphanumeric format';
    RAISE NOTICE '';
    RAISE NOTICE 'Records updated:';
    RAISE NOTICE '  Pick Lists:      %', v_pl_count;
    RAISE NOTICE '  Purchase Orders: %', v_po_count;
    RAISE NOTICE '  Inventory Items: %', v_item_count;
    RAISE NOTICE '  Folders:         %', v_folder_count;
    RAISE NOTICE '  Receives:        %', v_rcv_count;
    RAISE NOTICE '  Sales Orders:    %', v_so_count;
    RAISE NOTICE '  Delivery Orders: %', v_do_count;
    RAISE NOTICE '  Invoices:        %', v_inv_count;
    RAISE NOTICE '  Customers:       %', v_cus_count;
    RAISE NOTICE '';
    RAISE NOTICE 'New format: {PREFIX}-{ORGCODE}-{LETTER(S)}{5-digit}';
    RAISE NOTICE 'Examples:';
    RAISE NOTICE '  SO-ACM01-A00001  (Sales Order #1)';
    RAISE NOTICE '  SO-ACM01-A99999  (Sales Order #99,999)';
    RAISE NOTICE '  SO-ACM01-B00001  (Sales Order #100,000)';
    RAISE NOTICE '  SO-ACM01-Z99999  (Sales Order #2,599,974)';
    RAISE NOTICE '  SO-ACM01-AA00001 (Sales Order #2,599,975)';
    RAISE NOTICE '';
    RAISE NOTICE 'Capacity: ~70 million per entity type per tenant';
END;
$$;

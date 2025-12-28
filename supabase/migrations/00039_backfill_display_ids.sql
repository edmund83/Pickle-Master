-- Migration: Backfill display_ids for existing data
-- This migration generates display_ids for all existing records
-- and updates the sequence counters to reflect the current state

-- ===================
-- Step 1: Backfill display_ids for Pick Lists
-- ===================
WITH numbered_pick_lists AS (
    SELECT
        pl.id,
        t.org_code,
        ROW_NUMBER() OVER (PARTITION BY pl.tenant_id ORDER BY pl.created_at, pl.id) as rn
    FROM pick_lists pl
    JOIN tenants t ON t.id = pl.tenant_id
    WHERE pl.display_id IS NULL
)
UPDATE pick_lists pl
SET display_id = 'PL-' || npl.org_code || '-' || LPAD(npl.rn::TEXT, 5, '0')
FROM numbered_pick_lists npl
WHERE pl.id = npl.id;

-- Update pick_list counters to reflect backfilled data
INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
SELECT
    pl.tenant_id,
    'pick_list',
    COUNT(*)
FROM pick_lists pl
GROUP BY pl.tenant_id
ON CONFLICT (tenant_id, entity_type)
DO UPDATE SET
    current_value = GREATEST(entity_sequence_counters.current_value, EXCLUDED.current_value),
    updated_at = NOW();

-- ===================
-- Step 2: Backfill display_ids for Purchase Orders
-- ===================
WITH numbered_purchase_orders AS (
    SELECT
        po.id,
        t.org_code,
        ROW_NUMBER() OVER (PARTITION BY po.tenant_id ORDER BY po.created_at, po.id) as rn
    FROM purchase_orders po
    JOIN tenants t ON t.id = po.tenant_id
    WHERE po.display_id IS NULL
)
UPDATE purchase_orders po
SET display_id = 'PO-' || npo.org_code || '-' || LPAD(npo.rn::TEXT, 5, '0')
FROM numbered_purchase_orders npo
WHERE po.id = npo.id;

-- Update purchase_order counters
INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
SELECT
    po.tenant_id,
    'purchase_order',
    COUNT(*)
FROM purchase_orders po
GROUP BY po.tenant_id
ON CONFLICT (tenant_id, entity_type)
DO UPDATE SET
    current_value = GREATEST(entity_sequence_counters.current_value, EXCLUDED.current_value),
    updated_at = NOW();

-- ===================
-- Step 3: Backfill display_ids for Inventory Items
-- ===================
WITH numbered_items AS (
    SELECT
        i.id,
        t.org_code,
        ROW_NUMBER() OVER (PARTITION BY i.tenant_id ORDER BY i.created_at, i.id) as rn
    FROM inventory_items i
    JOIN tenants t ON t.id = i.tenant_id
    WHERE i.display_id IS NULL
      AND i.deleted_at IS NULL
)
UPDATE inventory_items i
SET display_id = 'ITM-' || ni.org_code || '-' || LPAD(ni.rn::TEXT, 5, '0')
FROM numbered_items ni
WHERE i.id = ni.id;

-- Update item counters
INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
SELECT
    i.tenant_id,
    'item',
    COUNT(*)
FROM inventory_items i
WHERE i.deleted_at IS NULL
GROUP BY i.tenant_id
ON CONFLICT (tenant_id, entity_type)
DO UPDATE SET
    current_value = GREATEST(entity_sequence_counters.current_value, EXCLUDED.current_value),
    updated_at = NOW();

-- ===================
-- Step 4: Backfill display_ids for Folders
-- ===================
WITH numbered_folders AS (
    SELECT
        f.id,
        t.org_code,
        ROW_NUMBER() OVER (PARTITION BY f.tenant_id ORDER BY f.created_at, f.id) as rn
    FROM folders f
    JOIN tenants t ON t.id = f.tenant_id
    WHERE f.display_id IS NULL
)
UPDATE folders f
SET display_id = 'FLD-' || nf.org_code || '-' || LPAD(nf.rn::TEXT, 5, '0')
FROM numbered_folders nf
WHERE f.id = nf.id;

-- Update folder counters
INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
SELECT
    f.tenant_id,
    'folder',
    COUNT(*)
FROM folders f
GROUP BY f.tenant_id
ON CONFLICT (tenant_id, entity_type)
DO UPDATE SET
    current_value = GREATEST(entity_sequence_counters.current_value, EXCLUDED.current_value),
    updated_at = NOW();

-- ===================
-- Step 5: Log backfill summary
-- ===================
DO $$
DECLARE
    pl_count INTEGER;
    po_count INTEGER;
    item_count INTEGER;
    folder_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pl_count FROM pick_lists WHERE display_id IS NOT NULL;
    SELECT COUNT(*) INTO po_count FROM purchase_orders WHERE display_id IS NOT NULL;
    SELECT COUNT(*) INTO item_count FROM inventory_items WHERE display_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO folder_count FROM folders WHERE display_id IS NOT NULL;

    RAISE NOTICE 'Backfill complete:';
    RAISE NOTICE '  Pick Lists: % records', pl_count;
    RAISE NOTICE '  Purchase Orders: % records', po_count;
    RAISE NOTICE '  Inventory Items: % records', item_count;
    RAISE NOTICE '  Folders: % records', folder_count;
END;
$$;

-- Migration: Add display_id columns to entity tables
-- Adds human-readable unique identifiers to pick_lists, purchase_orders, inventory_items, folders
-- Format: PREFIX-ORGCODE-SEQUENCE (e.g., PL-ACM01-00001)

-- ===================
-- Pick Lists
-- ===================
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS display_id VARCHAR(20);

-- Unique index for display_id (globally unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pick_lists_display_id
    ON pick_lists(display_id)
    WHERE display_id IS NOT NULL;

-- Trigram index for partial/fuzzy search
CREATE INDEX IF NOT EXISTS idx_pick_lists_display_id_trgm
    ON pick_lists USING GIN(display_id gin_trgm_ops)
    WHERE display_id IS NOT NULL;

-- Composite index for tenant + display_id queries (RLS optimization)
CREATE INDEX IF NOT EXISTS idx_pick_lists_tenant_display
    ON pick_lists(tenant_id, display_id)
    WHERE display_id IS NOT NULL;

COMMENT ON COLUMN pick_lists.display_id IS 'Human-readable unique ID: PL-{ORG_CODE}-{5-digit-number}, e.g., PL-ACM01-00001';

-- ===================
-- Purchase Orders
-- ===================
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS display_id VARCHAR(20);

-- Unique index for display_id (globally unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_orders_display_id
    ON purchase_orders(display_id)
    WHERE display_id IS NOT NULL;

-- Trigram index for partial/fuzzy search
CREATE INDEX IF NOT EXISTS idx_purchase_orders_display_id_trgm
    ON purchase_orders USING GIN(display_id gin_trgm_ops)
    WHERE display_id IS NOT NULL;

-- Composite index for tenant + display_id queries (RLS optimization)
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_display
    ON purchase_orders(tenant_id, display_id)
    WHERE display_id IS NOT NULL;

COMMENT ON COLUMN purchase_orders.display_id IS 'Human-readable unique ID: PO-{ORG_CODE}-{5-digit-number}, e.g., PO-ACM01-00001';

-- ===================
-- Inventory Items
-- ===================
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS display_id VARCHAR(20);

-- Unique index for display_id (only for non-deleted items)
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_items_display_id
    ON inventory_items(display_id)
    WHERE display_id IS NOT NULL AND deleted_at IS NULL;

-- Trigram index for partial/fuzzy search (only non-deleted)
CREATE INDEX IF NOT EXISTS idx_inventory_items_display_id_trgm
    ON inventory_items USING GIN(display_id gin_trgm_ops)
    WHERE display_id IS NOT NULL AND deleted_at IS NULL;

-- Composite index for tenant + display_id queries (RLS optimization)
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_display
    ON inventory_items(tenant_id, display_id)
    WHERE display_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN inventory_items.display_id IS 'Human-readable unique ID: ITM-{ORG_CODE}-{5-digit-number}, e.g., ITM-ACM01-00001';

-- ===================
-- Folders
-- ===================
ALTER TABLE folders ADD COLUMN IF NOT EXISTS display_id VARCHAR(20);

-- Unique index for display_id (globally unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_display_id
    ON folders(display_id)
    WHERE display_id IS NOT NULL;

-- Trigram index for partial/fuzzy search
CREATE INDEX IF NOT EXISTS idx_folders_display_id_trgm
    ON folders USING GIN(display_id gin_trgm_ops)
    WHERE display_id IS NOT NULL;

-- Composite index for tenant + display_id queries (RLS optimization)
CREATE INDEX IF NOT EXISTS idx_folders_tenant_display
    ON folders(tenant_id, display_id)
    WHERE display_id IS NOT NULL;

COMMENT ON COLUMN folders.display_id IS 'Human-readable unique ID: FLD-{ORG_CODE}-{5-digit-number}, e.g., FLD-ACM01-00001';

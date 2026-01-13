-- ============================================
-- Migration: 00055_auto_reorder_suggestions.sql
-- Purpose: Auto-reorder suggestions feature - link items to vendors and generate reorder suggestions
-- ============================================

-- ===================
-- ITEM_VENDORS TABLE
-- Links items to their suppliers with ordering details
-- ===================
CREATE TABLE IF NOT EXISTS item_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

    -- Vendor-specific details
    vendor_sku VARCHAR(255),              -- Vendor's part/SKU number
    unit_cost DECIMAL(12,2),              -- Cost from this vendor
    min_order_qty INTEGER DEFAULT 1,      -- Minimum order quantity from vendor
    pack_size INTEGER DEFAULT 1,          -- How many units per pack/case
    lead_time_days INTEGER DEFAULT 7,     -- Days from order to receipt

    -- Preference
    is_preferred BOOLEAN DEFAULT FALSE,   -- Is this the preferred vendor?
    priority INTEGER DEFAULT 1,           -- Lower = higher priority if multiple vendors

    -- Historical tracking
    last_ordered_at TIMESTAMPTZ,
    last_unit_cost DECIMAL(12,2),         -- Last price paid

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One record per item-vendor pair
    CONSTRAINT unique_item_vendor UNIQUE (item_id, vendor_id)
);

-- Indexes for item_vendors
CREATE INDEX IF NOT EXISTS idx_item_vendors_tenant ON item_vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_item_vendors_item ON item_vendors(item_id);
CREATE INDEX IF NOT EXISTS idx_item_vendors_vendor ON item_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_item_vendors_preferred ON item_vendors(item_id) WHERE is_preferred = true;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_item_vendors_updated_at ON item_vendors;
CREATE TRIGGER trigger_item_vendors_updated_at
    BEFORE UPDATE ON item_vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- EXTEND INVENTORY_ITEMS
-- Add reorder point and quantity columns
-- ===================
ALTER TABLE inventory_items
    ADD COLUMN IF NOT EXISTS reorder_point INTEGER,
    ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER;

COMMENT ON COLUMN inventory_items.reorder_point IS 'Stock level at which to trigger reorder suggestion (defaults to min_quantity if not set)';
COMMENT ON COLUMN inventory_items.reorder_quantity IS 'Default quantity to order when reordering';

-- ===================
-- RLS POLICIES FOR ITEM_VENDORS
-- ===================
ALTER TABLE item_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tenant item_vendors" ON item_vendors;
CREATE POLICY "Users can view tenant item_vendors" ON item_vendors
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert item_vendors" ON item_vendors;
CREATE POLICY "Editors can insert item_vendors" ON item_vendors
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update item_vendors" ON item_vendors;
CREATE POLICY "Editors can update item_vendors" ON item_vendors
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete item_vendors" ON item_vendors;
CREATE POLICY "Admins can delete item_vendors" ON item_vendors
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- TRIGGER: Ensure only one preferred vendor per item
-- ===================
CREATE OR REPLACE FUNCTION ensure_single_preferred_vendor()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this vendor as preferred, unset others
    IF NEW.is_preferred = TRUE THEN
        UPDATE item_vendors
        SET is_preferred = FALSE
        WHERE item_id = NEW.item_id
        AND id != NEW.id
        AND is_preferred = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_preferred_vendor ON item_vendors;
CREATE TRIGGER trigger_ensure_single_preferred_vendor
    BEFORE INSERT OR UPDATE ON item_vendors
    FOR EACH ROW
    WHEN (NEW.is_preferred = TRUE)
    EXECUTE FUNCTION ensure_single_preferred_vendor();

-- ===================
-- RPC: Get Reorder Suggestions
-- Returns items below reorder point with vendor info
-- ===================
CREATE OR REPLACE FUNCTION get_reorder_suggestions(
    p_include_without_vendor BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                i.id as item_id,
                i.name as item_name,
                i.sku,
                i.image_urls[1] as item_image,
                i.quantity as current_qty,
                i.min_quantity,
                COALESCE(i.reorder_point, i.min_quantity) as reorder_point,
                COALESCE(
                    i.reorder_quantity,
                    GREATEST(
                        (COALESCE(i.reorder_point, i.min_quantity, 0) * 2) - i.quantity,
                        COALESCE(iv.min_order_qty, 1)
                    )
                ) as suggested_qty,
                -- Preferred vendor info (if exists)
                iv.id as item_vendor_id,
                iv.vendor_id as preferred_vendor_id,
                v.name as preferred_vendor_name,
                v.email as preferred_vendor_email,
                iv.vendor_sku,
                iv.unit_cost,
                iv.min_order_qty,
                iv.pack_size,
                iv.lead_time_days as vendor_lead_time,
                -- Urgency calculation
                CASE
                    WHEN i.quantity <= 0 THEN 'critical'
                    WHEN i.quantity <= COALESCE(i.min_quantity, 0) THEN 'urgent'
                    WHEN i.quantity <= COALESCE(i.reorder_point, i.min_quantity, 0) THEN 'reorder'
                    ELSE 'normal'
                END as urgency,
                -- Reason text
                CASE
                    WHEN i.quantity <= 0 THEN format('%s is out of stock', i.name)
                    WHEN i.quantity <= COALESCE(i.min_quantity, 0) THEN
                        format('%s is critically low (%s left, min %s)', i.name, i.quantity, COALESCE(i.min_quantity, 0))
                    ELSE format('%s is below reorder point (%s left, reorder at %s)',
                        i.name, i.quantity, COALESCE(i.reorder_point, i.min_quantity, 0))
                END as reason
            FROM inventory_items i
            LEFT JOIN item_vendors iv ON iv.item_id = i.id AND iv.is_preferred = true
            LEFT JOIN vendors v ON v.id = iv.vendor_id
            WHERE i.tenant_id = tenant
            AND i.deleted_at IS NULL
            AND (
                i.quantity <= COALESCE(i.reorder_point, i.min_quantity, 0)
                OR i.quantity <= COALESCE(i.min_quantity, 0)
            )
            AND COALESCE(i.min_quantity, 0) > 0  -- Only items with defined thresholds
            AND (p_include_without_vendor OR iv.vendor_id IS NOT NULL)
            ORDER BY
                CASE
                    WHEN i.quantity <= 0 THEN 0
                    WHEN i.quantity <= COALESCE(i.min_quantity, 0) THEN 1
                    ELSE 2
                END,
                (COALESCE(i.reorder_point, i.min_quantity, 0) - i.quantity) DESC
            LIMIT 100
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_reorder_suggestions IS 'Returns items below reorder point with their preferred vendor info';

-- ===================
-- RPC: Get Reorder Suggestions Grouped by Vendor
-- Groups low-stock items by their preferred vendor for batch PO creation
-- ===================
CREATE OR REPLACE FUNCTION get_reorder_suggestions_by_vendor()
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                v.id as vendor_id,
                v.name as vendor_name,
                v.email as vendor_email,
                v.phone as vendor_phone,
                COUNT(i.id)::INTEGER as item_count,
                SUM(
                    COALESCE(iv.unit_cost, i.cost_price, 0) *
                    GREATEST(
                        COALESCE(i.reorder_quantity, (COALESCE(i.reorder_point, i.min_quantity, 0) * 2) - i.quantity),
                        COALESCE(iv.min_order_qty, 1)
                    )
                )::DECIMAL(12,2) as estimated_total,
                json_agg(json_build_object(
                    'item_id', i.id,
                    'item_name', i.name,
                    'sku', i.sku,
                    'item_image', i.image_urls[1],
                    'vendor_sku', iv.vendor_sku,
                    'current_qty', i.quantity,
                    'min_quantity', i.min_quantity,
                    'reorder_point', COALESCE(i.reorder_point, i.min_quantity),
                    'suggested_qty', GREATEST(
                        COALESCE(i.reorder_quantity, (COALESCE(i.reorder_point, i.min_quantity, 0) * 2) - i.quantity),
                        COALESCE(iv.min_order_qty, 1)
                    ),
                    'unit_cost', COALESCE(iv.unit_cost, i.cost_price),
                    'urgency', CASE
                        WHEN i.quantity <= 0 THEN 'critical'
                        WHEN i.quantity <= COALESCE(i.min_quantity, 0) THEN 'urgent'
                        ELSE 'reorder'
                    END
                ) ORDER BY i.quantity ASC) as items
            FROM inventory_items i
            INNER JOIN item_vendors iv ON iv.item_id = i.id AND iv.is_preferred = true
            INNER JOIN vendors v ON v.id = iv.vendor_id
            WHERE i.tenant_id = tenant
            AND i.deleted_at IS NULL
            AND (
                i.quantity <= COALESCE(i.reorder_point, i.min_quantity, 0)
                OR i.quantity <= COALESCE(i.min_quantity, 0)
            )
            AND COALESCE(i.min_quantity, 0) > 0
            GROUP BY v.id, v.name, v.email, v.phone
            ORDER BY COUNT(i.id) DESC
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_reorder_suggestions_by_vendor IS 'Returns low-stock items grouped by their preferred vendor for batch PO creation';

-- ===================
-- RPC: Create PO from Suggestions
-- Creates a draft PO from a list of suggested items
-- ===================
CREATE OR REPLACE FUNCTION create_po_from_suggestions(
    p_vendor_id UUID,
    p_item_suggestions JSONB  -- Array of {item_id, quantity, unit_cost}
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_display_id VARCHAR(20);
    v_po_id UUID;
    v_item JSONB;
    v_items_added INTEGER := 0;
    v_subtotal DECIMAL(12,2) := 0;
BEGIN
    -- Get tenant and user IDs
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    IF p_vendor_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Vendor ID is required');
    END IF;

    IF p_item_suggestions IS NULL OR jsonb_array_length(p_item_suggestions) = 0 THEN
        RETURN json_build_object('success', false, 'error', 'At least one item is required');
    END IF;

    -- Generate display ID (atomic)
    v_display_id := generate_display_id(v_tenant_id, 'purchase_order');

    -- Create purchase order
    INSERT INTO purchase_orders (
        tenant_id,
        display_id,
        order_number,
        vendor_id,
        status,
        subtotal,
        tax,
        shipping,
        total_amount,
        created_by,
        currency
    ) VALUES (
        v_tenant_id,
        v_display_id,
        v_display_id,
        p_vendor_id,
        'draft',
        0,
        0,
        0,
        0,
        v_user_id,
        'MYR'
    ) RETURNING id INTO v_po_id;

    -- Insert items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_item_suggestions)
    LOOP
        INSERT INTO purchase_order_items (
            purchase_order_id,
            item_id,
            item_name,
            sku,
            ordered_quantity,
            unit_price,
            received_quantity
        )
        SELECT
            v_po_id,
            i.id,
            i.name,
            COALESCE(iv.vendor_sku, i.sku),
            (v_item->>'quantity')::INTEGER,
            COALESCE((v_item->>'unit_cost')::DECIMAL, iv.unit_cost, i.cost_price, 0),
            0
        FROM inventory_items i
        LEFT JOIN item_vendors iv ON iv.item_id = i.id AND iv.vendor_id = p_vendor_id
        WHERE i.id = (v_item->>'item_id')::UUID;

        v_items_added := v_items_added + 1;
    END LOOP;

    -- Calculate totals
    SELECT COALESCE(SUM(ordered_quantity * unit_price), 0)
    INTO v_subtotal
    FROM purchase_order_items
    WHERE purchase_order_id = v_po_id;

    UPDATE purchase_orders
    SET subtotal = v_subtotal,
        total_amount = v_subtotal
    WHERE id = v_po_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        entity_name,
        action_type
    ) VALUES (
        v_tenant_id,
        v_user_id,
        'purchase_order',
        v_po_id,
        v_display_id,
        'create'
    );

    RETURN json_build_object(
        'success', true,
        'purchase_order_id', v_po_id,
        'display_id', v_display_id,
        'items_added', v_items_added,
        'subtotal', v_subtotal
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_po_from_suggestions IS 'Creates a draft purchase order from a list of suggested items';

-- ===================
-- RPC: Get Item Vendors
-- Returns all vendors for a specific item
-- ===================
CREATE OR REPLACE FUNCTION get_item_vendors(p_item_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.is_preferred DESC, r.priority ASC), '[]'::json)
        FROM (
            SELECT
                iv.id,
                iv.item_id,
                iv.vendor_id,
                v.name as vendor_name,
                v.email as vendor_email,
                v.phone as vendor_phone,
                iv.vendor_sku,
                iv.unit_cost,
                iv.min_order_qty,
                iv.pack_size,
                iv.lead_time_days,
                iv.is_preferred,
                iv.priority,
                iv.last_ordered_at,
                iv.last_unit_cost,
                iv.notes,
                iv.created_at,
                iv.updated_at
            FROM item_vendors iv
            JOIN vendors v ON v.id = iv.vendor_id
            WHERE iv.item_id = p_item_id
            AND iv.tenant_id = get_user_tenant_id()
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_item_vendors IS 'Returns all vendors linked to a specific item';

-- ===================
-- RPC: Link Item to Vendor
-- Creates or updates an item-vendor relationship
-- ===================
CREATE OR REPLACE FUNCTION link_item_to_vendor(
    p_item_id UUID,
    p_vendor_id UUID,
    p_vendor_sku VARCHAR DEFAULT NULL,
    p_unit_cost DECIMAL DEFAULT NULL,
    p_min_order_qty INTEGER DEFAULT 1,
    p_pack_size INTEGER DEFAULT 1,
    p_lead_time_days INTEGER DEFAULT 7,
    p_is_preferred BOOLEAN DEFAULT FALSE,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_item_vendor_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tenant not found');
    END IF;

    -- Upsert item-vendor relationship
    INSERT INTO item_vendors (
        tenant_id,
        item_id,
        vendor_id,
        vendor_sku,
        unit_cost,
        min_order_qty,
        pack_size,
        lead_time_days,
        is_preferred,
        notes
    ) VALUES (
        v_tenant_id,
        p_item_id,
        p_vendor_id,
        p_vendor_sku,
        p_unit_cost,
        p_min_order_qty,
        p_pack_size,
        p_lead_time_days,
        p_is_preferred,
        p_notes
    )
    ON CONFLICT (item_id, vendor_id)
    DO UPDATE SET
        vendor_sku = COALESCE(EXCLUDED.vendor_sku, item_vendors.vendor_sku),
        unit_cost = COALESCE(EXCLUDED.unit_cost, item_vendors.unit_cost),
        min_order_qty = EXCLUDED.min_order_qty,
        pack_size = EXCLUDED.pack_size,
        lead_time_days = EXCLUDED.lead_time_days,
        is_preferred = EXCLUDED.is_preferred,
        notes = COALESCE(EXCLUDED.notes, item_vendors.notes),
        updated_at = NOW()
    RETURNING id INTO v_item_vendor_id;

    RETURN json_build_object(
        'success', true,
        'item_vendor_id', v_item_vendor_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION link_item_to_vendor IS 'Creates or updates an item-vendor relationship';

-- ===================
-- RPC: Get Reorder Suggestions Count
-- Returns count of items needing reorder (for sidebar badge)
-- ===================
CREATE OR REPLACE FUNCTION get_reorder_suggestions_count()
RETURNS INTEGER AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM inventory_items i
        WHERE i.tenant_id = tenant
        AND i.deleted_at IS NULL
        AND (
            i.quantity <= COALESCE(i.reorder_point, i.min_quantity, 0)
            OR i.quantity <= COALESCE(i.min_quantity, 0)
        )
        AND COALESCE(i.min_quantity, 0) > 0
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_reorder_suggestions_count IS 'Returns count of items below reorder point for sidebar badge';

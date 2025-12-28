-- ============================================
-- Migration: Stock Count Workflow
-- Purpose: Physical inventory counts and reconciliation
-- ============================================

-- ===================
-- ENUM TYPES
-- ===================

-- Stock count status
CREATE TYPE stock_count_status AS ENUM ('draft', 'in_progress', 'review', 'completed', 'cancelled');

-- Stock count scope type (uses folders for organization, not locations)
CREATE TYPE stock_count_scope_type AS ENUM ('full', 'folder', 'custom');

-- Stock count item status
CREATE TYPE stock_count_item_status AS ENUM ('pending', 'counted', 'verified', 'adjusted');

-- ===================
-- STOCK COUNTS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS stock_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Display ID (e.g., SC-ACM01-00001)
    display_id VARCHAR(20),

    -- Basic info
    name VARCHAR(255),
    description TEXT,
    status stock_count_status NOT NULL DEFAULT 'draft',

    -- Scope of the count (uses folders for organization)
    scope_type stock_count_scope_type NOT NULL DEFAULT 'full',
    scope_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

    -- Assignment
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- Timing
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Summary stats (computed/cached)
    total_items INTEGER DEFAULT 0,
    counted_items INTEGER DEFAULT 0,
    variance_items INTEGER DEFAULT 0,

    -- Audit
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_counts_tenant ON stock_counts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_counts_status ON stock_counts(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_counts_assigned ON stock_counts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_stock_counts_due_date ON stock_counts(due_date) WHERE status NOT IN ('completed', 'cancelled');

-- ===================
-- STOCK COUNT ITEMS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS stock_count_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_count_id UUID NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,

    -- System values at time of count creation
    expected_quantity INTEGER NOT NULL,

    -- Counted values
    counted_quantity INTEGER,
    counted_at TIMESTAMPTZ,
    counted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Variance (computed)
    variance INTEGER GENERATED ALWAYS AS (
        CASE WHEN counted_quantity IS NOT NULL
        THEN counted_quantity - expected_quantity
        ELSE NULL END
    ) STORED,
    variance_resolved BOOLEAN DEFAULT FALSE,
    variance_notes TEXT,

    -- Status
    status stock_count_item_status NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate items in same count
    CONSTRAINT unique_item_per_stock_count UNIQUE (stock_count_id, item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_count_items_count ON stock_count_items(stock_count_id);
CREATE INDEX IF NOT EXISTS idx_stock_count_items_item ON stock_count_items(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_count_items_status ON stock_count_items(stock_count_id, status);

-- ===================
-- RLS POLICIES
-- ===================

-- Enable RLS
ALTER TABLE stock_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_count_items ENABLE ROW LEVEL SECURITY;

-- STOCK COUNTS POLICIES
DROP POLICY IF EXISTS "Users can view tenant stock counts" ON stock_counts;
CREATE POLICY "Users can view tenant stock counts" ON stock_counts
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert stock counts" ON stock_counts;
CREATE POLICY "Editors can insert stock counts" ON stock_counts
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update stock counts" ON stock_counts;
CREATE POLICY "Editors can update stock counts" ON stock_counts
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete stock counts" ON stock_counts;
CREATE POLICY "Admins can delete stock counts" ON stock_counts
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- STOCK COUNT ITEMS POLICIES (based on parent stock_count access)
DROP POLICY IF EXISTS "Users can view stock count items" ON stock_count_items;
CREATE POLICY "Users can view stock count items" ON stock_count_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stock_counts sc
            WHERE sc.id = stock_count_items.stock_count_id
            AND sc.tenant_id = get_user_tenant_id()
        )
    );

DROP POLICY IF EXISTS "Editors can insert stock count items" ON stock_count_items;
CREATE POLICY "Editors can insert stock count items" ON stock_count_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stock_counts sc
            WHERE sc.id = stock_count_items.stock_count_id
            AND sc.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update stock count items" ON stock_count_items;
CREATE POLICY "Editors can update stock count items" ON stock_count_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stock_counts sc
            WHERE sc.id = stock_count_items.stock_count_id
            AND sc.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete stock count items" ON stock_count_items;
CREATE POLICY "Admins can delete stock count items" ON stock_count_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM stock_counts sc
            WHERE sc.id = stock_count_items.stock_count_id
            AND sc.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Create a new stock count with items
CREATE OR REPLACE FUNCTION create_stock_count(
    p_name VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_scope_type stock_count_scope_type DEFAULT 'full',
    p_scope_folder_id UUID DEFAULT NULL,
    p_assigned_to UUID DEFAULT NULL,
    p_due_date TIMESTAMPTZ DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_stock_count_id UUID;
    v_tenant_id UUID;
    v_display_id VARCHAR(20);
    v_item_count INTEGER := 0;
BEGIN
    -- Get tenant ID
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User has no associated tenant');
    END IF;

    -- Generate display ID
    v_display_id := generate_display_id(v_tenant_id, 'stock_count');

    -- Create stock count
    INSERT INTO stock_counts (
        tenant_id, display_id, name, description, scope_type,
        scope_folder_id, assigned_to, due_date, notes, created_by
    ) VALUES (
        v_tenant_id, v_display_id,
        COALESCE(p_name, 'Stock Count ' || to_char(NOW(), 'YYYY-MM-DD')),
        p_description, p_scope_type, p_scope_folder_id,
        p_assigned_to, p_due_date, p_notes, auth.uid()
    ) RETURNING id INTO v_stock_count_id;

    -- Set assigned_at if assigned_to is provided
    IF p_assigned_to IS NOT NULL THEN
        UPDATE stock_counts SET assigned_at = NOW() WHERE id = v_stock_count_id;
    END IF;

    -- Add items based on scope
    IF p_scope_type = 'full' THEN
        -- All items in tenant
        INSERT INTO stock_count_items (stock_count_id, item_id, expected_quantity)
        SELECT v_stock_count_id, id, COALESCE(quantity, 0)
        FROM inventory_items
        WHERE tenant_id = v_tenant_id;
    ELSIF p_scope_type = 'folder' AND p_scope_folder_id IS NOT NULL THEN
        -- Items in specific folder (and subfolders)
        INSERT INTO stock_count_items (stock_count_id, item_id, expected_quantity)
        SELECT v_stock_count_id, i.id, COALESCE(i.quantity, 0)
        FROM inventory_items i
        WHERE i.tenant_id = v_tenant_id
        AND i.folder_id IN (
            WITH RECURSIVE folder_tree AS (
                SELECT id FROM folders WHERE id = p_scope_folder_id AND tenant_id = v_tenant_id
                UNION ALL
                SELECT f.id FROM folders f
                JOIN folder_tree ft ON f.parent_id = ft.id
                WHERE f.tenant_id = v_tenant_id
            )
            SELECT id FROM folder_tree
        );
    END IF;
    -- For 'custom' scope, items are added manually later

    -- Update total_items count
    SELECT COUNT(*) INTO v_item_count FROM stock_count_items WHERE stock_count_id = v_stock_count_id;
    UPDATE stock_counts SET total_items = v_item_count WHERE id = v_stock_count_id;

    RETURN json_build_object(
        'success', true,
        'id', v_stock_count_id,
        'display_id', v_display_id,
        'item_count', v_item_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record a count for an item
CREATE OR REPLACE FUNCTION record_stock_count(
    p_stock_count_item_id UUID,
    p_counted_quantity INTEGER,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_stock_count_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get stock count ID and verify access
    SELECT sc.id, sc.tenant_id INTO v_stock_count_id, v_tenant_id
    FROM stock_count_items sci
    JOIN stock_counts sc ON sc.id = sci.stock_count_id
    WHERE sci.id = p_stock_count_item_id
    AND sc.tenant_id = get_user_tenant_id();

    IF v_stock_count_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Stock count item not found');
    END IF;

    -- Update the item
    UPDATE stock_count_items
    SET
        counted_quantity = p_counted_quantity,
        counted_at = NOW(),
        counted_by = auth.uid(),
        status = 'counted',
        variance_notes = COALESCE(p_notes, variance_notes)
    WHERE id = p_stock_count_item_id;

    -- Update parent stats
    UPDATE stock_counts
    SET
        counted_items = (
            SELECT COUNT(*) FROM stock_count_items
            WHERE stock_count_id = v_stock_count_id AND status != 'pending'
        ),
        variance_items = (
            SELECT COUNT(*) FROM stock_count_items
            WHERE stock_count_id = v_stock_count_id
            AND counted_quantity IS NOT NULL
            AND counted_quantity != expected_quantity
        )
    WHERE id = v_stock_count_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Start a stock count
CREATE OR REPLACE FUNCTION start_stock_count(p_stock_count_id UUID)
RETURNS JSON AS $$
BEGIN
    UPDATE stock_counts
    SET status = 'in_progress', started_at = NOW()
    WHERE id = p_stock_count_id
    AND tenant_id = get_user_tenant_id()
    AND status = 'draft';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Stock count not found or not in draft status');
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit for review
CREATE OR REPLACE FUNCTION submit_stock_count_for_review(p_stock_count_id UUID)
RETURNS JSON AS $$
BEGIN
    UPDATE stock_counts
    SET status = 'review'
    WHERE id = p_stock_count_id
    AND tenant_id = get_user_tenant_id()
    AND status = 'in_progress';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Stock count not found or not in progress');
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete stock count and optionally apply adjustments
CREATE OR REPLACE FUNCTION complete_stock_count(
    p_stock_count_id UUID,
    p_apply_adjustments BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_adjusted_count INTEGER := 0;
    v_user_name VARCHAR;
BEGIN
    -- Verify access
    SELECT tenant_id INTO v_tenant_id
    FROM stock_counts
    WHERE id = p_stock_count_id
    AND tenant_id = get_user_tenant_id()
    AND status IN ('in_progress', 'review');

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Stock count not found or already completed');
    END IF;

    -- Get user name for activity log
    SELECT full_name INTO v_user_name FROM profiles WHERE id = auth.uid();

    -- Apply adjustments if requested
    IF p_apply_adjustments THEN
        -- Update inventory quantities to match counted quantities
        UPDATE inventory_items i
        SET quantity = sci.counted_quantity
        FROM stock_count_items sci
        WHERE sci.stock_count_id = p_stock_count_id
        AND sci.item_id = i.id
        AND sci.counted_quantity IS NOT NULL
        AND sci.counted_quantity != sci.expected_quantity;

        GET DIAGNOSTICS v_adjusted_count = ROW_COUNT;

        -- Mark items as adjusted
        UPDATE stock_count_items
        SET status = 'adjusted', variance_resolved = TRUE
        WHERE stock_count_id = p_stock_count_id
        AND counted_quantity IS NOT NULL
        AND counted_quantity != expected_quantity;

        -- Log activity for each adjusted item
        INSERT INTO activity_logs (
            tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
            action_type, changes
        )
        SELECT
            v_tenant_id, auth.uid(), v_user_name, 'item', i.id, i.name,
            'stock_count_adjustment',
            jsonb_build_object(
                'stock_count_id', p_stock_count_id,
                'expected_quantity', sci.expected_quantity,
                'counted_quantity', sci.counted_quantity,
                'variance', sci.variance
            )
        FROM stock_count_items sci
        JOIN inventory_items i ON i.id = sci.item_id
        WHERE sci.stock_count_id = p_stock_count_id
        AND sci.status = 'adjusted';
    END IF;

    -- Complete the stock count
    UPDATE stock_counts
    SET status = 'completed', completed_at = NOW()
    WHERE id = p_stock_count_id;

    RETURN json_build_object(
        'success', true,
        'adjustments_applied', p_apply_adjustments,
        'adjusted_count', v_adjusted_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel stock count
CREATE OR REPLACE FUNCTION cancel_stock_count(p_stock_count_id UUID)
RETURNS JSON AS $$
BEGIN
    UPDATE stock_counts
    SET status = 'cancelled'
    WHERE id = p_stock_count_id
    AND tenant_id = get_user_tenant_id()
    AND status NOT IN ('completed', 'cancelled');

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Stock count not found or already completed/cancelled');
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get stock count with items
CREATE OR REPLACE FUNCTION get_stock_count_with_items(p_stock_count_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'stock_count', row_to_json(sc),
        'items', COALESCE((
            SELECT json_agg(row_to_json(item_data) ORDER BY item_data.item_name)
            FROM (
                SELECT
                    sci.id,
                    sci.item_id,
                    i.name as item_name,
                    i.sku as item_sku,
                    i.image_urls[1] as item_image,
                    sci.expected_quantity,
                    sci.counted_quantity,
                    sci.variance,
                    sci.status,
                    sci.counted_at,
                    p.full_name as counted_by_name,
                    sci.variance_notes,
                    sci.variance_resolved
                FROM stock_count_items sci
                JOIN inventory_items i ON i.id = sci.item_id
                LEFT JOIN profiles p ON p.id = sci.counted_by
                WHERE sci.stock_count_id = sc.id
            ) item_data
        ), '[]'::json),
        'assigned_to_name', (SELECT full_name FROM profiles WHERE id = sc.assigned_to),
        'created_by_name', (SELECT full_name FROM profiles WHERE id = sc.created_by),
        'scope_folder_name', (SELECT name FROM folders WHERE id = sc.scope_folder_id)
    ) INTO v_result
    FROM stock_counts sc
    WHERE sc.id = p_stock_count_id
    AND sc.tenant_id = get_user_tenant_id();

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- Initialize counters for existing tenants
-- ===================
INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
SELECT t.id, 'stock_count', 0
FROM tenants t
ON CONFLICT (tenant_id, entity_type) DO NOTHING;

-- Update generate_display_id to handle stock_count entity type
CREATE OR REPLACE FUNCTION generate_display_id(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_code VARCHAR(5);
    v_prefix VARCHAR(4);
    v_sequence BIGINT;
BEGIN
    -- Get org code for tenant
    SELECT org_code INTO v_org_code
    FROM tenants
    WHERE id = p_tenant_id;

    IF v_org_code IS NULL THEN
        RAISE EXCEPTION 'Tenant org_code not found for tenant_id %', p_tenant_id;
    END IF;

    -- Determine prefix based on entity type
    v_prefix := CASE p_entity_type
        WHEN 'pick_list' THEN 'PL'
        WHEN 'purchase_order' THEN 'PO'
        WHEN 'stock_count' THEN 'SC'
        WHEN 'item' THEN 'ITM'
        WHEN 'folder' THEN 'FLD'
        ELSE UPPER(LEFT(p_entity_type, 3))
    END;

    -- Get next sequence number (atomically)
    v_sequence := get_next_entity_number(p_tenant_id, p_entity_type);

    -- Format: PREFIX-ORGCODE-SEQUENCE (e.g., PL-ACM01-00001)
    RETURN v_prefix || '-' || v_org_code || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$;

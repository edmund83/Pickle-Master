-- Migration: 00072_data_integrity_constraints.sql
-- Description: Add data integrity constraints and check function for SO/DO/Invoice system

-- ============================================================================
-- UNIQUE CONSTRAINTS FOR DISPLAY_ID COLUMNS
-- ============================================================================
-- The existing indexes are non-unique. We need to drop and recreate as unique.

-- Sales Orders: Make display_id unique per tenant
DROP INDEX IF EXISTS idx_sales_orders_display_id;
CREATE UNIQUE INDEX idx_sales_orders_display_id_unique
ON sales_orders(tenant_id, display_id)
WHERE display_id IS NOT NULL;

-- Delivery Orders: Make display_id unique per tenant
DROP INDEX IF EXISTS idx_delivery_orders_display_id;
CREATE UNIQUE INDEX idx_delivery_orders_display_id_unique
ON delivery_orders(tenant_id, display_id)
WHERE display_id IS NOT NULL;

-- Invoices: Make display_id unique per tenant
DROP INDEX IF EXISTS idx_invoices_display_id;
CREATE UNIQUE INDEX idx_invoices_display_id_unique
ON invoices(tenant_id, display_id)
WHERE display_id IS NOT NULL;

-- ============================================================================
-- QUANTITY CHAIN CONSTRAINTS
-- ============================================================================

-- Ensure delivered quantity never exceeds ordered quantity
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_qty_delivered;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_qty_delivered
CHECK (quantity_delivered <= quantity_ordered);

-- Ensure invoiced quantity never exceeds ordered quantity
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_qty_invoiced;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_qty_invoiced
CHECK (quantity_invoiced <= quantity_ordered);

-- Ensure picked quantity never exceeds ordered quantity
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_qty_picked;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_qty_picked
CHECK (quantity_picked <= quantity_ordered);

-- Ensure shipped quantity never exceeds ordered quantity
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_qty_shipped;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_qty_shipped
CHECK (quantity_shipped <= quantity_ordered);

-- Ensure allocated quantity never exceeds ordered quantity
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_qty_allocated;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_qty_allocated
CHECK (quantity_allocated <= quantity_ordered);

-- DO items: delivered never exceeds shipped
ALTER TABLE delivery_order_items
DROP CONSTRAINT IF EXISTS chk_do_items_qty_delivered;

ALTER TABLE delivery_order_items
ADD CONSTRAINT chk_do_items_qty_delivered
CHECK (quantity_delivered <= quantity_shipped);

-- ============================================================================
-- FINANCIAL INTEGRITY CONSTRAINTS
-- ============================================================================

-- Ensure unit_price is non-negative
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_unit_price_positive;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_unit_price_positive
CHECK (unit_price >= 0);

-- Ensure quantity is positive
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_qty_positive;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_qty_positive
CHECK (quantity_ordered > 0);

-- Ensure discount is within valid range (0-100%)
ALTER TABLE sales_order_items
DROP CONSTRAINT IF EXISTS chk_so_items_discount_range;

ALTER TABLE sales_order_items
ADD CONSTRAINT chk_so_items_discount_range
CHECK (COALESCE(discount_percent, 0) >= 0 AND COALESCE(discount_percent, 0) <= 100);

-- ============================================================================
-- DATA INTEGRITY CHECK FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_so_do_invoice_integrity(p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE (
    check_name TEXT,
    check_status TEXT,
    issue_count BIGINT,
    details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_filter UUID;
BEGIN
    -- Use provided tenant or current user's tenant
    v_tenant_filter := COALESCE(p_tenant_id, get_user_tenant_id());

    -- Check 1: Orphan SO items
    RETURN QUERY
    SELECT
        'orphan_so_items'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object('item_id', soi.id))
        END
    FROM sales_order_items soi
    LEFT JOIN sales_orders so ON soi.sales_order_id = so.id
    WHERE so.id IS NULL
      AND (v_tenant_filter IS NULL OR EXISTS (
          SELECT 1 FROM sales_orders so2
          WHERE so2.id = soi.sales_order_id
          AND so2.tenant_id = v_tenant_filter
      ));

    -- Check 2: Orphan DO items
    RETURN QUERY
    SELECT
        'orphan_do_items'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object('item_id', doi.id))
        END
    FROM delivery_order_items doi
    LEFT JOIN delivery_orders dord ON doi.delivery_order_id = dord.id
    WHERE dord.id IS NULL;

    -- Check 3: Orphan invoice items
    RETURN QUERY
    SELECT
        'orphan_invoice_items'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object('item_id', ii.id))
        END
    FROM invoice_items ii
    LEFT JOIN invoices inv ON ii.invoice_id = inv.id
    WHERE inv.id IS NULL;

    -- Check 4: SO items with quantity violations (should not happen with constraints)
    RETURN QUERY
    SELECT
        'so_qty_violations'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object(
                 'item_id', soi.id,
                 'ordered', soi.quantity_ordered,
                 'delivered', soi.quantity_delivered,
                 'invoiced', soi.quantity_invoiced
             ))
        END
    FROM sales_order_items soi
    JOIN sales_orders so ON soi.sales_order_id = so.id
    WHERE (v_tenant_filter IS NULL OR so.tenant_id = v_tenant_filter)
      AND (soi.quantity_delivered > soi.quantity_ordered
           OR soi.quantity_invoiced > soi.quantity_ordered
           OR soi.quantity_picked > soi.quantity_ordered
           OR soi.quantity_shipped > soi.quantity_ordered);

    -- Check 5: Cross-tenant references (SO items referencing items from different tenant)
    RETURN QUERY
    SELECT
        'cross_tenant_so_items'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object(
                 'so_item_id', soi.id,
                 'so_tenant', so.tenant_id,
                 'item_tenant', i.tenant_id
             ))
        END
    FROM sales_order_items soi
    JOIN sales_orders so ON soi.sales_order_id = so.id
    JOIN inventory_items i ON soi.item_id = i.id
    WHERE (v_tenant_filter IS NULL OR so.tenant_id = v_tenant_filter)
      AND so.tenant_id != i.tenant_id;

    -- Check 6: Cross-tenant DO-SO references
    RETURN QUERY
    SELECT
        'cross_tenant_do_so'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object(
                 'do_id', dord.id,
                 'do_tenant', dord.tenant_id,
                 'so_tenant', so.tenant_id
             ))
        END
    FROM delivery_orders dord
    JOIN sales_orders so ON dord.sales_order_id = so.id
    WHERE (v_tenant_filter IS NULL OR dord.tenant_id = v_tenant_filter)
      AND dord.tenant_id != so.tenant_id;

    -- Check 7: Cross-tenant Invoice-DO references
    RETURN QUERY
    SELECT
        'cross_tenant_inv_do'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object(
                 'invoice_id', inv.id,
                 'invoice_tenant', inv.tenant_id,
                 'do_tenant', dord.tenant_id
             ))
        END
    FROM invoices inv
    JOIN delivery_orders dord ON inv.delivery_order_id = dord.id
    WHERE (v_tenant_filter IS NULL OR inv.tenant_id = v_tenant_filter)
      AND inv.tenant_id != dord.tenant_id;

    -- Check 8: Duplicate display_ids (should not happen with unique constraints)
    RETURN QUERY
    SELECT
        'duplicate_so_display_ids'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        NULL::JSONB
    FROM (
        SELECT tenant_id, display_id, COUNT(*) as cnt
        FROM sales_orders
        WHERE (v_tenant_filter IS NULL OR tenant_id = v_tenant_filter)
          AND display_id IS NOT NULL
        GROUP BY tenant_id, display_id
        HAVING COUNT(*) > 1
    ) dupes;

    -- Check 9: SO line_total calculation accuracy
    RETURN QUERY
    SELECT
        'so_line_total_mismatch'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN NULL
             ELSE jsonb_agg(jsonb_build_object(
                 'item_id', soi.id,
                 'stored_total', soi.line_total,
                 'calculated', soi.quantity_ordered * soi.unit_price * (1 - COALESCE(soi.discount_percent, 0)/100)
             ))
        END
    FROM sales_order_items soi
    JOIN sales_orders so ON soi.sales_order_id = so.id
    WHERE (v_tenant_filter IS NULL OR so.tenant_id = v_tenant_filter)
      AND ABS(COALESCE(soi.line_total, 0) - (soi.quantity_ordered * soi.unit_price * (1 - COALESCE(soi.discount_percent, 0)/100))) > 0.01;

    RETURN;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION check_so_do_invoice_integrity(UUID) TO authenticated;

-- ============================================================================
-- SUMMARY INTEGRITY CHECK (returns simple pass/fail)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_integrity_summary(p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_checks INT,
    passed INT,
    failed INT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total INT;
    v_passed INT;
    v_failed INT;
BEGIN
    SELECT
        COUNT(*)::INT,
        COUNT(*) FILTER (WHERE check_status = 'PASS')::INT,
        COUNT(*) FILTER (WHERE check_status = 'FAIL')::INT
    INTO v_total, v_passed, v_failed
    FROM check_so_do_invoice_integrity(p_tenant_id);

    RETURN QUERY SELECT
        v_total,
        v_passed,
        v_failed,
        CASE WHEN v_failed = 0 THEN 'ALL_PASS' ELSE 'HAS_FAILURES' END::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION check_integrity_summary(UUID) TO authenticated;

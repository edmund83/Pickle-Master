-- Feature Gating Migration
-- Adds plan-based feature access control at the database level
-- Aligns with docs/pricingplan.md feature matrix

-- ============================================================================
-- FEATURE ACCESS FUNCTION
-- ============================================================================

-- Helper function to check if current user's plan can access a feature
CREATE OR REPLACE FUNCTION can_access_feature(feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier VARCHAR;
BEGIN
    -- Get the subscription tier for the current user's tenant
    SELECT t.subscription_tier INTO v_tier
    FROM tenants t
    INNER JOIN profiles p ON p.tenant_id = t.id
    WHERE p.id = auth.uid();

    -- If no tier found, deny access
    IF v_tier IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Feature access matrix based on docs/pricingplan.md
    -- ALL PLANS: pick_lists, check_in_out
    -- GROWTH+: sales_orders, delivery_orders, invoices, stock_counts, purchase_orders, receiving
    -- SCALE ONLY: lot_tracking, serial_tracking

    CASE feature_name
        -- Features available on ALL plans (Starter, Growth, Scale, Early Access)
        WHEN 'pick_lists' THEN
            RETURN TRUE;
        WHEN 'check_in_out' THEN
            RETURN TRUE;

        -- Features available on GROWTH+ (Growth, Scale, Early Access)
        WHEN 'sales_orders' THEN
            RETURN v_tier IN ('early_access', 'growth', 'scale');
        WHEN 'delivery_orders' THEN
            RETURN v_tier IN ('early_access', 'growth', 'scale');
        WHEN 'invoices' THEN
            RETURN v_tier IN ('early_access', 'growth', 'scale');
        WHEN 'stock_counts' THEN
            RETURN v_tier IN ('early_access', 'growth', 'scale');
        WHEN 'purchase_orders' THEN
            RETURN v_tier IN ('early_access', 'growth', 'scale');
        WHEN 'receiving' THEN
            RETURN v_tier IN ('early_access', 'growth', 'scale');

        -- Features available on SCALE ONLY (Scale, Early Access)
        WHEN 'lot_tracking' THEN
            RETURN v_tier IN ('early_access', 'scale');
        WHEN 'serial_tracking' THEN
            RETURN v_tier IN ('early_access', 'scale');

        -- Default: allow access for unlisted features
        ELSE
            RETURN TRUE;
    END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION can_access_feature(TEXT) TO authenticated;

-- ============================================================================
-- RLS POLICY UPDATES FOR GROWTH+ FEATURES
-- ============================================================================

-- SALES ORDERS (Growth+)
DROP POLICY IF EXISTS sales_orders_feature_gate ON sales_orders;
CREATE POLICY sales_orders_feature_gate ON sales_orders
    FOR ALL
    USING (can_access_feature('sales_orders'))
    WITH CHECK (can_access_feature('sales_orders'));

DROP POLICY IF EXISTS sales_order_items_feature_gate ON sales_order_items;
CREATE POLICY sales_order_items_feature_gate ON sales_order_items
    FOR ALL
    USING (can_access_feature('sales_orders'))
    WITH CHECK (can_access_feature('sales_orders'));

-- DELIVERY ORDERS (Growth+)
DROP POLICY IF EXISTS delivery_orders_feature_gate ON delivery_orders;
CREATE POLICY delivery_orders_feature_gate ON delivery_orders
    FOR ALL
    USING (can_access_feature('delivery_orders'))
    WITH CHECK (can_access_feature('delivery_orders'));

DROP POLICY IF EXISTS delivery_order_items_feature_gate ON delivery_order_items;
CREATE POLICY delivery_order_items_feature_gate ON delivery_order_items
    FOR ALL
    USING (can_access_feature('delivery_orders'))
    WITH CHECK (can_access_feature('delivery_orders'));

-- INVOICES (Growth+)
DROP POLICY IF EXISTS invoices_feature_gate ON invoices;
CREATE POLICY invoices_feature_gate ON invoices
    FOR ALL
    USING (can_access_feature('invoices'))
    WITH CHECK (can_access_feature('invoices'));

DROP POLICY IF EXISTS invoice_items_feature_gate ON invoice_items;
CREATE POLICY invoice_items_feature_gate ON invoice_items
    FOR ALL
    USING (can_access_feature('invoices'))
    WITH CHECK (can_access_feature('invoices'));

-- STOCK COUNTS (Growth+)
DROP POLICY IF EXISTS stock_counts_feature_gate ON stock_counts;
CREATE POLICY stock_counts_feature_gate ON stock_counts
    FOR ALL
    USING (can_access_feature('stock_counts'))
    WITH CHECK (can_access_feature('stock_counts'));

DROP POLICY IF EXISTS stock_count_items_feature_gate ON stock_count_items;
CREATE POLICY stock_count_items_feature_gate ON stock_count_items
    FOR ALL
    USING (can_access_feature('stock_counts'))
    WITH CHECK (can_access_feature('stock_counts'));

-- PURCHASE ORDERS (Growth+)
DROP POLICY IF EXISTS purchase_orders_feature_gate ON purchase_orders;
CREATE POLICY purchase_orders_feature_gate ON purchase_orders
    FOR ALL
    USING (can_access_feature('purchase_orders'))
    WITH CHECK (can_access_feature('purchase_orders'));

DROP POLICY IF EXISTS purchase_order_items_feature_gate ON purchase_order_items;
CREATE POLICY purchase_order_items_feature_gate ON purchase_order_items
    FOR ALL
    USING (can_access_feature('purchase_orders'))
    WITH CHECK (can_access_feature('purchase_orders'));

-- RECEIVES/RECEIVING (Growth+)
DROP POLICY IF EXISTS receives_feature_gate ON receives;
CREATE POLICY receives_feature_gate ON receives
    FOR ALL
    USING (can_access_feature('receiving'))
    WITH CHECK (can_access_feature('receiving'));

DROP POLICY IF EXISTS receive_items_feature_gate ON receive_items;
CREATE POLICY receive_items_feature_gate ON receive_items
    FOR ALL
    USING (can_access_feature('receiving'))
    WITH CHECK (can_access_feature('receiving'));

-- ============================================================================
-- RLS POLICY UPDATES FOR SCALE ONLY FEATURES
-- ============================================================================

-- LOTS (Scale only)
-- Check if lots table exists before adding policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lots') THEN
        EXECUTE 'DROP POLICY IF EXISTS lots_feature_gate ON lots';
        EXECUTE 'CREATE POLICY lots_feature_gate ON lots
            FOR ALL
            USING (can_access_feature(''lot_tracking''))
            WITH CHECK (can_access_feature(''lot_tracking''))';
    END IF;
END $$;

-- LOT ITEMS (Scale only)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lot_items') THEN
        EXECUTE 'DROP POLICY IF EXISTS lot_items_feature_gate ON lot_items';
        EXECUTE 'CREATE POLICY lot_items_feature_gate ON lot_items
            FOR ALL
            USING (can_access_feature(''lot_tracking''))
            WITH CHECK (can_access_feature(''lot_tracking''))';
    END IF;
END $$;

-- ============================================================================
-- COMMENT FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION can_access_feature(TEXT) IS
'Checks if the current user''s subscription plan allows access to a feature.
Feature matrix (from docs/pricingplan.md):
- ALL PLANS: pick_lists, check_in_out
- GROWTH+: sales_orders, delivery_orders, invoices, stock_counts, purchase_orders, receiving
- SCALE ONLY: lot_tracking, serial_tracking
Early Access = Scale (all features)';

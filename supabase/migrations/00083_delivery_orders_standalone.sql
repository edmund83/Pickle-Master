-- Migration: Enable standalone delivery orders
-- Allows creating delivery orders without a sales order (for direct shipments, samples, etc.)

-- ===================
-- 1. Make sales_order_id nullable on delivery_orders
-- ===================
ALTER TABLE delivery_orders
  ALTER COLUMN sales_order_id DROP NOT NULL;

-- ===================
-- 2. Add customer_id for standalone deliveries
-- ===================
ALTER TABLE delivery_orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT;

-- ===================
-- 3. Add constraint: require either sales_order_id OR customer_id
-- ===================
ALTER TABLE delivery_orders
  ADD CONSTRAINT delivery_orders_source_check
  CHECK (sales_order_id IS NOT NULL OR customer_id IS NOT NULL);

-- ===================
-- 4. Make sales_order_item_id nullable on delivery_order_items
-- ===================
ALTER TABLE delivery_order_items
  ALTER COLUMN sales_order_item_id DROP NOT NULL;

-- ===================
-- 5. Add index for standalone queries (queries by customer without SO)
-- ===================
CREATE INDEX IF NOT EXISTS idx_delivery_orders_customer
  ON delivery_orders(tenant_id, customer_id)
  WHERE customer_id IS NOT NULL;

-- ===================
-- 6. Backfill customer_id from sales_orders for existing records
-- ===================
UPDATE delivery_orders d
SET customer_id = so.customer_id
FROM sales_orders so
WHERE d.sales_order_id = so.id
  AND d.customer_id IS NULL;

-- ===================
-- 7. Update RLS policy to allow access via customer_id
-- ===================
-- Drop existing policy if it needs updating
DROP POLICY IF EXISTS "Users can view delivery orders in their tenant" ON delivery_orders;

-- Recreate with both paths
CREATE POLICY "Users can view delivery orders in their tenant"
  ON delivery_orders
  FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- ===================
-- 8. Add comment for documentation
-- ===================
COMMENT ON COLUMN delivery_orders.customer_id IS 'Customer for standalone delivery orders (when no sales_order_id)';
COMMENT ON CONSTRAINT delivery_orders_source_check ON delivery_orders IS 'Ensures delivery order has either a sales order or direct customer reference';

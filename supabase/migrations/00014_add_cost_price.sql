-- Add cost_price column to inventory_items for margin calculation
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12, 2) DEFAULT NULL;

COMMENT ON COLUMN inventory_items.cost_price IS 'Cost to acquire/produce this item, used for margin calculation';

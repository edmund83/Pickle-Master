-- Migration: 00106_fix_po_missing_columns.sql
-- Purpose: Fix missing columns in purchase_orders table that are expected by create_purchase_order_v2 RPC
-- Issue: The RPC function references 'currency' and 'total_amount' columns that don't exist

-- ===========================================
-- ADD CURRENCY COLUMN
-- ===========================================
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MYR';

COMMENT ON COLUMN purchase_orders.currency IS 'Currency code (e.g., MYR, USD, SGD)';

-- Create index for currency if needed for filtering
CREATE INDEX IF NOT EXISTS idx_purchase_orders_currency
ON purchase_orders(currency)
WHERE currency IS NOT NULL;

-- ===========================================
-- ADD TOTAL_AMOUNT COLUMN (alias for total)
-- ===========================================
-- The RPC uses total_amount but the original schema used 'total'
-- Add total_amount as an alias/computed column
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2) DEFAULT 0;

-- Migrate existing data from 'total' to 'total_amount'
UPDATE purchase_orders
SET total_amount = total
WHERE total_amount IS NULL OR total_amount = 0;

COMMENT ON COLUMN purchase_orders.total_amount IS 'Total amount including subtotal, tax, and shipping';

-- ===========================================
-- CREATE TRIGGER TO KEEP TOTAL AND TOTAL_AMOUNT IN SYNC
-- ===========================================
CREATE OR REPLACE FUNCTION sync_po_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- When total is updated, sync to total_amount
    IF NEW.total IS DISTINCT FROM OLD.total THEN
        NEW.total_amount := NEW.total;
    END IF;
    -- When total_amount is updated, sync to total
    IF NEW.total_amount IS DISTINCT FROM OLD.total_amount THEN
        NEW.total := NEW.total_amount;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_po_total_amount ON purchase_orders;
CREATE TRIGGER trg_sync_po_total_amount
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION sync_po_total_amount();

-- ===========================================
-- VERIFICATION
-- ===========================================
DO $$
BEGIN
    -- Verify currency column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchase_orders' AND column_name = 'currency'
    ) THEN
        RAISE EXCEPTION 'Migration failed: currency column was not created';
    END IF;

    -- Verify total_amount column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'purchase_orders' AND column_name = 'total_amount'
    ) THEN
        RAISE EXCEPTION 'Migration failed: total_amount column was not created';
    END IF;

    RAISE NOTICE 'Migration 00106 completed successfully: currency and total_amount columns added to purchase_orders';
END $$;

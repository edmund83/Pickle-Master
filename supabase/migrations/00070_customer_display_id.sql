-- Migration: 00070_customer_display_id.sql
-- Description: Add display_id column to customers table for consistent ID formatting

-- ============================================================================
-- ADD DISPLAY_ID COLUMN TO CUSTOMERS TABLE
-- ============================================================================

-- Add display_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'customers' AND column_name = 'display_id') THEN
        ALTER TABLE customers ADD COLUMN display_id VARCHAR(25);
    END IF;
END $$;

-- Create unique index on display_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_display_id
ON customers(display_id)
WHERE display_id IS NOT NULL;

-- ============================================================================
-- TRIGGER TO AUTO-GENERATE DISPLAY_ID ON INSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_customer_display_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.display_id IS NULL THEN
        NEW.display_id := generate_display_id(NEW.tenant_id, 'customer');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_generate_customer_display_id ON customers;

CREATE TRIGGER trigger_generate_customer_display_id
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION generate_customer_display_id();

-- ============================================================================
-- BACKFILL EXISTING CUSTOMERS WITHOUT DISPLAY_ID
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT id, tenant_id
        FROM customers
        WHERE display_id IS NULL
    LOOP
        UPDATE customers
        SET display_id = generate_display_id(r.tenant_id, 'customer')
        WHERE id = r.id;
    END LOOP;
END $$;

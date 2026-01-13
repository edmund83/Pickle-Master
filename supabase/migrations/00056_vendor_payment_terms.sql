-- Migration: Add payment_terms to vendors table
-- This allows tracking vendor payment terms (e.g., "Net 30", "COD", "Net 15")

-- Add payment_terms column to vendors
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100);

-- Add comment for documentation
COMMENT ON COLUMN vendors.payment_terms IS 'Payment terms for this vendor (e.g., Net 30, COD, Net 15, 2/10 Net 30)';

-- Create index for filtering by payment terms if needed
CREATE INDEX IF NOT EXISTS idx_vendors_payment_terms ON vendors(tenant_id, payment_terms) WHERE payment_terms IS NOT NULL;

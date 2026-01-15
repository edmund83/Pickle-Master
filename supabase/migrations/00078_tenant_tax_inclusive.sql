-- Migration: Add prices_include_tax setting to tenants
-- This determines whether product prices are displayed/stored with tax included (like UK/AU) or excluded (like US)

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS prices_include_tax BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN tenants.prices_include_tax IS 'If true, all prices include tax (VAT-style). If false, tax is added on top (US-style).';

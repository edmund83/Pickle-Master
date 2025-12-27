-- Migration: 00033_purchase_order_enhancements.sql
-- Purpose: Add Ship To, Bill To address fields, submission/approval tracking, and part numbers to purchase orders

-- ===========================================
-- ADD SHIP TO ADDRESS FIELDS TO PURCHASE_ORDERS
-- ===========================================
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS ship_to_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ship_to_address1 VARCHAR(500),
ADD COLUMN IF NOT EXISTS ship_to_address2 VARCHAR(500),
ADD COLUMN IF NOT EXISTS ship_to_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS ship_to_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS ship_to_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS ship_to_country VARCHAR(100);

-- ===========================================
-- ADD BILL TO ADDRESS FIELDS TO PURCHASE_ORDERS
-- ===========================================
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS bill_to_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bill_to_address1 VARCHAR(500),
ADD COLUMN IF NOT EXISTS bill_to_address2 VARCHAR(500),
ADD COLUMN IF NOT EXISTS bill_to_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS bill_to_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS bill_to_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS bill_to_country VARCHAR(100);

-- ===========================================
-- ADD SUBMISSION AND APPROVAL TRACKING
-- ===========================================
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- ===========================================
-- ADD PART NUMBER TO PURCHASE ORDER ITEMS
-- ===========================================
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS part_number VARCHAR(100);

-- ===========================================
-- COMMENTS
-- ===========================================
COMMENT ON COLUMN purchase_orders.ship_to_name IS 'Ship to recipient name';
COMMENT ON COLUMN purchase_orders.ship_to_address1 IS 'Ship to address line 1';
COMMENT ON COLUMN purchase_orders.ship_to_address2 IS 'Ship to address line 2';
COMMENT ON COLUMN purchase_orders.ship_to_city IS 'Ship to city';
COMMENT ON COLUMN purchase_orders.ship_to_state IS 'Ship to state/province';
COMMENT ON COLUMN purchase_orders.ship_to_postal_code IS 'Ship to postal/zip code';
COMMENT ON COLUMN purchase_orders.ship_to_country IS 'Ship to country';

COMMENT ON COLUMN purchase_orders.bill_to_name IS 'Bill to name';
COMMENT ON COLUMN purchase_orders.bill_to_address1 IS 'Bill to address line 1';
COMMENT ON COLUMN purchase_orders.bill_to_address2 IS 'Bill to address line 2';
COMMENT ON COLUMN purchase_orders.bill_to_city IS 'Bill to city';
COMMENT ON COLUMN purchase_orders.bill_to_state IS 'Bill to state/province';
COMMENT ON COLUMN purchase_orders.bill_to_postal_code IS 'Bill to postal/zip code';
COMMENT ON COLUMN purchase_orders.bill_to_country IS 'Bill to country';

COMMENT ON COLUMN purchase_orders.submitted_by IS 'User who submitted the PO for approval';
COMMENT ON COLUMN purchase_orders.submitted_at IS 'When the PO was submitted';
COMMENT ON COLUMN purchase_orders.approved_by IS 'User who approved the PO';
COMMENT ON COLUMN purchase_orders.approved_at IS 'When the PO was approved';

COMMENT ON COLUMN purchase_order_items.part_number IS 'Manufacturer or vendor part number';

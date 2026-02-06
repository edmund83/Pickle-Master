-- ============================================
-- Migration: 00126_fix_delivery_order_item_serials_nullable.sql
-- Purpose: Make serial_number nullable to support lot-only tracking
--
-- Problem: The delivery_order_item_serials table has serial_number as NOT NULL,
-- but we need to support lot-only tracking where there is no serial number.
--
-- Solution: Make serial_number nullable and add a check constraint to ensure
-- either serial_number OR lot_id is provided.
-- ============================================

-- Make serial_number nullable
ALTER TABLE delivery_order_item_serials
ALTER COLUMN serial_number DROP NOT NULL;

-- Add constraint to ensure at least one tracking type is specified
ALTER TABLE delivery_order_item_serials
ADD CONSTRAINT chk_tracking_type
CHECK (serial_number IS NOT NULL OR lot_id IS NOT NULL);

-- Add comment
COMMENT ON TABLE delivery_order_item_serials IS
'Tracks serial numbers and/or lot assignments for delivery order items.
Either serial_number or lot_id must be specified (or both for lot-tracked serials).';

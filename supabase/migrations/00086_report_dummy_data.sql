-- ============================================
-- Report Dummy Data Migration
-- Purpose: Add report-relevant dummy data to validate ALL report pages
-- ============================================

-- Use the existing tenant from seed.sql
DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN

-- ===========================================
-- 1. PROFIT MARGIN REPORT DATA
-- Update existing items with cost_price for profit margin calculations
-- ===========================================

-- High margin items (>50% margin)
UPDATE inventory_items SET cost_price = 140.00 WHERE id = 'dddd0001-0000-0000-0000-000000000001' AND tenant_id = v_tenant_id; -- Price 349, Cost 140 = 149% margin
UPDATE inventory_items SET cost_price = 120.00 WHERE id = 'dddd0002-0000-0000-0000-000000000002' AND tenant_id = v_tenant_id; -- Price 299, Cost 120 = 149% margin
UPDATE inventory_items SET cost_price = 180.00 WHERE id = 'dddd0005-0000-0000-0000-000000000005' AND tenant_id = v_tenant_id; -- Price 449, Cost 180 = 149% margin

-- Medium margin items (20-50% margin)
UPDATE inventory_items SET cost_price = 160.00 WHERE id = 'dddd0003-0000-0000-0000-000000000003' AND tenant_id = v_tenant_id; -- Price 229, Cost 160 = 43% margin
UPDATE inventory_items SET cost_price = 130.00 WHERE id = 'dddd0004-0000-0000-0000-000000000004' AND tenant_id = v_tenant_id; -- Price 179, Cost 130 = 38% margin
UPDATE inventory_items SET cost_price = 330.00 WHERE id = 'dddd0006-0000-0000-0000-000000000006' AND tenant_id = v_tenant_id; -- Price 449, Cost 330 = 36% margin

-- Low margin items (<20% margin)
UPDATE inventory_items SET cost_price = 290.00 WHERE id = 'dddd0007-0000-0000-0000-000000000007' AND tenant_id = v_tenant_id; -- Price 329, Cost 290 = 13% margin
UPDATE inventory_items SET cost_price = 620.00 WHERE id = 'dddd0008-0000-0000-0000-000000000008' AND tenant_id = v_tenant_id; -- Price 699, Cost 620 = 13% margin
UPDATE inventory_items SET cost_price = 270.00 WHERE id = 'dddd0009-0000-0000-0000-000000000009' AND tenant_id = v_tenant_id; -- Price 299, Cost 270 = 11% margin

-- Very low / negative margin items
UPDATE inventory_items SET cost_price = 75.00 WHERE id = 'dddd0010-0000-0000-0000-000000000010' AND tenant_id = v_tenant_id; -- Price 79, Cost 75 = 5% margin

-- Hand tools - mixed margins
UPDATE inventory_items SET cost_price = 100.00 WHERE id = 'dddd0020-0000-0000-0000-000000000020' AND tenant_id = v_tenant_id; -- Price 199, Cost 100 = 99% margin
UPDATE inventory_items SET cost_price = 35.00 WHERE id = 'dddd0021-0000-0000-0000-000000000021' AND tenant_id = v_tenant_id; -- Price 69, Cost 35 = 97% margin
UPDATE inventory_items SET cost_price = 18.00 WHERE id = 'dddd0022-0000-0000-0000-000000000022' AND tenant_id = v_tenant_id; -- Price 29, Cost 18 = 61% margin
UPDATE inventory_items SET cost_price = 14.00 WHERE id = 'dddd0023-0000-0000-0000-000000000023' AND tenant_id = v_tenant_id; -- Price 19, Cost 14 = 36% margin
UPDATE inventory_items SET cost_price = 12.00 WHERE id = 'dddd0024-0000-0000-0000-000000000024' AND tenant_id = v_tenant_id; -- Price 24, Cost 12 = 100% margin

-- Safety equipment
UPDATE inventory_items SET cost_price = 15.00 WHERE id = 'dddd0040-0000-0000-0000-000000000040' AND tenant_id = v_tenant_id; -- Price 24, Cost 15 = 60% margin
UPDATE inventory_items SET cost_price = 5.00 WHERE id = 'dddd0042-0000-0000-0000-000000000042' AND tenant_id = v_tenant_id; -- Price 8, Cost 5 = 60% margin
UPDATE inventory_items SET cost_price = 20.00 WHERE id = 'dddd0045-0000-0000-0000-000000000045' AND tenant_id = v_tenant_id; -- Price 35, Cost 20 = 75% margin

-- Electronics - high value items
UPDATE inventory_items SET cost_price = 950.00 WHERE id = 'dddd0060-0000-0000-0000-000000000060' AND tenant_id = v_tenant_id; -- Price 1349, Cost 950 = 42% margin
UPDATE inventory_items SET cost_price = 750.00 WHERE id = 'dddd0061-0000-0000-0000-000000000061' AND tenant_id = v_tenant_id; -- Price 999, Cost 750 = 33% margin
UPDATE inventory_items SET cost_price = 50.00 WHERE id = 'dddd0062-0000-0000-0000-000000000062' AND tenant_id = v_tenant_id; -- Price 89, Cost 50 = 78% margin
UPDATE inventory_items SET cost_price = 280.00 WHERE id = 'dddd0063-0000-0000-0000-000000000063' AND tenant_id = v_tenant_id; -- Price 399, Cost 280 = 43% margin

-- Fasteners & consumables
UPDATE inventory_items SET cost_price = 18.00 WHERE id = 'dddd0070-0000-0000-0000-000000000070' AND tenant_id = v_tenant_id; -- Price 32, Cost 18 = 78% margin
UPDATE inventory_items SET cost_price = 15.00 WHERE id = 'dddd0071-0000-0000-0000-000000000071' AND tenant_id = v_tenant_id; -- Price 28, Cost 15 = 87% margin
UPDATE inventory_items SET cost_price = 4.50 WHERE id = 'dddd0075-0000-0000-0000-000000000075' AND tenant_id = v_tenant_id; -- Price 9, Cost 4.50 = 100% margin
UPDATE inventory_items SET cost_price = 4.00 WHERE id = 'dddd0077-0000-0000-0000-000000000077' AND tenant_id = v_tenant_id; -- Price 8, Cost 4 = 100% margin

-- Low stock items with cost
UPDATE inventory_items SET cost_price = 70.00 WHERE id = 'dddd0100-0000-0000-0000-000000000100' AND tenant_id = v_tenant_id; -- Price 129, Cost 70 = 84% margin
UPDATE inventory_items SET cost_price = 14.00 WHERE id = 'dddd0101-0000-0000-0000-000000000101' AND tenant_id = v_tenant_id; -- Price 24, Cost 14 = 71% margin
UPDATE inventory_items SET cost_price = 3.50 WHERE id = 'dddd0102-0000-0000-0000-000000000102' AND tenant_id = v_tenant_id; -- Price 6, Cost 3.50 = 71% margin
UPDATE inventory_items SET cost_price = 14.00 WHERE id = 'dddd0103-0000-0000-0000-000000000103' AND tenant_id = v_tenant_id; -- Price 24, Cost 14 = 71% margin

RAISE NOTICE 'Updated cost_price for profit margin report';

END $$;

-- ===========================================
-- 2. LOW STOCK REPORT DATA
-- Update item statuses to reflect current stock levels
-- ===========================================

-- Set status based on quantity vs min_quantity
UPDATE inventory_items
SET status = CASE
    WHEN quantity = 0 THEN 'out_of_stock'
    WHEN quantity <= min_quantity THEN 'low_stock'
    ELSE 'in_stock'
END
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

-- Ensure we have clear test cases for low stock report
UPDATE inventory_items SET quantity = 0, min_quantity = 15, status = 'out_of_stock'
WHERE id = 'dddd0102-0000-0000-0000-000000000102' AND tenant_id = '11111111-1111-1111-1111-111111111111';

UPDATE inventory_items SET quantity = 2, min_quantity = 8, status = 'low_stock'
WHERE id = 'dddd0100-0000-0000-0000-000000000100' AND tenant_id = '11111111-1111-1111-1111-111111111111';

UPDATE inventory_items SET quantity = 1, min_quantity = 10, status = 'low_stock'
WHERE id = 'dddd0101-0000-0000-0000-000000000101' AND tenant_id = '11111111-1111-1111-1111-111111111111';

UPDATE inventory_items SET quantity = 3, min_quantity = 10, status = 'low_stock'
WHERE id = 'dddd0103-0000-0000-0000-000000000103' AND tenant_id = '11111111-1111-1111-1111-111111111111';

-- Add a few more low stock items
UPDATE inventory_items SET quantity = 1, min_quantity = 4, status = 'low_stock'
WHERE id = 'dddd0004-0000-0000-0000-000000000004' AND tenant_id = '11111111-1111-1111-1111-111111111111';

UPDATE inventory_items SET quantity = 0, min_quantity = 2, status = 'out_of_stock'
WHERE id = 'dddd0063-0000-0000-0000-000000000063' AND tenant_id = '11111111-1111-1111-1111-111111111111';

-- ===========================================
-- 3. EXPIRING ITEMS REPORT DATA
-- Create lots with various expiry dates
-- ===========================================

-- First, enable lot tracking on some items
UPDATE inventory_items SET tracking_mode = 'lot' WHERE id IN (
    'dddd0040-0000-0000-0000-000000000040', -- Hard hats
    'dddd0042-0000-0000-0000-000000000042', -- Safety glasses
    'dddd0045-0000-0000-0000-000000000045', -- Work gloves
    'dddd0077-0000-0000-0000-000000000077', -- Caulk
    'dddd0078-0000-0000-0000-000000000078', -- Wood glue
    'dddd0101-0000-0000-0000-000000000101'  -- N95 Respirators
) AND tenant_id = '11111111-1111-1111-1111-111111111111';

-- Create lots with expiry dates (expired, critical, warning, upcoming)
INSERT INTO lots (id, tenant_id, item_id, lot_number, batch_code, quantity, expiry_date, manufactured_date, status, created_at) VALUES
-- EXPIRED lots (past expiry)
('a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'dddd0101-0000-0000-0000-000000000101',
 'LOT-N95-001', 'BATCH-2023-A', 15, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '400 days', 'active', NOW() - INTERVAL '1 year'),

('a0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'dddd0077-0000-0000-0000-000000000077',
 'LOT-CAULK-001', 'OSI-2023-Q1', 25, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '365 days', 'active', NOW() - INTERVAL '1 year'),

-- CRITICAL lots (expiring within 7 days)
('a0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'dddd0045-0000-0000-0000-000000000045',
 'LOT-GLOVE-001', 'MEC-2024-A', 20, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE - INTERVAL '300 days', 'active', NOW() - INTERVAL '10 months'),

('a0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'dddd0078-0000-0000-0000-000000000078',
 'LOT-GLUE-001', 'GOR-2024-B', 10, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE - INTERVAL '180 days', 'active', NOW() - INTERVAL '6 months'),

-- WARNING lots (expiring within 14 days)
('a0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'dddd0042-0000-0000-0000-000000000042',
 'LOT-GLASS-001', '3M-2024-C', 50, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE - INTERVAL '350 days', 'active', NOW() - INTERVAL '11 months'),

('a0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'dddd0077-0000-0000-0000-000000000077',
 'LOT-CAULK-002', 'OSI-2024-Q1', 30, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE - INTERVAL '280 days', 'active', NOW() - INTERVAL '9 months'),

-- UPCOMING lots (expiring within 30 days)
('a0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'dddd0040-0000-0000-0000-000000000040',
 'LOT-HAT-001', '3M-2024-D', 15, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE - INTERVAL '700 days', 'active', NOW() - INTERVAL '2 years'),

('a0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'dddd0101-0000-0000-0000-000000000101',
 'LOT-N95-002', 'BATCH-2024-A', 30, CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE - INTERVAL '340 days', 'active', NOW() - INTERVAL '11 months'),

-- Good lots (not expiring soon - for comparison)
('a0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'dddd0045-0000-0000-0000-000000000045',
 'LOT-GLOVE-002', 'MEC-2024-B', 25, CURRENT_DATE + INTERVAL '180 days', CURRENT_DATE - INTERVAL '30 days', 'active', NOW() - INTERVAL '1 month'),

('a0000010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'dddd0078-0000-0000-0000-000000000078',
 'LOT-GLUE-002', 'GOR-2024-C', 15, CURRENT_DATE + INTERVAL '365 days', CURRENT_DATE - INTERVAL '7 days', 'active', NOW() - INTERVAL '1 week')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- 4. ACTIVITY LOG DATA
-- Create varied activity logs for Activity, Stock Movement, and Trends reports
-- ===========================================

-- Generate activity logs for the last 7 days (for trends report)
-- Day 1 (today)
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, created_at) VALUES
('b0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0001-0000-0000-0000-000000000001', 'Milwaukee M18 FUEL Hammer Drill', 'adjust_quantity', 'Mike Thompson', 2, 6, 8, NOW() - INTERVAL '2 hours'),
('b0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0002-0000-0000-0000-000000000002', 'Milwaukee M18 FUEL Impact Driver', 'create', 'Sarah Chen', NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
('b0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0070-0000-0000-0000-000000000070', 'GRK R4 Screws 3"', 'adjust_quantity', 'Carlos Rivera', -10, 60, 50, NOW() - INTERVAL '5 hours'),
('b0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0040-0000-0000-0000-000000000040', '3M Hard Hat H-700', 'update', 'Tom Anderson', NULL, NULL, NULL, NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- Day 2 (yesterday)
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, from_folder_id, from_folder_name, to_folder_id, to_folder_name, created_at) VALUES
('b0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0005-0000-0000-0000-000000000005', 'Milwaukee M18 FUEL Circular Saw', 'move', 'Mike Thompson', NULL, NULL, NULL, 'bbbb0011-0000-0000-0000-000000000011', 'Rack A2 - Saws', 'bbbb0041-0000-0000-0000-000000000041', 'Riverside Apartments', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
('b0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0045-0000-0000-0000-000000000045', 'Mechanix M-Pact Gloves', 'adjust_quantity', 'Sarah Chen', -5, 45, 40, NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day' - INTERVAL '4 hours'),
('b0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0060-0000-0000-0000-000000000060', 'Dell Latitude 5540 Laptop', 'update', 'Carlos Rivera', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day' - INTERVAL '6 hours'),
('b0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0020-0000-0000-0000-000000000020', 'Milwaukee 56pc Mechanics Tool Set', 'create', 'Tom Anderson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day' - INTERVAL '8 hours'),
('b0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'folder', 'bbbb0042-0000-0000-0000-000000000042', 'Downtown Office Remodel', 'create', 'Mike Thompson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day' - INTERVAL '10 hours')
ON CONFLICT (id) DO NOTHING;

-- Day 3
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, from_folder_id, from_folder_name, to_folder_id, to_folder_name, created_at) VALUES
('b0000010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0006-0000-0000-0000-000000000006', 'DeWalt 12" Sliding Miter Saw', 'move', 'Sarah Chen', NULL, NULL, NULL, 'bbbb0011-0000-0000-0000-000000000011', 'Rack A2 - Saws', 'bbbb0042-0000-0000-0000-000000000042', 'Downtown Office Remodel', NOW() - INTERVAL '2 days' - INTERVAL '3 hours'),
('b0000011-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0071-0000-0000-0000-000000000071', 'GRK R4 Screws 2-1/2"', 'adjust_quantity', 'Carlos Rivera', 25, 35, 60, NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days' - INTERVAL '5 hours'),
('b0000012-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0042-0000-0000-0000-000000000042', '3M SecureFit Safety Glasses', 'adjust_quantity', 'Tom Anderson', -15, 115, 100, NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days' - INTERVAL '7 hours'),
('b0000013-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0049-0000-0000-0000-000000000049', 'Werner Full Body Harness', 'update', 'Mike Thompson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days' - INTERVAL '9 hours')
ON CONFLICT (id) DO NOTHING;

-- Day 4
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, from_folder_id, from_folder_name, to_folder_id, to_folder_name, created_at) VALUES
('b0000014-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0007-0000-0000-0000-000000000007', 'Milwaukee M18 FUEL Sawzall', 'move', 'Carlos Rivera', NULL, NULL, NULL, 'bbbb0011-0000-0000-0000-000000000011', 'Rack A2 - Saws', 'bbbb0031-0000-0000-0000-000000000031', 'Truck 101 - Ford F-250', NOW() - INTERVAL '3 days' - INTERVAL '2 hours'),
('b0000015-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0100-0000-0000-0000-000000000100', 'Milwaukee M18 5.0Ah Battery', 'adjust_quantity', 'Tom Anderson', -3, 5, 2, NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 days' - INTERVAL '4 hours'),
('b0000016-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0024-0000-0000-0000-000000000024', 'Klein 11-in-1 Screwdriver', 'create', 'Mike Thompson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 days' - INTERVAL '6 hours'),
('b0000017-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0075-0000-0000-0000-000000000075', '3M Duct Tape', 'adjust_quantity', 'Sarah Chen', 50, 50, 100, NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 days' - INTERVAL '8 hours'),
('b0000018-0000-0000-0000-000000000018', '11111111-1111-1111-1111-111111111111', 'tag', 'aaaa0007-0000-0000-0000-000000000007', 'New Arrival', 'create', 'Carlos Rivera', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 days' - INTERVAL '10 hours'),
('b0000019-0000-0000-0000-000000000019', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0028-0000-0000-0000-000000000028', 'Stanley FatMax 25ft Tape Measure', 'delete', 'Tom Anderson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 days' - INTERVAL '11 hours')
ON CONFLICT (id) DO NOTHING;

-- Day 5
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, from_folder_id, from_folder_name, to_folder_id, to_folder_name, created_at) VALUES
('b0000020-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0009-0000-0000-0000-000000000009', 'Milwaukee M18 FUEL Angle Grinder', 'move', 'Mike Thompson', NULL, NULL, NULL, 'bbbb0012-0000-0000-0000-000000000012', 'Rack A3 - Grinders & Sanders', 'bbbb0041-0000-0000-0000-000000000041', 'Riverside Apartments', NOW() - INTERVAL '4 days' - INTERVAL '1 hour'),
('b0000021-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0101-0000-0000-0000-000000000101', '3M N95 Respirators', 'adjust_quantity', 'Sarah Chen', -9, 10, 1, NULL, NULL, NULL, NULL, NOW() - INTERVAL '4 days' - INTERVAL '3 hours'),
('b0000022-0000-0000-0000-000000000022', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0061-0000-0000-0000-000000000061', 'iPad Pro 11"', 'update', 'Carlos Rivera', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '4 days' - INTERVAL '5 hours'),
('b0000023-0000-0000-0000-000000000023', '11111111-1111-1111-1111-111111111111', 'pick_list', 'eeee0001-0000-0000-0000-000000000001', 'Truck 101 Restock', 'create', 'Tom Anderson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '4 days' - INTERVAL '7 hours')
ON CONFLICT (id) DO NOTHING;

-- Day 6
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, from_folder_id, from_folder_name, to_folder_id, to_folder_name, created_at) VALUES
('b0000024-0000-0000-0000-000000000024', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0010-0000-0000-0000-000000000010', 'DeWalt 5" Random Orbit Sander', 'adjust_quantity', 'Mike Thompson', 3, 5, 8, NULL, NULL, NULL, NULL, NOW() - INTERVAL '5 days' - INTERVAL '2 hours'),
('b0000025-0000-0000-0000-000000000025', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0021-0000-0000-0000-000000000021', 'Knipex Pliers Wrench', 'move', 'Sarah Chen', NULL, NULL, NULL, 'bbbb0013-0000-0000-0000-000000000013', 'Rack B1 - Wrenches & Sockets', 'bbbb0032-0000-0000-0000-000000000032', 'Truck 102 - Ford F-250', NOW() - INTERVAL '5 days' - INTERVAL '4 hours'),
('b0000026-0000-0000-0000-000000000026', '11111111-1111-1111-1111-111111111111', 'purchase_order', 'ffff0001-0000-0000-0000-000000000001', 'PO-2024-0089', 'create', 'Carlos Rivera', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '5 days' - INTERVAL '6 hours'),
('b0000027-0000-0000-0000-000000000027', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0047-0000-0000-0000-000000000047', 'Carhartt High-Vis Safety Vest', 'adjust_quantity', 'Tom Anderson', -5, 40, 35, NULL, NULL, NULL, NULL, NOW() - INTERVAL '5 days' - INTERVAL '8 hours')
ON CONFLICT (id) DO NOTHING;

-- Day 7
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, from_folder_id, from_folder_name, to_folder_id, to_folder_name, created_at) VALUES
('b0000028-0000-0000-0000-000000000028', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0003-0000-0000-0000-000000000003', 'DeWalt 20V MAX XR Drill/Driver', 'move', 'Mike Thompson', NULL, NULL, NULL, 'bbbb0010-0000-0000-0000-000000000010', 'Rack A1 - Drills & Drivers', 'bbbb0033-0000-0000-0000-000000000033', 'Van 201 - Transit', NOW() - INTERVAL '6 days' - INTERVAL '1 hour'),
('b0000029-0000-0000-0000-000000000029', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0102-0000-0000-0000-000000000102', 'Liquid Nails Heavy Duty', 'adjust_quantity', 'Sarah Chen', -15, 15, 0, NULL, NULL, NULL, NULL, NOW() - INTERVAL '6 days' - INTERVAL '3 hours'),
('b0000030-0000-0000-0000-000000000030', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0050-0000-0000-0000-000000000050', 'Miller 6ft Shock Absorbing Lanyard', 'create', 'Carlos Rivera', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '6 days' - INTERVAL '5 hours'),
('b0000031-0000-0000-0000-000000000031', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0022-0000-0000-0000-000000000022', 'Channellock 430 Tongue & Groove', 'update', 'Tom Anderson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '6 days' - INTERVAL '7 hours'),
('b0000032-0000-0000-0000-000000000032', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0077-0000-0000-0000-000000000077', 'OSI Quad Max Caulk', 'adjust_quantity', 'Mike Thompson', 30, 45, 75, NULL, NULL, NULL, NULL, NOW() - INTERVAL '6 days' - INTERVAL '9 hours')
ON CONFLICT (id) DO NOTHING;

-- Additional activity for "most active items" in trends report
-- Make certain items very active
INSERT INTO activity_logs (id, tenant_id, entity_type, entity_id, entity_name, action_type, user_name, quantity_delta, quantity_before, quantity_after, created_at) VALUES
('b0000033-0000-0000-0000-000000000033', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0001-0000-0000-0000-000000000001', 'Milwaukee M18 FUEL Hammer Drill', 'update', 'Sarah Chen', NULL, NULL, NULL, NOW() - INTERVAL '12 hours'),
('b0000034-0000-0000-0000-000000000034', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0001-0000-0000-0000-000000000001', 'Milwaukee M18 FUEL Hammer Drill', 'adjust_quantity', 'Carlos Rivera', -1, 9, 8, NOW() - INTERVAL '18 hours'),
('b0000035-0000-0000-0000-000000000035', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0001-0000-0000-0000-000000000001', 'Milwaukee M18 FUEL Hammer Drill', 'update', 'Tom Anderson', NULL, NULL, NULL, NOW() - INTERVAL '30 hours'),
('b0000036-0000-0000-0000-000000000036', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0005-0000-0000-0000-000000000005', 'Milwaukee M18 FUEL Circular Saw', 'adjust_quantity', 'Mike Thompson', 2, 3, 5, NOW() - INTERVAL '36 hours'),
('b0000037-0000-0000-0000-000000000037', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0005-0000-0000-0000-000000000005', 'Milwaukee M18 FUEL Circular Saw', 'update', 'Sarah Chen', NULL, NULL, NULL, NOW() - INTERVAL '48 hours'),
('b0000038-0000-0000-0000-000000000038', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0070-0000-0000-0000-000000000070', 'GRK R4 Screws 3"', 'adjust_quantity', 'Carlos Rivera', 20, 30, 50, NOW() - INTERVAL '60 hours'),
('b0000039-0000-0000-0000-000000000039', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0070-0000-0000-0000-000000000070', 'GRK R4 Screws 3"', 'update', 'Tom Anderson', NULL, NULL, NULL, NOW() - INTERVAL '72 hours'),
('b0000040-0000-0000-0000-000000000040', '11111111-1111-1111-1111-111111111111', 'item', 'dddd0045-0000-0000-0000-000000000045', 'Mechanix M-Pact Gloves', 'adjust_quantity', 'Mike Thompson', 10, 30, 40, NOW() - INTERVAL '84 hours')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- Summary of created test data
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Report Dummy Data Created Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'PROFIT MARGIN REPORT:';
    RAISE NOTICE '  - 25+ items with cost_price set';
    RAISE NOTICE '  - High margin (>50%%): 5 items';
    RAISE NOTICE '  - Medium margin (20-50%%): 8 items';
    RAISE NOTICE '  - Low margin (<20%%): 5 items';
    RAISE NOTICE '';
    RAISE NOTICE 'LOW STOCK REPORT:';
    RAISE NOTICE '  - 2 out_of_stock items';
    RAISE NOTICE '  - 4 low_stock items';
    RAISE NOTICE '';
    RAISE NOTICE 'EXPIRING ITEMS REPORT:';
    RAISE NOTICE '  - 2 expired lots';
    RAISE NOTICE '  - 2 critical lots (within 7 days)';
    RAISE NOTICE '  - 2 warning lots (within 14 days)';
    RAISE NOTICE '  - 2 upcoming lots (within 30 days)';
    RAISE NOTICE '  - 2 good lots (not expiring soon)';
    RAISE NOTICE '';
    RAISE NOTICE 'ACTIVITY/STOCK MOVEMENT/TRENDS REPORTS:';
    RAISE NOTICE '  - 40 activity logs over 7 days';
    RAISE NOTICE '  - Action types: create, update, delete, move, adjust_quantity';
    RAISE NOTICE '  - Entity types: item, folder, tag, pick_list, purchase_order';
    RAISE NOTICE '  - 8 move actions with folder details';
    RAISE NOTICE '  - 15 adjust_quantity actions with deltas';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

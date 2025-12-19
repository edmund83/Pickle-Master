-- ============================================
-- Pickle Master Seed Data
-- Purpose: Populate database with realistic US dummy data
-- Run this in Supabase SQL Editor AFTER running migrations
-- ============================================

-- ===================
-- TENANT
-- ===================
INSERT INTO tenants (id, name, slug, primary_color, subscription_tier, max_users, max_items)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Apex Construction & Equipment',
    'apex-construction',
    '#de4a4a',
    'pro',
    25,
    10000
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    subscription_tier = EXCLUDED.subscription_tier;

-- ===================
-- TAGS
-- ===================
INSERT INTO tags (id, tenant_id, name, color) VALUES
    ('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'High Value', '#ef4444'),
    ('aaaa0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Fragile', '#f97316'),
    ('aaaa0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Electronics', '#3b82f6'),
    ('aaaa0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Power Tools', '#6b7280'),
    ('aaaa0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Safety/PPE', '#22c55e'),
    ('aaaa0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Consumable', '#8b5cf6'),
    ('aaaa0007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'New Arrival', '#06b6d4'),
    ('aaaa0008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Job Site', '#ec4899'),
    ('aaaa0009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Needs Service', '#eab308'),
    ('aaaa0010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Reserved', '#14b8a6')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ===================
-- FOLDERS (Location Hierarchy)
-- ===================

-- Main Warehouse - Denver
INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES ('bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Denver Warehouse', NULL, '#3b82f6', 'warehouse', 1)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

-- Warehouse Sections
INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES
    ('bbbb0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Bay A - Power Tools', 'bbbb0001-0000-0000-0000-000000000001', '#f97316', 'zap', 1),
    ('bbbb0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Bay B - Hand Tools', 'bbbb0001-0000-0000-0000-000000000001', '#6b7280', 'wrench', 2),
    ('bbbb0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Bay C - Safety Equipment', 'bbbb0001-0000-0000-0000-000000000001', '#22c55e', 'shield', 3),
    ('bbbb0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Bay D - Electronics & Tech', 'bbbb0001-0000-0000-0000-000000000001', '#3b82f6', 'cpu', 4),
    ('bbbb0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Bay E - Fasteners & Hardware', 'bbbb0001-0000-0000-0000-000000000001', '#8b5cf6', 'package', 5)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

-- Sub-sections (Shelves/Racks)
INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES
    ('bbbb0010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Rack A1 - Drills & Drivers', 'bbbb0002-0000-0000-0000-000000000002', '#f97316', 'tool', 1),
    ('bbbb0011-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'Rack A2 - Saws', 'bbbb0002-0000-0000-0000-000000000002', '#f97316', 'tool', 2),
    ('bbbb0012-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'Rack A3 - Grinders & Sanders', 'bbbb0002-0000-0000-0000-000000000002', '#f97316', 'tool', 3),
    ('bbbb0013-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'Rack B1 - Wrenches & Sockets', 'bbbb0003-0000-0000-0000-000000000003', '#6b7280', 'wrench', 1),
    ('bbbb0014-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'Rack B2 - Screwdrivers & Pliers', 'bbbb0003-0000-0000-0000-000000000003', '#6b7280', 'wrench', 2),
    ('bbbb0015-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'Rack B3 - Measuring & Layout', 'bbbb0003-0000-0000-0000-000000000003', '#6b7280', 'ruler', 3),
    ('bbbb0016-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 'Rack C1 - Hard Hats & Eye Protection', 'bbbb0004-0000-0000-0000-000000000004', '#22c55e', 'hard-hat', 1),
    ('bbbb0017-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', 'Rack C2 - Gloves & Clothing', 'bbbb0004-0000-0000-0000-000000000004', '#22c55e', 'shirt', 2),
    ('bbbb0018-0000-0000-0000-000000000018', '11111111-1111-1111-1111-111111111111', 'Rack C3 - Fall Protection', 'bbbb0004-0000-0000-0000-000000000004', '#22c55e', 'anchor', 3)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

-- Second Location - Boulder Office
INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES ('bbbb0020-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', 'Boulder Office', NULL, '#8b5cf6', 'building', 2)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES
    ('bbbb0021-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111', 'IT Closet', 'bbbb0020-0000-0000-0000-000000000020', '#3b82f6', 'server', 1),
    ('bbbb0022-0000-0000-0000-000000000022', '11111111-1111-1111-1111-111111111111', 'Conference Room Storage', 'bbbb0020-0000-0000-0000-000000000020', '#f59e0b', 'users', 2),
    ('bbbb0023-0000-0000-0000-000000000023', '11111111-1111-1111-1111-111111111111', 'Break Room Supplies', 'bbbb0020-0000-0000-0000-000000000020', '#10b981', 'coffee', 3)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

-- Third Location - Fleet/Vehicles
INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES ('bbbb0030-0000-0000-0000-000000000030', '11111111-1111-1111-1111-111111111111', 'Fleet Vehicles', NULL, '#ef4444', 'truck', 3)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES
    ('bbbb0031-0000-0000-0000-000000000031', '11111111-1111-1111-1111-111111111111', 'Truck 101 - Ford F-250', 'bbbb0030-0000-0000-0000-000000000030', '#ef4444', 'truck', 1),
    ('bbbb0032-0000-0000-0000-000000000032', '11111111-1111-1111-1111-111111111111', 'Truck 102 - Ford F-250', 'bbbb0030-0000-0000-0000-000000000030', '#ef4444', 'truck', 2),
    ('bbbb0033-0000-0000-0000-000000000033', '11111111-1111-1111-1111-111111111111', 'Van 201 - Transit', 'bbbb0030-0000-0000-0000-000000000030', '#ef4444', 'truck', 3)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

-- Fourth Location - Job Sites
INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES ('bbbb0040-0000-0000-0000-000000000040', '11111111-1111-1111-1111-111111111111', 'Active Job Sites', NULL, '#ec4899', 'map-pin', 4)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

INSERT INTO folders (id, tenant_id, name, parent_id, color, icon, sort_order)
VALUES
    ('bbbb0041-0000-0000-0000-000000000041', '11111111-1111-1111-1111-111111111111', 'Riverside Apartments', 'bbbb0040-0000-0000-0000-000000000040', '#ec4899', 'building', 1),
    ('bbbb0042-0000-0000-0000-000000000042', '11111111-1111-1111-1111-111111111111', 'Downtown Office Remodel', 'bbbb0040-0000-0000-0000-000000000040', '#ec4899', 'building', 2)
ON CONFLICT (tenant_id, parent_id, name) DO NOTHING;

-- ===================
-- VENDORS
-- ===================
INSERT INTO vendors (id, tenant_id, name, contact_name, email, phone, address_line1, city, state, postal_code, country, notes)
VALUES
    ('cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'Home Depot Pro', 'Mike Johnson', 'mike.johnson@homedepot.com', '(303) 555-0101',
     '1500 Industrial Blvd', 'Denver', 'CO', '80204', 'USA',
     'Primary supplier for general tools and hardware. 2% discount on orders over $5,000.'),

    ('cccc0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'Grainger', 'Sarah Chen', 'schen@grainger.com', '(303) 555-0102',
     '2200 Commerce Way', 'Aurora', 'CO', '80011', 'USA',
     'Industrial supplies and safety equipment. Same-day delivery available.'),

    ('cccc0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'Milwaukee Tool Direct', 'Account Team', 'proaccounts@milwaukeetool.com', '(800) 555-0103',
     '13135 W Lisbon Rd', 'Brookfield', 'WI', '53005', 'USA',
     'Direct account for Milwaukee power tools. Extended warranty on all purchases.'),

    ('cccc0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'Fastenal', 'Tom Martinez', 'tmartinez@fastenal.com', '(303) 555-0104',
     '875 Supply Drive', 'Lakewood', 'CO', '80215', 'USA',
     'Fasteners, hardware, and consumables. VMI program available.'),

    ('cccc0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
     'Dell Technologies', 'Enterprise Sales', 'enterprise@dell.com', '(800) 555-0105',
     'One Dell Way', 'Round Rock', 'TX', '78682', 'USA',
     'IT equipment and laptops. ProSupport Plus warranty on all devices.')
ON CONFLICT DO NOTHING;

-- ===================
-- INVENTORY ITEMS - Power Tools
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'bbbb0010-0000-0000-0000-000000000010',
     'Milwaukee M18 FUEL Hammer Drill', 'MIL-2904-22', '18V Brushless, 1/2" Chuck, 2x 5.0Ah Batteries, Charger, Case',
     8, 3, 'units', 349.00, 'USD', '045242532100', 'Rack A1, Shelf 1', 'Primary drill for framing crews'),

    ('dddd0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbb0010-0000-0000-0000-000000000010',
     'Milwaukee M18 FUEL Impact Driver', 'MIL-2953-22', '18V Brushless, 1/4" Hex, 2x 5.0Ah Batteries, Charger, Case',
     12, 4, 'units', 299.00, 'USD', '045242532101', 'Rack A1, Shelf 1', 'Pair with hammer drill for combo'),

    ('dddd0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'bbbb0010-0000-0000-0000-000000000010',
     'DeWalt 20V MAX XR Drill/Driver', 'DEW-DCD791D2', '20V Brushless, 1/2" Chuck, 2x 2.0Ah Batteries',
     6, 2, 'units', 229.00, 'USD', '885911478922', 'Rack A1, Shelf 2', 'Lighter option for finish work'),

    ('dddd0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'bbbb0010-0000-0000-0000-000000000010',
     'Makita 18V LXT Hammer Drill', 'MAK-XPH14Z', '18V Brushless, Tool Only',
     4, 2, 'units', 179.00, 'USD', '088381894012', 'Rack A1, Shelf 3', 'Backup drills'),

    ('dddd0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'bbbb0011-0000-0000-0000-000000000011',
     'Milwaukee M18 FUEL Circular Saw 7-1/4"', 'MIL-2732-21HD', '18V Brushless, 12.0Ah Battery, Charger',
     5, 2, 'units', 449.00, 'USD', '045242532200', 'Rack A2, Shelf 1', 'High output for all-day cutting'),

    ('dddd0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'bbbb0011-0000-0000-0000-000000000011',
     'DeWalt 12" Sliding Miter Saw', 'DEW-DWS779', '15 Amp, Double Bevel, XPS Cutline',
     3, 1, 'units', 449.00, 'USD', '885911478300', 'Rack A2, Shelf 2', 'Job site miter saws'),

    ('dddd0007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'bbbb0011-0000-0000-0000-000000000011',
     'Milwaukee M18 FUEL Sawzall', 'MIL-2821-21', '18V Brushless, 5.0Ah Battery',
     6, 2, 'units', 329.00, 'USD', '045242532300', 'Rack A2, Shelf 3', 'Demo and rough-in work'),

    ('dddd0008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'bbbb0011-0000-0000-0000-000000000011',
     'Bosch 10" Jobsite Table Saw', 'BOS-4100XC-10', '15 Amp, Gravity-Rise Stand',
     2, 1, 'units', 699.00, 'USD', '000346472400', 'Rack A2, Floor', 'Portable table saws'),

    ('dddd0009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'bbbb0012-0000-0000-0000-000000000012',
     'Milwaukee M18 FUEL Angle Grinder 4-1/2"', 'MIL-2880-22', '18V Brushless, Paddle Switch, 2 Batteries',
     4, 2, 'units', 299.00, 'USD', '045242532400', 'Rack A3, Shelf 1', NULL),

    ('dddd0010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'bbbb0012-0000-0000-0000-000000000012',
     'DeWalt 5" Random Orbit Sander', 'DEW-DWE6423', '3 Amp, Variable Speed, Dust Collection',
     8, 3, 'units', 79.00, 'USD', '885911478500', 'Rack A3, Shelf 2', NULL);

-- ===================
-- INVENTORY ITEMS - Hand Tools
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0020-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', 'bbbb0013-0000-0000-0000-000000000013',
     'Milwaukee 56pc Mechanics Tool Set', 'MIL-48-22-9010', '3/8" Drive, SAE & Metric, Hard Case',
     10, 4, 'units', 199.00, 'USD', '045242533001', 'Rack B1, Drawer 1', 'Standard issue for field techs'),

    ('dddd0021-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111', 'bbbb0013-0000-0000-0000-000000000013',
     'Knipex Pliers Wrench 10"', 'KNI-8603250', 'Parallel Jaws, Zero Backlash',
     15, 5, 'units', 69.00, 'USD', '843221008955', 'Rack B1, Drawer 2', 'Favorite among plumbers'),

    ('dddd0022-0000-0000-0000-000000000022', '11111111-1111-1111-1111-111111111111', 'bbbb0013-0000-0000-0000-000000000013',
     'Channellock 430 Tongue & Groove', 'CHL-430', '10" Straight Jaw',
     20, 8, 'units', 29.00, 'USD', '025582104304', 'Rack B1, Drawer 3', NULL),

    ('dddd0023-0000-0000-0000-000000000023', '11111111-1111-1111-1111-111111111111', 'bbbb0013-0000-0000-0000-000000000013',
     'Crescent 8" Adjustable Wrench', 'CRE-AC28VS', 'Chrome Vanadium, Wide Jaw',
     25, 10, 'units', 19.00, 'USD', '037103226181', 'Rack B1, Drawer 4', NULL),

    ('dddd0024-0000-0000-0000-000000000024', '11111111-1111-1111-1111-111111111111', 'bbbb0014-0000-0000-0000-000000000014',
     'Klein 11-in-1 Screwdriver', 'KLE-32500', 'Multi-bit, Cushion Grip',
     30, 10, 'units', 24.00, 'USD', '092644325007', 'Rack B2, Bin 1', 'Every tool bag needs one'),

    ('dddd0025-0000-0000-0000-000000000025', '11111111-1111-1111-1111-111111111111', 'bbbb0014-0000-0000-0000-000000000014',
     'Milwaukee 10pc Precision Screwdriver Set', 'MIL-48-22-2410', 'Phillips, Slotted, Torx',
     12, 4, 'units', 34.00, 'USD', '045242533100', 'Rack B2, Bin 2', 'For electrical and electronics'),

    ('dddd0026-0000-0000-0000-000000000026', '11111111-1111-1111-1111-111111111111', 'bbbb0014-0000-0000-0000-000000000014',
     'Knipex Diagonal Cutters 8"', 'KNI-7401200', 'High Leverage, Comfort Grip',
     18, 6, 'units', 49.00, 'USD', '843221009006', 'Rack B2, Bin 3', NULL),

    ('dddd0027-0000-0000-0000-000000000027', '11111111-1111-1111-1111-111111111111', 'bbbb0014-0000-0000-0000-000000000014',
     'Klein Lineman Pliers 9"', 'KLE-D2139NE', 'New England Nose, High Leverage',
     15, 5, 'units', 44.00, 'USD', '092644720017', 'Rack B2, Bin 4', 'Electrician favorite'),

    ('dddd0028-0000-0000-0000-000000000028', '11111111-1111-1111-1111-111111111111', 'bbbb0015-0000-0000-0000-000000000015',
     'Stanley FatMax 25ft Tape Measure', 'STA-33-725', 'Blade Armor, Magnetic Tip',
     40, 15, 'units', 29.00, 'USD', '076174337259', 'Rack B3, Bin 1', NULL),

    ('dddd0029-0000-0000-0000-000000000029', '11111111-1111-1111-1111-111111111111', 'bbbb0015-0000-0000-0000-000000000015',
     'Milwaukee 48" Box Level', 'MIL-MLBX48', 'Die-Cast Aluminum, Magnetic',
     8, 3, 'units', 89.00, 'USD', '045242533200', 'Rack B3, Wall Mount', NULL),

    ('dddd0030-0000-0000-0000-000000000030', '11111111-1111-1111-1111-111111111111', 'bbbb0015-0000-0000-0000-000000000015',
     'Stabila 78" Level', 'STA-37478', 'Type 196, Aluminum',
     4, 2, 'units', 179.00, 'USD', '616164374781', 'Rack B3, Wall Mount', 'For door and window installs'),

    ('dddd0031-0000-0000-0000-000000000031', '11111111-1111-1111-1111-111111111111', 'bbbb0015-0000-0000-0000-000000000015',
     'Johnson 12" Combination Square', 'JOH-400EM-S', 'Stainless Steel, Etched',
     20, 8, 'units', 16.00, 'USD', '049448001054', 'Rack B3, Bin 2', NULL);

-- ===================
-- INVENTORY ITEMS - Safety Equipment
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0040-0000-0000-0000-000000000040', '11111111-1111-1111-1111-111111111111', 'bbbb0016-0000-0000-0000-000000000016',
     '3M Hard Hat H-700 (White)', 'SAF-3M-H700-W', '4-Point Ratchet Suspension, Vented',
     30, 15, 'units', 24.00, 'USD', '051138661847', 'Rack C1, Shelf 1', 'Standard site hard hat'),

    ('dddd0041-0000-0000-0000-000000000041', '11111111-1111-1111-1111-111111111111', 'bbbb0016-0000-0000-0000-000000000016',
     '3M Hard Hat H-700 (Yellow)', 'SAF-3M-H700-Y', '4-Point Ratchet Suspension, Vented',
     25, 10, 'units', 24.00, 'USD', '051138661854', 'Rack C1, Shelf 1', 'For supervisors'),

    ('dddd0042-0000-0000-0000-000000000042', '11111111-1111-1111-1111-111111111111', 'bbbb0016-0000-0000-0000-000000000016',
     '3M SecureFit Safety Glasses (Clear)', 'SAF-3M-SF400-C', 'Anti-Fog, Anti-Scratch',
     100, 40, 'units', 8.00, 'USD', '051138676015', 'Rack C1, Shelf 2', 'Bulk purchase from Grainger'),

    ('dddd0043-0000-0000-0000-000000000043', '11111111-1111-1111-1111-111111111111', 'bbbb0016-0000-0000-0000-000000000016',
     '3M SecureFit Safety Glasses (Tinted)', 'SAF-3M-SF400-T', 'Anti-Fog, UV Protection',
     50, 20, 'units', 9.00, 'USD', '051138676022', 'Rack C1, Shelf 2', 'For outdoor work'),

    ('dddd0044-0000-0000-0000-000000000044', '11111111-1111-1111-1111-111111111111', 'bbbb0016-0000-0000-0000-000000000016',
     '3M Peltor X4A Earmuffs', 'SAF-3M-X4A', 'NRR 27dB, Low Profile',
     20, 8, 'units', 34.00, 'USD', '051141558783', 'Rack C1, Shelf 3', NULL),

    ('dddd0045-0000-0000-0000-000000000045', '11111111-1111-1111-1111-111111111111', 'bbbb0017-0000-0000-0000-000000000017',
     'Mechanix M-Pact Gloves (Large)', 'SAF-MEC-MPT-L', 'Impact Protection, D3O Palm',
     40, 15, 'pairs', 35.00, 'USD', '781513605240', 'Rack C2, Bin 1', 'Most popular size'),

    ('dddd0046-0000-0000-0000-000000000046', '11111111-1111-1111-1111-111111111111', 'bbbb0017-0000-0000-0000-000000000017',
     'Mechanix M-Pact Gloves (XL)', 'SAF-MEC-MPT-XL', 'Impact Protection, D3O Palm',
     25, 10, 'pairs', 35.00, 'USD', '781513605257', 'Rack C2, Bin 1', NULL),

    ('dddd0047-0000-0000-0000-000000000047', '11111111-1111-1111-1111-111111111111', 'bbbb0017-0000-0000-0000-000000000017',
     'Carhartt High-Vis Safety Vest', 'SAF-CAR-VIS-L', 'Class 2, Mesh, Large',
     35, 15, 'units', 22.00, 'USD', '889192987456', 'Rack C2, Bin 2', NULL),

    ('dddd0048-0000-0000-0000-000000000048', '11111111-1111-1111-1111-111111111111', 'bbbb0017-0000-0000-0000-000000000017',
     'Timberland PRO Pit Boss Boots (Size 10)', 'SAF-TIM-PB-10', 'Steel Toe, Oil Resistant',
     6, 2, 'pairs', 145.00, 'USD', '657622124565', 'Rack C2, Shelf 1', 'Most common size'),

    ('dddd0049-0000-0000-0000-000000000049', '11111111-1111-1111-1111-111111111111', 'bbbb0018-0000-0000-0000-000000000018',
     'Werner Full Body Harness', 'SAF-WER-H412002', 'BaseWear, Quick Connect',
     10, 4, 'units', 149.00, 'USD', '051751093728', 'Rack C3, Hook 1', 'Annual inspection due March'),

    ('dddd0050-0000-0000-0000-000000000050', '11111111-1111-1111-1111-111111111111', 'bbbb0018-0000-0000-0000-000000000018',
     'Miller 6ft Shock Absorbing Lanyard', 'SAF-MIL-913WLS', 'Twin Leg, Snap Hooks',
     15, 6, 'units', 89.00, 'USD', '034831009132', 'Rack C3, Hook 2', NULL),

    ('dddd0051-0000-0000-0000-000000000051', '11111111-1111-1111-1111-111111111111', 'bbbb0018-0000-0000-0000-000000000018',
     '3M DBI-SALA Roof Anchor', 'SAF-3M-2103677', 'Reusable, Fits 4-12 Pitch',
     8, 3, 'units', 69.00, 'USD', '051141940168', 'Rack C3, Shelf 1', NULL);

-- ===================
-- INVENTORY ITEMS - Electronics & Tech
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0060-0000-0000-0000-000000000060', '11111111-1111-1111-1111-111111111111', 'bbbb0005-0000-0000-0000-000000000005',
     'Dell Latitude 5540 Laptop', 'IT-DELL-5540', '15.6" FHD, i7-1365U, 16GB, 512GB SSD, Win 11 Pro',
     8, 3, 'units', 1349.00, 'USD', '884116456123', 'Bay D, Shelf 1', 'Standard field laptop'),

    ('dddd0061-0000-0000-0000-000000000061', '11111111-1111-1111-1111-111111111111', 'bbbb0005-0000-0000-0000-000000000005',
     'iPad Pro 11" 256GB', 'IT-APL-IPAD11', 'M2 Chip, Wi-Fi + Cellular, Space Gray',
     5, 2, 'units', 999.00, 'USD', '194253392057', 'Bay D, Shelf 1', 'For project managers on site'),

    ('dddd0062-0000-0000-0000-000000000062', '11111111-1111-1111-1111-111111111111', 'bbbb0005-0000-0000-0000-000000000005',
     'Motorola TALKABOUT T800 (2-Pack)', 'COM-MOT-T800', 'Two-Way Radio, 35mi Range, Bluetooth',
     10, 4, 'packs', 89.00, 'USD', '748091003086', 'Bay D, Shelf 2', 'Job site communication'),

    ('dddd0063-0000-0000-0000-000000000063', '11111111-1111-1111-1111-111111111111', 'bbbb0005-0000-0000-0000-000000000005',
     'FLIR ONE Pro Thermal Camera', 'IT-FLIR-ONE', 'iOS/Android, 19,200 Pixels',
     3, 1, 'units', 399.00, 'USD', '812462022946', 'Bay D, Shelf 3', 'For HVAC and electrical diagnostics'),

    ('dddd0064-0000-0000-0000-000000000064', '11111111-1111-1111-1111-111111111111', 'bbbb0005-0000-0000-0000-000000000005',
     'Milwaukee M12 Laser Level', 'MIL-3632-21', '3-Plane, Red Beam, Receiver',
     4, 2, 'units', 449.00, 'USD', '045242533500', 'Bay D, Shelf 3', NULL);

-- ===================
-- INVENTORY ITEMS - Fasteners & Consumables
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0070-0000-0000-0000-000000000070', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'GRK R4 Screws 3" (100ct)', 'FAS-GRK-R4-3', '#9 x 3", Self-Countersinking',
     50, 20, 'boxes', 32.00, 'USD', '772691020307', 'Bay E, Bin A1', 'Best all-purpose screw'),

    ('dddd0071-0000-0000-0000-000000000071', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'GRK R4 Screws 2-1/2" (100ct)', 'FAS-GRK-R4-2.5', '#9 x 2.5", Self-Countersinking',
     60, 25, 'boxes', 28.00, 'USD', '772691020253', 'Bay E, Bin A2', NULL),

    ('dddd0072-0000-0000-0000-000000000072', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'Simpson Strong-Tie SD9 Screws (100ct)', 'FAS-SST-SD9', '#9 x 1-1/2", Structural',
     40, 15, 'boxes', 24.00, 'USD', '044315330001', 'Bay E, Bin A3', 'For metal connectors'),

    ('dddd0073-0000-0000-0000-000000000073', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'Tapcon 1/4" x 2-3/4" (25ct)', 'FAS-TAP-2.75', 'Concrete Anchors, Hex Head',
     35, 15, 'boxes', 18.00, 'USD', '099397000358', 'Bay E, Bin B1', NULL),

    ('dddd0074-0000-0000-0000-000000000074', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'Red Head 3/8" x 3" Wedge Anchors (25ct)', 'FAS-RH-38-3', 'Zinc Plated, Carbon Steel',
     25, 10, 'boxes', 29.00, 'USD', '044315120019', 'Bay E, Bin B2', NULL),

    ('dddd0075-0000-0000-0000-000000000075', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     '3M Duct Tape 1.88" x 60yd', 'CON-3M-DT-60', 'Industrial Grade, Silver',
     100, 40, 'rolls', 9.00, 'USD', '051131066908', 'Bay E, Bin C1', NULL),

    ('dddd0076-0000-0000-0000-000000000076', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'Tyvek Tape 2" x 55yd', 'CON-TYV-2-55', 'Housewrap Seam Tape',
     30, 12, 'rolls', 14.00, 'USD', '049793006479', 'Bay E, Bin C2', NULL),

    ('dddd0077-0000-0000-0000-000000000077', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'OSI Quad Max Caulk (Tan)', 'CON-OSI-QUAD-T', '9.5 oz Cartridge, 50 Year',
     75, 30, 'tubes', 8.00, 'USD', '028756925637', 'Bay E, Bin D1', 'Matches most wood trim'),

    ('dddd0078-0000-0000-0000-000000000078', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'Gorilla Wood Glue 18oz', 'CON-GOR-WG-18', 'Water Resistant, Fast Setting',
     20, 8, 'bottles', 12.00, 'USD', '052427000231', 'Bay E, Bin D2', NULL);

-- ===================
-- INVENTORY ITEMS - Office/IT Room
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0080-0000-0000-0000-000000000080', '11111111-1111-1111-1111-111111111111', 'bbbb0021-0000-0000-0000-000000000021',
     'Cat6 Patch Cable 7ft (Blue)', 'NET-CAT6-7', 'RJ45, Snagless Boot',
     50, 20, 'units', 6.00, 'USD', '812451013856', 'IT Closet, Shelf 1', NULL),

    ('dddd0081-0000-0000-0000-000000000081', '11111111-1111-1111-1111-111111111111', 'bbbb0021-0000-0000-0000-000000000021',
     'APC UPS 1500VA', 'IT-APC-1500', 'Back-UPS Pro, 900W, LCD',
     4, 2, 'units', 249.00, 'USD', '731304315940', 'IT Closet, Floor', 'For critical workstations'),

    ('dddd0082-0000-0000-0000-000000000082', '11111111-1111-1111-1111-111111111111', 'bbbb0021-0000-0000-0000-000000000021',
     'Dell 65W USB-C Charger', 'IT-DELL-65W', 'Universal Laptop Charger',
     10, 4, 'units', 49.00, 'USD', '884116456200', 'IT Closet, Drawer 1', 'Spare chargers for laptops');

-- ===================
-- INVENTORY ITEMS - Vehicle Inventory
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0090-0000-0000-0000-000000000090', '11111111-1111-1111-1111-111111111111', 'bbbb0031-0000-0000-0000-000000000031',
     'DeWalt ToughSystem Tool Box', 'VEH-DEW-TOUGH', 'Large, Wheeled, IP65',
     1, 1, 'units', 199.00, 'USD', '885911478700', 'Truck 101, Bed', 'Main tool storage'),

    ('dddd0091-0000-0000-0000-000000000091', '11111111-1111-1111-1111-111111111111', 'bbbb0031-0000-0000-0000-000000000031',
     'Werner 24ft Extension Ladder', 'VEH-WER-D1224', 'Type IA, Fiberglass',
     1, 1, 'units', 329.00, 'USD', '051751019773', 'Truck 101, Rack', NULL),

    ('dddd0092-0000-0000-0000-000000000092', '11111111-1111-1111-1111-111111111111', 'bbbb0032-0000-0000-0000-000000000032',
     'DeWalt ToughSystem Tool Box', 'VEH-DEW-TOUGH-2', 'Large, Wheeled, IP65',
     1, 1, 'units', 199.00, 'USD', '885911478701', 'Truck 102, Bed', 'Main tool storage'),

    ('dddd0093-0000-0000-0000-000000000093', '11111111-1111-1111-1111-111111111111', 'bbbb0032-0000-0000-0000-000000000032',
     'Werner 28ft Extension Ladder', 'VEH-WER-D1228', 'Type IA, Fiberglass',
     1, 1, 'units', 389.00, 'USD', '051751019780', 'Truck 102, Rack', NULL);

-- ===================
-- LOW STOCK & OUT OF STOCK ITEMS (for testing)
-- ===================
INSERT INTO inventory_items (id, tenant_id, folder_id, name, sku, description, quantity, min_quantity, unit, price, currency, barcode, location, notes)
VALUES
    ('dddd0100-0000-0000-0000-000000000100', '11111111-1111-1111-1111-111111111111', 'bbbb0010-0000-0000-0000-000000000010',
     'Milwaukee M18 5.0Ah Battery', 'MIL-48-11-1850', 'REDLITHIUM XC5.0',
     2, 8, 'units', 129.00, 'USD', '045242533600', 'Rack A1, Shelf 4', 'LOW STOCK - Order ASAP'),

    ('dddd0101-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', 'bbbb0016-0000-0000-0000-000000000016',
     '3M N95 Respirators (20ct)', 'SAF-3M-N95-20', '8210 Particulate Respirator',
     1, 10, 'boxes', 24.00, 'USD', '051138665000', 'Rack C1, Shelf 4', 'CRITICAL - Reorder immediately'),

    ('dddd0102-0000-0000-0000-000000000102', '11111111-1111-1111-1111-111111111111', 'bbbb0006-0000-0000-0000-000000000006',
     'Liquid Nails Heavy Duty', 'CON-LN-HD', '10 oz Cartridge',
     0, 15, 'tubes', 6.00, 'USD', '022078212109', 'Bay E, Bin D3', 'OUT OF STOCK'),

    ('dddd0103-0000-0000-0000-000000000103', '11111111-1111-1111-1111-111111111111', 'bbbb0011-0000-0000-0000-000000000011',
     'Milwaukee 7-1/4" Circular Saw Blade', 'MIL-48-40-0726', 'Framing, 24T Carbide',
     3, 10, 'units', 24.00, 'USD', '045242533700', 'Rack A2, Bin 1', 'Running low');

-- ===================
-- JOBS (Projects)
-- ===================
INSERT INTO jobs (id, tenant_id, name, description, status, start_date, end_date, location, notes)
VALUES
    ('eeee0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'Riverside Apartments Phase 2', '48-unit apartment complex, framing and rough-in',
     'active', '2024-11-15', '2025-03-31', '1250 Riverside Dr, Denver, CO', 'Main project Q4 2024 - Q1 2025. Need 8 crew members on site daily.'),

    ('eeee0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'Downtown Office Remodel', 'Complete gut renovation of 3rd floor office space',
     'active', '2024-12-01', '2025-02-15', '500 17th St, Denver, CO', 'High-end finish work. Client very particular about details.'),

    ('eeee0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'Boulder Tech Campus - Building B', 'New construction, steel and concrete',
     'active', '2024-10-01', '2025-06-30', '2800 Arapahoe Ave, Boulder, CO', 'Large-scale project. Multiple crews rotating.'),

    ('eeee0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'Smith Residence Kitchen', 'Full kitchen renovation including new cabinets',
     'completed', '2024-11-01', '2024-12-10', '456 Oak St, Lakewood, CO', 'Completed ahead of schedule. Happy customer.'),

    ('eeee0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
     'Annual Safety Equipment Audit', 'Inventory and inspection of all safety equipment',
     'active', '2024-12-15', '2024-12-31', 'All Locations', 'OSHA compliance check')
ON CONFLICT DO NOTHING;

-- ===================
-- CHECKOUTS
-- ===================
INSERT INTO checkouts (id, tenant_id, item_id, quantity, assignee_type, assignee_name, checked_out_at, due_date, status, notes)
VALUES
    ('hhhh0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'dddd0001-0000-0000-0000-000000000001', 2, 'job', 'Mike Thompson',
     NOW() - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'checked_out',
     'For Riverside Apartments framing'),

    ('hhhh0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'dddd0005-0000-0000-0000-000000000005', 1, 'person', 'Carlos Rivera',
     NOW() - INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days', 'checked_out',
     'Downtown Office job'),

    ('hhhh0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'dddd0049-0000-0000-0000-000000000049', 2, 'job', 'Safety Team',
     NOW() - INTERVAL '7 days', CURRENT_DATE - INTERVAL '2 days', 'checked_out',
     'Boulder Tech Campus roofing work'),

    ('hhhh0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
     'dddd0063-0000-0000-0000-000000000063', 1, 'person', 'Tom Anderson',
     NOW() - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 'checked_out',
     'HVAC inspection at client site'),

    ('hhhh0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
     'dddd0006-0000-0000-0000-000000000006', 1, 'location', 'Job Site Trailer',
     NOW() - INTERVAL '10 days', NULL, 'checked_out',
     'Permanent assignment to Riverside site')
ON CONFLICT DO NOTHING;

-- ===================
-- ITEM TAGS
-- ===================
INSERT INTO item_tags (item_id, tag_id)
VALUES
    -- High Value
    ('dddd0060-0000-0000-0000-000000000060', 'aaaa0001-0000-0000-0000-000000000001'), -- Dell Laptop
    ('dddd0061-0000-0000-0000-000000000061', 'aaaa0001-0000-0000-0000-000000000001'), -- iPad Pro
    ('dddd0063-0000-0000-0000-000000000063', 'aaaa0001-0000-0000-0000-000000000001'), -- FLIR Camera
    ('dddd0008-0000-0000-0000-000000000008', 'aaaa0001-0000-0000-0000-000000000001'), -- Table Saw

    -- Fragile
    ('dddd0060-0000-0000-0000-000000000060', 'aaaa0002-0000-0000-0000-000000000002'), -- Dell Laptop
    ('dddd0061-0000-0000-0000-000000000061', 'aaaa0002-0000-0000-0000-000000000002'), -- iPad Pro
    ('dddd0064-0000-0000-0000-000000000064', 'aaaa0002-0000-0000-0000-000000000002'), -- Laser Level

    -- Electronics
    ('dddd0060-0000-0000-0000-000000000060', 'aaaa0003-0000-0000-0000-000000000003'),
    ('dddd0061-0000-0000-0000-000000000061', 'aaaa0003-0000-0000-0000-000000000003'),
    ('dddd0062-0000-0000-0000-000000000062', 'aaaa0003-0000-0000-0000-000000000003'),
    ('dddd0063-0000-0000-0000-000000000063', 'aaaa0003-0000-0000-0000-000000000003'),
    ('dddd0064-0000-0000-0000-000000000064', 'aaaa0003-0000-0000-0000-000000000003'),

    -- Power Tools
    ('dddd0001-0000-0000-0000-000000000001', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0002-0000-0000-0000-000000000002', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0003-0000-0000-0000-000000000003', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0004-0000-0000-0000-000000000004', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0005-0000-0000-0000-000000000005', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0006-0000-0000-0000-000000000006', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0007-0000-0000-0000-000000000007', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0008-0000-0000-0000-000000000008', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0009-0000-0000-0000-000000000009', 'aaaa0004-0000-0000-0000-000000000004'),
    ('dddd0010-0000-0000-0000-000000000010', 'aaaa0004-0000-0000-0000-000000000004'),

    -- Safety/PPE
    ('dddd0040-0000-0000-0000-000000000040', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0041-0000-0000-0000-000000000041', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0042-0000-0000-0000-000000000042', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0043-0000-0000-0000-000000000043', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0044-0000-0000-0000-000000000044', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0045-0000-0000-0000-000000000045', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0046-0000-0000-0000-000000000046', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0047-0000-0000-0000-000000000047', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0048-0000-0000-0000-000000000048', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0049-0000-0000-0000-000000000049', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0050-0000-0000-0000-000000000050', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0051-0000-0000-0000-000000000051', 'aaaa0005-0000-0000-0000-000000000005'),
    ('dddd0101-0000-0000-0000-000000000101', 'aaaa0005-0000-0000-0000-000000000005'),

    -- Consumable
    ('dddd0070-0000-0000-0000-000000000070', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0071-0000-0000-0000-000000000071', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0072-0000-0000-0000-000000000072', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0073-0000-0000-0000-000000000073', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0074-0000-0000-0000-000000000074', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0075-0000-0000-0000-000000000075', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0076-0000-0000-0000-000000000076', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0077-0000-0000-0000-000000000077', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0078-0000-0000-0000-000000000078', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0102-0000-0000-0000-000000000102', 'aaaa0006-0000-0000-0000-000000000006'),
    ('dddd0103-0000-0000-0000-000000000103', 'aaaa0006-0000-0000-0000-000000000006'),

    -- Job Site
    ('dddd0090-0000-0000-0000-000000000090', 'aaaa0008-0000-0000-0000-000000000008'),
    ('dddd0091-0000-0000-0000-000000000091', 'aaaa0008-0000-0000-0000-000000000008'),
    ('dddd0092-0000-0000-0000-000000000092', 'aaaa0008-0000-0000-0000-000000000008'),
    ('dddd0093-0000-0000-0000-000000000093', 'aaaa0008-0000-0000-0000-000000000008'),

    -- Needs Service
    ('dddd0100-0000-0000-0000-000000000100', 'aaaa0009-0000-0000-0000-000000000009')
ON CONFLICT DO NOTHING;

-- ===================
-- ACTIVITY LOGS
-- ===================
INSERT INTO activity_logs (tenant_id, entity_type, entity_id, entity_name, action_type, changes, quantity_delta, quantity_before, quantity_after, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'item', 'dddd0001-0000-0000-0000-000000000001', 'Milwaukee M18 FUEL Hammer Drill',
     'quantity_adjust', '{"reason": "Received shipment from Milwaukee Direct"}', 4, 4, 8, NOW() - INTERVAL '3 hours'),

    ('11111111-1111-1111-1111-111111111111', 'item', 'dddd0070-0000-0000-0000-000000000070', 'GRK R4 Screws 3" (100ct)',
     'quantity_adjust', '{"reason": "Restocked from Fastenal delivery"}', 25, 25, 50, NOW() - INTERVAL '1 day'),

    ('11111111-1111-1111-1111-111111111111', 'item', 'dddd0042-0000-0000-0000-000000000042', '3M SecureFit Safety Glasses (Clear)',
     'quantity_adjust', '{"reason": "Distributed to new hires"}', -20, 120, 100, NOW() - INTERVAL '2 days'),

    ('11111111-1111-1111-1111-111111111111', 'item', 'dddd0005-0000-0000-0000-000000000005', 'Milwaukee M18 FUEL Circular Saw 7-1/4"',
     'check_out', '{"assignee": "Carlos Rivera", "job": "Downtown Office Remodel"}', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),

    ('11111111-1111-1111-1111-111111111111', 'item', 'dddd0102-0000-0000-0000-000000000102', 'Liquid Nails Heavy Duty',
     'quantity_adjust', '{"reason": "Used at Riverside Apartments site"}', -15, 15, 0, NOW() - INTERVAL '4 days'),

    ('11111111-1111-1111-1111-111111111111', 'folder', 'bbbb0041-0000-0000-0000-000000000041', 'Riverside Apartments',
     'create', '{"parent": "Active Job Sites"}', NULL, NULL, NULL, NOW() - INTERVAL '1 week')
ON CONFLICT DO NOTHING;

-- ===================
-- PURCHASE ORDERS
-- ===================
INSERT INTO purchase_orders (id, tenant_id, order_number, vendor_id, status, expected_date, subtotal, tax, shipping, total, notes, created_at)
VALUES
    ('ffff0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'PO-2024-0089', 'cccc0003-0000-0000-0000-000000000003', 'received',
     '2024-12-10', 2196.00, 175.68, 0.00, 2371.68,
     'Milwaukee batteries and chargers', NOW() - INTERVAL '10 days'),

    ('ffff0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'PO-2024-0090', 'cccc0002-0000-0000-0000-000000000002', 'pending',
     '2025-01-05', 1440.00, 115.20, 45.00, 1600.20,
     'Safety equipment restock for Q1', NOW() - INTERVAL '3 days'),

    ('ffff0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'PO-2024-0091', 'cccc0004-0000-0000-0000-000000000004', 'draft',
     NULL, 0.00, 0.00, 0.00, 0.00,
     'Fastener restock - pending approval', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, item_id, item_name, sku, ordered_quantity, received_quantity, unit_price, notes)
VALUES
    ('fff10001-0000-0000-0000-000000000001', 'ffff0001-0000-0000-0000-000000000001',
     'dddd0100-0000-0000-0000-000000000100', 'Milwaukee M18 5.0Ah Battery', 'MIL-48-11-1850',
     12, 12, 129.00, NULL),

    ('fff10002-0000-0000-0000-000000000002', 'ffff0001-0000-0000-0000-000000000001',
     NULL, 'Milwaukee M18 Dual Bay Charger', 'MIL-48-59-1802',
     4, 4, 99.00, 'New item - add to inventory'),

    ('fff10003-0000-0000-0000-000000000003', 'ffff0002-0000-0000-0000-000000000002',
     'dddd0040-0000-0000-0000-000000000040', '3M Hard Hat H-700 (White)', 'SAF-3M-H700-W',
     20, 0, 24.00, NULL),

    ('fff10004-0000-0000-0000-000000000004', 'ffff0002-0000-0000-0000-000000000002',
     'dddd0101-0000-0000-0000-000000000101', '3M N95 Respirators (20ct)', 'SAF-3M-N95-20',
     30, 0, 24.00, 'Critical item'),

    ('fff10005-0000-0000-0000-000000000005', 'ffff0002-0000-0000-0000-000000000002',
     'dddd0045-0000-0000-0000-000000000045', 'Mechanix M-Pact Gloves (Large)', 'SAF-MEC-MPT-L',
     20, 0, 35.00, NULL)
ON CONFLICT DO NOTHING;

-- ===================
-- PICK LISTS
-- ===================
INSERT INTO pick_lists (id, tenant_id, name, status, notes, due_date, created_at)
VALUES
    ('gggg0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'Truck 101 Restock', 'draft',
     'Weekly restock for Mike Thompson crew', '2024-12-23', NOW() - INTERVAL '1 day'),

    ('gggg0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'New Hire Kit - Jake Williams', 'in_progress',
     'Starting Monday 12/23', '2024-12-22', NOW() - INTERVAL '2 days'),

    ('gggg0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'Boulder Site Safety Equipment', 'completed',
     'Delivered to site 12/15', NULL, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

INSERT INTO pick_list_items (id, pick_list_id, item_id, requested_quantity, picked_quantity, notes)
VALUES
    ('ggg10001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001',
     'dddd0070-0000-0000-0000-000000000070', 5, 0, 'GRK 3" screws'),
    ('ggg10002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001',
     'dddd0075-0000-0000-0000-000000000075', 3, 0, 'Duct tape'),
    ('ggg10003-0000-0000-0000-000000000003', 'gggg0001-0000-0000-0000-000000000001',
     'dddd0077-0000-0000-0000-000000000077', 10, 0, 'Caulk'),

    ('ggg10004-0000-0000-0000-000000000004', 'gggg0002-0000-0000-0000-000000000002',
     'dddd0040-0000-0000-0000-000000000040', 1, 1, 'White hard hat'),
    ('ggg10005-0000-0000-0000-000000000005', 'gggg0002-0000-0000-0000-000000000002',
     'dddd0042-0000-0000-0000-000000000042', 2, 2, 'Safety glasses'),
    ('ggg10006-0000-0000-0000-000000000006', 'gggg0002-0000-0000-0000-000000000002',
     'dddd0045-0000-0000-0000-000000000045', 1, 0, 'Work gloves - check size'),
    ('ggg10007-0000-0000-0000-000000000007', 'gggg0002-0000-0000-0000-000000000002',
     'dddd0047-0000-0000-0000-000000000047', 1, 1, 'Safety vest'),

    ('ggg10008-0000-0000-0000-000000000008', 'gggg0003-0000-0000-0000-000000000003',
     'dddd0049-0000-0000-0000-000000000049', 4, 4, 'Harnesses'),
    ('ggg10009-0000-0000-0000-000000000009', 'gggg0003-0000-0000-0000-000000000003',
     'dddd0050-0000-0000-0000-000000000050', 6, 6, 'Lanyards')
ON CONFLICT DO NOTHING;

-- ===================
-- SUCCESS MESSAGE
-- ===================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Pickle Master US Seed Data Loaded!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 1 Tenant: Apex Construction & Equipment';
    RAISE NOTICE '  - 10 Tags';
    RAISE NOTICE '  - 25+ Folders (warehouse, office, vehicles, job sites)';
    RAISE NOTICE '  - 5 Vendors (Home Depot Pro, Grainger, Milwaukee, etc.)';
    RAISE NOTICE '  - 60+ Inventory Items (tools, safety, electronics, consumables)';
    RAISE NOTICE '  - 5 Jobs/Projects';
    RAISE NOTICE '  - 5 Active Checkouts';
    RAISE NOTICE '  - 3 Purchase Orders';
    RAISE NOTICE '  - 3 Pick Lists';
    RAISE NOTICE '  - Sample Activity Logs';
    RAISE NOTICE '';
    RAISE NOTICE 'To use this data:';
    RAISE NOTICE '  1. Create a user account via Supabase Auth';
    RAISE NOTICE '  2. Link your user to this tenant:';
    RAISE NOTICE '';
    RAISE NOTICE '  INSERT INTO profiles (id, tenant_id, email, full_name, role)';
    RAISE NOTICE '  VALUES (';
    RAISE NOTICE '    ''YOUR_AUTH_USER_ID'',';
    RAISE NOTICE '    ''11111111-1111-1111-1111-111111111111'',';
    RAISE NOTICE '    ''your@email.com'',';
    RAISE NOTICE '    ''Your Name'',';
    RAISE NOTICE '    ''owner''';
    RAISE NOTICE '  );';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

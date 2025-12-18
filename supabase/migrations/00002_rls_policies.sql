-- Row Level Security Policies for Pickle Master
-- Run this after the initial schema

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===================
-- PROFILES POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can view teammates" ON profiles;
CREATE POLICY "Users can view teammates" ON profiles
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- ===================
-- TENANTS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
CREATE POLICY "Users can view own tenant" ON tenants
    FOR SELECT USING (id = get_user_tenant_id());

DROP POLICY IF EXISTS "Owners can update tenant" ON tenants;
CREATE POLICY "Owners can update tenant" ON tenants
    FOR UPDATE USING (
        id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
    );

DROP POLICY IF EXISTS "Allow tenant creation during signup" ON tenants;
CREATE POLICY "Allow tenant creation during signup" ON tenants
    FOR INSERT WITH CHECK (true);

-- ===================
-- INVENTORY ITEMS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant items" ON inventory_items;
CREATE POLICY "Users can view tenant items" ON inventory_items
    FOR SELECT USING (tenant_id = get_user_tenant_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Editors can insert items" ON inventory_items;
CREATE POLICY "Editors can insert items" ON inventory_items
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update items" ON inventory_items;
CREATE POLICY "Editors can update items" ON inventory_items
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete items" ON inventory_items;
CREATE POLICY "Admins can delete items" ON inventory_items
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- FOLDERS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant folders" ON folders;
CREATE POLICY "Users can view tenant folders" ON folders
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert folders" ON folders;
CREATE POLICY "Editors can insert folders" ON folders
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update folders" ON folders;
CREATE POLICY "Editors can update folders" ON folders
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete folders" ON folders;
CREATE POLICY "Admins can delete folders" ON folders
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- ACTIVITY LOGS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant activity" ON activity_logs;
CREATE POLICY "Users can view tenant activity" ON activity_logs
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "System can insert activity" ON activity_logs;
CREATE POLICY "System can insert activity" ON activity_logs
    FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

-- ===================
-- TAGS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant tags" ON tags;
CREATE POLICY "Users can view tenant tags" ON tags
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can manage tags" ON tags;
CREATE POLICY "Editors can manage tags" ON tags
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- ===================
-- ADDRESSES POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant addresses" ON addresses;
CREATE POLICY "Users can view tenant addresses" ON addresses
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Admins can manage addresses" ON addresses;
CREATE POLICY "Admins can manage addresses" ON addresses
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- VENDORS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant vendors" ON vendors;
CREATE POLICY "Users can view tenant vendors" ON vendors
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can manage vendors" ON vendors;
CREATE POLICY "Editors can manage vendors" ON vendors
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- ===================
-- CUSTOM FIELD DEFINITIONS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view custom fields" ON custom_field_definitions;
CREATE POLICY "Users can view custom fields" ON custom_field_definitions
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Admins can manage custom fields" ON custom_field_definitions;
CREATE POLICY "Admins can manage custom fields" ON custom_field_definitions
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- ALERTS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant alerts" ON alerts;
CREATE POLICY "Users can view tenant alerts" ON alerts
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can manage alerts" ON alerts;
CREATE POLICY "Editors can manage alerts" ON alerts
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- ===================
-- PICK LISTS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant pick lists" ON pick_lists;
CREATE POLICY "Users can view tenant pick lists" ON pick_lists
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can manage pick lists" ON pick_lists;
CREATE POLICY "Editors can manage pick lists" ON pick_lists
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Users can view pick list items" ON pick_list_items;
CREATE POLICY "Users can view pick list items" ON pick_list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
    );

DROP POLICY IF EXISTS "Editors can manage pick list items" ON pick_list_items;
CREATE POLICY "Editors can manage pick list items" ON pick_list_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- ===================
-- PURCHASE ORDERS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view tenant purchase orders" ON purchase_orders;
CREATE POLICY "Users can view tenant purchase orders" ON purchase_orders
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can manage purchase orders" ON purchase_orders;
CREATE POLICY "Editors can manage purchase orders" ON purchase_orders
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Users can view purchase order items" ON purchase_order_items;
CREATE POLICY "Users can view purchase order items" ON purchase_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po
            WHERE po.id = purchase_order_items.purchase_order_id
            AND po.tenant_id = get_user_tenant_id()
        )
    );

DROP POLICY IF EXISTS "Editors can manage purchase order items" ON purchase_order_items;
CREATE POLICY "Editors can manage purchase order items" ON purchase_order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po
            WHERE po.id = purchase_order_items.purchase_order_id
            AND po.tenant_id = get_user_tenant_id()
        ) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- ===================
-- NOTIFICATIONS POLICIES
-- ===================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (
        user_id = auth.uid() OR
        (user_id IS NULL AND tenant_id = get_user_tenant_id())
    );

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

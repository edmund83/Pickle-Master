-- ============================================
-- Migration: 00134_rls_replace_admin_editor_with_staff.sql
-- Purpose: Fix Critical #3 - RLS policies still use admin/editor after 00089
--          Replace (owner, admin) and (owner, admin, editor) with 3-role model.
--          owner-only: user_has_role(ARRAY['owner'])
--          owner or staff: user_has_role(ARRAY['owner', 'staff'])
-- ============================================

-- ============================================================================
-- 1. RATE LIMITING (owner-only: settings)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view rate limit logs" ON rate_limit_logs;
CREATE POLICY "Admins can view rate limit logs" ON rate_limit_logs
    FOR SELECT USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

DROP POLICY IF EXISTS "Admins can manage tenant rate limits" ON tenant_rate_limits;
CREATE POLICY "Admins can manage tenant rate limits" ON tenant_rate_limits
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

-- ============================================================================
-- 2. TAX RATES (owner-only: settings)
-- ============================================================================
DROP POLICY IF EXISTS tax_rates_insert ON tax_rates;
CREATE POLICY tax_rates_insert ON tax_rates
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

DROP POLICY IF EXISTS tax_rates_update ON tax_rates;
CREATE POLICY tax_rates_update ON tax_rates
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

DROP POLICY IF EXISTS tax_rates_delete ON tax_rates;
CREATE POLICY tax_rates_delete ON tax_rates
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

-- ============================================================================
-- 3. PAYMENT TERMS (owner-only: settings)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can insert payment terms" ON payment_terms;
CREATE POLICY "Admins can insert payment terms" ON payment_terms
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

DROP POLICY IF EXISTS "Admins can update payment terms" ON payment_terms;
CREATE POLICY "Admins can update payment terms" ON payment_terms
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

DROP POLICY IF EXISTS "Admins can delete payment terms" ON payment_terms;
CREATE POLICY "Admins can delete payment terms" ON payment_terms
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

-- ============================================================================
-- 4. RECEIVES (owner or staff)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can insert receives" ON receives;
CREATE POLICY "Editors can insert receives" ON receives
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update receives" ON receives;
CREATE POLICY "Editors can update receives" ON receives
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete receives" ON receives;
CREATE POLICY "Admins can delete receives" ON receives
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can insert receive items" ON receive_items;
CREATE POLICY "Editors can insert receive items" ON receive_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM receives r
            WHERE r.id = receive_items.receive_id
            AND r.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update receive items" ON receive_items;
CREATE POLICY "Editors can update receive items" ON receive_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM receives r
            WHERE r.id = receive_items.receive_id
            AND r.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can delete receive items" ON receive_items;
CREATE POLICY "Editors can delete receive items" ON receive_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM receives r
            WHERE r.id = receive_items.receive_id
            AND r.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 5. STOCK COUNTS (owner or staff)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can insert stock counts" ON stock_counts;
CREATE POLICY "Editors can insert stock counts" ON stock_counts
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update stock counts" ON stock_counts;
CREATE POLICY "Editors can update stock counts" ON stock_counts
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete stock counts" ON stock_counts;
CREATE POLICY "Admins can delete stock counts" ON stock_counts
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can insert stock count items" ON stock_count_items;
CREATE POLICY "Editors can insert stock count items" ON stock_count_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stock_counts sc
            WHERE sc.id = stock_count_items.stock_count_id
            AND sc.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update stock count items" ON stock_count_items;
CREATE POLICY "Editors can update stock count items" ON stock_count_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stock_counts sc
            WHERE sc.id = stock_count_items.stock_count_id
            AND sc.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete stock count items" ON stock_count_items;
CREATE POLICY "Admins can delete stock count items" ON stock_count_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM stock_counts sc
            WHERE sc.id = stock_count_items.stock_count_id
            AND sc.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 6. PICK LISTS (00031 - owner or staff; policy names use pick_lists/pick_list_items)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can insert pick_lists" ON pick_lists;
CREATE POLICY "Editors can insert pick_lists" ON pick_lists
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update pick_lists" ON pick_lists;
CREATE POLICY "Editors can update pick_lists" ON pick_lists
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete pick_lists" ON pick_lists;
CREATE POLICY "Admins can delete pick_lists" ON pick_lists
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can insert pick_list_items" ON pick_list_items;
CREATE POLICY "Editors can insert pick_list_items" ON pick_list_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update pick_list_items" ON pick_list_items;
CREATE POLICY "Editors can update pick_list_items" ON pick_list_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can delete pick_list_items" ON pick_list_items;
CREATE POLICY "Editors can delete pick_list_items" ON pick_list_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pick_lists pl
            WHERE pl.id = pick_list_items.pick_list_id
            AND pl.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 7. CHECKOUT SERIALS (00030 - owner or staff)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can insert checkout_serials" ON checkout_serials;
CREATE POLICY "Editors can insert checkout_serials" ON checkout_serials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM checkouts c
            WHERE c.id = checkout_serials.checkout_id
            AND c.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update checkout_serials" ON checkout_serials;
CREATE POLICY "Editors can update checkout_serials" ON checkout_serials
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM checkouts c
            WHERE c.id = checkout_serials.checkout_id
            AND c.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete checkout_serials" ON checkout_serials;
CREATE POLICY "Admins can delete checkout_serials" ON checkout_serials
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM checkouts c
            WHERE c.id = checkout_serials.checkout_id
            AND c.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 8. CHECKOUTS (00013 - owner or staff)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can insert checkouts" ON checkouts;
CREATE POLICY "Editors can insert checkouts" ON checkouts
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update checkouts" ON checkouts;
CREATE POLICY "Editors can update checkouts" ON checkouts
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete checkouts" ON checkouts;
CREATE POLICY "Admins can delete checkouts" ON checkouts
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 9. STORAGE (00003 - owner or staff)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can upload images" ON storage.objects;
CREATE POLICY "Editors can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'item-images'
        AND (storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid())
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update images" ON storage.objects;
CREATE POLICY "Editors can update images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'item-images'
        AND (storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid())
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can delete images" ON storage.objects;
CREATE POLICY "Editors can delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'item-images'
        AND (storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid())
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 10. INVENTORY ITEMS, FOLDERS, TAGS, etc. (00002 - owner or staff)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can insert items" ON inventory_items;
CREATE POLICY "Editors can insert items" ON inventory_items
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update items" ON inventory_items;
CREATE POLICY "Editors can update items" ON inventory_items
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete items" ON inventory_items;
CREATE POLICY "Admins can delete items" ON inventory_items
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can insert folders" ON folders;
CREATE POLICY "Editors can insert folders" ON folders
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can update folders" ON folders;
CREATE POLICY "Editors can update folders" ON folders
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can delete folders" ON folders;
CREATE POLICY "Admins can delete folders" ON folders
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can manage tags" ON tags;
CREATE POLICY "Editors can manage tags" ON tags
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can manage addresses" ON addresses;
CREATE POLICY "Admins can manage addresses" ON addresses
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can manage vendors" ON vendors;
CREATE POLICY "Editors can manage vendors" ON vendors
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Admins can manage custom fields" ON custom_field_definitions;
CREATE POLICY "Admins can manage custom fields" ON custom_field_definitions
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can manage alerts" ON alerts;
CREATE POLICY "Editors can manage alerts" ON alerts
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can manage purchase orders" ON purchase_orders;
CREATE POLICY "Editors can manage purchase orders" ON purchase_orders
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS "Editors can manage purchase order items" ON purchase_order_items;
CREATE POLICY "Editors can manage purchase order items" ON purchase_order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po
            WHERE po.id = purchase_order_items.purchase_order_id
            AND po.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 11. AI USAGE (00082 - owner only for admin-style)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view tenant AI limits" ON ai_usage_limits;
CREATE POLICY "Admins can view tenant AI limits" ON ai_usage_limits
    FOR SELECT USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

DROP POLICY IF EXISTS "Admins can manage AI limits" ON ai_usage_limits;
CREATE POLICY "Admins can manage AI limits" ON ai_usage_limits
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner'])
    );

-- (Further tables with admin/editor in RLS: activity_logs, lots, serial_numbers,
-- item_reminders, auto_reorder_suggestions, etc. can be updated in a follow-up
-- if staff are denied; 00092 already updated many via can_edit()/user_has_role.)

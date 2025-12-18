-- ============================================
-- Migration: Performance-Critical Indexes
-- Purpose: Optimize query performance for 10,000+ tenants
-- ============================================

-- 1. CRITICAL: Index on profiles.tenant_id (was missing!)
-- Required for efficient tenant lookups in RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id
ON profiles(tenant_id);

-- 2. Composite index for RLS optimization
-- Speeds up the common pattern: WHERE id = auth.uid() AND tenant_id = X
CREATE INDEX IF NOT EXISTS idx_profiles_id_tenant
ON profiles(id, tenant_id);

-- 3. Composite indexes for inventory_items common queries
-- Most queries filter by tenant + folder + status
CREATE INDEX IF NOT EXISTS idx_items_tenant_folder_status
ON inventory_items(tenant_id, folder_id, status)
WHERE deleted_at IS NULL;

-- Most queries order by updated_at
CREATE INDEX IF NOT EXISTS idx_items_tenant_updated
ON inventory_items(tenant_id, updated_at DESC)
WHERE deleted_at IS NULL;

-- Name search within tenant
CREATE INDEX IF NOT EXISTS idx_items_tenant_name
ON inventory_items(tenant_id, name)
WHERE deleted_at IS NULL;

-- 4. Partial index for soft deletes (only active items)
-- Dramatically reduces index size and speeds up active item queries
CREATE INDEX IF NOT EXISTS idx_items_active
ON inventory_items(tenant_id, id)
WHERE deleted_at IS NULL;

-- 5. Activity logs - time-based queries are common for reports
CREATE INDEX IF NOT EXISTS idx_activity_tenant_created
ON activity_logs(tenant_id, created_at DESC);

-- 6. Notifications - unread optimization
-- Most queries fetch unread notifications first
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications(user_id, created_at DESC)
WHERE is_read = FALSE;

-- 7. Pick lists - filter by active status
CREATE INDEX IF NOT EXISTS idx_pick_lists_tenant_status
ON pick_lists(tenant_id, status)
WHERE status NOT IN ('completed', 'cancelled');

-- 8. Purchase orders - filter by active status
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_status
ON purchase_orders(tenant_id, status)
WHERE status NOT IN ('received', 'cancelled');

-- 9. Folders - optimize tree traversal
CREATE INDEX IF NOT EXISTS idx_folders_tenant_parent
ON folders(tenant_id, parent_id);

-- 10. Vendors - commonly filtered by tenant
CREATE INDEX IF NOT EXISTS idx_vendors_tenant
ON vendors(tenant_id);

-- 11. Addresses - commonly filtered by tenant
CREATE INDEX IF NOT EXISTS idx_addresses_tenant
ON addresses(tenant_id);

-- 12. Alerts - active alerts lookup
CREATE INDEX IF NOT EXISTS idx_alerts_tenant_active
ON alerts(tenant_id, target_type, target_id)
WHERE is_active = TRUE;

-- 13. Custom field definitions - tenant lookup
CREATE INDEX IF NOT EXISTS idx_custom_fields_tenant
ON custom_field_definitions(tenant_id);

-- 14. JSONB index for custom_fields queries
CREATE INDEX IF NOT EXISTS idx_items_custom_fields
ON inventory_items USING GIN (custom_fields);

-- 15. Tags index for tenant
CREATE INDEX IF NOT EXISTS idx_tags_tenant
ON tags(tenant_id);

-- Analyze tables to update statistics
ANALYZE profiles;
ANALYZE inventory_items;
ANALYZE activity_logs;
ANALYZE folders;
ANALYZE notifications;
ANALYZE pick_lists;
ANALYZE purchase_orders;
ANALYZE vendors;
ANALYZE addresses;
ANALYZE alerts;
ANALYZE tags;
ANALYZE custom_field_definitions;

-- ============================================
-- Migration: Enum Types for Type Safety
-- Purpose: Better type safety, storage efficiency, and query optimization
-- ============================================

-- Note: We create the enum types but don't alter existing columns
-- to avoid data migration complexity. New code should use these types.

-- 1. Item Status Enum
DO $$ BEGIN
    CREATE TYPE item_status_enum AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. User Role Enum
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('owner', 'admin', 'editor', 'viewer', 'member');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Subscription Tier Enum
DO $$ BEGIN
    CREATE TYPE subscription_tier_enum AS ENUM ('free', 'starter', 'professional', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Subscription Status Enum
DO $$ BEGIN
    CREATE TYPE subscription_status_enum AS ENUM ('active', 'trial', 'past_due', 'cancelled', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 5. Pick List Status Enum
DO $$ BEGIN
    CREATE TYPE pick_list_status_enum AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 6. Purchase Order Status Enum
DO $$ BEGIN
    CREATE TYPE po_status_enum AS ENUM ('draft', 'submitted', 'confirmed', 'partial', 'received', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 7. Notification Type Enum
DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM (
        'low_stock',
        'out_of_stock',
        'order_update',
        'pick_list_assigned',
        'system',
        'team',
        'alert',
        'welcome'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 8. Activity Action Type Enum
DO $$ BEGIN
    CREATE TYPE activity_action_enum AS ENUM (
        'create',
        'update',
        'delete',
        'restore',
        'adjust_quantity',
        'move',
        'archive',
        'login',
        'logout',
        'export',
        'import',
        'bulk_update',
        'assign',
        'complete'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 9. Entity Type Enum (for activity logs and alerts)
DO $$ BEGIN
    CREATE TYPE entity_type_enum AS ENUM (
        'item',
        'folder',
        'tag',
        'pick_list',
        'purchase_order',
        'vendor',
        'address',
        'profile',
        'tenant',
        'alert',
        'notification'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 10. Alert Type Enum
DO $$ BEGIN
    CREATE TYPE alert_type_enum AS ENUM (
        'low_stock',
        'out_of_stock',
        'expiring_soon',
        'reorder_point',
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 11. Custom Field Type Enum
DO $$ BEGIN
    CREATE TYPE field_type_enum AS ENUM (
        'text',
        'number',
        'date',
        'datetime',
        'boolean',
        'select',
        'multi_select',
        'url',
        'email',
        'phone',
        'currency',
        'percentage'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Validation Functions
-- These ensure data integrity without changing column types
-- ============================================

-- Validate item status
CREATE OR REPLACE FUNCTION validate_item_status(status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN status IN ('in_stock', 'low_stock', 'out_of_stock');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate user role
CREATE OR REPLACE FUNCTION validate_user_role(role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role IN ('owner', 'admin', 'editor', 'viewer', 'member');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate pick list status
CREATE OR REPLACE FUNCTION validate_pick_list_status(status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN status IN ('draft', 'in_progress', 'completed', 'cancelled');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate purchase order status
CREATE OR REPLACE FUNCTION validate_po_status(status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN status IN ('draft', 'submitted', 'confirmed', 'partial', 'received', 'cancelled');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Add CHECK constraints for validation
-- ============================================

-- Item status constraint
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS chk_item_status;
ALTER TABLE inventory_items
ADD CONSTRAINT chk_item_status
CHECK (validate_item_status(status));

-- User role constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS chk_user_role;
ALTER TABLE profiles
ADD CONSTRAINT chk_user_role
CHECK (validate_user_role(role));

-- Pick list status constraint
ALTER TABLE pick_lists
DROP CONSTRAINT IF EXISTS chk_pick_list_status;
ALTER TABLE pick_lists
ADD CONSTRAINT chk_pick_list_status
CHECK (validate_pick_list_status(status));

-- Purchase order status constraint
ALTER TABLE purchase_orders
DROP CONSTRAINT IF EXISTS chk_po_status;
ALTER TABLE purchase_orders
ADD CONSTRAINT chk_po_status
CHECK (validate_po_status(status));

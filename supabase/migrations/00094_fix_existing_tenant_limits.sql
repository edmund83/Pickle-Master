-- ============================================
-- Migration: Fix Existing Tenant Limits
-- Purpose: Ensure all existing tenants have correct plan limits
-- ============================================

-- This migration is idempotent and safe to run multiple times

-- Fix limits for each plan using the get_plan_limits function
-- Updates tenants where limits don't match expected values

-- Fix early_access tenants
UPDATE tenants t
SET
    max_users = (SELECT max_users_limit FROM get_plan_limits('early_access')),
    max_items = (SELECT max_items_limit FROM get_plan_limits('early_access')),
    max_folders = (SELECT max_folders_limit FROM get_plan_limits('early_access')),
    updated_at = NOW()
WHERE t.subscription_tier = 'early_access'
  AND (t.max_items != 1200 OR t.max_users != 3 OR t.max_folders != -1);

-- Fix starter tenants
UPDATE tenants t
SET
    max_users = (SELECT max_users_limit FROM get_plan_limits('starter')),
    max_items = (SELECT max_items_limit FROM get_plan_limits('starter')),
    max_folders = (SELECT max_folders_limit FROM get_plan_limits('starter')),
    updated_at = NOW()
WHERE t.subscription_tier = 'starter'
  AND (t.max_items != 1200 OR t.max_users != 3 OR t.max_folders != -1);

-- Fix growth tenants
UPDATE tenants t
SET
    max_users = (SELECT max_users_limit FROM get_plan_limits('growth')),
    max_items = (SELECT max_items_limit FROM get_plan_limits('growth')),
    max_folders = (SELECT max_folders_limit FROM get_plan_limits('growth')),
    updated_at = NOW()
WHERE t.subscription_tier = 'growth'
  AND (t.max_items != 3000 OR t.max_users != 5 OR t.max_folders != -1);

-- Fix scale tenants
UPDATE tenants t
SET
    max_users = (SELECT max_users_limit FROM get_plan_limits('scale')),
    max_items = (SELECT max_items_limit FROM get_plan_limits('scale')),
    max_folders = (SELECT max_folders_limit FROM get_plan_limits('scale')),
    updated_at = NOW()
WHERE t.subscription_tier = 'scale'
  AND (t.max_items != 8000 OR t.max_users != 8 OR t.max_folders != -1);

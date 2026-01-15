-- Migration: 00069_update_chatter_types.sql
-- Description: Add new entity types to chatter_entity_type enum for sales workflow

-- ============================================================================
-- ADD NEW VALUES TO CHATTER_ENTITY_TYPE ENUM
-- ============================================================================

-- Add 'customer' to the enum
ALTER TYPE chatter_entity_type ADD VALUE IF NOT EXISTS 'customer';

-- Add 'sales_order' to the enum
ALTER TYPE chatter_entity_type ADD VALUE IF NOT EXISTS 'sales_order';

-- Add 'delivery_order' to the enum
ALTER TYPE chatter_entity_type ADD VALUE IF NOT EXISTS 'delivery_order';

-- Add 'invoice' to the enum
ALTER TYPE chatter_entity_type ADD VALUE IF NOT EXISTS 'invoice';

-- ============================================================================
-- UPDATE FUNCTIONS THAT REFERENCE ENTITY TYPES (if needed)
-- ============================================================================

-- The existing functions like get_entity_messages, post_chatter_message, etc.
-- will automatically work with the new enum values since they use the
-- chatter_entity_type parameter dynamically.

-- ============================================================================
-- GRANT PERMISSIONS FOR NEW ENTITY TYPE VALUES
-- ============================================================================

-- The GRANT USAGE ON TYPE was already done in 00049_chatter_system.sql
-- and applies to all values of the enum including new ones.

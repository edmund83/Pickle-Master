-- ============================================
-- Migration: 00034_pick_list_assigned_at.sql
-- Purpose: Add assigned_at timestamp to pick_lists
-- ============================================

-- Add assigned_at column to track when a user was assigned
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pick_lists_assigned_at ON pick_lists(assigned_at);

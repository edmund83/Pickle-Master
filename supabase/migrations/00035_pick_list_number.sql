-- Add pick_list_number column to pick_lists table
-- This provides a human-readable sequential number (PL-0001, PL-0002, etc.)

ALTER TABLE pick_lists
ADD COLUMN IF NOT EXISTS pick_list_number VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pick_lists_number ON pick_lists(pick_list_number);

-- Backfill existing pick lists with generated numbers based on creation order
WITH numbered_lists AS (
    SELECT
        id,
        tenant_id,
        ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY created_at) as row_num
    FROM pick_lists
    WHERE pick_list_number IS NULL
)
UPDATE pick_lists
SET pick_list_number = 'PL-' || LPAD(numbered_lists.row_num::TEXT, 4, '0')
FROM numbered_lists
WHERE pick_lists.id = numbered_lists.id;

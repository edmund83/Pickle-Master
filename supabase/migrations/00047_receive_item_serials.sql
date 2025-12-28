-- Migration: Create receive_item_serials table for serialized inventory tracking
-- This table stores individual serial numbers for receive items with tracking_mode = 'serial'

-- Create the receive_item_serials table
CREATE TABLE IF NOT EXISTS receive_item_serials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receive_item_id UUID NOT NULL REFERENCES receive_items(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique serial numbers per receive item
    CONSTRAINT unique_serial_per_receive_item UNIQUE (receive_item_id, serial_number)
);

-- Index for faster lookups by receive_item_id
CREATE INDEX IF NOT EXISTS idx_receive_item_serials_receive_item_id
ON receive_item_serials(receive_item_id);

-- Index for serial number searches (useful for duplicate checking across all items)
CREATE INDEX IF NOT EXISTS idx_receive_item_serials_serial_number
ON receive_item_serials(serial_number);

-- Enable RLS
ALTER TABLE receive_item_serials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view serials for receive items in their tenant
CREATE POLICY "Users can view serials in their tenant" ON receive_item_serials
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM receive_items ri
            JOIN receives r ON r.id = ri.receive_id
            JOIN profiles p ON p.tenant_id = r.tenant_id
            WHERE ri.id = receive_item_serials.receive_item_id
            AND p.id = auth.uid()
        )
    );

-- RLS Policy: Users can insert serials for receive items in their tenant
CREATE POLICY "Users can insert serials in their tenant" ON receive_item_serials
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM receive_items ri
            JOIN receives r ON r.id = ri.receive_id
            JOIN profiles p ON p.tenant_id = r.tenant_id
            WHERE ri.id = receive_item_serials.receive_item_id
            AND p.id = auth.uid()
        )
    );

-- RLS Policy: Users can delete serials for receive items in their tenant (only draft receives)
CREATE POLICY "Users can delete serials in their tenant" ON receive_item_serials
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM receive_items ri
            JOIN receives r ON r.id = ri.receive_id
            JOIN profiles p ON p.tenant_id = r.tenant_id
            WHERE ri.id = receive_item_serials.receive_item_id
            AND p.id = auth.uid()
            AND r.status = 'draft'
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON receive_item_serials TO authenticated;

-- Add comment
COMMENT ON TABLE receive_item_serials IS 'Stores individual serial numbers for serialized inventory items being received. Each row represents one unit with a unique serial number.';

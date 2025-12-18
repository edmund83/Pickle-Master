-- ============================================
-- Migration: Normalize Tags (Junction Table)
-- Purpose: Eliminate data duplication, enable efficient tag queries
-- ============================================

-- 1. Create junction table for item-tag relationships
CREATE TABLE IF NOT EXISTS item_tags (
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    PRIMARY KEY (item_id, tag_id)
);

-- 2. Create indexes for efficient lookups in both directions
CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);

-- 3. Enable RLS
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for item_tags
DROP POLICY IF EXISTS "Users can view item tags" ON item_tags;
CREATE POLICY "Users can view item tags" ON item_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM inventory_items i
            WHERE i.id = item_tags.item_id
            AND i.tenant_id = get_user_tenant_id()
        )
    );

DROP POLICY IF EXISTS "Editors can insert item tags" ON item_tags;
CREATE POLICY "Editors can insert item tags" ON item_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM inventory_items i
            WHERE i.id = item_tags.item_id
            AND i.tenant_id = get_user_tenant_id()
        ) AND can_edit()
    );

DROP POLICY IF EXISTS "Editors can delete item tags" ON item_tags;
CREATE POLICY "Editors can delete item tags" ON item_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM inventory_items i
            WHERE i.id = item_tags.item_id
            AND i.tenant_id = get_user_tenant_id()
        ) AND can_edit()
    );

-- 5. Helper function to get items by tag
CREATE OR REPLACE FUNCTION get_items_by_tag(p_tag_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(500),
    sku VARCHAR(100),
    quantity INTEGER,
    status VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.sku, i.quantity, i.status
    FROM inventory_items i
    INNER JOIN item_tags it ON it.item_id = i.id
    WHERE it.tag_id = p_tag_id
    AND i.tenant_id = get_user_tenant_id()
    AND i.deleted_at IS NULL
    ORDER BY i.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Helper function to get tags for an item
CREATE OR REPLACE FUNCTION get_item_tags(p_item_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    color VARCHAR(7)
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.name, t.color
    FROM tags t
    INNER JOIN item_tags it ON it.tag_id = t.id
    WHERE it.item_id = p_item_id
    AND t.tenant_id = get_user_tenant_id()
    ORDER BY t.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Helper function to add tags to item (bulk)
CREATE OR REPLACE FUNCTION add_tags_to_item(p_item_id UUID, p_tag_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER;
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Verify item belongs to tenant
    IF NOT EXISTS (
        SELECT 1 FROM inventory_items
        WHERE id = p_item_id AND tenant_id = tenant AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Item not found or access denied';
    END IF;

    -- Insert tags (ignore duplicates)
    WITH inserted AS (
        INSERT INTO item_tags (item_id, tag_id, created_by)
        SELECT p_item_id, t.id, auth.uid()
        FROM unnest(p_tag_ids) AS tid
        INNER JOIN tags t ON t.id = tid AND t.tenant_id = tenant
        ON CONFLICT (item_id, tag_id) DO NOTHING
        RETURNING 1
    )
    SELECT COUNT(*) INTO inserted_count FROM inserted;

    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Helper function to remove tags from item (bulk)
CREATE OR REPLACE FUNCTION remove_tags_from_item(p_item_id UUID, p_tag_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Verify item belongs to tenant
    IF NOT EXISTS (
        SELECT 1 FROM inventory_items
        WHERE id = p_item_id AND tenant_id = tenant AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Item not found or access denied';
    END IF;

    DELETE FROM item_tags
    WHERE item_id = p_item_id AND tag_id = ANY(p_tag_ids);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Helper function to set item tags (replace all)
CREATE OR REPLACE FUNCTION set_item_tags(p_item_id UUID, p_tag_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Verify item belongs to tenant
    IF NOT EXISTS (
        SELECT 1 FROM inventory_items
        WHERE id = p_item_id AND tenant_id = tenant AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Item not found or access denied';
    END IF;

    -- Remove existing tags
    DELETE FROM item_tags WHERE item_id = p_item_id;

    -- Add new tags
    INSERT INTO item_tags (item_id, tag_id, created_by)
    SELECT p_item_id, t.id, auth.uid()
    FROM unnest(p_tag_ids) AS tid
    INNER JOIN tags t ON t.id = tid AND t.tenant_id = tenant;

    RETURN array_length(p_tag_ids, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. View for items with their tags (denormalized for easy querying)
CREATE OR REPLACE VIEW items_with_tags AS
SELECT
    i.*,
    COALESCE(
        array_agg(
            jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color)
        ) FILTER (WHERE t.id IS NOT NULL),
        '{}'::jsonb[]
    ) AS tag_list
FROM inventory_items i
LEFT JOIN item_tags it ON it.item_id = i.id
LEFT JOIN tags t ON t.id = it.tag_id
WHERE i.deleted_at IS NULL
GROUP BY i.id;

-- 11. Get tag usage statistics
CREATE OR REPLACE FUNCTION get_tag_stats()
RETURNS TABLE (
    tag_id UUID,
    tag_name VARCHAR(100),
    tag_color VARCHAR(7),
    item_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.name, t.color, COUNT(it.item_id)::BIGINT
    FROM tags t
    LEFT JOIN item_tags it ON it.tag_id = t.id
    LEFT JOIN inventory_items i ON i.id = it.item_id AND i.deleted_at IS NULL
    WHERE t.tenant_id = get_user_tenant_id()
    GROUP BY t.id, t.name, t.color
    ORDER BY COUNT(it.item_id) DESC, t.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

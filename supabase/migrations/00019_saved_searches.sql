-- Migration: Saved Searches
-- Description: Create saved_searches table for persisting user search preferences

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    query TEXT,
    filters JSONB DEFAULT '{}',
    sort JSONB DEFAULT '{}',

    is_shared BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique name per user
    UNIQUE (user_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_tenant ON saved_searches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_shared ON saved_searches(tenant_id, is_shared) WHERE is_shared = true;

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own searches and shared searches from their tenant
CREATE POLICY "Users can view own and shared saved searches"
    ON saved_searches FOR SELECT
    USING (
        tenant_id = get_user_tenant_id()
        AND (user_id = auth.uid() OR is_shared = true)
    );

-- Users can create their own saved searches
CREATE POLICY "Users can create own saved searches"
    ON saved_searches FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_id = auth.uid()
    );

-- Users can update their own saved searches
CREATE POLICY "Users can update own saved searches"
    ON saved_searches FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_id = auth.uid()
    );

-- Users can delete their own saved searches
CREATE POLICY "Users can delete own saved searches"
    ON saved_searches FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_id = auth.uid()
    );

-- Function to save a search
CREATE OR REPLACE FUNCTION save_search(
    p_name VARCHAR,
    p_query TEXT DEFAULT NULL,
    p_filters JSONB DEFAULT '{}',
    p_sort JSONB DEFAULT '{}',
    p_is_shared BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_search_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL OR v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Upsert the saved search (update if name exists, insert if not)
    INSERT INTO saved_searches (tenant_id, user_id, name, query, filters, sort, is_shared)
    VALUES (v_tenant_id, v_user_id, p_name, p_query, p_filters, p_sort, p_is_shared)
    ON CONFLICT (user_id, name)
    DO UPDATE SET
        query = EXCLUDED.query,
        filters = EXCLUDED.filters,
        sort = EXCLUDED.sort,
        is_shared = EXCLUDED.is_shared,
        updated_at = NOW()
    RETURNING id INTO v_search_id;

    RETURN json_build_object(
        'success', true,
        'search_id', v_search_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get saved searches for current user
CREATE OR REPLACE FUNCTION get_saved_searches()
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();
    v_user_id := auth.uid();

    IF v_tenant_id IS NULL OR v_user_id IS NULL THEN
        RETURN '[]'::json;
    END IF;

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.last_used_at DESC NULLS LAST, r.created_at DESC), '[]'::json)
        FROM (
            SELECT
                id,
                name,
                query,
                filters,
                sort,
                is_shared,
                use_count,
                last_used_at,
                user_id = v_user_id as is_owner,
                created_at
            FROM saved_searches
            WHERE tenant_id = v_tenant_id
            AND (user_id = v_user_id OR is_shared = true)
        ) r
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a saved search
CREATE OR REPLACE FUNCTION delete_saved_search(p_search_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_deleted_count INTEGER;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Only owner can delete
    DELETE FROM saved_searches
    WHERE id = p_search_id AND user_id = v_user_id;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_deleted_count = 0 THEN
        RETURN json_build_object('success', false, 'error', 'Search not found or not authorized');
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record search usage (for sorting by most used)
CREATE OR REPLACE FUNCTION use_saved_search(p_search_id UUID)
RETURNS JSON AS $$
BEGIN
    UPDATE saved_searches
    SET
        use_count = use_count + 1,
        last_used_at = NOW()
    WHERE id = p_search_id
    AND tenant_id = get_user_tenant_id();

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION save_search TO authenticated;
GRANT EXECUTE ON FUNCTION get_saved_searches TO authenticated;
GRANT EXECUTE ON FUNCTION delete_saved_search TO authenticated;
GRANT EXECUTE ON FUNCTION use_saved_search TO authenticated;

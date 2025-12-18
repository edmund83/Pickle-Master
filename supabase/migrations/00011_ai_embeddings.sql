-- ============================================
-- Migration: AI-Ready Embeddings Support
-- Purpose: Enable semantic search and AI features
-- ============================================

-- 1. Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to inventory_items
-- Using 1536 dimensions (OpenAI ada-002 compatible)
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Add embedding metadata
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- 4. Create IVFFlat index for approximate nearest neighbor search
-- lists = sqrt(num_rows) is a good starting point
-- Adjust lists parameter based on your data size
CREATE INDEX IF NOT EXISTS idx_items_embedding
ON inventory_items USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. Semantic search function
CREATE OR REPLACE FUNCTION search_items_semantic(
    query_embedding vector(1536),
    match_count INTEGER DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(500),
    sku VARCHAR(100),
    description TEXT,
    quantity INTEGER,
    status VARCHAR(50),
    similarity FLOAT
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.name,
        i.sku,
        i.description,
        i.quantity,
        i.status,
        (1 - (i.embedding <=> query_embedding))::FLOAT AS similarity
    FROM inventory_items i
    WHERE
        i.tenant_id = tenant
        AND i.deleted_at IS NULL
        AND i.embedding IS NOT NULL
        AND (1 - (i.embedding <=> query_embedding)) > similarity_threshold
    ORDER BY i.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Full-text search with proper tokenization
-- Create a generated column for full-text search
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(notes, '')), 'C')
) STORED;

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_items_search_vector
ON inventory_items USING GIN (search_vector);

-- 7. Full-text search function with ranking
CREATE OR REPLACE FUNCTION search_items_fulltext(
    search_query TEXT,
    p_limit INTEGER DEFAULT 50,
    p_folder_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(500),
    sku VARCHAR(100),
    description TEXT,
    quantity INTEGER,
    status VARCHAR(50),
    rank FLOAT
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    tsquery_val tsquery;
BEGIN
    -- Parse search query
    tsquery_val := plainto_tsquery('english', search_query);

    RETURN QUERY
    SELECT
        i.id,
        i.name,
        i.sku,
        i.description,
        i.quantity,
        i.status,
        ts_rank(i.search_vector, tsquery_val)::FLOAT AS rank
    FROM inventory_items i
    WHERE
        i.tenant_id = tenant
        AND i.deleted_at IS NULL
        AND i.search_vector @@ tsquery_val
        AND (p_folder_id IS NULL OR i.folder_id = p_folder_id)
    ORDER BY rank DESC, i.updated_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. Hybrid search (combines semantic + full-text)
CREATE OR REPLACE FUNCTION search_items_hybrid(
    search_query TEXT,
    query_embedding vector(1536) DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    semantic_weight FLOAT DEFAULT 0.7,
    fulltext_weight FLOAT DEFAULT 0.3
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(500),
    sku VARCHAR(100),
    description TEXT,
    quantity INTEGER,
    status VARCHAR(50),
    semantic_score FLOAT,
    fulltext_score FLOAT,
    combined_score FLOAT
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    tsquery_val tsquery;
BEGIN
    tsquery_val := plainto_tsquery('english', search_query);

    RETURN QUERY
    SELECT
        i.id,
        i.name,
        i.sku,
        i.description,
        i.quantity,
        i.status,
        CASE WHEN i.embedding IS NOT NULL AND query_embedding IS NOT NULL
            THEN (1 - (i.embedding <=> query_embedding))::FLOAT
            ELSE 0
        END AS semantic_score,
        ts_rank(i.search_vector, tsquery_val)::FLOAT AS fulltext_score,
        (
            CASE WHEN i.embedding IS NOT NULL AND query_embedding IS NOT NULL
                THEN (1 - (i.embedding <=> query_embedding)) * semantic_weight
                ELSE 0
            END +
            ts_rank(i.search_vector, tsquery_val) * fulltext_weight
        )::FLOAT AS combined_score
    FROM inventory_items i
    WHERE
        i.tenant_id = tenant
        AND i.deleted_at IS NULL
        AND (
            i.search_vector @@ tsquery_val
            OR (query_embedding IS NOT NULL AND i.embedding IS NOT NULL)
        )
    ORDER BY combined_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 9. Find similar items (for recommendations)
CREATE OR REPLACE FUNCTION find_similar_items(
    p_item_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(500),
    sku VARCHAR(100),
    similarity FLOAT
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    source_embedding vector(1536);
BEGIN
    -- Get source item embedding
    SELECT embedding INTO source_embedding
    FROM inventory_items
    WHERE id = p_item_id AND tenant_id = tenant AND deleted_at IS NULL;

    IF source_embedding IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        i.id,
        i.name,
        i.sku,
        (1 - (i.embedding <=> source_embedding))::FLOAT AS similarity
    FROM inventory_items i
    WHERE
        i.tenant_id = tenant
        AND i.deleted_at IS NULL
        AND i.id != p_item_id
        AND i.embedding IS NOT NULL
    ORDER BY i.embedding <=> source_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 10. Update embedding function (call from application)
CREATE OR REPLACE FUNCTION update_item_embedding(
    p_item_id UUID,
    p_embedding vector(1536)
)
RETURNS BOOLEAN AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    UPDATE inventory_items
    SET
        embedding = p_embedding,
        embedding_updated_at = NOW()
    WHERE id = p_item_id AND tenant_id = tenant;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Bulk update embeddings
CREATE OR REPLACE FUNCTION bulk_update_embeddings(
    embeddings JSONB -- Array of {item_id, embedding}
)
RETURNS INTEGER AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    updated_count INTEGER := 0;
    emb JSONB;
    item_id UUID;
    embedding_arr FLOAT[];
BEGIN
    FOR emb IN SELECT * FROM jsonb_array_elements(embeddings)
    LOOP
        item_id := (emb->>'item_id')::UUID;
        embedding_arr := ARRAY(SELECT jsonb_array_elements_text(emb->'embedding')::FLOAT);

        UPDATE inventory_items
        SET
            embedding = embedding_arr::vector(1536),
            embedding_updated_at = NOW()
        WHERE id = item_id AND tenant_id = tenant;

        IF FOUND THEN
            updated_count := updated_count + 1;
        END IF;
    END LOOP;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Get items needing embeddings (for background processing)
CREATE OR REPLACE FUNCTION get_items_needing_embeddings(
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(500),
    description TEXT,
    sku VARCHAR(100)
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.name,
        i.description,
        i.sku
    FROM inventory_items i
    WHERE
        i.tenant_id = tenant
        AND i.deleted_at IS NULL
        AND (
            i.embedding IS NULL
            OR i.embedding_updated_at < i.updated_at
        )
    ORDER BY i.updated_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

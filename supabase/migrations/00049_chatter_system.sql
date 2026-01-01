-- ============================================
-- Migration: Chatter System (Odoo-style)
-- Purpose: Add threaded messaging, @mentions, and follow notifications
-- ============================================

-- ============================================
-- 1. ENUM TYPE FOR ENTITY TYPES
-- ============================================
CREATE TYPE chatter_entity_type AS ENUM (
    'item',
    'checkout',
    'stock_count',
    'purchase_order',
    'pick_list',
    'receive'
);

-- ============================================
-- 2. CHATTER MESSAGES TABLE
-- ============================================
CREATE TABLE chatter_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Polymorphic entity reference
    entity_type chatter_entity_type NOT NULL,
    entity_id UUID NOT NULL,

    -- Message content
    author_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,

    -- Threading support (optional parent for replies)
    parent_id UUID REFERENCES chatter_messages(id) ON DELETE CASCADE,

    -- Metadata
    is_system_message BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chatter_messages
CREATE INDEX idx_chatter_messages_entity ON chatter_messages(tenant_id, entity_type, entity_id, created_at DESC);
CREATE INDEX idx_chatter_messages_author ON chatter_messages(author_id);
CREATE INDEX idx_chatter_messages_parent ON chatter_messages(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_chatter_messages_not_deleted ON chatter_messages(tenant_id, entity_type, entity_id) WHERE deleted_at IS NULL;

-- ============================================
-- 3. ENTITY FOLLOWERS TABLE
-- ============================================
CREATE TABLE entity_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    entity_type chatter_entity_type NOT NULL,
    entity_id UUID NOT NULL,

    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Follow preferences
    notify_email BOOLEAN DEFAULT TRUE,
    notify_in_app BOOLEAN DEFAULT TRUE,
    notify_push BOOLEAN DEFAULT FALSE,

    followed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one follow per user per entity
    CONSTRAINT unique_follower UNIQUE (entity_type, entity_id, user_id)
);

-- Indexes for entity_followers
CREATE INDEX idx_entity_followers_entity ON entity_followers(tenant_id, entity_type, entity_id);
CREATE INDEX idx_entity_followers_user ON entity_followers(user_id);

-- ============================================
-- 4. CHATTER MENTIONS TABLE
-- ============================================
CREATE TABLE chatter_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chatter_messages(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Whether the mention has been seen
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_mention UNIQUE (message_id, mentioned_user_id)
);

-- Indexes for chatter_mentions
CREATE INDEX idx_chatter_mentions_user ON chatter_mentions(mentioned_user_id, read_at);
CREATE INDEX idx_chatter_mentions_message ON chatter_mentions(message_id);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE chatter_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatter_mentions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES FOR CHATTER_MESSAGES
-- ============================================

-- Users can view messages in their tenant (not deleted)
CREATE POLICY "Users can view tenant messages" ON chatter_messages
    FOR SELECT USING (
        tenant_id = get_user_tenant_id()
        AND deleted_at IS NULL
    );

-- Editors+ can create messages
CREATE POLICY "Editors can create messages" ON chatter_messages
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND author_id = auth.uid()
        AND can_edit()
    );

-- Authors can update their own messages
CREATE POLICY "Authors can update own messages" ON chatter_messages
    FOR UPDATE USING (
        author_id = auth.uid()
        AND deleted_at IS NULL
    );

-- Authors can soft delete their own messages
CREATE POLICY "Authors can delete own messages" ON chatter_messages
    FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- 7. RLS POLICIES FOR ENTITY_FOLLOWERS
-- ============================================

-- Users can view followers in their tenant
CREATE POLICY "Users can view tenant followers" ON entity_followers
    FOR SELECT USING (tenant_id = get_user_tenant_id());

-- Users can follow entities in their tenant
CREATE POLICY "Users can follow entities" ON entity_followers
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_id = auth.uid()
    );

-- Users can unfollow (delete their own follows)
CREATE POLICY "Users can unfollow" ON entity_followers
    FOR DELETE USING (user_id = auth.uid());

-- Users can update their own follow preferences
CREATE POLICY "Users can update follow preferences" ON entity_followers
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- 8. RLS POLICIES FOR CHATTER_MENTIONS
-- ============================================

-- Users can view their own mentions
CREATE POLICY "Users can view own mentions" ON chatter_mentions
    FOR SELECT USING (mentioned_user_id = auth.uid());

-- Messages create mentions (via the message author)
CREATE POLICY "Message authors can create mentions" ON chatter_mentions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chatter_messages m
            WHERE m.id = message_id
            AND m.author_id = auth.uid()
            AND m.tenant_id = get_user_tenant_id()
        )
    );

-- Users can mark their own mentions as read
CREATE POLICY "Users can update own mentions" ON chatter_mentions
    FOR UPDATE USING (mentioned_user_id = auth.uid());

-- ============================================
-- 9. DATABASE FUNCTIONS
-- ============================================

-- Function to get messages for an entity with author info and reply counts
CREATE OR REPLACE FUNCTION get_entity_messages(
    p_entity_type chatter_entity_type,
    p_entity_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    author_id UUID,
    author_name TEXT,
    author_email TEXT,
    author_avatar TEXT,
    parent_id UUID,
    is_system_message BOOLEAN,
    created_at TIMESTAMPTZ,
    edited_at TIMESTAMPTZ,
    reply_count BIGINT,
    mentions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.content,
        m.author_id,
        COALESCE(p.full_name, p.email)::TEXT as author_name,
        p.email::TEXT as author_email,
        p.avatar_url::TEXT as author_avatar,
        m.parent_id,
        m.is_system_message,
        m.created_at,
        m.edited_at,
        (
            SELECT COUNT(*)
            FROM chatter_messages r
            WHERE r.parent_id = m.id
            AND r.deleted_at IS NULL
        ) as reply_count,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'user_id', men.mentioned_user_id,
                        'user_name', COALESCE(mp.full_name, mp.email)
                    )
                )
                FROM chatter_mentions men
                JOIN profiles mp ON mp.id = men.mentioned_user_id
                WHERE men.message_id = m.id
            ),
            '[]'::jsonb
        ) as mentions
    FROM chatter_messages m
    JOIN profiles p ON p.id = m.author_id
    WHERE m.tenant_id = get_user_tenant_id()
        AND m.entity_type = p_entity_type
        AND m.entity_id = p_entity_id
        AND m.parent_id IS NULL  -- Top-level messages only
        AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get replies for a message
CREATE OR REPLACE FUNCTION get_message_replies(
    p_message_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    author_id UUID,
    author_name TEXT,
    author_email TEXT,
    author_avatar TEXT,
    parent_id UUID,
    is_system_message BOOLEAN,
    created_at TIMESTAMPTZ,
    edited_at TIMESTAMPTZ,
    mentions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.content,
        m.author_id,
        COALESCE(p.full_name, p.email)::TEXT as author_name,
        p.email::TEXT as author_email,
        p.avatar_url::TEXT as author_avatar,
        m.parent_id,
        m.is_system_message,
        m.created_at,
        m.edited_at,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'user_id', men.mentioned_user_id,
                        'user_name', COALESCE(mp.full_name, mp.email)
                    )
                )
                FROM chatter_mentions men
                JOIN profiles mp ON mp.id = men.mentioned_user_id
                WHERE men.message_id = m.id
            ),
            '[]'::jsonb
        ) as mentions
    FROM chatter_messages m
    JOIN profiles p ON p.id = m.author_id
    WHERE m.parent_id = p_message_id
        AND m.deleted_at IS NULL
        AND m.tenant_id = get_user_tenant_id()
    ORDER BY m.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to post a message and handle mentions
CREATE OR REPLACE FUNCTION post_chatter_message(
    p_entity_type chatter_entity_type,
    p_entity_id UUID,
    p_content TEXT,
    p_parent_id UUID DEFAULT NULL,
    p_mentioned_user_ids UUID[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID := get_user_tenant_id();
    v_message_id UUID;
    v_author_id UUID := auth.uid();
BEGIN
    -- Validate that author can edit (permission check)
    IF NOT can_edit() THEN
        RAISE EXCEPTION 'Permission denied: User cannot post messages';
    END IF;

    -- Insert message
    INSERT INTO chatter_messages (
        tenant_id, entity_type, entity_id, author_id, content, parent_id
    ) VALUES (
        v_tenant_id, p_entity_type, p_entity_id, v_author_id, p_content, p_parent_id
    ) RETURNING id INTO v_message_id;

    -- Insert mentions if any
    IF array_length(p_mentioned_user_ids, 1) > 0 THEN
        INSERT INTO chatter_mentions (message_id, mentioned_user_id)
        SELECT v_message_id, unnest(p_mentioned_user_ids)
        ON CONFLICT (message_id, mentioned_user_id) DO NOTHING;
    END IF;

    -- Auto-follow author if not already following
    INSERT INTO entity_followers (tenant_id, entity_type, entity_id, user_id)
    VALUES (v_tenant_id, p_entity_type, p_entity_id, v_author_id)
    ON CONFLICT (entity_type, entity_id, user_id) DO NOTHING;

    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get entity followers with user details
CREATE OR REPLACE FUNCTION get_entity_followers(
    p_entity_type chatter_entity_type,
    p_entity_id UUID
)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    user_avatar TEXT,
    notify_email BOOLEAN,
    notify_in_app BOOLEAN,
    notify_push BOOLEAN,
    followed_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.user_id,
        COALESCE(p.full_name, p.email)::TEXT as user_name,
        p.email::TEXT as user_email,
        p.avatar_url::TEXT as user_avatar,
        f.notify_email,
        f.notify_in_app,
        f.notify_push,
        f.followed_at
    FROM entity_followers f
    JOIN profiles p ON p.id = f.user_id
    WHERE f.tenant_id = get_user_tenant_id()
        AND f.entity_type = p_entity_type
        AND f.entity_id = p_entity_id
    ORDER BY f.followed_at;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if current user follows an entity
CREATE OR REPLACE FUNCTION is_following_entity(
    p_entity_type chatter_entity_type,
    p_entity_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM entity_followers
        WHERE entity_type = p_entity_type
        AND entity_id = p_entity_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get unread mention count for current user
CREATE OR REPLACE FUNCTION get_unread_mentions_count()
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM chatter_mentions men
        JOIN chatter_messages m ON m.id = men.message_id
        WHERE men.mentioned_user_id = auth.uid()
        AND men.read_at IS NULL
        AND m.deleted_at IS NULL
        AND m.tenant_id = get_user_tenant_id()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to mark mentions as read
CREATE OR REPLACE FUNCTION mark_mentions_read(
    p_message_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE chatter_mentions
    SET read_at = NOW()
    WHERE message_id = ANY(p_message_ids)
    AND mentioned_user_id = auth.uid()
    AND read_at IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team members for @mention autocomplete
CREATE OR REPLACE FUNCTION get_team_members_for_mention(
    p_search_query TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    user_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as user_id,
        COALESCE(p.full_name, p.email)::TEXT as user_name,
        p.email::TEXT as user_email,
        p.avatar_url::TEXT as user_avatar
    FROM profiles p
    WHERE p.tenant_id = get_user_tenant_id()
    AND (
        p_search_query IS NULL
        OR p_search_query = ''
        OR p.full_name ILIKE '%' || p_search_query || '%'
        OR p.email ILIKE '%' || p_search_query || '%'
    )
    ORDER BY
        CASE WHEN p.id = auth.uid() THEN 0 ELSE 1 END,  -- Current user first
        p.full_name NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 10. EXTEND NOTIFICATIONS TABLE
-- ============================================

-- Add notification_subtype column if it doesn't exist
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS notification_subtype VARCHAR(50);

-- Add index for faster chatter notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_type_subtype
    ON notifications(notification_type, notification_subtype)
    WHERE notification_type = 'chatter';

-- ============================================
-- 11. TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_chatter_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chatter_message_updated
    BEFORE UPDATE ON chatter_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chatter_message_timestamp();

-- ============================================
-- 12. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON TYPE chatter_entity_type TO authenticated;
GRANT ALL ON chatter_messages TO authenticated;
GRANT ALL ON entity_followers TO authenticated;
GRANT ALL ON chatter_mentions TO authenticated;

GRANT EXECUTE ON FUNCTION get_entity_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_message_replies TO authenticated;
GRANT EXECUTE ON FUNCTION post_chatter_message TO authenticated;
GRANT EXECUTE ON FUNCTION get_entity_followers TO authenticated;
GRANT EXECUTE ON FUNCTION is_following_entity TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_mentions_count TO authenticated;
GRANT EXECUTE ON FUNCTION mark_mentions_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_members_for_mention TO authenticated;

-- ============================================
-- Migration: Check-In/Check-Out Asset Tracking
-- Purpose: Track item assignments to people, jobs, or locations
-- ============================================

-- ===================
-- ENUM TYPES
-- ===================

-- Assignee types for check-outs
CREATE TYPE checkout_assignee_type AS ENUM ('person', 'job', 'location');

-- Checkout status
CREATE TYPE checkout_status AS ENUM ('checked_out', 'returned', 'overdue');

-- Item condition on return
CREATE TYPE item_condition AS ENUM ('good', 'damaged', 'needs_repair', 'lost');

-- ===================
-- JOBS TABLE (Projects/Work Orders)
-- ===================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled

    start_date DATE,
    end_date DATE,

    location VARCHAR(255),
    notes TEXT,

    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_job_name_per_tenant UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_dates ON jobs(start_date, end_date);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- CHECKOUTS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS checkouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Item being checked out
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,

    -- Assignee information (polymorphic reference)
    assignee_type checkout_assignee_type NOT NULL,
    assignee_id UUID, -- References profiles.id (person), jobs.id (job), or folders.id (location)
    assignee_name VARCHAR(255), -- Denormalized for quick display

    -- Checkout details
    checked_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_out_by UUID REFERENCES profiles(id),
    due_date DATE,

    -- Return details
    status checkout_status DEFAULT 'checked_out',
    returned_at TIMESTAMPTZ,
    returned_by UUID REFERENCES profiles(id),
    return_condition item_condition,
    return_notes TEXT,

    -- General
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_checkouts_tenant ON checkouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_item ON checkouts(item_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkouts_assignee ON checkouts(assignee_type, assignee_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_due_date ON checkouts(due_date) WHERE status = 'checked_out';
CREATE INDEX IF NOT EXISTS idx_checkouts_checked_out_by ON checkouts(checked_out_by);
CREATE INDEX IF NOT EXISTS idx_checkouts_active ON checkouts(tenant_id, status) WHERE status != 'returned';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_checkouts_updated_at ON checkouts;
CREATE TRIGGER trigger_checkouts_updated_at
    BEFORE UPDATE ON checkouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- RLS POLICIES
-- ===================

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;

-- JOBS POLICIES
DROP POLICY IF EXISTS "Users can view tenant jobs" ON jobs;
CREATE POLICY "Users can view tenant jobs" ON jobs
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert jobs" ON jobs;
CREATE POLICY "Editors can insert jobs" ON jobs
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update jobs" ON jobs;
CREATE POLICY "Editors can update jobs" ON jobs
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete jobs" ON jobs;
CREATE POLICY "Admins can delete jobs" ON jobs
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- CHECKOUTS POLICIES
DROP POLICY IF EXISTS "Users can view tenant checkouts" ON checkouts;
CREATE POLICY "Users can view tenant checkouts" ON checkouts
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert checkouts" ON checkouts;
CREATE POLICY "Editors can insert checkouts" ON checkouts
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update checkouts" ON checkouts;
CREATE POLICY "Editors can update checkouts" ON checkouts
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete checkouts" ON checkouts;
CREATE POLICY "Admins can delete checkouts" ON checkouts
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Function to update overdue status
CREATE OR REPLACE FUNCTION update_overdue_checkouts()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE checkouts
    SET status = 'overdue', updated_at = NOW()
    WHERE status = 'checked_out'
    AND due_date < CURRENT_DATE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Perform checkout operation
CREATE OR REPLACE FUNCTION perform_checkout(
    p_item_id UUID,
    p_quantity INTEGER DEFAULT 1,
    p_assignee_type checkout_assignee_type DEFAULT 'person',
    p_assignee_id UUID DEFAULT NULL,
    p_assignee_name VARCHAR DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_checkout_id UUID;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
BEGIN
    -- Get tenant and user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Get item name
    SELECT name INTO v_item_name
    FROM inventory_items WHERE id = p_item_id AND tenant_id = v_tenant_id;

    IF v_item_name IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Create checkout record
    INSERT INTO checkouts (
        tenant_id, item_id, quantity, assignee_type, assignee_id,
        assignee_name, due_date, notes, checked_out_by
    ) VALUES (
        v_tenant_id, p_item_id, p_quantity, p_assignee_type, p_assignee_id,
        p_assignee_name, p_due_date, p_notes, auth.uid()
    ) RETURNING id INTO v_checkout_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
        'check_out',
        jsonb_build_object(
            'checkout_id', v_checkout_id,
            'assignee_type', p_assignee_type,
            'assignee_name', p_assignee_name,
            'quantity', p_quantity,
            'due_date', p_due_date
        )
    );

    RETURN json_build_object(
        'success', true,
        'checkout_id', v_checkout_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Perform check-in operation
CREATE OR REPLACE FUNCTION perform_checkin(
    p_checkout_id UUID,
    p_condition item_condition DEFAULT 'good',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_item_id UUID;
    v_item_name VARCHAR;
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_assignee_name VARCHAR;
BEGIN
    -- Get checkout details
    SELECT c.item_id, c.assignee_name, c.tenant_id, i.name
    INTO v_item_id, v_assignee_name, v_tenant_id, v_item_name
    FROM checkouts c
    JOIN inventory_items i ON i.id = c.item_id
    WHERE c.id = p_checkout_id AND c.tenant_id = get_user_tenant_id();

    IF v_item_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Checkout not found');
    END IF;

    -- Get user name
    SELECT full_name INTO v_user_name FROM profiles WHERE id = auth.uid();

    -- Update checkout record
    UPDATE checkouts
    SET
        status = 'returned',
        returned_at = NOW(),
        returned_by = auth.uid(),
        return_condition = p_condition,
        return_notes = p_notes
    WHERE id = p_checkout_id
    AND tenant_id = get_user_tenant_id();

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
        action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), v_user_name, 'item', v_item_id, v_item_name,
        'check_in',
        jsonb_build_object(
            'checkout_id', p_checkout_id,
            'condition', p_condition,
            'returned_from', v_assignee_name,
            'notes', p_notes
        )
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active checkout for an item
CREATE OR REPLACE FUNCTION get_active_checkout(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(c) INTO result
    FROM (
        SELECT
            ch.id,
            ch.quantity,
            ch.assignee_type,
            ch.assignee_id,
            ch.assignee_name,
            ch.checked_out_at,
            ch.due_date,
            ch.status,
            ch.notes,
            p.full_name as checked_out_by_name,
            CASE
                WHEN ch.due_date IS NOT NULL AND ch.due_date < CURRENT_DATE
                THEN true ELSE false
            END as is_overdue,
            CASE
                WHEN ch.due_date IS NOT NULL
                THEN ch.due_date - CURRENT_DATE
                ELSE NULL
            END as days_until_due
        FROM checkouts ch
        LEFT JOIN profiles p ON p.id = ch.checked_out_by
        WHERE ch.item_id = p_item_id
        AND ch.tenant_id = get_user_tenant_id()
        AND ch.status != 'returned'
        ORDER BY ch.checked_out_at DESC
        LIMIT 1
    ) c;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get checkout history for an item
CREATE OR REPLACE FUNCTION get_item_checkout_history(
    p_item_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
        FROM (
            SELECT
                ch.id,
                ch.quantity,
                ch.assignee_type,
                ch.assignee_name,
                ch.checked_out_at,
                ch.due_date,
                ch.status,
                ch.returned_at,
                ch.return_condition,
                ch.return_notes,
                co.full_name as checked_out_by_name,
                ri.full_name as returned_by_name
            FROM checkouts ch
            LEFT JOIN profiles co ON co.id = ch.checked_out_by
            LEFT JOIN profiles ri ON ri.id = ch.returned_by
            WHERE ch.item_id = p_item_id
            AND ch.tenant_id = get_user_tenant_id()
            ORDER BY ch.checked_out_at DESC
            LIMIT p_limit
        ) c
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get all checkouts with filtering
CREATE OR REPLACE FUNCTION get_checkouts(
    p_status TEXT DEFAULT NULL,
    p_assignee_type TEXT DEFAULT NULL,
    p_overdue_only BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    total_count BIGINT;
    checkouts_data JSON;
BEGIN
    -- First update overdue statuses
    PERFORM update_overdue_checkouts();

    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM checkouts c
    WHERE c.tenant_id = tenant
    AND (p_status IS NULL OR c.status::TEXT = p_status)
    AND (p_assignee_type IS NULL OR c.assignee_type::TEXT = p_assignee_type)
    AND (NOT p_overdue_only OR (c.due_date IS NOT NULL AND c.due_date < CURRENT_DATE AND c.status != 'returned'));

    -- Get checkouts
    SELECT COALESCE(json_agg(row_to_json(co)), '[]'::json) INTO checkouts_data
    FROM (
        SELECT
            c.id,
            c.item_id,
            i.name as item_name,
            i.sku as item_sku,
            i.image_urls[1] as item_image,
            c.quantity,
            c.assignee_type,
            c.assignee_id,
            c.assignee_name,
            c.checked_out_at,
            c.due_date,
            c.status,
            c.returned_at,
            c.return_condition,
            p.full_name as checked_out_by_name,
            CASE
                WHEN c.due_date IS NOT NULL AND c.due_date < CURRENT_DATE AND c.status != 'returned'
                THEN CURRENT_DATE - c.due_date
                ELSE 0
            END as days_overdue
        FROM checkouts c
        JOIN inventory_items i ON i.id = c.item_id
        LEFT JOIN profiles p ON p.id = c.checked_out_by
        WHERE c.tenant_id = tenant
        AND (p_status IS NULL OR c.status::TEXT = p_status)
        AND (p_assignee_type IS NULL OR c.assignee_type::TEXT = p_assignee_type)
        AND (NOT p_overdue_only OR (c.due_date IS NOT NULL AND c.due_date < CURRENT_DATE AND c.status != 'returned'))
        ORDER BY
            CASE WHEN c.status = 'overdue' THEN 0 ELSE 1 END,
            c.due_date ASC NULLS LAST,
            c.checked_out_at DESC
        LIMIT p_limit
        OFFSET p_offset
    ) co;

    RETURN json_build_object(
        'checkouts', checkouts_data,
        'total', total_count,
        'limit', p_limit,
        'offset', p_offset,
        'has_more', (p_offset + p_limit) < total_count
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get my checked out items (for current user)
CREATE OR REPLACE FUNCTION get_my_checkouts()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
        FROM (
            SELECT
                ch.id as checkout_id,
                ch.item_id,
                i.name as item_name,
                i.sku as item_sku,
                i.image_urls[1] as item_image,
                ch.quantity,
                ch.checked_out_at,
                ch.due_date,
                ch.status,
                CASE
                    WHEN ch.due_date IS NOT NULL AND ch.due_date < CURRENT_DATE
                    THEN true ELSE false
                END as is_overdue,
                CASE
                    WHEN ch.due_date IS NOT NULL AND ch.due_date < CURRENT_DATE
                    THEN CURRENT_DATE - ch.due_date
                    ELSE 0
                END as days_overdue
            FROM checkouts ch
            JOIN inventory_items i ON i.id = ch.item_id
            WHERE ch.tenant_id = get_user_tenant_id()
            AND ch.assignee_type = 'person'
            AND ch.assignee_id = auth.uid()
            AND ch.status != 'returned'
            ORDER BY ch.due_date ASC NULLS LAST, ch.checked_out_at DESC
        ) c
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get overdue checkouts summary for dashboard
CREATE OR REPLACE FUNCTION get_overdue_summary()
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Update overdue statuses first
    PERFORM update_overdue_checkouts();

    RETURN json_build_object(
        'count', (
            SELECT COUNT(*)
            FROM checkouts
            WHERE tenant_id = tenant
            AND status != 'returned'
            AND due_date IS NOT NULL
            AND due_date < CURRENT_DATE
        ),
        'items', (
            SELECT COALESCE(json_agg(row_to_json(o)), '[]'::json)
            FROM (
                SELECT
                    c.id,
                    i.name as item_name,
                    c.assignee_name,
                    c.due_date,
                    CURRENT_DATE - c.due_date as days_overdue
                FROM checkouts c
                JOIN inventory_items i ON i.id = c.item_id
                WHERE c.tenant_id = tenant
                AND c.status != 'returned'
                AND c.due_date IS NOT NULL
                AND c.due_date < CURRENT_DATE
                ORDER BY c.due_date ASC
                LIMIT 5
            ) o
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get jobs list
CREATE OR REPLACE FUNCTION get_jobs(
    p_status TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(j)), '[]'::json)
        FROM (
            SELECT
                j.id,
                j.name,
                j.description,
                j.status,
                j.start_date,
                j.end_date,
                j.location,
                (
                    SELECT COUNT(*)
                    FROM checkouts c
                    WHERE c.assignee_type = 'job'
                    AND c.assignee_id = j.id
                    AND c.status != 'returned'
                ) as active_checkouts
            FROM jobs j
            WHERE j.tenant_id = get_user_tenant_id()
            AND (p_status IS NULL OR j.status = p_status)
            ORDER BY j.created_at DESC
            LIMIT p_limit
        ) j
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a job
CREATE OR REPLACE FUNCTION create_job(
    p_name VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_location VARCHAR DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_job_id UUID;
    v_tenant_id UUID;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    INSERT INTO jobs (tenant_id, name, description, start_date, end_date, location, created_by)
    VALUES (v_tenant_id, p_name, p_description, p_start_date, p_end_date, p_location, auth.uid())
    RETURNING id INTO v_job_id;

    RETURN json_build_object(
        'success', true,
        'job_id', v_job_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration: 00059_approval_and_notifications.sql
-- Purpose: Add manager approval workflow and notification system

-- ===========================================
-- 1. UPDATE PO STATUS CONSTRAINT for pending_approval
-- ===========================================

-- Drop existing constraint
ALTER TABLE purchase_orders
DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

-- Add new constraint with pending_approval status
ALTER TABLE purchase_orders
ADD CONSTRAINT purchase_orders_status_check
CHECK (status IN ('draft', 'submitted', 'pending_approval', 'confirmed', 'receiving', 'received', 'cancelled'));

-- ===========================================
-- 2. ADD APPROVAL FIELDS TO STOCK COUNTS
-- ===========================================

-- Add approval tracking fields to stock_counts
ALTER TABLE stock_counts
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Update stock_count_status to include pending_approval
-- First drop dependent objects
DROP FUNCTION IF EXISTS submit_stock_count_for_review CASCADE;

-- Recreate the enum with pending_approval
ALTER TYPE stock_count_status ADD VALUE IF NOT EXISTS 'pending_approval' AFTER 'review';

-- ===========================================
-- 3. CREATE NOTIFICATIONS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Recipient
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Notification details
    type VARCHAR(50) NOT NULL, -- 'po_submitted', 'po_approved', 'receive_completed', 'pick_list_assigned', 'stock_count_assigned'
    title VARCHAR(255) NOT NULL,
    message TEXT,

    -- Related entity
    entity_type VARCHAR(50), -- 'purchase_order', 'receive', 'pick_list', 'stock_count'
    entity_id UUID,
    entity_display_id VARCHAR(50),

    -- Action URL (optional)
    action_url VARCHAR(500),

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Delivery tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Actor who triggered the notification
    triggered_by UUID REFERENCES profiles(id)
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===========================================
-- 4. NOTIFICATION PREFERENCES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Email preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    email_po_submitted BOOLEAN DEFAULT TRUE,
    email_po_approved BOOLEAN DEFAULT TRUE,
    email_receive_completed BOOLEAN DEFAULT TRUE,
    email_pick_list_assigned BOOLEAN DEFAULT TRUE,
    email_stock_count_assigned BOOLEAN DEFAULT TRUE,
    email_low_stock_alert BOOLEAN DEFAULT TRUE,

    -- Push notification preferences (for future mobile app)
    push_enabled BOOLEAN DEFAULT TRUE,
    push_po_submitted BOOLEAN DEFAULT TRUE,
    push_po_approved BOOLEAN DEFAULT TRUE,
    push_receive_completed BOOLEAN DEFAULT TRUE,
    push_pick_list_assigned BOOLEAN DEFAULT TRUE,
    push_stock_count_assigned BOOLEAN DEFAULT TRUE,
    push_low_stock_alert BOOLEAN DEFAULT TRUE,

    -- In-app notification preferences
    inapp_enabled BOOLEAN DEFAULT TRUE,

    -- Digest preferences
    digest_frequency VARCHAR(20) DEFAULT 'instant', -- 'instant', 'hourly', 'daily', 'weekly'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_notification_prefs UNIQUE (user_id)
);

-- RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their preferences" ON notification_preferences;
CREATE POLICY "Users can view their preferences" ON notification_preferences
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their preferences" ON notification_preferences;
CREATE POLICY "Users can update their preferences" ON notification_preferences
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their preferences" ON notification_preferences;
CREATE POLICY "Users can insert their preferences" ON notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ===========================================
-- 5. CREATE NOTIFICATION HELPER FUNCTIONS
-- ===========================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    p_tenant_id UUID,
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_entity_display_id VARCHAR(50) DEFAULT NULL,
    p_action_url VARCHAR(500) DEFAULT NULL,
    p_triggered_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        tenant_id, user_id, type, title, message,
        entity_type, entity_id, entity_display_id, action_url, triggered_by
    ) VALUES (
        p_tenant_id, p_user_id, p_type, p_title, p_message,
        p_entity_type, p_entity_id, p_entity_display_id, p_action_url, p_triggered_by
    ) RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify admins of pending approvals
CREATE OR REPLACE FUNCTION notify_admins_pending_approval(
    p_tenant_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_display_id VARCHAR(50),
    p_submitter_name VARCHAR(255),
    p_triggered_by UUID
)
RETURNS VOID AS $$
DECLARE
    admin_record RECORD;
    v_title VARCHAR(255);
    v_message TEXT;
    v_action_url VARCHAR(500);
BEGIN
    -- Build notification content
    v_title := p_entity_display_id || ' submitted for approval';
    v_message := p_submitter_name || ' has submitted ' || p_entity_display_id || ' for your approval.';
    v_action_url := '/tasks/' ||
        CASE p_entity_type
            WHEN 'purchase_order' THEN 'purchase-orders'
            WHEN 'stock_count' THEN 'stock-count'
            ELSE p_entity_type || 's'
        END || '/' || p_entity_id;

    -- Get all admins and owners for this tenant
    FOR admin_record IN
        SELECT id FROM profiles
        WHERE tenant_id = p_tenant_id
        AND role IN ('owner', 'admin')
        AND id != p_triggered_by -- Don't notify the submitter
    LOOP
        PERFORM create_notification(
            p_tenant_id,
            admin_record.id,
            p_entity_type || '_submitted',
            v_title,
            v_message,
            p_entity_type,
            p_entity_id,
            p_entity_display_id,
            v_action_url,
            p_triggered_by
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify user of approval
CREATE OR REPLACE FUNCTION notify_approval(
    p_tenant_id UUID,
    p_user_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_display_id VARCHAR(50),
    p_approver_name VARCHAR(255),
    p_approved BOOLEAN,
    p_triggered_by UUID
)
RETURNS VOID AS $$
DECLARE
    v_title VARCHAR(255);
    v_message TEXT;
    v_action_url VARCHAR(500);
    v_type VARCHAR(50);
BEGIN
    IF p_approved THEN
        v_title := p_entity_display_id || ' has been approved';
        v_message := p_approver_name || ' has approved ' || p_entity_display_id || '.';
        v_type := p_entity_type || '_approved';
    ELSE
        v_title := p_entity_display_id || ' needs revision';
        v_message := p_approver_name || ' has sent ' || p_entity_display_id || ' back for revision.';
        v_type := p_entity_type || '_rejected';
    END IF;

    v_action_url := '/tasks/' ||
        CASE p_entity_type
            WHEN 'purchase_order' THEN 'purchase-orders'
            WHEN 'stock_count' THEN 'stock-count'
            ELSE p_entity_type || 's'
        END || '/' || p_entity_id;

    PERFORM create_notification(
        p_tenant_id,
        p_user_id,
        v_type,
        v_title,
        v_message,
        p_entity_type,
        p_entity_id,
        p_entity_display_id,
        v_action_url,
        p_triggered_by
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify user of assignment
CREATE OR REPLACE FUNCTION notify_assignment(
    p_tenant_id UUID,
    p_user_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_display_id VARCHAR(50),
    p_assigner_name VARCHAR(255),
    p_triggered_by UUID
)
RETURNS VOID AS $$
DECLARE
    v_title VARCHAR(255);
    v_message TEXT;
    v_action_url VARCHAR(500);
BEGIN
    v_title := 'You have been assigned to ' || p_entity_display_id;
    v_message := p_assigner_name || ' has assigned you to ' || p_entity_display_id || '.';

    v_action_url := '/tasks/' ||
        CASE p_entity_type
            WHEN 'purchase_order' THEN 'purchase-orders'
            WHEN 'pick_list' THEN 'pick-lists'
            WHEN 'stock_count' THEN 'stock-count'
            ELSE p_entity_type || 's'
        END || '/' || p_entity_id;

    PERFORM create_notification(
        p_tenant_id,
        p_user_id,
        p_entity_type || '_assigned',
        v_title,
        v_message,
        p_entity_type,
        p_entity_id,
        p_entity_display_id,
        v_action_url,
        p_triggered_by
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify of receive completion
CREATE OR REPLACE FUNCTION notify_receive_completed(
    p_tenant_id UUID,
    p_receive_id UUID,
    p_receive_display_id VARCHAR(50),
    p_completer_name VARCHAR(255),
    p_triggered_by UUID
)
RETURNS VOID AS $$
DECLARE
    admin_record RECORD;
    v_title VARCHAR(255);
    v_message TEXT;
    v_action_url VARCHAR(500);
BEGIN
    v_title := p_receive_display_id || ' has been completed';
    v_message := p_completer_name || ' has completed receiving ' || p_receive_display_id || '.';
    v_action_url := '/tasks/receives/' || p_receive_id;

    -- Notify admins and owners
    FOR admin_record IN
        SELECT id FROM profiles
        WHERE tenant_id = p_tenant_id
        AND role IN ('owner', 'admin')
        AND id != p_triggered_by
    LOOP
        PERFORM create_notification(
            p_tenant_id,
            admin_record.id,
            'receive_completed',
            v_title,
            v_message,
            'receive',
            p_receive_id,
            p_receive_display_id,
            v_action_url,
            p_triggered_by
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 6. UPDATE PO STATUS TRANSITION TRIGGER
-- ===========================================

-- Drop and recreate the PO status transition trigger to include pending_approval
CREATE OR REPLACE FUNCTION validate_po_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions text[];
BEGIN
    -- If status isn't changing, allow
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Define valid transitions (now includes pending_approval)
    CASE OLD.status
        WHEN 'draft' THEN valid_transitions := ARRAY['submitted', 'pending_approval', 'cancelled'];
        WHEN 'submitted' THEN valid_transitions := ARRAY['pending_approval', 'confirmed', 'cancelled', 'draft'];
        WHEN 'pending_approval' THEN valid_transitions := ARRAY['confirmed', 'draft', 'cancelled'];
        WHEN 'confirmed' THEN valid_transitions := ARRAY['receiving', 'cancelled'];
        WHEN 'receiving' THEN valid_transitions := ARRAY['received', 'cancelled'];
        WHEN 'received' THEN valid_transitions := ARRAY[]::text[]; -- Terminal state
        WHEN 'cancelled' THEN valid_transitions := ARRAY['draft'];
        ELSE valid_transitions := ARRAY[]::text[];
    END CASE;

    IF NOT NEW.status = ANY(valid_transitions) THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 7. FUNCTION TO GET UNREAD NOTIFICATION COUNT
-- ===========================================

CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = auth.uid()
        AND read = FALSE
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===========================================
-- 8. FUNCTION TO MARK NOTIFICATIONS AS READ
-- ===========================================

CREATE OR REPLACE FUNCTION mark_notifications_read(p_notification_ids UUID[])
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET read = TRUE, read_at = NOW()
    WHERE id = ANY(p_notification_ids)
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 9. FUNCTION TO GET USER NOTIFICATIONS
-- ===========================================

CREATE OR REPLACE FUNCTION get_user_notifications(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_unread_only BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'notifications', COALESCE((
            SELECT json_agg(row_to_json(n) ORDER BY n.created_at DESC)
            FROM (
                SELECT
                    id, type, title, message,
                    entity_type, entity_id, entity_display_id,
                    action_url, read, created_at
                FROM notifications
                WHERE user_id = auth.uid()
                AND (NOT p_unread_only OR read = FALSE)
                ORDER BY created_at DESC
                LIMIT p_limit OFFSET p_offset
            ) n
        ), '[]'::json),
        'unread_count', (
            SELECT COUNT(*)::INTEGER
            FROM notifications
            WHERE user_id = auth.uid()
            AND read = FALSE
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===========================================
-- 10. RECREATE submit_stock_count_for_review
-- ===========================================

CREATE OR REPLACE FUNCTION submit_stock_count_for_review(p_stock_count_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_display_id VARCHAR(50);
    v_user_name VARCHAR(255);
BEGIN
    -- Get current user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    UPDATE stock_counts
    SET
        status = 'review',
        submitted_by = auth.uid(),
        submitted_at = NOW()
    WHERE id = p_stock_count_id
    AND tenant_id = get_user_tenant_id()
    AND status = 'in_progress'
    RETURNING display_id INTO v_display_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Stock count not found or not in progress');
    END IF;

    -- Notify admins
    PERFORM notify_admins_pending_approval(
        v_tenant_id,
        'stock_count',
        p_stock_count_id,
        v_display_id,
        v_user_name,
        auth.uid()
    );

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 11. COMMENTS
-- ===========================================

COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE notification_preferences IS 'User notification preferences for email, push, and in-app notifications';
COMMENT ON FUNCTION create_notification IS 'Create a new notification for a user';
COMMENT ON FUNCTION notify_admins_pending_approval IS 'Notify all admins/owners about a pending approval';
COMMENT ON FUNCTION notify_approval IS 'Notify a user about approval/rejection of their submission';
COMMENT ON FUNCTION notify_assignment IS 'Notify a user about being assigned to a task';
COMMENT ON FUNCTION notify_receive_completed IS 'Notify admins about a completed receive';

-- ============================================
-- Migration: Update Reminder Function
-- Purpose: Add unified update function for both item and folder reminders
-- ============================================

-- ============================================
-- 1. Update Reminder Function (supports both types)
-- ============================================

CREATE OR REPLACE FUNCTION update_reminder(
    p_reminder_id UUID,
    p_source_type TEXT, -- 'item' or 'folder'
    p_title VARCHAR DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_threshold INTEGER DEFAULT NULL,
    p_comparison_operator TEXT DEFAULT NULL,
    p_days_before_expiry INTEGER DEFAULT NULL,
    p_scheduled_at TIMESTAMPTZ DEFAULT NULL,
    p_recurrence TEXT DEFAULT NULL,
    p_recurrence_end_date DATE DEFAULT NULL,
    p_notify_in_app BOOLEAN DEFAULT NULL,
    p_notify_email BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_reminder RECORD;
    v_tenant_id UUID;
    v_user_role TEXT;
    v_next_trigger TIMESTAMPTZ;
BEGIN
    -- Get user's tenant_id and role
    SELECT tenant_id, role INTO v_tenant_id, v_user_role
    FROM profiles WHERE id = auth.uid();

    -- Check permission
    IF v_user_role NOT IN ('owner', 'admin', 'editor') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Editor role or higher required.');
    END IF;

    IF p_source_type = 'item' THEN
        -- Get existing item reminder
        SELECT * INTO v_reminder FROM item_reminders
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id;

        IF v_reminder IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Reminder not found');
        END IF;

        -- Calculate next_trigger_at for scheduled reminders
        IF v_reminder.reminder_type = 'restock' AND p_scheduled_at IS NOT NULL THEN
            v_next_trigger := p_scheduled_at;
        ELSIF v_reminder.reminder_type = 'restock' THEN
            v_next_trigger := v_reminder.next_trigger_at;
        END IF;

        -- Update item reminder
        UPDATE item_reminders
        SET
            title = COALESCE(p_title, title),
            message = COALESCE(p_message, message),
            threshold = CASE WHEN v_reminder.reminder_type = 'low_stock' THEN COALESCE(p_threshold, threshold) ELSE threshold END,
            comparison_operator = CASE WHEN v_reminder.reminder_type = 'low_stock' AND p_comparison_operator IS NOT NULL THEN p_comparison_operator::comparison_operator_enum ELSE comparison_operator END,
            days_before_expiry = CASE WHEN v_reminder.reminder_type = 'expiry' THEN COALESCE(p_days_before_expiry, days_before_expiry) ELSE days_before_expiry END,
            scheduled_at = CASE WHEN v_reminder.reminder_type = 'restock' THEN COALESCE(p_scheduled_at, scheduled_at) ELSE scheduled_at END,
            recurrence = CASE WHEN v_reminder.reminder_type = 'restock' AND p_recurrence IS NOT NULL THEN p_recurrence::reminder_recurrence_enum ELSE recurrence END,
            recurrence_end_date = CASE WHEN v_reminder.reminder_type = 'restock' THEN COALESCE(p_recurrence_end_date, recurrence_end_date) ELSE recurrence_end_date END,
            next_trigger_at = CASE WHEN v_reminder.reminder_type = 'restock' THEN COALESCE(v_next_trigger, next_trigger_at) ELSE next_trigger_at END,
            notify_in_app = COALESCE(p_notify_in_app, notify_in_app),
            notify_email = COALESCE(p_notify_email, notify_email),
            updated_at = NOW()
        WHERE id = p_reminder_id;

    ELSIF p_source_type = 'folder' THEN
        -- Get existing folder reminder
        SELECT * INTO v_reminder FROM folder_reminders
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id;

        IF v_reminder IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Reminder not found');
        END IF;

        -- Calculate next_trigger_at for scheduled reminders
        IF v_reminder.reminder_type = 'restock' AND p_scheduled_at IS NOT NULL THEN
            v_next_trigger := p_scheduled_at;
        ELSIF v_reminder.reminder_type = 'restock' THEN
            v_next_trigger := v_reminder.next_trigger_at;
        END IF;

        -- Update folder reminder
        UPDATE folder_reminders
        SET
            title = COALESCE(p_title, title),
            message = COALESCE(p_message, message),
            threshold = CASE WHEN v_reminder.reminder_type = 'low_stock' THEN COALESCE(p_threshold, threshold) ELSE threshold END,
            comparison_operator = CASE WHEN v_reminder.reminder_type = 'low_stock' AND p_comparison_operator IS NOT NULL THEN p_comparison_operator::comparison_operator_enum ELSE comparison_operator END,
            days_before_expiry = CASE WHEN v_reminder.reminder_type = 'expiry' THEN COALESCE(p_days_before_expiry, days_before_expiry) ELSE days_before_expiry END,
            scheduled_at = CASE WHEN v_reminder.reminder_type = 'restock' THEN COALESCE(p_scheduled_at, scheduled_at) ELSE scheduled_at END,
            recurrence = CASE WHEN v_reminder.reminder_type = 'restock' AND p_recurrence IS NOT NULL THEN p_recurrence::reminder_recurrence_enum ELSE recurrence END,
            recurrence_end_date = CASE WHEN v_reminder.reminder_type = 'restock' THEN COALESCE(p_recurrence_end_date, recurrence_end_date) ELSE recurrence_end_date END,
            next_trigger_at = CASE WHEN v_reminder.reminder_type = 'restock' THEN COALESCE(v_next_trigger, next_trigger_at) ELSE next_trigger_at END,
            notify_in_app = COALESCE(p_notify_in_app, notify_in_app),
            notify_email = COALESCE(p_notify_email, notify_email),
            updated_at = NOW()
        WHERE id = p_reminder_id;

    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid source type');
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Grant Permissions
-- ============================================

GRANT EXECUTE ON FUNCTION update_reminder(UUID, TEXT, VARCHAR, TEXT, INTEGER, TEXT, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN) TO authenticated;

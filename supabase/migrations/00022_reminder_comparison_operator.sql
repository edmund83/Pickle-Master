-- ============================================
-- Migration: Add comparison operator to item_reminders
-- Purpose: Support different comparison conditions for low stock alerts
-- ============================================

-- ============================================
-- 1. Create Comparison Operator Enum
-- ============================================

DO $$ BEGIN
    CREATE TYPE comparison_operator_enum AS ENUM ('lte', 'lt', 'gt', 'gte', 'eq');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. Add Column to item_reminders
-- ============================================

ALTER TABLE item_reminders
ADD COLUMN IF NOT EXISTS comparison_operator comparison_operator_enum DEFAULT 'lte';

-- ============================================
-- 3. Update create_item_reminder Function
-- ============================================

CREATE OR REPLACE FUNCTION create_item_reminder(
    p_item_id UUID,
    p_reminder_type TEXT,
    p_title VARCHAR DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_threshold INTEGER DEFAULT NULL,
    p_days_before_expiry INTEGER DEFAULT NULL,
    p_scheduled_at TIMESTAMPTZ DEFAULT NULL,
    p_recurrence TEXT DEFAULT 'once',
    p_recurrence_end_date DATE DEFAULT NULL,
    p_notify_in_app BOOLEAN DEFAULT TRUE,
    p_notify_email BOOLEAN DEFAULT FALSE,
    p_notify_user_ids UUID[] DEFAULT NULL,
    p_comparison_operator TEXT DEFAULT 'lte'
)
RETURNS JSON AS $$
DECLARE
    v_reminder_id UUID;
    v_tenant_id UUID;
    v_next_trigger TIMESTAMPTZ;
    v_user_role TEXT;
BEGIN
    -- Get user's tenant_id and role
    SELECT tenant_id, role INTO v_tenant_id, v_user_role
    FROM profiles WHERE id = auth.uid();

    -- Check permission
    IF v_user_role NOT IN ('owner', 'admin', 'editor') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Editor role or higher required.');
    END IF;

    -- Validate item belongs to tenant
    IF NOT EXISTS (
        SELECT 1 FROM inventory_items
        WHERE id = p_item_id AND tenant_id = v_tenant_id AND deleted_at IS NULL
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;

    -- Validate reminder type-specific requirements
    IF p_reminder_type = 'low_stock' AND p_threshold IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Threshold required for low stock reminders');
    END IF;

    IF p_reminder_type = 'expiry' AND p_days_before_expiry IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Days before expiry required for expiry reminders');
    END IF;

    IF p_reminder_type = 'restock' AND p_scheduled_at IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Scheduled date required for restock reminders');
    END IF;

    -- Calculate next_trigger_at for scheduled reminders
    IF p_reminder_type = 'restock' AND p_scheduled_at IS NOT NULL THEN
        v_next_trigger := p_scheduled_at;
    END IF;

    -- Insert reminder
    INSERT INTO item_reminders (
        tenant_id, item_id, created_by,
        reminder_type, title, message,
        threshold, days_before_expiry,
        scheduled_at, recurrence, recurrence_end_date,
        notify_in_app, notify_email, notify_user_ids,
        next_trigger_at, comparison_operator
    ) VALUES (
        v_tenant_id, p_item_id, auth.uid(),
        p_reminder_type::reminder_type_enum, p_title, p_message,
        p_threshold, p_days_before_expiry,
        p_scheduled_at, COALESCE(p_recurrence, 'once')::reminder_recurrence_enum, p_recurrence_end_date,
        p_notify_in_app, p_notify_email, p_notify_user_ids,
        v_next_trigger, COALESCE(p_comparison_operator, 'lte')::comparison_operator_enum
    ) RETURNING id INTO v_reminder_id;

    RETURN json_build_object('success', true, 'reminder_id', v_reminder_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Update get_item_reminders to include comparison_operator
-- ============================================

CREATE OR REPLACE FUNCTION get_item_reminders(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get user's tenant_id
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN '[]'::json;
    END IF;

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.created_at DESC), '[]'::json)
        FROM (
            SELECT
                ir.id,
                ir.item_id,
                ir.reminder_type,
                ir.title,
                ir.message,
                ir.threshold,
                ir.comparison_operator,
                ir.days_before_expiry,
                ir.scheduled_at,
                ir.recurrence,
                ir.recurrence_end_date,
                ir.notify_in_app,
                ir.notify_email,
                ir.notify_user_ids,
                ir.status,
                ir.last_triggered_at,
                ir.next_trigger_at,
                ir.trigger_count,
                ir.created_at,
                ir.created_by,
                p.full_name as created_by_name,
                CASE
                    WHEN ir.reminder_type = 'low_stock' THEN
                        CASE ir.comparison_operator
                            WHEN 'lte' THEN 'When quantity ≤ ' || ir.threshold
                            WHEN 'lt' THEN 'When quantity < ' || ir.threshold
                            WHEN 'gt' THEN 'When quantity > ' || ir.threshold
                            WHEN 'gte' THEN 'When quantity ≥ ' || ir.threshold
                            WHEN 'eq' THEN 'When quantity = ' || ir.threshold
                            ELSE 'When quantity drops below ' || ir.threshold
                        END
                    WHEN ir.reminder_type = 'expiry' THEN
                        ir.days_before_expiry || ' days before expiry'
                    WHEN ir.reminder_type = 'restock' THEN
                        CASE ir.recurrence
                            WHEN 'once' THEN 'One-time on ' || to_char(ir.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY HH24:MI')
                            ELSE initcap(ir.recurrence::text) || ' starting ' || to_char(ir.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY')
                        END
                END as trigger_description
            FROM item_reminders ir
            LEFT JOIN profiles p ON p.id = ir.created_by
            WHERE ir.item_id = p_item_id
            AND ir.tenant_id = v_tenant_id
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 5. Update Low Stock Trigger to respect comparison operator
-- ============================================

CREATE OR REPLACE FUNCTION check_low_stock_reminders()
RETURNS TRIGGER AS $$
DECLARE
    v_reminder RECORD;
    v_user_id UUID;
    v_notification_title TEXT;
    v_notification_message TEXT;
    v_should_trigger BOOLEAN;
    v_was_triggered BOOLEAN;
BEGIN
    -- Only proceed if quantity changed
    IF NEW.quantity = OLD.quantity THEN
        RETURN NEW;
    END IF;

    -- Find active low stock reminders for this item
    FOR v_reminder IN
        SELECT ir.*, p.full_name as creator_name
        FROM item_reminders ir
        LEFT JOIN profiles p ON p.id = ir.created_by
        WHERE ir.item_id = NEW.id
        AND ir.reminder_type = 'low_stock'
        AND ir.status = 'active'
        AND ir.threshold IS NOT NULL
    LOOP
        -- Check if condition is NOW met based on comparison operator
        v_should_trigger := CASE v_reminder.comparison_operator
            WHEN 'lte' THEN NEW.quantity <= v_reminder.threshold
            WHEN 'lt' THEN NEW.quantity < v_reminder.threshold
            WHEN 'gt' THEN NEW.quantity > v_reminder.threshold
            WHEN 'gte' THEN NEW.quantity >= v_reminder.threshold
            WHEN 'eq' THEN NEW.quantity = v_reminder.threshold
            ELSE NEW.quantity <= v_reminder.threshold  -- Default to lte
        END;

        -- Check if condition WAS met before (to detect crossing)
        v_was_triggered := CASE v_reminder.comparison_operator
            WHEN 'lte' THEN OLD.quantity <= v_reminder.threshold
            WHEN 'lt' THEN OLD.quantity < v_reminder.threshold
            WHEN 'gt' THEN OLD.quantity > v_reminder.threshold
            WHEN 'gte' THEN OLD.quantity >= v_reminder.threshold
            WHEN 'eq' THEN OLD.quantity = v_reminder.threshold
            ELSE OLD.quantity <= v_reminder.threshold
        END;

        -- Only trigger if condition just became true (crossing the threshold)
        IF v_should_trigger AND NOT v_was_triggered THEN
            -- Prepare notification content
            v_notification_title := COALESCE(
                v_reminder.title,
                'Stock Alert: ' || NEW.name
            );
            v_notification_message := COALESCE(
                v_reminder.message,
                NEW.name || ' quantity is now ' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'units') || ' (threshold: ' || v_reminder.threshold || ')'
            );

            -- Create notifications for each target user
            IF v_reminder.notify_in_app THEN
                FOREACH v_user_id IN ARRAY COALESCE(v_reminder.notify_user_ids, ARRAY[v_reminder.created_by])
                LOOP
                    IF v_user_id IS NOT NULL THEN
                        INSERT INTO notifications (
                            tenant_id,
                            user_id,
                            title,
                            message,
                            notification_type,
                            entity_type,
                            entity_id
                        ) VALUES (
                            NEW.tenant_id,
                            v_user_id,
                            v_notification_title,
                            v_notification_message,
                            'reminder_low_stock',
                            'item',
                            NEW.id
                        );
                    END IF;
                END LOOP;
            END IF;

            -- Update reminder tracking
            UPDATE item_reminders
            SET
                last_triggered_at = NOW(),
                trigger_count = trigger_count + 1,
                updated_at = NOW()
            WHERE id = v_reminder.id;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Grant Permissions for Updated Function
-- ============================================

GRANT EXECUTE ON FUNCTION create_item_reminder(UUID, TEXT, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, UUID[], TEXT) TO authenticated;

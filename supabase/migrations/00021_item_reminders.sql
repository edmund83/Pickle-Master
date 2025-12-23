-- ============================================
-- Migration: Item Reminders System
-- Purpose: Per-item reminders for low stock, expiry, and scheduled restock notifications
-- ============================================

-- ============================================
-- 1. Create Enum Types
-- ============================================

-- Reminder type enum
DO $$ BEGIN
    CREATE TYPE reminder_type_enum AS ENUM ('low_stock', 'expiry', 'restock');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Reminder recurrence enum
DO $$ BEGIN
    CREATE TYPE reminder_recurrence_enum AS ENUM ('once', 'daily', 'weekly', 'monthly');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Reminder status enum
DO $$ BEGIN
    CREATE TYPE reminder_status_enum AS ENUM ('active', 'paused', 'triggered', 'expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. Extend notification_type_enum
-- ============================================

-- Add new notification types for reminders
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'reminder_low_stock';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'reminder_expiry';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'reminder_restock';

-- ============================================
-- 3. Create item_reminders Table
-- ============================================

CREATE TABLE IF NOT EXISTS item_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Reminder configuration
    reminder_type reminder_type_enum NOT NULL,
    title VARCHAR(255),
    message TEXT,

    -- Trigger conditions (varies by type)
    threshold INTEGER,              -- For low_stock: quantity threshold
    days_before_expiry INTEGER,     -- For expiry: days before expiry_date

    -- Schedule settings (for restock type)
    scheduled_at TIMESTAMPTZ,       -- First/one-time trigger datetime
    recurrence reminder_recurrence_enum DEFAULT 'once',
    recurrence_end_date DATE,       -- Optional end date for recurring

    -- Notification preferences
    notify_in_app BOOLEAN DEFAULT TRUE,
    notify_email BOOLEAN DEFAULT FALSE,
    notify_user_ids UUID[],         -- Specific users to notify (null = creator only)

    -- Status tracking
    status reminder_status_enum DEFAULT 'active',
    last_triggered_at TIMESTAMPTZ,
    next_trigger_at TIMESTAMPTZ,    -- Computed for scheduled reminders
    trigger_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_low_stock_threshold CHECK (
        reminder_type != 'low_stock' OR threshold IS NOT NULL
    ),
    CONSTRAINT chk_expiry_days CHECK (
        reminder_type != 'expiry' OR days_before_expiry IS NOT NULL
    ),
    CONSTRAINT chk_restock_schedule CHECK (
        reminder_type != 'restock' OR scheduled_at IS NOT NULL
    ),
    CONSTRAINT chk_positive_threshold CHECK (
        threshold IS NULL OR threshold >= 0
    ),
    CONSTRAINT chk_positive_days CHECK (
        days_before_expiry IS NULL OR days_before_expiry > 0
    )
);

-- ============================================
-- 4. Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_item_reminders_tenant ON item_reminders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_item_reminders_item ON item_reminders(item_id);
CREATE INDEX IF NOT EXISTS idx_item_reminders_status ON item_reminders(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_item_reminders_type ON item_reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_item_reminders_next_trigger ON item_reminders(next_trigger_at)
    WHERE status = 'active' AND reminder_type = 'restock';
CREATE INDEX IF NOT EXISTS idx_item_reminders_created_by ON item_reminders(created_by);

-- Composite index for efficient low stock trigger queries
CREATE INDEX IF NOT EXISTS idx_item_reminders_low_stock_active
    ON item_reminders(item_id, threshold)
    WHERE reminder_type = 'low_stock' AND status = 'active';

-- ============================================
-- 5. Enable RLS and Create Policies
-- ============================================

ALTER TABLE item_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view reminders for their tenant's items
CREATE POLICY "Users can view tenant reminders" ON item_reminders
    FOR SELECT USING (tenant_id = get_user_tenant_id());

-- Editors and above can create reminders
CREATE POLICY "Editors can create reminders" ON item_reminders
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Users can update their own reminders, admins can update any
CREATE POLICY "Users can update reminders" ON item_reminders
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND role IN ('owner', 'admin')
            )
        )
    );

-- Users can delete their own reminders, admins can delete any
CREATE POLICY "Users can delete reminders" ON item_reminders
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND role IN ('owner', 'admin')
            )
        )
    );

-- ============================================
-- 6. Create Updated_at Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_item_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_item_reminders_updated_at ON item_reminders;
CREATE TRIGGER trigger_update_item_reminders_updated_at
    BEFORE UPDATE ON item_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_item_reminders_updated_at();

-- ============================================
-- 7. Low Stock Reminder Trigger
-- ============================================

CREATE OR REPLACE FUNCTION check_low_stock_reminders()
RETURNS TRIGGER AS $$
DECLARE
    v_reminder RECORD;
    v_user_id UUID;
    v_notification_title TEXT;
    v_notification_message TEXT;
BEGIN
    -- Only proceed if quantity decreased and crossed below a threshold
    IF NEW.quantity >= OLD.quantity THEN
        RETURN NEW;
    END IF;

    -- Find active low stock reminders for this item where threshold was crossed
    FOR v_reminder IN
        SELECT ir.*, p.full_name as creator_name
        FROM item_reminders ir
        LEFT JOIN profiles p ON p.id = ir.created_by
        WHERE ir.item_id = NEW.id
        AND ir.reminder_type = 'low_stock'
        AND ir.status = 'active'
        AND ir.threshold IS NOT NULL
        AND NEW.quantity <= ir.threshold
        AND OLD.quantity > ir.threshold  -- Only trigger on crossing threshold
    LOOP
        -- Prepare notification content
        v_notification_title := COALESCE(
            v_reminder.title,
            'Low Stock Alert: ' || NEW.name
        );
        v_notification_message := COALESCE(
            v_reminder.message,
            NEW.name || ' has dropped to ' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'units') || ' (threshold: ' || v_reminder.threshold || ')'
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
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger
DROP TRIGGER IF EXISTS trigger_check_low_stock_reminders ON inventory_items;
CREATE TRIGGER trigger_check_low_stock_reminders
    AFTER UPDATE OF quantity ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION check_low_stock_reminders();

-- ============================================
-- 8. RPC Functions for Reminder Management
-- ============================================

-- Get all reminders for an item
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
                        'When quantity drops below ' || ir.threshold
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

-- Create a new reminder
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
    p_notify_user_ids UUID[] DEFAULT NULL
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
        next_trigger_at
    ) VALUES (
        v_tenant_id, p_item_id, auth.uid(),
        p_reminder_type::reminder_type_enum, p_title, p_message,
        p_threshold, p_days_before_expiry,
        p_scheduled_at, COALESCE(p_recurrence, 'once')::reminder_recurrence_enum, p_recurrence_end_date,
        p_notify_in_app, p_notify_email, p_notify_user_ids,
        v_next_trigger
    ) RETURNING id INTO v_reminder_id;

    RETURN json_build_object('success', true, 'reminder_id', v_reminder_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update an existing reminder
CREATE OR REPLACE FUNCTION update_item_reminder(
    p_reminder_id UUID,
    p_title VARCHAR DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_threshold INTEGER DEFAULT NULL,
    p_days_before_expiry INTEGER DEFAULT NULL,
    p_scheduled_at TIMESTAMPTZ DEFAULT NULL,
    p_recurrence TEXT DEFAULT NULL,
    p_recurrence_end_date DATE DEFAULT NULL,
    p_notify_in_app BOOLEAN DEFAULT NULL,
    p_notify_email BOOLEAN DEFAULT NULL,
    p_status TEXT DEFAULT NULL
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

    -- Get existing reminder
    SELECT * INTO v_reminder FROM item_reminders
    WHERE id = p_reminder_id AND tenant_id = v_tenant_id;

    IF v_reminder IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Reminder not found');
    END IF;

    -- Check permission (creator or admin)
    IF v_reminder.created_by != auth.uid() AND v_user_role NOT IN ('owner', 'admin') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied');
    END IF;

    -- Calculate next_trigger_at if scheduled_at changed
    IF p_scheduled_at IS NOT NULL AND v_reminder.reminder_type = 'restock' THEN
        v_next_trigger := p_scheduled_at;
    ELSE
        v_next_trigger := v_reminder.next_trigger_at;
    END IF;

    -- Update fields
    UPDATE item_reminders SET
        title = COALESCE(p_title, title),
        message = COALESCE(p_message, message),
        threshold = COALESCE(p_threshold, threshold),
        days_before_expiry = COALESCE(p_days_before_expiry, days_before_expiry),
        scheduled_at = COALESCE(p_scheduled_at, scheduled_at),
        recurrence = COALESCE(p_recurrence::reminder_recurrence_enum, recurrence),
        recurrence_end_date = COALESCE(p_recurrence_end_date, recurrence_end_date),
        notify_in_app = COALESCE(p_notify_in_app, notify_in_app),
        notify_email = COALESCE(p_notify_email, notify_email),
        status = COALESCE(p_status::reminder_status_enum, status),
        next_trigger_at = v_next_trigger,
        updated_at = NOW()
    WHERE id = p_reminder_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a reminder
CREATE OR REPLACE FUNCTION delete_item_reminder(p_reminder_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_role TEXT;
    v_reminder_created_by UUID;
BEGIN
    -- Get user's tenant_id and role
    SELECT tenant_id, role INTO v_tenant_id, v_user_role
    FROM profiles WHERE id = auth.uid();

    -- Get reminder creator
    SELECT created_by INTO v_reminder_created_by
    FROM item_reminders
    WHERE id = p_reminder_id AND tenant_id = v_tenant_id;

    IF v_reminder_created_by IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Reminder not found');
    END IF;

    -- Check permission (creator or admin)
    IF v_reminder_created_by != auth.uid() AND v_user_role NOT IN ('owner', 'admin') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied');
    END IF;

    DELETE FROM item_reminders WHERE id = p_reminder_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle reminder status (active/paused)
CREATE OR REPLACE FUNCTION toggle_reminder_status(p_reminder_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_role TEXT;
    v_reminder RECORD;
    v_new_status reminder_status_enum;
BEGIN
    -- Get user's tenant_id and role
    SELECT tenant_id, role INTO v_tenant_id, v_user_role
    FROM profiles WHERE id = auth.uid();

    -- Get reminder
    SELECT * INTO v_reminder FROM item_reminders
    WHERE id = p_reminder_id AND tenant_id = v_tenant_id;

    IF v_reminder IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Reminder not found');
    END IF;

    -- Check permission (creator or admin)
    IF v_reminder.created_by != auth.uid() AND v_user_role NOT IN ('owner', 'admin') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied');
    END IF;

    -- Toggle status
    v_new_status := CASE
        WHEN v_reminder.status = 'active' THEN 'paused'::reminder_status_enum
        WHEN v_reminder.status = 'paused' THEN 'active'::reminder_status_enum
        ELSE v_reminder.status  -- Don't change triggered/expired
    END;

    UPDATE item_reminders
    SET status = v_new_status, updated_at = NOW()
    WHERE id = p_reminder_id;

    RETURN json_build_object('success', true, 'new_status', v_new_status::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Function to Process Scheduled Reminders (for Edge Function)
-- ============================================

-- Get reminders due for processing (used by Edge Function)
CREATE OR REPLACE FUNCTION get_due_reminders()
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    item_id UUID,
    item_name VARCHAR,
    reminder_type reminder_type_enum,
    title VARCHAR,
    message TEXT,
    threshold INTEGER,
    days_before_expiry INTEGER,
    scheduled_at TIMESTAMPTZ,
    recurrence reminder_recurrence_enum,
    recurrence_end_date DATE,
    notify_in_app BOOLEAN,
    notify_email BOOLEAN,
    notify_user_ids UUID[],
    created_by UUID,
    trigger_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ir.id,
        ir.tenant_id,
        ir.item_id,
        i.name as item_name,
        ir.reminder_type,
        ir.title,
        ir.message,
        ir.threshold,
        ir.days_before_expiry,
        ir.scheduled_at,
        ir.recurrence,
        ir.recurrence_end_date,
        ir.notify_in_app,
        ir.notify_email,
        ir.notify_user_ids,
        ir.created_by,
        ir.trigger_count
    FROM item_reminders ir
    JOIN inventory_items i ON i.id = ir.item_id
    WHERE ir.status = 'active'
    AND ir.reminder_type = 'restock'
    AND ir.next_trigger_at <= NOW()
    AND i.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update reminder after processing (used by Edge Function)
CREATE OR REPLACE FUNCTION process_reminder_trigger(
    p_reminder_id UUID,
    p_mark_triggered BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    v_reminder RECORD;
    v_next_trigger TIMESTAMPTZ;
    v_new_status reminder_status_enum;
BEGIN
    SELECT * INTO v_reminder FROM item_reminders WHERE id = p_reminder_id;

    IF v_reminder IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Reminder not found');
    END IF;

    -- Calculate next trigger for recurring reminders
    IF v_reminder.recurrence = 'once' OR p_mark_triggered THEN
        v_new_status := 'triggered';
        v_next_trigger := NULL;
    ELSE
        v_new_status := 'active';
        v_next_trigger := CASE v_reminder.recurrence
            WHEN 'daily' THEN v_reminder.next_trigger_at + INTERVAL '1 day'
            WHEN 'weekly' THEN v_reminder.next_trigger_at + INTERVAL '1 week'
            WHEN 'monthly' THEN v_reminder.next_trigger_at + INTERVAL '1 month'
            ELSE v_reminder.next_trigger_at
        END;

        -- Check if past end date
        IF v_reminder.recurrence_end_date IS NOT NULL AND v_next_trigger::date > v_reminder.recurrence_end_date THEN
            v_new_status := 'expired';
            v_next_trigger := NULL;
        END IF;
    END IF;

    UPDATE item_reminders SET
        last_triggered_at = NOW(),
        trigger_count = trigger_count + 1,
        next_trigger_at = v_next_trigger,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_reminder_id;

    RETURN json_build_object('success', true, 'new_status', v_new_status::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. Grant Permissions
-- ============================================

GRANT EXECUTE ON FUNCTION get_item_reminders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_item_reminder(UUID, TEXT, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION update_item_reminder(UUID, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_item_reminder(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_reminder_status(UUID) TO authenticated;
-- Edge Function uses service role, so no grant needed for get_due_reminders and process_reminder_trigger

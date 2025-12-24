-- ============================================
-- Migration: Reminder Management System
-- Purpose: Add folder reminders and global reminder management features
-- ============================================

-- ============================================
-- 1. Create folder_reminders Table
-- ============================================

CREATE TABLE IF NOT EXISTS folder_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    reminder_type reminder_type_enum NOT NULL,

    -- Content fields
    title VARCHAR(200),
    message TEXT,

    -- Type-specific fields
    threshold INTEGER,
    comparison_operator comparison_operator_enum DEFAULT 'lte',
    days_before_expiry INTEGER,
    scheduled_at TIMESTAMPTZ,
    recurrence reminder_recurrence_enum DEFAULT 'once',
    recurrence_end_date DATE,

    -- Notification settings
    notify_in_app BOOLEAN DEFAULT TRUE,
    notify_email BOOLEAN DEFAULT FALSE,
    notify_user_ids UUID[],

    -- Status tracking
    status reminder_status_enum DEFAULT 'active',
    last_triggered_at TIMESTAMPTZ,
    next_trigger_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_threshold CHECK (
        (reminder_type != 'low_stock') OR (threshold IS NOT NULL)
    ),
    CONSTRAINT valid_days_before_expiry CHECK (
        (reminder_type != 'expiry') OR (days_before_expiry IS NOT NULL)
    ),
    CONSTRAINT valid_scheduled_at CHECK (
        (reminder_type != 'restock') OR (scheduled_at IS NOT NULL)
    )
);

-- Create indexes for folder_reminders
CREATE INDEX IF NOT EXISTS idx_folder_reminders_tenant_id ON folder_reminders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_folder_reminders_folder_id ON folder_reminders(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_reminders_status ON folder_reminders(status);
CREATE INDEX IF NOT EXISTS idx_folder_reminders_type ON folder_reminders(reminder_type);

-- Enable RLS
ALTER TABLE folder_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folder_reminders
CREATE POLICY "Users can view folder reminders in their tenant"
    ON folder_reminders FOR SELECT
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert folder reminders in their tenant"
    ON folder_reminders FOR INSERT
    WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update folder reminders in their tenant"
    ON folder_reminders FOR UPDATE
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete folder reminders in their tenant"
    ON folder_reminders FOR DELETE
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- ============================================
-- 2. Get All Reminders Function
-- Returns both item_reminders and folder_reminders
-- ============================================

CREATE OR REPLACE FUNCTION get_all_reminders(
    p_type TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get user's tenant_id
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('reminders', '[]'::json, 'total', 0);
    END IF;

    RETURN (
        WITH all_reminders AS (
            -- Item reminders
            SELECT
                ir.id,
                'item' as source_type,
                ir.item_id,
                NULL::UUID as folder_id,
                ii.name as item_name,
                NULL as folder_name,
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
                            WHEN 'lte' THEN 'Quantity ≤ ' || ir.threshold
                            WHEN 'lt' THEN 'Quantity < ' || ir.threshold
                            WHEN 'gt' THEN 'Quantity > ' || ir.threshold
                            WHEN 'gte' THEN 'Quantity ≥ ' || ir.threshold
                            WHEN 'eq' THEN 'Quantity = ' || ir.threshold
                            ELSE 'Quantity ≤ ' || ir.threshold
                        END
                    WHEN ir.reminder_type = 'expiry' THEN
                        ir.days_before_expiry || ' days before expiry'
                    WHEN ir.reminder_type = 'restock' THEN
                        CASE ir.recurrence
                            WHEN 'once' THEN 'One-time on ' || to_char(ir.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY')
                            ELSE initcap(ir.recurrence::text) || ' starting ' || to_char(ir.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY')
                        END
                END as trigger_description
            FROM item_reminders ir
            LEFT JOIN inventory_items ii ON ii.id = ir.item_id
            LEFT JOIN profiles p ON p.id = ir.created_by
            WHERE ir.tenant_id = v_tenant_id
            AND (p_type IS NULL OR ir.reminder_type::text = p_type)
            AND (p_status IS NULL OR ir.status::text = p_status)

            UNION ALL

            -- Folder reminders
            SELECT
                fr.id,
                'folder' as source_type,
                NULL::UUID as item_id,
                fr.folder_id,
                NULL as item_name,
                f.name as folder_name,
                fr.reminder_type,
                fr.title,
                fr.message,
                fr.threshold,
                fr.comparison_operator,
                fr.days_before_expiry,
                fr.scheduled_at,
                fr.recurrence,
                fr.recurrence_end_date,
                fr.notify_in_app,
                fr.notify_email,
                fr.notify_user_ids,
                fr.status,
                fr.last_triggered_at,
                fr.next_trigger_at,
                fr.trigger_count,
                fr.created_at,
                fr.created_by,
                p.full_name as created_by_name,
                CASE
                    WHEN fr.reminder_type = 'low_stock' THEN
                        CASE fr.comparison_operator
                            WHEN 'lte' THEN 'Quantity ≤ ' || fr.threshold
                            WHEN 'lt' THEN 'Quantity < ' || fr.threshold
                            WHEN 'gt' THEN 'Quantity > ' || fr.threshold
                            WHEN 'gte' THEN 'Quantity ≥ ' || fr.threshold
                            WHEN 'eq' THEN 'Quantity = ' || fr.threshold
                            ELSE 'Quantity ≤ ' || fr.threshold
                        END
                    WHEN fr.reminder_type = 'expiry' THEN
                        fr.days_before_expiry || ' days before expiry'
                    WHEN fr.reminder_type = 'restock' THEN
                        CASE fr.recurrence
                            WHEN 'once' THEN 'One-time on ' || to_char(fr.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY')
                            ELSE initcap(fr.recurrence::text) || ' starting ' || to_char(fr.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY')
                        END
                END as trigger_description
            FROM folder_reminders fr
            LEFT JOIN folders f ON f.id = fr.folder_id
            LEFT JOIN profiles p ON p.id = fr.created_by
            WHERE fr.tenant_id = v_tenant_id
            AND (p_type IS NULL OR fr.reminder_type::text = p_type)
            AND (p_status IS NULL OR fr.status::text = p_status)
        ),
        counted AS (
            SELECT COUNT(*) as total FROM all_reminders
        ),
        paginated AS (
            SELECT * FROM all_reminders
            ORDER BY created_at DESC
            LIMIT p_limit OFFSET p_offset
        )
        SELECT json_build_object(
            'reminders', COALESCE((SELECT json_agg(row_to_json(paginated)) FROM paginated), '[]'::json),
            'total', (SELECT total FROM counted)
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 3. Get Reminder Stats Function
-- Returns count of reminders by type and status
-- ============================================

CREATE OR REPLACE FUNCTION get_reminder_stats()
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get user's tenant_id
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object(
            'total', 0,
            'active', 0,
            'paused', 0,
            'by_type', json_build_object('low_stock', 0, 'expiry', 0, 'restock', 0)
        );
    END IF;

    RETURN (
        WITH all_counts AS (
            SELECT status, reminder_type FROM item_reminders WHERE tenant_id = v_tenant_id
            UNION ALL
            SELECT status, reminder_type FROM folder_reminders WHERE tenant_id = v_tenant_id
        )
        SELECT json_build_object(
            'total', COUNT(*),
            'active', COUNT(*) FILTER (WHERE status = 'active'),
            'paused', COUNT(*) FILTER (WHERE status = 'paused'),
            'by_type', json_build_object(
                'low_stock', COUNT(*) FILTER (WHERE reminder_type = 'low_stock'),
                'expiry', COUNT(*) FILTER (WHERE reminder_type = 'expiry'),
                'restock', COUNT(*) FILTER (WHERE reminder_type = 'restock')
            )
        )
        FROM all_counts
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 4. Create Folder Reminder Function
-- ============================================

CREATE OR REPLACE FUNCTION create_folder_reminder(
    p_folder_id UUID,
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

    -- Validate folder belongs to tenant
    IF NOT EXISTS (
        SELECT 1 FROM folders
        WHERE id = p_folder_id AND tenant_id = v_tenant_id
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Folder not found');
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
    INSERT INTO folder_reminders (
        tenant_id, folder_id, created_by,
        reminder_type, title, message,
        threshold, days_before_expiry,
        scheduled_at, recurrence, recurrence_end_date,
        notify_in_app, notify_email, notify_user_ids,
        next_trigger_at, comparison_operator
    ) VALUES (
        v_tenant_id, p_folder_id, auth.uid(),
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
-- 5. Create Bulk Item Reminders Function
-- Creates the same reminder for multiple items
-- ============================================

CREATE OR REPLACE FUNCTION create_bulk_item_reminders(
    p_item_ids UUID[],
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
    v_tenant_id UUID;
    v_user_role TEXT;
    v_next_trigger TIMESTAMPTZ;
    v_item_id UUID;
    v_created_count INTEGER := 0;
    v_skipped_count INTEGER := 0;
BEGIN
    -- Get user's tenant_id and role
    SELECT tenant_id, role INTO v_tenant_id, v_user_role
    FROM profiles WHERE id = auth.uid();

    -- Check permission
    IF v_user_role NOT IN ('owner', 'admin', 'editor') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Editor role or higher required.');
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

    -- Loop through item IDs and create reminders
    FOREACH v_item_id IN ARRAY p_item_ids
    LOOP
        -- Verify item belongs to tenant and isn't deleted
        IF EXISTS (
            SELECT 1 FROM inventory_items
            WHERE id = v_item_id AND tenant_id = v_tenant_id AND deleted_at IS NULL
        ) THEN
            -- Check if reminder of same type already exists for this item
            IF NOT EXISTS (
                SELECT 1 FROM item_reminders
                WHERE item_id = v_item_id
                AND reminder_type = p_reminder_type::reminder_type_enum
                AND status = 'active'
            ) THEN
                INSERT INTO item_reminders (
                    tenant_id, item_id, created_by,
                    reminder_type, title, message,
                    threshold, days_before_expiry,
                    scheduled_at, recurrence, recurrence_end_date,
                    notify_in_app, notify_email, notify_user_ids,
                    next_trigger_at, comparison_operator
                ) VALUES (
                    v_tenant_id, v_item_id, auth.uid(),
                    p_reminder_type::reminder_type_enum, p_title, p_message,
                    p_threshold, p_days_before_expiry,
                    p_scheduled_at, COALESCE(p_recurrence, 'once')::reminder_recurrence_enum, p_recurrence_end_date,
                    p_notify_in_app, p_notify_email, p_notify_user_ids,
                    v_next_trigger, COALESCE(p_comparison_operator, 'lte')::comparison_operator_enum
                );
                v_created_count := v_created_count + 1;
            ELSE
                v_skipped_count := v_skipped_count + 1;
            END IF;
        ELSE
            v_skipped_count := v_skipped_count + 1;
        END IF;
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'created', v_created_count,
        'skipped', v_skipped_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Delete Reminder Function (supports both types)
-- ============================================

CREATE OR REPLACE FUNCTION delete_reminder(
    p_reminder_id UUID,
    p_source_type TEXT -- 'item' or 'folder'
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_role TEXT;
BEGIN
    -- Get user's tenant_id and role
    SELECT tenant_id, role INTO v_tenant_id, v_user_role
    FROM profiles WHERE id = auth.uid();

    -- Check permission
    IF v_user_role NOT IN ('owner', 'admin', 'editor') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Editor role or higher required.');
    END IF;

    IF p_source_type = 'item' THEN
        DELETE FROM item_reminders
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id;
    ELSIF p_source_type = 'folder' THEN
        DELETE FROM folder_reminders
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id;
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid source type');
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Toggle Reminder Status (supports both types)
-- ============================================

CREATE OR REPLACE FUNCTION toggle_reminder(
    p_reminder_id UUID,
    p_source_type TEXT -- 'item' or 'folder'
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_role TEXT;
    v_new_status reminder_status_enum;
BEGIN
    -- Get user's tenant_id and role
    SELECT tenant_id, role INTO v_tenant_id, v_user_role
    FROM profiles WHERE id = auth.uid();

    -- Check permission
    IF v_user_role NOT IN ('owner', 'admin', 'editor') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Editor role or higher required.');
    END IF;

    IF p_source_type = 'item' THEN
        UPDATE item_reminders
        SET status = CASE WHEN status = 'active' THEN 'paused'::reminder_status_enum ELSE 'active'::reminder_status_enum END,
            updated_at = NOW()
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id
        RETURNING status INTO v_new_status;
    ELSIF p_source_type = 'folder' THEN
        UPDATE folder_reminders
        SET status = CASE WHEN status = 'active' THEN 'paused'::reminder_status_enum ELSE 'active'::reminder_status_enum END,
            updated_at = NOW()
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id
        RETURNING status INTO v_new_status;
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid source type');
    END IF;

    IF v_new_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Reminder not found');
    END IF;

    RETURN json_build_object('success', true, 'new_status', v_new_status::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Update Low Stock Trigger to Check Folder Reminders
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

    -- Find active low stock reminders for this item (direct item reminders)
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
            ELSE NEW.quantity <= v_reminder.threshold
        END;

        -- Check if condition WAS met before
        v_was_triggered := CASE v_reminder.comparison_operator
            WHEN 'lte' THEN OLD.quantity <= v_reminder.threshold
            WHEN 'lt' THEN OLD.quantity < v_reminder.threshold
            WHEN 'gt' THEN OLD.quantity > v_reminder.threshold
            WHEN 'gte' THEN OLD.quantity >= v_reminder.threshold
            WHEN 'eq' THEN OLD.quantity = v_reminder.threshold
            ELSE OLD.quantity <= v_reminder.threshold
        END;

        -- Only trigger if condition just became true
        IF v_should_trigger AND NOT v_was_triggered THEN
            v_notification_title := COALESCE(
                v_reminder.title,
                'Stock Alert: ' || NEW.name
            );
            v_notification_message := COALESCE(
                v_reminder.message,
                NEW.name || ' quantity is now ' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'units') || ' (threshold: ' || v_reminder.threshold || ')'
            );

            IF v_reminder.notify_in_app THEN
                FOREACH v_user_id IN ARRAY COALESCE(v_reminder.notify_user_ids, ARRAY[v_reminder.created_by])
                LOOP
                    IF v_user_id IS NOT NULL THEN
                        INSERT INTO notifications (
                            tenant_id, user_id, title, message,
                            notification_type, entity_type, entity_id
                        ) VALUES (
                            NEW.tenant_id, v_user_id, v_notification_title, v_notification_message,
                            'reminder_low_stock', 'item', NEW.id
                        );
                    END IF;
                END LOOP;
            END IF;

            UPDATE item_reminders
            SET last_triggered_at = NOW(), trigger_count = trigger_count + 1, updated_at = NOW()
            WHERE id = v_reminder.id;
        END IF;
    END LOOP;

    -- Also check folder reminders for the item's folder
    IF NEW.folder_id IS NOT NULL THEN
        FOR v_reminder IN
            SELECT fr.*, p.full_name as creator_name, f.name as folder_name
            FROM folder_reminders fr
            LEFT JOIN profiles p ON p.id = fr.created_by
            LEFT JOIN folders f ON f.id = fr.folder_id
            WHERE fr.folder_id = NEW.folder_id
            AND fr.reminder_type = 'low_stock'
            AND fr.status = 'active'
            AND fr.threshold IS NOT NULL
        LOOP
            v_should_trigger := CASE v_reminder.comparison_operator
                WHEN 'lte' THEN NEW.quantity <= v_reminder.threshold
                WHEN 'lt' THEN NEW.quantity < v_reminder.threshold
                WHEN 'gt' THEN NEW.quantity > v_reminder.threshold
                WHEN 'gte' THEN NEW.quantity >= v_reminder.threshold
                WHEN 'eq' THEN NEW.quantity = v_reminder.threshold
                ELSE NEW.quantity <= v_reminder.threshold
            END;

            v_was_triggered := CASE v_reminder.comparison_operator
                WHEN 'lte' THEN OLD.quantity <= v_reminder.threshold
                WHEN 'lt' THEN OLD.quantity < v_reminder.threshold
                WHEN 'gt' THEN OLD.quantity > v_reminder.threshold
                WHEN 'gte' THEN OLD.quantity >= v_reminder.threshold
                WHEN 'eq' THEN OLD.quantity = v_reminder.threshold
                ELSE OLD.quantity <= v_reminder.threshold
            END;

            IF v_should_trigger AND NOT v_was_triggered THEN
                v_notification_title := COALESCE(
                    v_reminder.title,
                    'Folder Alert (' || v_reminder.folder_name || '): ' || NEW.name
                );
                v_notification_message := COALESCE(
                    v_reminder.message,
                    NEW.name || ' in folder "' || v_reminder.folder_name || '" quantity is now ' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'units') || ' (threshold: ' || v_reminder.threshold || ')'
                );

                IF v_reminder.notify_in_app THEN
                    FOREACH v_user_id IN ARRAY COALESCE(v_reminder.notify_user_ids, ARRAY[v_reminder.created_by])
                    LOOP
                        IF v_user_id IS NOT NULL THEN
                            INSERT INTO notifications (
                                tenant_id, user_id, title, message,
                                notification_type, entity_type, entity_id
                            ) VALUES (
                                NEW.tenant_id, v_user_id, v_notification_title, v_notification_message,
                                'reminder_low_stock', 'item', NEW.id
                            );
                        END IF;
                    END LOOP;
                END IF;

                UPDATE folder_reminders
                SET last_triggered_at = NOW(), trigger_count = trigger_count + 1, updated_at = NOW()
                WHERE id = v_reminder.id;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Grant Permissions
-- ============================================

GRANT EXECUTE ON FUNCTION get_all_reminders(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_reminder_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION create_folder_reminder(UUID, TEXT, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_bulk_item_reminders(UUID[], TEXT, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_reminder(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_reminder(UUID, TEXT) TO authenticated;

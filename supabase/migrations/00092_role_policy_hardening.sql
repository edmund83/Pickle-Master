-- Migration: Align role checks and harden RLS policies
-- Purpose: Enforce owner/staff/viewer permissions consistently and prevent viewer writes

-- ============================================================================
-- 1. Role helper functions
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_role(ARRAY['owner']);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_edit()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_role(ARRAY['owner', 'staff']);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- 2. Reminder RPCs (align to owner/staff)
-- ============================================================================

DROP FUNCTION IF EXISTS create_item_reminder(UUID, VARCHAR, TIMESTAMPTZ, INTEGER, VARCHAR, TEXT);

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
    IF v_user_role NOT IN ('owner', 'staff') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Staff role or higher required.');
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

    -- Check permission (creator or owner)
    IF v_reminder.created_by != auth.uid() AND v_user_role != 'owner' THEN
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

    -- Check permission (creator or owner)
    IF v_reminder_created_by != auth.uid() AND v_user_role != 'owner' THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied');
    END IF;

    DELETE FROM item_reminders WHERE id = p_reminder_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

    -- Check permission (creator or owner)
    IF v_reminder.created_by != auth.uid() AND v_user_role != 'owner' THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied');
    END IF;

    -- Toggle status
    v_new_status := CASE
        WHEN v_reminder.status = 'active' THEN 'paused'::reminder_status_enum
        WHEN v_reminder.status = 'paused' THEN 'active'::reminder_status_enum
        ELSE v_reminder.status
    END;

    UPDATE item_reminders
    SET status = v_new_status, updated_at = NOW()
    WHERE id = p_reminder_id;

    RETURN json_build_object('success', true, 'new_status', v_new_status::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    IF v_user_role NOT IN ('owner', 'staff') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Staff role or higher required.');
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
    IF v_user_role NOT IN ('owner', 'staff') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Staff role or higher required.');
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

    -- Insert reminders for each item
    FOREACH v_item_id IN ARRAY p_item_ids LOOP
        -- Validate item belongs to tenant
        IF EXISTS (
            SELECT 1 FROM inventory_items
            WHERE id = v_item_id AND tenant_id = v_tenant_id AND deleted_at IS NULL
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
            ) ON CONFLICT DO NOTHING;

            IF FOUND THEN
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

CREATE OR REPLACE FUNCTION update_reminder(
    p_reminder_id UUID,
    p_source_type TEXT,
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
    IF v_user_role NOT IN ('owner', 'staff') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Staff role or higher required.');
    END IF;

    IF p_source_type = 'item' THEN
        SELECT * INTO v_reminder FROM item_reminders
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id;

        IF v_reminder IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Reminder not found');
        END IF;

        IF v_reminder.reminder_type = 'restock' AND p_scheduled_at IS NOT NULL THEN
            v_next_trigger := p_scheduled_at;
        ELSIF v_reminder.reminder_type = 'restock' THEN
            v_next_trigger := v_reminder.next_trigger_at;
        END IF;

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
        SELECT * INTO v_reminder FROM folder_reminders
        WHERE id = p_reminder_id AND tenant_id = v_tenant_id;

        IF v_reminder IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'Reminder not found');
        END IF;

        IF v_reminder.reminder_type = 'restock' AND p_scheduled_at IS NOT NULL THEN
            v_next_trigger := p_scheduled_at;
        ELSIF v_reminder.reminder_type = 'restock' THEN
            v_next_trigger := v_reminder.next_trigger_at;
        END IF;

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

CREATE OR REPLACE FUNCTION delete_reminder(
    p_reminder_id UUID,
    p_source_type TEXT
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
    IF v_user_role NOT IN ('owner', 'staff') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Staff role or higher required.');
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

CREATE OR REPLACE FUNCTION toggle_reminder(
    p_reminder_id UUID,
    p_source_type TEXT
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
    IF v_user_role NOT IN ('owner', 'staff') THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied. Staff role or higher required.');
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

GRANT EXECUTE ON FUNCTION create_item_reminder(UUID, TEXT, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_item_reminder(UUID, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_item_reminder(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_reminder_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_folder_reminder(UUID, TEXT, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_bulk_item_reminders(UUID[], TEXT, VARCHAR, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_reminder(UUID, TEXT, VARCHAR, TEXT, INTEGER, TEXT, INTEGER, TIMESTAMPTZ, TEXT, DATE, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_reminder(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_reminder(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 3. Reminder RLS policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view tenant reminders" ON item_reminders;
DROP POLICY IF EXISTS "Editors can create reminders" ON item_reminders;
DROP POLICY IF EXISTS "Users can update reminders" ON item_reminders;
DROP POLICY IF EXISTS "Users can delete reminders" ON item_reminders;

CREATE POLICY "Users can view tenant reminders" ON item_reminders
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can create reminders" ON item_reminders
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY "Users can update reminders" ON item_reminders
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND (created_by = auth.uid() OR user_has_role(ARRAY['owner']))
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND (created_by = auth.uid() OR user_has_role(ARRAY['owner']))
    );

CREATE POLICY "Users can delete reminders" ON item_reminders
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND (created_by = auth.uid() OR user_has_role(ARRAY['owner']))
    );

DROP POLICY IF EXISTS "Users can view folder reminders in their tenant" ON folder_reminders;
DROP POLICY IF EXISTS "Users can insert folder reminders in their tenant" ON folder_reminders;
DROP POLICY IF EXISTS "Users can update folder reminders in their tenant" ON folder_reminders;
DROP POLICY IF EXISTS "Users can delete folder reminders in their tenant" ON folder_reminders;

CREATE POLICY "Users can view folder reminders in their tenant" ON folder_reminders
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can insert folder reminders" ON folder_reminders
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY "Staff can update folder reminders" ON folder_reminders
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY "Staff can delete folder reminders" ON folder_reminders
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 4. Custom field folder policies (owner/staff manage)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view custom field folders" ON custom_field_folders;
DROP POLICY IF EXISTS "Admins can manage custom field folders" ON custom_field_folders;

CREATE POLICY "Users can view custom field folders" ON custom_field_folders
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff can manage custom field folders" ON custom_field_folders
    FOR ALL
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- ============================================================================
-- 5. RLS hardening for core business tables (prevent viewer writes)
-- ============================================================================

-- Customers
DROP POLICY IF EXISTS customers_tenant_isolation ON customers;

CREATE POLICY customers_read ON customers
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY customers_write ON customers
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY customers_update ON customers
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY customers_delete ON customers
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- Sales orders
DROP POLICY IF EXISTS sales_orders_tenant_isolation ON sales_orders;

CREATE POLICY sales_orders_read ON sales_orders
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY sales_orders_write ON sales_orders
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY sales_orders_update ON sales_orders
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY sales_orders_delete ON sales_orders
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS sales_order_items_via_parent ON sales_order_items;

CREATE POLICY sales_order_items_read ON sales_order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY sales_order_items_write ON sales_order_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY sales_order_items_update ON sales_order_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY sales_order_items_delete ON sales_order_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sales_orders so
            WHERE so.id = sales_order_items.sales_order_id
            AND so.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- Delivery orders
DROP POLICY IF EXISTS delivery_orders_tenant_isolation ON delivery_orders;

CREATE POLICY delivery_orders_read ON delivery_orders
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY delivery_orders_write ON delivery_orders
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY delivery_orders_update ON delivery_orders
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY delivery_orders_delete ON delivery_orders
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS delivery_order_items_via_parent ON delivery_order_items;

CREATE POLICY delivery_order_items_read ON delivery_order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM delivery_orders do
            WHERE do.id = delivery_order_items.delivery_order_id
            AND do.tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY delivery_order_items_write ON delivery_order_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM delivery_orders do
            WHERE do.id = delivery_order_items.delivery_order_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY delivery_order_items_update ON delivery_order_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM delivery_orders do
            WHERE do.id = delivery_order_items.delivery_order_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM delivery_orders do
            WHERE do.id = delivery_order_items.delivery_order_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY delivery_order_items_delete ON delivery_order_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM delivery_orders do
            WHERE do.id = delivery_order_items.delivery_order_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS delivery_order_item_serials_via_grandparent ON delivery_order_item_serials;

CREATE POLICY delivery_order_item_serials_read ON delivery_order_item_serials
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM delivery_order_items doi
            JOIN delivery_orders do ON do.id = doi.delivery_order_id
            WHERE doi.id = delivery_order_item_serials.delivery_order_item_id
            AND do.tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY delivery_order_item_serials_write ON delivery_order_item_serials
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM delivery_order_items doi
            JOIN delivery_orders do ON do.id = doi.delivery_order_id
            WHERE doi.id = delivery_order_item_serials.delivery_order_item_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY delivery_order_item_serials_update ON delivery_order_item_serials
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM delivery_order_items doi
            JOIN delivery_orders do ON do.id = doi.delivery_order_id
            WHERE doi.id = delivery_order_item_serials.delivery_order_item_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM delivery_order_items doi
            JOIN delivery_orders do ON do.id = doi.delivery_order_id
            WHERE doi.id = delivery_order_item_serials.delivery_order_item_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY delivery_order_item_serials_delete ON delivery_order_item_serials
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM delivery_order_items doi
            JOIN delivery_orders do ON do.id = doi.delivery_order_id
            WHERE doi.id = delivery_order_item_serials.delivery_order_item_id
            AND do.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- Invoices
DROP POLICY IF EXISTS invoices_tenant_isolation ON invoices;

CREATE POLICY invoices_read ON invoices
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY invoices_write ON invoices
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY invoices_update ON invoices
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY invoices_delete ON invoices
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS invoice_items_via_parent ON invoice_items;

CREATE POLICY invoice_items_read ON invoice_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY invoice_items_write ON invoice_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY invoice_items_update ON invoice_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY invoice_items_delete ON invoice_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.tenant_id = get_user_tenant_id()
        )
        AND user_has_role(ARRAY['owner', 'staff'])
    );

DROP POLICY IF EXISTS invoice_payments_tenant_isolation ON invoice_payments;

CREATE POLICY invoice_payments_read ON invoice_payments
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY invoice_payments_write ON invoice_payments
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY invoice_payments_update ON invoice_payments
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY invoice_payments_delete ON invoice_payments
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

-- Line item taxes
DROP POLICY IF EXISTS line_item_taxes_tenant_isolation ON line_item_taxes;

CREATE POLICY line_item_taxes_read ON line_item_taxes
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY line_item_taxes_write ON line_item_taxes
    FOR INSERT
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY line_item_taxes_update ON line_item_taxes
    FOR UPDATE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    )
    WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

CREATE POLICY line_item_taxes_delete ON line_item_taxes
    FOR DELETE
    USING (
        tenant_id = get_user_tenant_id()
        AND user_has_role(ARRAY['owner', 'staff'])
    );

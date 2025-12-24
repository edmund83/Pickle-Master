-- ============================================
-- Migration: Update get_item_reminders to include folder reminders
-- Purpose: Show folder-level reminders on individual item pages
-- ============================================

-- ============================================
-- 1. Update get_item_reminders Function
-- Returns UNION of item-specific reminders AND folder reminders that apply to the item
-- ============================================

CREATE OR REPLACE FUNCTION get_item_reminders(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_folder_id UUID;
BEGIN
    -- Get user's tenant_id
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN '[]'::json;
    END IF;

    -- Get the item's folder_id
    SELECT folder_id INTO v_folder_id
    FROM inventory_items
    WHERE id = p_item_id AND tenant_id = v_tenant_id AND deleted_at IS NULL;

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.source_type DESC, r.created_at DESC), '[]'::json)
        FROM (
            -- Item-specific reminders
            SELECT
                ir.id,
                ir.item_id,
                NULL::UUID as folder_id,
                'item'::text as source_type,
                NULL::text as folder_name,
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

            UNION ALL

            -- Folder reminders (only if item has a folder)
            SELECT
                fr.id,
                NULL::UUID as item_id,
                fr.folder_id,
                'folder'::text as source_type,
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
                            WHEN 'lte' THEN 'When quantity ≤ ' || fr.threshold
                            WHEN 'lt' THEN 'When quantity < ' || fr.threshold
                            WHEN 'gt' THEN 'When quantity > ' || fr.threshold
                            WHEN 'gte' THEN 'When quantity ≥ ' || fr.threshold
                            WHEN 'eq' THEN 'When quantity = ' || fr.threshold
                            ELSE 'When quantity drops below ' || fr.threshold
                        END
                    WHEN fr.reminder_type = 'expiry' THEN
                        fr.days_before_expiry || ' days before expiry'
                    WHEN fr.reminder_type = 'restock' THEN
                        CASE fr.recurrence
                            WHEN 'once' THEN 'One-time on ' || to_char(fr.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY HH24:MI')
                            ELSE initcap(fr.recurrence::text) || ' starting ' || to_char(fr.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY')
                        END
                END as trigger_description
            FROM folder_reminders fr
            LEFT JOIN profiles p ON p.id = fr.created_by
            LEFT JOIN folders f ON f.id = fr.folder_id
            WHERE fr.folder_id = v_folder_id
            AND fr.tenant_id = v_tenant_id
            AND v_folder_id IS NOT NULL
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 2. Grant Permissions
-- ============================================

GRANT EXECUTE ON FUNCTION get_item_reminders(UUID) TO authenticated;

-- ============================================
-- Migration: 00116_fix_serial_checkout_constraint.sql
-- Purpose: Fix upsert_item_serials to handle serials with checkout history
-- Issue: Cannot delete serials that have been used in checkouts due to FK constraint
-- ============================================

-- ===================
-- FIX upsert_item_serials FUNCTION
-- Now handles serials with checkout history by marking them as 'sold' instead of deleting
-- ===================
CREATE OR REPLACE FUNCTION upsert_item_serials(
    p_item_id UUID,
    p_serials TEXT[]
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
    v_serial TEXT;
    v_inserted INTEGER := 0;
    v_deleted INTEGER := 0;
    v_archived INTEGER := 0;
    v_existing TEXT[];
    v_serials_with_checkouts UUID[];
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

    -- Get existing serials
    SELECT ARRAY_AGG(serial_number) INTO v_existing
    FROM serial_numbers
    WHERE item_id = p_item_id AND tenant_id = v_tenant_id;

    -- Find serials that have checkout history (cannot be deleted due to FK constraint)
    SELECT ARRAY_AGG(DISTINCT sn.id) INTO v_serials_with_checkouts
    FROM serial_numbers sn
    WHERE sn.item_id = p_item_id
    AND sn.tenant_id = v_tenant_id
    AND sn.serial_number != ALL(COALESCE(p_serials, ARRAY[]::TEXT[]))
    AND EXISTS (
        SELECT 1 FROM checkout_serials cs WHERE cs.serial_id = sn.id
    );

    -- Archive serials with checkout history (mark as 'sold' instead of deleting)
    IF v_serials_with_checkouts IS NOT NULL AND array_length(v_serials_with_checkouts, 1) > 0 THEN
        UPDATE serial_numbers
        SET
            status = 'sold'::serial_status,
            notes = COALESCE(notes || E'\n', '') || 'Archived via serial update: ' || NOW()::TEXT,
            updated_at = NOW()
        WHERE id = ANY(v_serials_with_checkouts);

        GET DIAGNOSTICS v_archived = ROW_COUNT;
    END IF;

    -- Delete serials NOT in the new list AND without checkout history
    DELETE FROM serial_numbers
    WHERE item_id = p_item_id
    AND tenant_id = v_tenant_id
    AND serial_number != ALL(COALESCE(p_serials, ARRAY[]::TEXT[]))
    AND NOT EXISTS (
        SELECT 1 FROM checkout_serials cs WHERE cs.serial_id = serial_numbers.id
    );

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    -- Insert new serials (ignore duplicates)
    IF p_serials IS NOT NULL THEN
        FOREACH v_serial IN ARRAY p_serials
        LOOP
            IF v_serial IS NOT NULL AND TRIM(v_serial) != '' THEN
                INSERT INTO serial_numbers (tenant_id, item_id, serial_number, created_by)
                VALUES (v_tenant_id, p_item_id, TRIM(v_serial), auth.uid())
                ON CONFLICT (tenant_id, item_id, serial_number) DO UPDATE
                SET
                    -- Reactivate if it was previously archived
                    status = CASE
                        WHEN serial_numbers.status = 'sold' THEN 'available'::serial_status
                        ELSE serial_numbers.status
                    END,
                    updated_at = NOW();

                IF FOUND THEN
                    v_inserted := v_inserted + 1;
                END IF;
            END IF;
        END LOOP;
    END IF;

    -- Log activity if there were changes
    IF v_inserted > 0 OR v_deleted > 0 OR v_archived > 0 THEN
        INSERT INTO activity_logs (
            tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
            action_type, changes
        ) VALUES (
            v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
            'update_serials',
            jsonb_build_object(
                'serials_added', v_inserted,
                'serials_removed', v_deleted,
                'serials_archived', v_archived,
                'total_serials', (SELECT COUNT(*) FROM serial_numbers WHERE item_id = p_item_id AND tenant_id = v_tenant_id AND status = 'available')
            )
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'inserted', v_inserted,
        'deleted', v_deleted,
        'archived', v_archived,
        'total', (SELECT COUNT(*) FROM serial_numbers WHERE item_id = p_item_id AND tenant_id = v_tenant_id AND status = 'available')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- ADD FUNCTION: stock_in_serials
-- Allows adding serials without replacing existing ones (append mode)
-- ===================
CREATE OR REPLACE FUNCTION stock_in_serials(
    p_item_id UUID,
    p_serials TEXT[],
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_user_name VARCHAR;
    v_item_name VARCHAR;
    v_serial TEXT;
    v_inserted INTEGER := 0;
    v_duplicates INTEGER := 0;
BEGIN
    -- Get tenant and user info
    SELECT tenant_id, full_name INTO v_tenant_id, v_user_name
    FROM profiles WHERE id = auth.uid();

    -- Get item name and verify tracking mode
    SELECT name INTO v_item_name
    FROM inventory_items
    WHERE id = p_item_id
    AND tenant_id = v_tenant_id
    AND tracking_mode = 'serialized';

    IF v_item_name IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Item not found or not serialized');
    END IF;

    -- Insert new serials
    FOREACH v_serial IN ARRAY p_serials
    LOOP
        IF v_serial IS NOT NULL AND TRIM(v_serial) != '' THEN
            BEGIN
                INSERT INTO serial_numbers (tenant_id, item_id, serial_number, notes, created_by)
                VALUES (v_tenant_id, p_item_id, TRIM(v_serial), p_notes, auth.uid());
                v_inserted := v_inserted + 1;
            EXCEPTION WHEN unique_violation THEN
                -- Serial already exists, count as duplicate
                v_duplicates := v_duplicates + 1;
            END;
        END IF;
    END LOOP;

    -- Log activity if serials were added
    IF v_inserted > 0 THEN
        INSERT INTO activity_logs (
            tenant_id, user_id, user_name, entity_type, entity_id, entity_name,
            action_type, quantity_delta, changes
        ) VALUES (
            v_tenant_id, auth.uid(), v_user_name, 'item', p_item_id, v_item_name,
            'stock_in_serials',
            v_inserted,
            jsonb_build_object(
                'serials_added', v_inserted,
                'duplicates_skipped', v_duplicates,
                'notes', p_notes
            )
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'inserted', v_inserted,
        'duplicates', v_duplicates,
        'total', (SELECT COUNT(*) FROM serial_numbers WHERE item_id = p_item_id AND tenant_id = v_tenant_id AND status = 'available')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

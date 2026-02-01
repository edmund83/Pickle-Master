-- ============================================
-- Migration: 00017_fix_lot_functions_stable.sql
-- Purpose: Fix STABLE functions that incorrectly call update_expired_lots()
-- Issue: STABLE functions cannot perform writes, causing error 25006
-- Solution: Remove inline update_expired_lots() calls from read functions
--           Expiry status is already calculated in queries via CASE expressions
-- ============================================

-- ===================
-- FIX: get_item_lots
-- Remove PERFORM update_expired_lots() - queries already calculate expiry_status
-- ===================
CREATE OR REPLACE FUNCTION get_item_lots(
    p_item_id UUID,
    p_include_depleted BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
BEGIN
    -- Note: Removed update_expired_lots() call - STABLE functions cannot write
    -- The expiry_status is calculated dynamically in the query below

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.expiry_date ASC NULLS LAST), '[]'::json)
        FROM (
            SELECT
                l.id,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.manufactured_date,
                l.received_at,
                l.quantity,
                -- Return computed status based on actual date, not stored status
                CASE
                    WHEN l.expiry_date IS NOT NULL AND l.expiry_date < CURRENT_DATE THEN 'expired'::text
                    WHEN l.quantity = 0 THEN 'depleted'::text
                    ELSE l.status::text
                END as status,
                l.location_id,
                loc.name as location_name,
                CASE
                    WHEN l.expiry_date IS NULL THEN NULL
                    WHEN l.expiry_date < CURRENT_DATE THEN 0
                    ELSE l.expiry_date - CURRENT_DATE
                END as days_until_expiry,
                CASE
                    WHEN l.expiry_date IS NULL THEN 'no_expiry'
                    WHEN l.expiry_date < CURRENT_DATE THEN 'expired'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_month'
                    ELSE 'ok'
                END as expiry_status
            FROM lots l
            LEFT JOIN locations loc ON loc.id = l.location_id
            WHERE l.item_id = p_item_id
            AND l.tenant_id = get_user_tenant_id()
            AND (p_include_depleted OR l.status NOT IN ('depleted'))
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- FIX: get_location_lots
-- ===================
CREATE OR REPLACE FUNCTION get_location_lots(
    p_location_id UUID,
    p_expiring_only BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
BEGIN
    -- Note: Removed update_expired_lots() call - STABLE functions cannot write

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.expiry_date ASC NULLS LAST), '[]'::json)
        FROM (
            SELECT
                l.id,
                l.item_id,
                i.name as item_name,
                i.sku as item_sku,
                i.image_urls[1] as item_image,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.quantity,
                -- Return computed status
                CASE
                    WHEN l.expiry_date IS NOT NULL AND l.expiry_date < CURRENT_DATE THEN 'expired'::text
                    ELSE l.status::text
                END as status,
                CASE
                    WHEN l.expiry_date IS NULL THEN NULL
                    WHEN l.expiry_date < CURRENT_DATE THEN 0
                    ELSE l.expiry_date - CURRENT_DATE
                END as days_until_expiry
            FROM lots l
            JOIN inventory_items i ON i.id = l.item_id
            WHERE l.location_id = p_location_id
            AND l.tenant_id = get_user_tenant_id()
            -- Filter on stored status but include expired-by-date items
            AND (l.status = 'active' OR (l.expiry_date IS NOT NULL AND l.expiry_date < CURRENT_DATE))
            AND (NOT p_expiring_only OR (l.expiry_date IS NOT NULL AND l.expiry_date <= CURRENT_DATE + INTERVAL '30 days'))
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- FIX: get_expiring_lots
-- ===================
CREATE OR REPLACE FUNCTION get_expiring_lots(
    p_days INTEGER DEFAULT 30,
    p_location_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Note: Removed update_expired_lots() call - STABLE functions cannot write

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r) ORDER BY r.expiry_date ASC), '[]'::json)
        FROM (
            SELECT
                l.id as lot_id,
                l.item_id,
                i.name as item_name,
                i.sku as item_sku,
                i.image_urls[1] as item_image,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.quantity,
                -- Return computed status
                CASE
                    WHEN l.expiry_date < CURRENT_DATE THEN 'expired'::text
                    ELSE l.status::text
                END as status,
                l.location_id,
                loc.name as location_name,
                l.expiry_date - CURRENT_DATE as days_until_expiry,
                CASE
                    WHEN l.expiry_date < CURRENT_DATE THEN 'expired'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'critical'
                    WHEN l.expiry_date <= CURRENT_DATE + INTERVAL '14 days' THEN 'warning'
                    ELSE 'upcoming'
                END as urgency
            FROM lots l
            JOIN inventory_items i ON i.id = l.item_id
            LEFT JOIN locations loc ON loc.id = l.location_id
            WHERE l.tenant_id = tenant
            AND (l.status = 'active' OR (l.expiry_date IS NOT NULL AND l.expiry_date < CURRENT_DATE))
            AND l.expiry_date IS NOT NULL
            AND l.expiry_date <= CURRENT_DATE + (p_days || ' days')::INTERVAL
            AND l.quantity > 0
            AND (p_location_id IS NULL OR l.location_id = p_location_id)
        ) r
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- FIX: get_fefo_suggestion
-- ===================
CREATE OR REPLACE FUNCTION get_fefo_suggestion(
    p_item_id UUID,
    p_quantity_needed INTEGER,
    p_location_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    -- Note: Removed update_expired_lots() call - STABLE functions cannot write
    -- Expired lots are excluded from FEFO suggestions via WHERE clause

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
            SELECT
                l.id as lot_id,
                l.lot_number,
                l.batch_code,
                l.expiry_date,
                l.quantity as available_quantity,
                l.location_id,
                loc.name as location_name,
                LEAST(l.quantity, p_quantity_needed - COALESCE(
                    (SELECT SUM(quantity) FROM lots l2
                     WHERE l2.item_id = p_item_id
                     AND l2.status = 'active'
                     AND (l2.expiry_date IS NULL OR l2.expiry_date >= CURRENT_DATE)
                     AND l2.tenant_id = get_user_tenant_id()
                     AND (p_location_id IS NULL OR l2.location_id = p_location_id)
                     AND l2.quantity > 0
                     AND (l2.expiry_date < l.expiry_date OR (l2.expiry_date = l.expiry_date AND l2.id < l.id))),
                    0
                )) as pick_quantity
            FROM lots l
            LEFT JOIN locations loc ON loc.id = l.location_id
            WHERE l.item_id = p_item_id
            AND l.tenant_id = get_user_tenant_id()
            AND l.status = 'active'
            -- Exclude expired lots from FEFO suggestions
            AND (l.expiry_date IS NULL OR l.expiry_date >= CURRENT_DATE)
            AND l.quantity > 0
            AND (p_location_id IS NULL OR l.location_id = p_location_id)
            ORDER BY l.expiry_date ASC NULLS LAST, l.received_at ASC
        ) r
        WHERE r.pick_quantity > 0
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- FIX: get_expiring_lots_summary
-- ===================
CREATE OR REPLACE FUNCTION get_expiring_lots_summary()
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Note: Removed update_expired_lots() call - STABLE functions cannot write
    -- Expired count now includes both status='expired' and date-based expired

    RETURN json_build_object(
        'expired_count', (
            SELECT COUNT(*)
            FROM lots
            WHERE tenant_id = tenant
            AND (status = 'expired' OR (expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE))
            AND quantity > 0
        ),
        'expiring_7_days', (
            SELECT COUNT(*)
            FROM lots
            WHERE tenant_id = tenant
            AND status = 'active'
            AND expiry_date IS NOT NULL
            AND expiry_date >= CURRENT_DATE
            AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
            AND quantity > 0
        ),
        'expiring_30_days', (
            SELECT COUNT(*)
            FROM lots
            WHERE tenant_id = tenant
            AND status = 'active'
            AND expiry_date IS NOT NULL
            AND expiry_date > CURRENT_DATE + INTERVAL '7 days'
            AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            AND quantity > 0
        ),
        'total_value_at_risk', (
            SELECT COALESCE(SUM(l.quantity * COALESCE(i.cost_price, i.price, 0)), 0)
            FROM lots l
            JOIN inventory_items i ON i.id = l.item_id
            WHERE l.tenant_id = tenant
            AND (l.status IN ('active', 'expired') OR (l.expiry_date IS NOT NULL AND l.expiry_date < CURRENT_DATE))
            AND l.expiry_date IS NOT NULL
            AND l.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            AND l.quantity > 0
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===================
-- OPTIONAL: Create a scheduled function to update expired status
-- This can be called by a cron job (e.g., pg_cron) or application scheduler
-- ===================
COMMENT ON FUNCTION update_expired_lots() IS
'Updates the status column of expired lots.
Call this function via a scheduled job (pg_cron) or application scheduler, not from read queries.
The STABLE read functions now calculate expiry status dynamically without calling this function.';

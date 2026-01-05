-- Migration: SQL Aggregation Functions for Trends Page
-- Purpose: Move aggregation from JavaScript to PostgreSQL for better performance
-- This eliminates loading all activity logs and processing in the browser

-- Function 1: Get activity count by day for the last N days
CREATE OR REPLACE FUNCTION get_activity_by_day(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  activity_date DATE,
  activity_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::date AS day
  )
  SELECT
    ds.day AS activity_date,
    COALESCE(COUNT(al.id), 0)::BIGINT AS activity_count
  FROM date_series ds
  LEFT JOIN activity_logs al ON
    DATE(al.created_at) = ds.day
    AND al.tenant_id = p_tenant_id
  GROUP BY ds.day
  ORDER BY ds.day;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function 2: Get action type breakdown with counts and percentages
CREATE OR REPLACE FUNCTION get_action_breakdown(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  action_type TEXT,
  action_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  v_total BIGINT;
BEGIN
  -- Get total count first
  SELECT COUNT(*) INTO v_total
  FROM activity_logs
  WHERE tenant_id = p_tenant_id
    AND created_at >= CURRENT_DATE - p_days;

  RETURN QUERY
  SELECT
    al.action_type::TEXT,
    COUNT(*)::BIGINT AS action_count,
    CASE
      WHEN v_total > 0 THEN ROUND(COUNT(*)::NUMERIC / v_total * 100, 1)
      ELSE 0::NUMERIC
    END AS percentage
  FROM activity_logs al
  WHERE al.tenant_id = p_tenant_id
    AND al.created_at >= CURRENT_DATE - p_days
  GROUP BY al.action_type
  ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function 3: Get most active items by activity count
CREATE OR REPLACE FUNCTION get_most_active_items(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  entity_id UUID,
  entity_name TEXT,
  activity_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.entity_id,
    MAX(al.entity_name)::TEXT AS entity_name,
    COUNT(*)::BIGINT AS activity_count
  FROM activity_logs al
  WHERE al.tenant_id = p_tenant_id
    AND al.created_at >= CURRENT_DATE - p_days
    AND al.entity_type = 'item'
    AND al.entity_id IS NOT NULL
  GROUP BY al.entity_id
  ORDER BY activity_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function 4: Get week-over-week comparison stats
CREATE OR REPLACE FUNCTION get_weekly_comparison(
  p_tenant_id UUID
)
RETURNS TABLE (
  this_week_count BIGINT,
  last_week_count BIGINT,
  change_percent NUMERIC
) AS $$
DECLARE
  v_this_week BIGINT;
  v_last_week BIGINT;
BEGIN
  -- Count activities from this week
  SELECT COUNT(*) INTO v_this_week
  FROM activity_logs
  WHERE tenant_id = p_tenant_id
    AND created_at >= CURRENT_DATE - 7;

  -- Count activities from last week
  SELECT COUNT(*) INTO v_last_week
  FROM activity_logs
  WHERE tenant_id = p_tenant_id
    AND created_at >= CURRENT_DATE - 14
    AND created_at < CURRENT_DATE - 7;

  RETURN QUERY
  SELECT
    v_this_week,
    v_last_week,
    CASE
      WHEN v_last_week > 0 THEN
        ROUND((v_this_week - v_last_week)::NUMERIC / v_last_week * 100, 1)
      ELSE 0::NUMERIC
    END AS change_percent;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_activity_by_day TO authenticated;
GRANT EXECUTE ON FUNCTION get_action_breakdown TO authenticated;
GRANT EXECUTE ON FUNCTION get_most_active_items TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_comparison TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION get_activity_by_day IS
  'Returns activity counts per day for the last N days. Used by trends page.';

COMMENT ON FUNCTION get_action_breakdown IS
  'Returns action type breakdown with counts and percentages. Used by trends page.';

COMMENT ON FUNCTION get_most_active_items IS
  'Returns most active items by activity count. Used by trends page.';

COMMENT ON FUNCTION get_weekly_comparison IS
  'Returns week-over-week activity comparison. Used by trends page.';

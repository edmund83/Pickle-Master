-- Ensure trends report RPCs are tenant-scoped (defense in depth)
-- These functions are SECURITY DEFINER; enforce caller tenant via get_user_tenant_id().

-- 1) get_activity_by_day
CREATE OR REPLACE FUNCTION get_activity_by_day(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  activity_date DATE,
  activity_count BIGINT
) AS $$
DECLARE
  tenant UUID := get_user_tenant_id();
BEGIN
  IF p_tenant_id IS NOT NULL AND p_tenant_id <> tenant THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

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
    AND al.tenant_id = tenant
  GROUP BY ds.day
  ORDER BY ds.day;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2) get_action_breakdown
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
  tenant UUID := get_user_tenant_id();
  v_total BIGINT;
BEGIN
  IF p_tenant_id IS NOT NULL AND p_tenant_id <> tenant THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM activity_logs
  WHERE tenant_id = tenant
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
  WHERE al.tenant_id = tenant
    AND al.created_at >= CURRENT_DATE - p_days
  GROUP BY al.action_type
  ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3) get_most_active_items
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
DECLARE
  tenant UUID := get_user_tenant_id();
BEGIN
  IF p_tenant_id IS NOT NULL AND p_tenant_id <> tenant THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    al.entity_id,
    MAX(al.entity_name)::TEXT AS entity_name,
    COUNT(*)::BIGINT AS activity_count
  FROM activity_logs al
  WHERE al.tenant_id = tenant
    AND al.created_at >= CURRENT_DATE - p_days
    AND al.entity_type = 'item'
    AND al.entity_id IS NOT NULL
  GROUP BY al.entity_id
  ORDER BY activity_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4) get_weekly_comparison
CREATE OR REPLACE FUNCTION get_weekly_comparison(
  p_tenant_id UUID
)
RETURNS TABLE (
  this_week_count BIGINT,
  last_week_count BIGINT,
  change_percent NUMERIC
) AS $$
DECLARE
  tenant UUID := get_user_tenant_id();
  v_this_week BIGINT;
  v_last_week BIGINT;
BEGIN
  IF p_tenant_id IS NOT NULL AND p_tenant_id <> tenant THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COUNT(*) INTO v_this_week
  FROM activity_logs
  WHERE tenant_id = tenant
    AND created_at >= CURRENT_DATE - 7;

  SELECT COUNT(*) INTO v_last_week
  FROM activity_logs
  WHERE tenant_id = tenant
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

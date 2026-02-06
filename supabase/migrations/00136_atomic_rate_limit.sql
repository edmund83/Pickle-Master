-- ============================================
-- Migration: 00136_atomic_rate_limit.sql
-- Purpose: Make rate limit check-and-increment atomic (single upsert)
-- ============================================

-- 1. Merge existing rows to one per (tenant_id, operation, window_start)
CREATE TEMP TABLE IF NOT EXISTS rate_limit_agg AS
SELECT tenant_id, operation, window_start, SUM(count)::int AS count
FROM rate_limit_logs
GROUP BY tenant_id, operation, window_start;

TRUNCATE rate_limit_logs;

INSERT INTO rate_limit_logs (tenant_id, operation, count, window_start)
SELECT tenant_id, operation, count, window_start FROM rate_limit_agg;

-- 2. Enforce one row per window
ALTER TABLE rate_limit_logs
DROP CONSTRAINT IF EXISTS uq_rate_limit_tenant_op_window;
ALTER TABLE rate_limit_logs
ADD CONSTRAINT uq_rate_limit_tenant_op_window UNIQUE (tenant_id, operation, window_start);

-- 3. Atomic check-and-increment: upsert then check
CREATE OR REPLACE FUNCTION check_rate_limit(p_operation VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_max_requests INTEGER;
    v_window_minutes INTEGER;
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
    v_reset_at TIMESTAMPTZ;
BEGIN
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('allowed', false, 'error', 'Not authenticated');
    END IF;

    SELECT max_requests, window_minutes
    INTO v_max_requests, v_window_minutes
    FROM tenant_rate_limits
    WHERE tenant_id = v_tenant_id AND operation = p_operation;

    IF v_max_requests IS NULL THEN
        RETURN json_build_object('allowed', true, 'remaining', -1);
    END IF;

    v_window_start := date_trunc('minute', NOW());

    -- Atomic upsert: insert or increment in one step
    INSERT INTO rate_limit_logs (tenant_id, operation, count, window_start)
    VALUES (v_tenant_id, p_operation, 1, v_window_start)
    ON CONFLICT (tenant_id, operation, window_start)
    DO UPDATE SET count = rate_limit_logs.count + 1
    RETURNING count INTO v_current_count;

    IF v_current_count > v_max_requests THEN
        v_reset_at := v_window_start + (v_window_minutes || ' minutes')::INTERVAL;
        RETURN json_build_object(
            'allowed', false,
            'error', format('Rate limit exceeded. Max %s requests per %s minutes.', v_max_requests, v_window_minutes),
            'remaining', 0,
            'reset_at', v_reset_at
        );
    END IF;

    RETURN json_build_object(
        'allowed', true,
        'remaining', v_max_requests - v_current_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_rate_limit(VARCHAR) TO authenticated;

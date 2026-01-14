-- ============================================
-- Migration: 00062_rate_limiting.sql
-- Purpose: Per-tenant rate limiting for expensive operations
-- ============================================

-- ===========================================
-- PART 1: RATE LIMIT TRACKING TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('minute', NOW()),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_tenant_op_window
ON rate_limit_logs (tenant_id, operation, window_start);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_start
ON rate_limit_logs (window_start);

-- RLS: Rate limits are system-managed, only viewable by admins
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view rate limit logs" ON rate_limit_logs;
CREATE POLICY "Admins can view rate limit logs" ON rate_limit_logs
    FOR SELECT USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );


-- ===========================================
-- PART 2: TENANT RATE LIMITS CONFIGURATION
-- ===========================================

CREATE TABLE IF NOT EXISTS tenant_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL,
    max_requests INTEGER NOT NULL,
    window_minutes INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, operation)
);

-- RLS: Admins can view and manage rate limits
ALTER TABLE tenant_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view tenant rate limits" ON tenant_rate_limits;
CREATE POLICY "Admins can view tenant rate limits" ON tenant_rate_limits
    FOR SELECT USING (
        tenant_id = get_user_tenant_id()
    );

DROP POLICY IF EXISTS "Admins can manage tenant rate limits" ON tenant_rate_limits;
CREATE POLICY "Admins can manage tenant rate limits" ON tenant_rate_limits
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );


-- ===========================================
-- PART 3: DEFAULT RATE LIMITS
-- Insert default limits for existing tenants
-- ===========================================

INSERT INTO tenant_rate_limits (tenant_id, operation, max_requests, window_minutes)
SELECT t.id, op.name, op.default_limit, op.window_minutes
FROM tenants t
CROSS JOIN (VALUES
    ('bulk_import', 10, 60),
    ('report_generation', 20, 60),
    ('export', 30, 60),
    ('global_search', 100, 60)
) AS op(name, default_limit, window_minutes)
ON CONFLICT (tenant_id, operation) DO NOTHING;


-- ===========================================
-- PART 4: RATE LIMIT CHECK FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION check_rate_limit(p_operation VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_max_requests INTEGER;
    v_window_minutes INTEGER;
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
BEGIN
    -- Get tenant ID
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('allowed', false, 'error', 'Not authenticated');
    END IF;

    -- Get limits for this operation
    SELECT max_requests, window_minutes
    INTO v_max_requests, v_window_minutes
    FROM tenant_rate_limits
    WHERE tenant_id = v_tenant_id AND operation = p_operation;

    -- No limit configured = unlimited
    IF v_max_requests IS NULL THEN
        RETURN json_build_object('allowed', true, 'remaining', -1);
    END IF;

    v_window_start := NOW() - (v_window_minutes || ' minutes')::INTERVAL;

    -- Count requests in current window
    SELECT COALESCE(SUM(count), 0) INTO v_current_count
    FROM rate_limit_logs
    WHERE tenant_id = v_tenant_id
      AND operation = p_operation
      AND window_start >= v_window_start;

    IF v_current_count >= v_max_requests THEN
        RETURN json_build_object(
            'allowed', false,
            'error', format('Rate limit exceeded. Max %s requests per %s minutes.', v_max_requests, v_window_minutes),
            'remaining', 0,
            'reset_at', v_window_start + (v_window_minutes || ' minutes')::INTERVAL
        );
    END IF;

    -- Increment counter
    INSERT INTO rate_limit_logs (tenant_id, operation, count, window_start)
    VALUES (v_tenant_id, p_operation, 1, date_trunc('minute', NOW()));

    RETURN json_build_object(
        'allowed', true,
        'remaining', v_max_requests - v_current_count - 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION check_rate_limit(VARCHAR) TO authenticated;


-- ===========================================
-- PART 5: RATE LIMIT CLEANUP FUNCTION
-- Call periodically to clean up old records
-- ===========================================

CREATE OR REPLACE FUNCTION cleanup_rate_limit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM rate_limit_logs
    WHERE window_start < NOW() - INTERVAL '24 hours';

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===========================================
-- PART 6: TRIGGER TO AUTO-SET RATE LIMITS FOR NEW TENANTS
-- ===========================================

CREATE OR REPLACE FUNCTION set_default_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tenant_rate_limits (tenant_id, operation, max_requests, window_minutes)
    VALUES
        (NEW.id, 'bulk_import', 10, 60),
        (NEW.id, 'report_generation', 20, 60),
        (NEW.id, 'export', 30, 60),
        (NEW.id, 'global_search', 100, 60);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_default_rate_limits ON tenants;
CREATE TRIGGER tr_set_default_rate_limits
AFTER INSERT ON tenants
FOR EACH ROW
EXECUTE FUNCTION set_default_rate_limits();


-- ===========================================
-- ROLLBACK SCRIPT (for reference)
-- ===========================================
-- DROP TRIGGER IF EXISTS tr_set_default_rate_limits ON tenants;
-- DROP FUNCTION IF EXISTS set_default_rate_limits();
-- DROP FUNCTION IF EXISTS cleanup_rate_limit_logs();
-- DROP FUNCTION IF EXISTS check_rate_limit(VARCHAR);
-- DROP TABLE IF EXISTS tenant_rate_limits;
-- DROP TABLE IF EXISTS rate_limit_logs;

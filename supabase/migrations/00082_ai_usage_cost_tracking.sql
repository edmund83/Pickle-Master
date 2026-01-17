-- ============================================
-- Migration: 00082_ai_usage_cost_tracking.sql
-- Purpose: Track AI usage costs per user with $0.05/month limit (~100-160 questions)
-- ============================================

-- ===========================================
-- PART 1: USAGE TRACKING TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Token tracking
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,

    -- Cost tracking (in USD, 6 decimal places for micro-billing)
    cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,

    -- Model info for accurate pricing
    model_name VARCHAR(100),
    operation VARCHAR(50) NOT NULL DEFAULT 'ai_chat',

    -- Time tracking (monthly periods)
    period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_period
ON ai_usage_tracking (user_id, period_start);

CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant_period
ON ai_usage_tracking (tenant_id, period_start);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at
ON ai_usage_tracking (created_at);

-- ===========================================
-- PART 2: USER USAGE LIMITS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Monthly limit in USD (default $0.05 = ~100-160 questions with Gemini Flash)
    monthly_limit_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.05,

    -- Soft limit warning threshold (default 80%)
    warning_threshold NUMERIC(3, 2) NOT NULL DEFAULT 0.80,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_limits_tenant ON ai_usage_limits (tenant_id);

-- ===========================================
-- PART 3: RLS POLICIES
-- ===========================================

ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
DROP POLICY IF EXISTS "Users can view own AI usage" ON ai_usage_tracking;
CREATE POLICY "Users can view own AI usage" ON ai_usage_tracking
    FOR SELECT USING (user_id = auth.uid());

-- System can insert usage (via security definer function)
DROP POLICY IF EXISTS "System can track AI usage" ON ai_usage_tracking;
CREATE POLICY "System can track AI usage" ON ai_usage_tracking
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own limits
DROP POLICY IF EXISTS "Users can view own AI limits" ON ai_usage_limits;
CREATE POLICY "Users can view own AI limits" ON ai_usage_limits
    FOR SELECT USING (user_id = auth.uid());

-- Admins can view all limits for their tenant
DROP POLICY IF EXISTS "Admins can view tenant AI limits" ON ai_usage_limits;
CREATE POLICY "Admins can view tenant AI limits" ON ai_usage_limits
    FOR SELECT USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Admins can manage limits for their tenant
DROP POLICY IF EXISTS "Admins can manage AI limits" ON ai_usage_limits;
CREATE POLICY "Admins can manage AI limits" ON ai_usage_limits
    FOR ALL USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ===========================================
-- PART 4: CHECK USAGE LIMIT FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION check_ai_usage_limit(
    p_estimated_cost NUMERIC DEFAULT 0.0003 -- ~1 standard question with Gemini Flash
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
    v_monthly_limit NUMERIC(10, 4);
    v_warning_threshold NUMERIC(3, 2);
    v_current_usage NUMERIC(10, 6);
    v_period_start DATE;
    v_remaining NUMERIC(10, 6);
    v_usage_percent NUMERIC(5, 2);
BEGIN
    v_user_id := auth.uid();
    v_tenant_id := get_user_tenant_id();
    v_period_start := date_trunc('month', CURRENT_DATE)::DATE;

    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'allowed', false,
            'error', 'Not authenticated',
            'status', 401
        );
    END IF;

    -- Get user's limit (or default $0.05)
    SELECT COALESCE(monthly_limit_usd, 0.05), COALESCE(warning_threshold, 0.80)
    INTO v_monthly_limit, v_warning_threshold
    FROM ai_usage_limits
    WHERE user_id = v_user_id;

    -- Use default if no record exists
    IF v_monthly_limit IS NULL THEN
        v_monthly_limit := 0.05;
        v_warning_threshold := 0.80;
    END IF;

    -- Get current month's usage
    SELECT COALESCE(SUM(cost_usd), 0)
    INTO v_current_usage
    FROM ai_usage_tracking
    WHERE user_id = v_user_id
      AND period_start = v_period_start;

    v_remaining := v_monthly_limit - v_current_usage;
    v_usage_percent := CASE
        WHEN v_monthly_limit > 0 THEN (v_current_usage / v_monthly_limit) * 100
        ELSE 0
    END;

    -- Check if would exceed limit
    IF v_current_usage + p_estimated_cost > v_monthly_limit THEN
        RETURN json_build_object(
            'allowed', false,
            'error', format('Monthly AI limit reached. Resets on %s.',
                (v_period_start + INTERVAL '1 month')::DATE),
            'status', 429,
            'usage', json_build_object(
                'current_usd', ROUND(v_current_usage::NUMERIC, 4),
                'limit_usd', v_monthly_limit,
                'remaining_usd', GREATEST(0, ROUND(v_remaining::NUMERIC, 4)),
                'usage_percent', ROUND(v_usage_percent, 1),
                'resets_at', (v_period_start + INTERVAL '1 month')::DATE
            )
        );
    END IF;

    -- Return allowed with warning flag if approaching limit
    RETURN json_build_object(
        'allowed', true,
        'status', 200,
        'warning', v_current_usage >= (v_monthly_limit * v_warning_threshold),
        'usage', json_build_object(
            'current_usd', ROUND(v_current_usage::NUMERIC, 4),
            'limit_usd', v_monthly_limit,
            'remaining_usd', ROUND(v_remaining::NUMERIC, 4),
            'usage_percent', ROUND(v_usage_percent, 1),
            'resets_at', (v_period_start + INTERVAL '1 month')::DATE
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_ai_usage_limit(NUMERIC) TO authenticated;

-- ===========================================
-- PART 5: TRACK USAGE FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION track_ai_usage(
    p_input_tokens INTEGER,
    p_output_tokens INTEGER,
    p_model_name VARCHAR DEFAULT 'gemini-1.5-flash',
    p_operation VARCHAR DEFAULT 'ai_chat'
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
    v_cost_usd NUMERIC(10, 6);
    v_period_start DATE;
    v_input_rate NUMERIC(12, 10);
    v_output_rate NUMERIC(12, 10);
BEGIN
    v_user_id := auth.uid();
    v_tenant_id := get_user_tenant_id();
    v_period_start := date_trunc('month', CURRENT_DATE)::DATE;

    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Calculate cost based on model (prices per token, derived from per-1M rates)
    -- Gemini 1.5 Flash: $0.075/1M input, $0.30/1M output
    CASE
        WHEN p_model_name ILIKE '%gemini%flash%' THEN
            v_input_rate := 0.000000075;  -- $0.075/1M
            v_output_rate := 0.0000003;   -- $0.30/1M
        WHEN p_model_name ILIKE '%gemini%pro%' THEN
            v_input_rate := 0.00000125;   -- $1.25/1M
            v_output_rate := 0.000005;    -- $5.00/1M
        WHEN p_model_name ILIKE '%gpt-4o-mini%' THEN
            v_input_rate := 0.00000015;   -- $0.15/1M
            v_output_rate := 0.0000006;   -- $0.60/1M
        WHEN p_model_name ILIKE '%gpt-4o%' THEN
            v_input_rate := 0.0000025;    -- $2.50/1M
            v_output_rate := 0.00001;     -- $10.00/1M
        WHEN p_model_name ILIKE '%claude-3.5-sonnet%' THEN
            v_input_rate := 0.000003;     -- $3.00/1M
            v_output_rate := 0.000015;    -- $15.00/1M
        WHEN p_model_name ILIKE '%claude-3-haiku%' THEN
            v_input_rate := 0.00000025;   -- $0.25/1M
            v_output_rate := 0.00000125;  -- $1.25/1M
        ELSE
            -- Default to Gemini Flash rates (most common)
            v_input_rate := 0.000000075;
            v_output_rate := 0.0000003;
    END CASE;

    v_cost_usd := (p_input_tokens * v_input_rate) + (p_output_tokens * v_output_rate);

    -- Insert usage record
    INSERT INTO ai_usage_tracking (
        user_id, tenant_id, input_tokens, output_tokens,
        cost_usd, model_name, operation, period_start
    )
    VALUES (
        v_user_id, v_tenant_id, p_input_tokens, p_output_tokens,
        v_cost_usd, p_model_name, p_operation, v_period_start
    );

    RETURN json_build_object(
        'success', true,
        'cost_usd', ROUND(v_cost_usd::NUMERIC, 6),
        'input_tokens', p_input_tokens,
        'output_tokens', p_output_tokens
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION track_ai_usage(INTEGER, INTEGER, VARCHAR, VARCHAR) TO authenticated;

-- ===========================================
-- PART 6: GET USER USAGE SUMMARY
-- ===========================================

CREATE OR REPLACE FUNCTION get_ai_usage_summary()
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_period_start DATE;
    v_current_usage NUMERIC(10, 6);
    v_monthly_limit NUMERIC(10, 4);
    v_total_tokens INTEGER;
    v_request_count INTEGER;
BEGIN
    v_user_id := auth.uid();
    v_period_start := date_trunc('month', CURRENT_DATE)::DATE;

    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get limit
    SELECT COALESCE(monthly_limit_usd, 0.05)
    INTO v_monthly_limit
    FROM ai_usage_limits
    WHERE user_id = v_user_id;

    IF v_monthly_limit IS NULL THEN
        v_monthly_limit := 0.05;
    END IF;

    -- Get usage stats
    SELECT
        COALESCE(SUM(cost_usd), 0),
        COALESCE(SUM(input_tokens + output_tokens), 0),
        COUNT(*)
    INTO v_current_usage, v_total_tokens, v_request_count
    FROM ai_usage_tracking
    WHERE user_id = v_user_id
      AND period_start = v_period_start;

    RETURN json_build_object(
        'current_usd', ROUND(v_current_usage::NUMERIC, 4),
        'limit_usd', v_monthly_limit,
        'remaining_usd', ROUND(GREATEST(0, v_monthly_limit - v_current_usage)::NUMERIC, 4),
        'usage_percent', ROUND(CASE WHEN v_monthly_limit > 0 THEN (v_current_usage / v_monthly_limit * 100) ELSE 0 END::NUMERIC, 1),
        'total_tokens', v_total_tokens,
        'request_count', v_request_count,
        'period_start', v_period_start,
        'resets_at', (v_period_start + INTERVAL '1 month')::DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_ai_usage_summary() TO authenticated;

-- ===========================================
-- PART 7: AUTO-CREATE LIMITS FOR NEW USERS
-- ===========================================

CREATE OR REPLACE FUNCTION set_default_ai_usage_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ai_usage_limits (user_id, tenant_id, monthly_limit_usd)
    VALUES (NEW.id, NEW.tenant_id, 0.05)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_default_ai_usage_limits ON profiles;
CREATE TRIGGER tr_set_default_ai_usage_limits
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_default_ai_usage_limits();

-- Backfill existing users
INSERT INTO ai_usage_limits (user_id, tenant_id, monthly_limit_usd)
SELECT id, tenant_id, 0.05 FROM profiles
WHERE tenant_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- ===========================================
-- PART 8: CLEANUP OLD RECORDS (keep 3 months)
-- ===========================================

CREATE OR REPLACE FUNCTION cleanup_ai_usage_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM ai_usage_tracking
    WHERE period_start < date_trunc('month', CURRENT_DATE - INTERVAL '3 months')::DATE;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- PART 9: ADMIN FUNCTION TO ADJUST USER LIMITS
-- ===========================================

CREATE OR REPLACE FUNCTION set_user_ai_limit(
    p_user_id UUID,
    p_monthly_limit_usd NUMERIC
)
RETURNS JSON AS $$
DECLARE
    v_admin_tenant_id UUID;
    v_user_tenant_id UUID;
BEGIN
    v_admin_tenant_id := get_user_tenant_id();

    -- Get target user's tenant
    SELECT tenant_id INTO v_user_tenant_id
    FROM profiles WHERE id = p_user_id;

    -- Verify admin permission and same tenant
    IF v_admin_tenant_id IS NULL OR v_admin_tenant_id != v_user_tenant_id THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('owner', 'admin')
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Admin access required');
    END IF;

    -- Update or insert limit
    INSERT INTO ai_usage_limits (user_id, tenant_id, monthly_limit_usd, updated_at)
    VALUES (p_user_id, v_user_tenant_id, p_monthly_limit_usd, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        monthly_limit_usd = EXCLUDED.monthly_limit_usd,
        updated_at = NOW();

    RETURN json_build_object('success', true, 'new_limit', p_monthly_limit_usd);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_user_ai_limit(UUID, NUMERIC) TO authenticated;


-- ===========================================
-- ROLLBACK SCRIPT (for reference)
-- ===========================================
-- DROP TRIGGER IF EXISTS tr_set_default_ai_usage_limits ON profiles;
-- DROP FUNCTION IF EXISTS set_default_ai_usage_limits();
-- DROP FUNCTION IF EXISTS cleanup_ai_usage_logs();
-- DROP FUNCTION IF EXISTS get_ai_usage_summary();
-- DROP FUNCTION IF EXISTS track_ai_usage(INTEGER, INTEGER, VARCHAR, VARCHAR);
-- DROP FUNCTION IF EXISTS check_ai_usage_limit(NUMERIC);
-- DROP FUNCTION IF EXISTS set_user_ai_limit(UUID, NUMERIC);
-- DROP TABLE IF EXISTS ai_usage_limits;
-- DROP TABLE IF EXISTS ai_usage_tracking;

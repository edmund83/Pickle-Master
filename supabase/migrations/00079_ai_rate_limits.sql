-- ============================================
-- Migration: 00079_ai_rate_limits.sql
-- Purpose: Add rate limits for AI operations
-- ============================================

-- ===========================================
-- PART 1: ADD AI RATE LIMITS FOR EXISTING TENANTS
-- ===========================================

INSERT INTO tenant_rate_limits (tenant_id, operation, max_requests, window_minutes)
SELECT t.id, op.name, op.default_limit, op.window_minutes
FROM tenants t
CROSS JOIN (VALUES
    ('ai_insights', 30, 60),
    ('ai_chat', 60, 60)
) AS op(name, default_limit, window_minutes)
ON CONFLICT (tenant_id, operation) DO NOTHING;


-- ===========================================
-- PART 2: UPDATE TRIGGER FOR NEW TENANTS
-- ===========================================

CREATE OR REPLACE FUNCTION set_default_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tenant_rate_limits (tenant_id, operation, max_requests, window_minutes)
    VALUES
        (NEW.id, 'bulk_import', 10, 60),
        (NEW.id, 'report_generation', 20, 60),
        (NEW.id, 'export', 30, 60),
        (NEW.id, 'global_search', 100, 60),
        (NEW.id, 'ai_insights', 30, 60),
        (NEW.id, 'ai_chat', 60, 60);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ===========================================
-- ROLLBACK SCRIPT (for reference)
-- ===========================================
-- DELETE FROM tenant_rate_limits WHERE operation IN ('ai_insights', 'ai_chat');

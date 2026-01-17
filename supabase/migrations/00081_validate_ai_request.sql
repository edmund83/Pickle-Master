-- ============================================
-- Migration: Validate AI Request RPC Function
-- Purpose: Single RPC call to validate auth + rate limit + get tenant
-- Impact: Reduces 3 API calls to 1
-- ============================================

-- 1. Combined validation function for AI requests
CREATE OR REPLACE FUNCTION validate_ai_request(
    p_operation VARCHAR DEFAULT 'ai_chat'
) RETURNS JSON AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_tenant_id UUID;
    v_rate_check JSON;
BEGIN
    -- Check auth
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'allowed', FALSE,
            'error', 'Unauthorized',
            'status', 401
        );
    END IF;

    -- Get tenant (and cache it for this transaction)
    SELECT tenant_id INTO v_tenant_id
    FROM profiles
    WHERE id = v_user_id;

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object(
            'allowed', FALSE,
            'error', 'No tenant found',
            'status', 400
        );
    END IF;

    -- Cache tenant for subsequent RLS checks
    PERFORM set_config('app.current_tenant_id', v_tenant_id::text, true);

    -- Check rate limit
    v_rate_check := check_rate_limit(p_operation);

    IF NOT (v_rate_check->>'allowed')::BOOLEAN THEN
        RETURN json_build_object(
            'allowed', FALSE,
            'error', COALESCE(v_rate_check->>'error', 'Rate limit exceeded'),
            'status', 429,
            'remaining', 0,
            'reset_at', v_rate_check->>'reset_at'
        );
    END IF;

    -- Success: return tenant info and rate limit status
    RETURN json_build_object(
        'allowed', TRUE,
        'tenant_id', v_tenant_id,
        'remaining', (v_rate_check->>'remaining')::INT,
        'status', 200
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant execute permission
GRANT EXECUTE ON FUNCTION validate_ai_request TO authenticated;

-- 3. Add comment for documentation
COMMENT ON FUNCTION validate_ai_request IS
'Validates an AI request in a single RPC call.
Combines: auth check + profile/tenant fetch + rate limit check.
Reduces 3 separate API calls to 1.
Returns: { allowed, tenant_id, remaining, status } on success
Returns: { allowed: false, error, status } on failure';

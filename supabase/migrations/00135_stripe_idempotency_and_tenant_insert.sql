-- ============================================
-- Migration: 00135_stripe_idempotency_and_tenant_insert.sql
-- Purpose: High #4 Stripe webhook idempotency; High #5 restrict tenants INSERT
-- ============================================

-- ============================================================================
-- 1. STRIPE WEBHOOK IDEMPOTENCY (High #4)
-- Store processed Stripe event IDs so retries are safe.
-- ============================================================================
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE stripe_webhook_events IS 'Processed Stripe webhook event IDs for idempotency; retain to avoid duplicate subscription updates on retry';

-- Optional: prevent table from being queried by app users (webhook uses service role)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for stripe_webhook_events"
  ON stripe_webhook_events FOR ALL
  USING (false);

-- ============================================================================
-- 2. RESTRICT TENANTS INSERT (High #5)
-- Only allow tenant creation when the user does not already have a tenant
-- (signup flow). Blocks existing authenticated users from creating extra tenants.
-- ============================================================================
DROP POLICY IF EXISTS "Allow tenant creation during signup" ON tenants;
CREATE POLICY "Allow tenant creation during signup" ON tenants
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND tenant_id IS NOT NULL
    )
  );

COMMENT ON POLICY "Allow tenant creation during signup" ON tenants IS 'Only users without an existing tenant can create one (signup flow).';

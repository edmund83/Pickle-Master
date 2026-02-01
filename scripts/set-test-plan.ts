/**
 * Test Helper: Set Tenant Subscription Tier
 * Usage: npx tsx scripts/set-test-plan.ts <plan>
 * Where <plan> is: starter, growth, scale, early_access
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env.local is loaded');
  process.exit(1);
}

const plan = process.argv[2] as 'starter' | 'growth' | 'scale' | 'early_access';
const validPlans = ['starter', 'growth', 'scale', 'early_access'];

if (!plan || !validPlans.includes(plan)) {
  console.error('Usage: npx tsx scripts/set-test-plan.ts <plan>');
  console.error('Valid plans: starter, growth, scale, early_access');
  process.exit(1);
}

async function setTestPlan() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get all tenants
  const { data: tenants, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name, subscription_tier')
    .order('name');

  if (tenantError || !tenants || tenants.length === 0) {
    console.error('Error finding tenants:', tenantError?.message);
    process.exit(1);
  }

  console.log('Available tenants:');
  tenants.forEach(t => console.log(`  - ${t.name}: ${t.subscription_tier}`));

  // Find "Test Early Access" tenant or use specific tenant
  const targetTenant = tenants.find(t =>
    t.name.toLowerCase().includes('early access') ||
    t.name.toLowerCase().includes('test early')
  ) || tenants.find(t => t.subscription_tier === 'early_access');

  if (!targetTenant) {
    console.log('\nNo early_access tenant found. Using first tenant.');
  }

  const profile = { tenant_id: targetTenant?.id || tenants[0].id };
  console.log(`\nTarget tenant: ${targetTenant?.name || tenants[0].name}`);

  // Update the tenant's subscription tier
  const { data, error } = await supabase
    .from('tenants')
    .update({ subscription_tier: plan })
    .eq('id', profile.tenant_id)
    .select('name, subscription_tier')
    .single();

  if (error) {
    console.error('Error updating subscription tier:', error.message);
    process.exit(1);
  }

  console.log(`\n✅ Updated tenant "${data.name}" to plan: ${data.subscription_tier}`);
  console.log('\nExpected feature access:');

  if (plan === 'starter' || plan === 'growth') {
    console.log('  lot_tracking: ❌ BLOCKED');
    console.log('  serial_tracking: ❌ BLOCKED');
    console.log('\n  → Tracking Mode section should be HIDDEN in edit page');
  } else {
    console.log('  lot_tracking: ✅ ALLOWED');
    console.log('  serial_tracking: ✅ ALLOWED');
    console.log('\n  → Tracking Mode section should be VISIBLE in edit page');
  }
}

setTestPlan();

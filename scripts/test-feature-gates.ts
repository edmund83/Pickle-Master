/**
 * Feature Gate Test Script
 * Run with: npx tsx scripts/test-feature-gates.ts
 */

import { hasFeature, PLAN_FEATURES, type FeatureId } from '../lib/features/gating';
import type { PlanId } from '../lib/plans/config';

console.log('\n=== Feature Gate Test: lot_tracking and serial_tracking ===\n');

const plans: PlanId[] = ['starter', 'growth', 'scale', 'early_access'];
const features: FeatureId[] = ['lot_tracking', 'serial_tracking'];

console.log('Plan Feature Matrix:');
console.log('--------------------');

for (const plan of plans) {
  const lotAccess = hasFeature(plan, 'lot_tracking');
  const serialAccess = hasFeature(plan, 'serial_tracking');
  const planStr = plan.padEnd(15);
  console.log(`${planStr} | lot_tracking: ${lotAccess ? '✅' : '❌'} | serial_tracking: ${serialAccess ? '✅' : '❌'}`);
}

console.log('\n=== Expected Results ===');
console.log('Starter:        ❌ lot_tracking, ❌ serial_tracking');
console.log('Growth:         ❌ lot_tracking, ❌ serial_tracking');
console.log('Scale:          ✅ lot_tracking, ✅ serial_tracking');
console.log('Early Access:   ✅ lot_tracking, ✅ serial_tracking');

// Verify correctness
interface TestCase {
  plan: PlanId;
  feature: FeatureId;
  expected: boolean;
}

const tests: TestCase[] = [
  { plan: 'starter', feature: 'lot_tracking', expected: false },
  { plan: 'starter', feature: 'serial_tracking', expected: false },
  { plan: 'growth', feature: 'lot_tracking', expected: false },
  { plan: 'growth', feature: 'serial_tracking', expected: false },
  { plan: 'scale', feature: 'lot_tracking', expected: true },
  { plan: 'scale', feature: 'serial_tracking', expected: true },
  { plan: 'early_access', feature: 'lot_tracking', expected: true },
  { plan: 'early_access', feature: 'serial_tracking', expected: true },
];

console.log('\n=== Test Results ===');
let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = hasFeature(test.plan, test.feature);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  if (result === test.expected) passed++; else failed++;
  console.log(`${test.plan}.${test.feature}: ${status}`);
}

console.log(`\nTotal: ${passed}/${tests.length} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}

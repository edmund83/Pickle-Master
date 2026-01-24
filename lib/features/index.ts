/**
 * Feature Gating System Exports
 *
 * Client-safe exports only. For server-side utilities, import from:
 * import { checkFeatureAccess, requireFeature } from '@/lib/features/gating.server'
 */

export {
  // Types
  FEATURE_IDS,
  type FeatureId,
  type FeatureInfo,
  // Data
  PLAN_FEATURES,
  FEATURE_INFO,
  // Client-side helpers
  hasFeature,
  getRequiredPlan,
  getFeatureInfo,
  getFeaturesForPlan,
  isValidFeatureId,
} from './gating'

// Re-export server types for convenience (type-only imports are safe)
export type { FeatureCheckResult } from './gating.server'

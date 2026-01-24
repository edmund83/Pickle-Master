/**
 * Feature Gating System Exports
 */

export {
  // Types
  FEATURE_IDS,
  type FeatureId,
  type FeatureInfo,
  type FeatureCheckResult,
  // Data
  PLAN_FEATURES,
  FEATURE_INFO,
  // Client-side helpers
  hasFeature,
  getRequiredPlan,
  getFeatureInfo,
  getFeaturesForPlan,
  isValidFeatureId,
  // Server-side helpers
  checkFeatureAccess,
  requireFeature,
  requireFeatureSafe,
} from './gating'

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { hasFeature, getFeatureInfo, type FeatureId } from '@/lib/features'
import type { PlanId } from '@/lib/plans/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LockKeyhole, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface FeatureGuardProps {
  feature: FeatureId
  children: React.ReactNode
  /** Show nothing instead of upgrade prompt when feature is locked */
  hideWhenLocked?: boolean
  /** Custom fallback component when feature is locked */
  fallback?: React.ReactNode
}

/**
 * FeatureGuard wraps content that requires a specific feature.
 * If the user's plan doesn't include the feature, it shows an upgrade prompt.
 */
export function FeatureGuard({
  feature,
  children,
  hideWhenLocked = false,
  fallback,
}: FeatureGuardProps) {
  const [planId, setPlanId] = useState<PlanId | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlan()
  }, [])

  async function loadPlan() {
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get tenant subscription tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, tenants(subscription_tier)')
        .eq('id', user.id)
        .single()

      // Type the joined tenants result
      const profileWithTenant = profile as { tenants: { subscription_tier?: string } | null } | null
      const tier = profileWithTenant?.tenants?.subscription_tier || 'starter'
      setPlanId(tier as PlanId)
    } catch (error) {
      console.error('Failed to load plan:', error)
      setPlanId('starter') // Default to starter on error
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return <>{children}</>
  }

  // Check if feature is allowed
  const allowed = planId ? hasFeature(planId, feature) : false

  if (allowed) {
    return <>{children}</>
  }

  // Feature is locked
  if (hideWhenLocked) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Show upgrade prompt
  const featureInfo = getFeatureInfo(feature)
  return <FeatureLockedCard feature={feature} featureInfo={featureInfo} />
}

interface FeatureLockedCardProps {
  feature: FeatureId
  featureInfo: ReturnType<typeof getFeatureInfo>
}

function FeatureLockedCard({ feature, featureInfo }: FeatureLockedCardProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <LockKeyhole className="h-6 w-6 text-neutral-500" />
        </div>
        <CardTitle className="text-lg">{featureInfo?.name || feature}</CardTitle>
        <CardDescription>
          {featureInfo?.description || 'This feature is not available on your current plan.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-sm text-neutral-600">
          {featureInfo?.upgradeMessage || 'Upgrade your plan to unlock this feature.'}
        </p>
        <Link href="/settings/billing">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

/**
 * Hook to check if a feature is available for the current user
 */
export function useFeatureAccess(feature: FeatureId) {
  const [planId, setPlanId] = useState<PlanId | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlan()
  }, [])

  async function loadPlan() {
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, tenants(subscription_tier)')
        .eq('id', user.id)
        .single()

      // Type the joined tenants result
      const profileWithTenant = profile as { tenants: { subscription_tier?: string } | null } | null
      const tier = profileWithTenant?.tenants?.subscription_tier || 'starter'
      setPlanId(tier as PlanId)
    } catch (error) {
      console.error('Failed to load plan:', error)
      setPlanId('starter')
    } finally {
      setLoading(false)
    }
  }

  const allowed = planId ? hasFeature(planId, feature) : false
  const featureInfo = getFeatureInfo(feature)

  return {
    loading,
    allowed,
    planId,
    featureInfo,
  }
}

/**
 * Simple component to show a locked badge for features not in the user's plan
 */
interface FeatureLockedBadgeProps {
  feature: FeatureId
  className?: string
}

export function FeatureLockedBadge({ feature, className }: FeatureLockedBadgeProps) {
  const { loading, allowed, featureInfo } = useFeatureAccess(feature)

  if (loading || allowed) {
    return null
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 ${className}`}
      title={featureInfo?.upgradeMessage}
    >
      <LockKeyhole className="h-3 w-3" />
      {featureInfo?.requiredPlan === 'scale' ? 'Scale' : 'Growth'}
    </span>
  )
}

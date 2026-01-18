'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrialBanner, AccountPausedOverlay } from './TrialBanner'
import {
  isAccountPaused,
  type Tenant,
  type SubscriptionTier,
  type SubscriptionStatus,
} from '@/lib/subscription/status'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

// Routes that are allowed even when account is paused
const ALLOWED_ROUTES_WHEN_PAUSED = [
  '/settings/billing',
  '/export',
  '/login',
  '/logout',
]

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const pathname = usePathname()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTenant()
  }, [])

  async function loadTenant() {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get profile and tenant info
       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) {
        setLoading(false)
        return
      }

      // Get tenant subscription info
       
      const { data: tenantData } = await (supabase as any)
        .from('tenants')
        .select('id, subscription_tier, subscription_status, trial_ends_at, max_users, max_items, stripe_customer_id')
        .eq('id', profile.tenant_id)
        .single()

      if (tenantData) {
        setTenant({
          id: tenantData.id,
          subscription_tier: tenantData.subscription_tier as SubscriptionTier,
          subscription_status: tenantData.subscription_status as SubscriptionStatus,
          trial_ends_at: tenantData.trial_ends_at,
          max_users: tenantData.max_users,
          max_items: tenantData.max_items,
          stripe_customer_id: tenantData.stripe_customer_id,
        })
      }
    } catch (error) {
      console.error('Failed to load tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show anything while loading
  if (loading) {
    return <>{children}</>
  }

  // No tenant data - just render children
  if (!tenant) {
    return <>{children}</>
  }

  // Check if current route is allowed when paused
  const isAllowedRoute = ALLOWED_ROUTES_WHEN_PAUSED.some(route => pathname.startsWith(route))

  // Show paused overlay if account is paused and not on an allowed route
  if (isAccountPaused(tenant) && !isAllowedRoute) {
    return (
      <>
        {children}
        <AccountPausedOverlay tenant={tenant} />
      </>
    )
  }

  // Show trial banner at the top
  return (
    <>
      <TrialBanner tenant={tenant} />
      {children}
    </>
  )
}

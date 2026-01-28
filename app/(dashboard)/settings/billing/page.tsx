'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  CreditCard,
  Package,
  Users,
  Zap,
  Check,
  Crown,
  Building2,
  ExternalLink,
  FolderOpen,
  Rocket,
  Receipt,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SettingsSection,
  UsageStatCard,
  StatusBanner,
  PlanHeroCard,
} from '@/components/settings'
import { useFormatting } from '@/hooks/useFormatting'
import {
  StripePricingTable,
  StripePricingTablePlaceholder,
} from '@/components/StripePricingTable'
import {
  isAccountPaused,
  isInGracePeriod,
  type Tenant,
} from '@/lib/subscription/status'

interface TenantSubscription {
  id: string
  subscription_tier: string
  subscription_status: string
  trial_ends_at: string | null
  max_items: number
  max_users: number
  max_folders: number
  stripe_customer_id: string | null
}

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const STRIPE_PRICING_TABLE_ID =
  process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || ''
const isStripeConfigured = !!(STRIPE_PUBLISHABLE_KEY && STRIPE_PRICING_TABLE_ID)

interface UsageStats {
  items: number
  users: number
  folders: number
}

const PLANS = [
  {
    id: 'early_access',
    name: 'Early Access',
    price: 0,
    description: 'Limited spots for early adopters',
    features: [
      '1,200 inventory items',
      '3 users',
      'Unlimited folders',
      '500 AskZoe AI questions/mo',
      'All Scale features included',
      '3 months free trial',
    ],
    limits: { items: 1200, users: 3, folders: -1 },
    icon: Rocket,
    promotional: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 18,
    description: 'For individuals & small operations',
    features: [
      '1,200 inventory items',
      '3 users',
      '25 folders',
      '50 AskZoe AI questions/mo',
      'Basic reports',
      'Standard support',
    ],
    limits: { items: 1200, users: 3, folders: 25 },
    icon: Zap,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 39,
    description: 'For growing small businesses',
    features: [
      '3,000 inventory items',
      '5 users',
      'Unlimited folders',
      '100 AskZoe AI questions/mo',
      'Advanced reports',
      'Priority support',
    ],
    limits: { items: 3000, users: 5, folders: -1 },
    icon: Crown,
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 89,
    description: 'For teams needing advanced controls',
    features: [
      '8,000 inventory items',
      '8 users',
      'Unlimited folders',
      '500 AskZoe AI questions/mo',
      'Lot/Serial tracking',
      'Audit trail & Approvals',
      'Full priority support',
    ],
    limits: { items: 8000, users: 8, folders: -1 },
    icon: Building2,
  },
]

function BillingPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [subscription, setSubscription] = useState<TenantSubscription | null>(
    null
  )
  const [usage, setUsage] = useState<UsageStats>({
    items: 0,
    users: 0,
    folders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'canceled'
    message: string
  } | null>(null)
  const { formatCurrency, formatDate } = useFormatting()

  // Handle success/canceled query params from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      setFeedbackMessage({
        type: 'success',
        message: 'Your subscription has been updated successfully!',
      })
      // Clear the query params from URL
      router.replace('/settings/billing', { scroll: false })
    } else if (canceled === 'true') {
      setFeedbackMessage({
        type: 'canceled',
        message: 'Checkout was canceled. No changes were made.',
      })
      // Clear the query params from URL
      router.replace('/settings/billing', { scroll: false })
    }
  }, [searchParams, router])

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [feedbackMessage])

  useEffect(() => {
    loadBillingData()
  }, [])

  async function loadBillingData() {
    setLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email || '')

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      const { data: tenant } = await (supabase as any)
        .from('tenants')
        .select(
          'id, subscription_tier, subscription_status, trial_ends_at, max_items, max_users, max_folders, stripe_customer_id'
        )
        .eq('id', profile.tenant_id)
        .single()

      if (tenant) {
        setSubscription(tenant)
      }

      const [{ count: itemCount }, { count: userCount }, { count: folderCount }] =
        await Promise.all([
          (supabase as any)
            .from('inventory_items')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', profile.tenant_id)
            .is('deleted_at', null),
          (supabase as any)
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', profile.tenant_id),
          (supabase as any)
            .from('folders')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', profile.tenant_id),
        ])

      setUsage({
        items: itemCount || 0,
        users: userCount || 0,
        folders: folderCount || 0,
      })
    } finally {
      setLoading(false)
    }
  }

  function formatPrice(price: number): string {
    if (price < 0) return 'Contact us'
    if (price === 0) return 'Free'
    return `${formatCurrency(price)}/mo`
  }

  async function openStripePortal() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (err) {
      console.error('Failed to open portal:', err)
    }
  }

  async function handleUpgrade(planId: string) {
    try {
      setUpgradingPlan(planId)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        console.error('Checkout error:', data.error)
      }
    } catch (err) {
      console.error('Failed to start checkout:', err)
    } finally {
      setUpgradingPlan(null)
    }
  }

  const currentPlan =
    PLANS.find((p) => p.id === subscription?.subscription_tier) || PLANS[0]
  const isTrialing = subscription?.subscription_status === 'trial'
  const trialDaysLeft = subscription?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0

  // User is considered subscribed if they have an active subscription OR
  // they're on a valid trial (not expired)
  const hasActiveSubscription =
    subscription?.subscription_status === 'active' ||
    (isTrialing && trialDaysLeft > 0)
  const hasStripeSubscription = !!subscription?.stripe_customer_id

  // Feedback banner component to reuse in both loading and loaded states
  const FeedbackBanner = feedbackMessage && (
    <div
      className={`mb-6 flex items-center justify-between rounded-lg p-4 ${
        feedbackMessage.type === 'success'
          ? 'bg-green-50 text-green-800'
          : 'bg-amber-50 text-amber-800'
      }`}
    >
      <div className="flex items-center gap-3">
        {feedbackMessage.type === 'success' ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-amber-600" />
        )}
        <span className="font-medium">{feedbackMessage.message}</span>
      </div>
      <button
        onClick={() => setFeedbackMessage(null)}
        className={`rounded-full p-1 hover:bg-opacity-20 ${
          feedbackMessage.type === 'success'
            ? 'hover:bg-green-600'
            : 'hover:bg-amber-600'
        }`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Billing</h1>
          <p className="mt-1 text-neutral-500">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Show feedback banner even during loading */}
        {FeedbackBanner}

        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded-2xl bg-neutral-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-40 rounded-xl bg-neutral-200" />
            <div className="h-40 rounded-xl bg-neutral-200" />
            <div className="h-40 rounded-xl bg-neutral-200" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Billing</h1>
        <p className="mt-1 text-neutral-500">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Feedback Message from Stripe Redirect */}
      {FeedbackBanner}

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Status Banners */}
        {isTrialing && trialDaysLeft > 0 && (
          <StatusBanner
            severity={trialDaysLeft <= 3 ? 'warning' : 'info'}
            title={`Trial Period: ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} remaining`}
            description={`Your trial will end on ${formatDate(subscription?.trial_ends_at)}`}
            ctaText="Upgrade Now"
            ctaHref="#upgrade"
          />
        )}

        {subscription && isInGracePeriod(subscription as unknown as Tenant) && (
          <StatusBanner
            severity="warning"
            title="Trial Ended - Grace Period Active"
            description="Your account will be paused soon. Upgrade now to keep your data."
            ctaText="Upgrade Now"
            ctaHref="#upgrade"
          />
        )}

        {subscription && isAccountPaused(subscription as unknown as Tenant) && (
          <StatusBanner
            severity="danger"
            title="Account Paused"
            description="Your account has been paused. Upgrade to restore access to your inventory."
            ctaText="Upgrade Now"
            ctaHref="#upgrade"
          />
        )}

        {/* Current Plan Hero */}
        <PlanHeroCard
          plan={currentPlan}
          isTrialing={isTrialing}
          trialDaysLeft={trialDaysLeft}
          formatPrice={formatPrice}
        />

        {/* Usage Overview */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Usage Overview
            </h3>
            <p className="text-sm text-neutral-500">
              Track your resource consumption
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <UsageStatCard
              label="Inventory Items"
              icon={Package}
              current={usage.items}
              max={subscription?.max_items ?? 1200}
              colorScheme="blue"
            />
            <UsageStatCard
              label="Team Members"
              icon={Users}
              current={usage.users}
              max={subscription?.max_users ?? 3}
              colorScheme="green"
            />
            <UsageStatCard
              label="Folders"
              icon={FolderOpen}
              current={usage.folders}
              max={subscription?.max_folders ?? 25}
              colorScheme="purple"
            />
          </div>
        </div>

        {/* Upgrade Section */}
        <div id="upgrade" className="scroll-mt-8">
          {hasStripeSubscription ? (
            // User has a Stripe subscription - show consolidated billing card
            <>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Subscription Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">
                        {currentPlan.name} Plan
                      </span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {formatPrice(currentPlan.price)}
                    </p>
                  </div>
                </div>

                {/* Single CTA */}
                <Button onClick={openStripePortal} className="shrink-0">
                  Manage Subscription
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 grid gap-3 border-t border-neutral-100 pt-6 sm:grid-cols-3">
                <button
                  onClick={openStripePortal}
                  className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <Zap className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Change Plan</p>
                    <p className="text-xs text-neutral-500">Upgrade or downgrade</p>
                  </div>
                </button>
                <button
                  onClick={openStripePortal}
                  className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <CreditCard className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Payment Method</p>
                    <p className="text-xs text-neutral-500">Update card details</p>
                  </div>
                </button>
                <button
                  onClick={openStripePortal}
                  className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <Receipt className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Invoices</p>
                    <p className="text-xs text-neutral-500">View billing history</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Plans Reference Table */}
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-100 px-6 py-4">
                <h3 className="font-semibold text-neutral-900">Available Plans</h3>
                <p className="text-sm text-neutral-500">Compare features across all plans</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/50">
                      <th className="min-w-[140px] px-6 py-3 text-left font-medium text-neutral-500">Feature</th>
                      {PLANS.filter(p => !p.promotional).map((plan) => {
                        const isCurrent = plan.id === subscription?.subscription_tier
                        return (
                          <th
                            key={plan.id}
                            className={`min-w-[100px] px-4 py-3 text-center font-medium ${isCurrent ? 'bg-primary/5 text-primary' : 'text-neutral-900'}`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>{plan.name}</span>
                              <span className="text-xs font-normal text-neutral-500">{formatPrice(plan.price)}</span>
                              {isCurrent && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                  Current
                                </span>
                              )}
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {/* Limits Section */}
                    <tr className="bg-neutral-50/30">
                      <td colSpan={4} className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Limits
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Inventory Items</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5 font-medium text-neutral-900' : 'text-neutral-600'}`}>
                          {plan.limits.items.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Team Members</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5 font-medium text-neutral-900' : 'text-neutral-600'}`}>
                          {plan.limits.users}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Folders</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5 font-medium text-neutral-900' : 'text-neutral-600'}`}>
                          {plan.limits.folders === -1 ? 'Unlimited' : plan.limits.folders}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">AskZoe AI Questions</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5 font-medium text-neutral-900' : 'text-neutral-600'}`}>
                          {plan.features.find(f => f.includes('AskZoe'))?.match(/\d+/)?.[0] || '—'}/mo
                        </td>
                      ))}
                    </tr>
                    {/* Features Section */}
                    <tr className="bg-neutral-50/30">
                      <td colSpan={4} className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Features
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Reports</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5 font-medium text-neutral-900' : 'text-neutral-600'}`}>
                          {plan.features.find(f => f.includes('reports'))?.replace(' reports', '') || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Support</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5 font-medium text-neutral-900' : 'text-neutral-600'}`}>
                          {plan.features.find(f => f.toLowerCase().includes('support'))?.replace(' support', '') || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Lot/Serial Tracking</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          {plan.features.some(f => f.includes('Lot/Serial')) ? (
                            <Check className="mx-auto h-5 w-5 text-green-600" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-neutral-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Audit Trail & Approvals</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          {plan.features.some(f => f.includes('Audit trail')) ? (
                            <Check className="mx-auto h-5 w-5 text-green-600" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-neutral-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                    {/* Tasks Section */}
                    <tr className="bg-neutral-50/30">
                      <td colSpan={4} className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Tasks & Workflows
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Pick Lists</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Check-In / Check-Out</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Purchase Orders</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          {['growth', 'scale'].includes(plan.id) ? (
                            <Check className="mx-auto h-5 w-5 text-green-600" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-neutral-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Sales Orders</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          {['growth', 'scale'].includes(plan.id) ? (
                            <Check className="mx-auto h-5 w-5 text-green-600" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-neutral-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Receiving (GRN)</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          {['growth', 'scale'].includes(plan.id) ? (
                            <Check className="mx-auto h-5 w-5 text-green-600" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-neutral-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-neutral-600">Stock Counts</td>
                      {PLANS.filter(p => !p.promotional).map((plan) => (
                        <td key={plan.id} className={`px-4 py-3 text-center ${plan.id === subscription?.subscription_tier ? 'bg-primary/5' : ''}`}>
                          {['growth', 'scale'].includes(plan.id) ? (
                            <Check className="mx-auto h-5 w-5 text-green-600" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-neutral-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="border-t border-neutral-100 px-6 py-3">
                <p className="text-xs text-neutral-400">
                  To change your plan, click &quot;Manage Subscription&quot; above
                </p>
              </div>
            </div>
            </>
          ) : (
          <SettingsSection
            title={
              hasActiveSubscription
                  ? 'Upgrade Your Plan'
                  : 'Choose Your Plan'
            }
            description={
              hasActiveSubscription
                  ? 'Upgrade to unlock more features'
                  : 'Choose a plan that fits your needs'
            }
            icon={Zap}
          >
            {hasActiveSubscription ? (
              // User has active subscription without Stripe (e.g., early access, trial)
              // Show plan cards but clearly mark current plan and disable subscribe for it
              <div className="grid gap-4 sm:grid-cols-2">
                {PLANS.map((plan) => {
                  const isCurrent = plan.id === subscription?.subscription_tier
                  const PlanIcon = plan.icon
                  // Can only upgrade to plans with higher price than current
                  const canUpgrade =
                    !isCurrent && plan.price > (currentPlan?.price ?? 0)

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border p-5 transition-all ${
                        isCurrent
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : plan.popular
                            ? 'border-primary/30 hover:border-primary/60'
                            : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {plan.popular && !isCurrent && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
                          Popular
                        </span>
                      )}
                      {isCurrent && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
                          Current Plan
                        </span>
                      )}

                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isCurrent
                              ? 'bg-primary text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <PlanIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {plan.name}
                          </h3>
                          <p className="text-lg font-bold text-neutral-900">
                            {formatPrice(plan.price)}
                          </p>
                        </div>
                      </div>

                      <ul className="mb-4 space-y-2">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-neutral-600"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-sm text-neutral-400">
                            +{plan.features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      <Button
                        variant={isCurrent ? 'outline' : 'default'}
                        className="w-full"
                        disabled={isCurrent || !canUpgrade || upgradingPlan === plan.id}
                        onClick={() => canUpgrade && handleUpgrade(plan.id)}
                      >
                        {upgradingPlan === plan.id
                          ? 'Redirecting...'
                          : isCurrent
                            ? 'Your Current Plan'
                            : canUpgrade
                              ? 'Upgrade'
                              : 'Not Available'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : isStripeConfigured ? (
              // No subscription - show Stripe pricing table
              <StripePricingTable
                pricingTableId={STRIPE_PRICING_TABLE_ID}
                publishableKey={STRIPE_PUBLISHABLE_KEY}
                customerEmail={userEmail}
                clientReferenceId={subscription?.id}
              />
            ) : (
              // Fallback when Stripe is not configured
              <>
                <StripePricingTablePlaceholder />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {PLANS.map((plan) => {
                    const isCurrent =
                      plan.id === subscription?.subscription_tier
                    const PlanIcon = plan.icon

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border p-5 transition-all ${
                          isCurrent
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : plan.popular
                              ? 'border-primary/30 hover:border-primary/60'
                              : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {plan.popular && !isCurrent && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
                            Popular
                          </span>
                        )}
                        {isCurrent && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
                            Current
                          </span>
                        )}

                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isCurrent
                                ? 'bg-primary text-white'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            <PlanIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900">
                              {plan.name}
                            </h3>
                            <p className="text-lg font-bold text-neutral-900">
                              {formatPrice(plan.price)}
                            </p>
                          </div>
                        </div>

                        <ul className="mb-4 space-y-2">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-neutral-600"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 4 && (
                            <li className="text-sm text-neutral-400">
                              +{plan.features.length - 4} more features
                            </li>
                          )}
                        </ul>

                        <Button
                          variant={
                            isCurrent
                              ? 'outline'
                              : plan.popular
                                ? 'default'
                                : 'outline'
                          }
                          className="w-full"
                          disabled
                        >
                          {isCurrent
                            ? 'Current Plan'
                            : plan.price < 0
                              ? 'Contact Sales'
                              : 'Coming Soon'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </SettingsSection>
          )}
        </div>

        {/* Billing History - Only show when no Stripe subscription */}
        {!subscription?.stripe_customer_id && (
          <SettingsSection
            title="Billing History"
            description="Your recent invoices and payments"
            icon={Receipt}
          >
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                  <Receipt className="h-6 w-6 text-neutral-400" />
                </div>
                <p className="mt-3 text-sm text-neutral-500">
                  No billing history yet. Subscribe to a plan to get started.
                </p>
              </div>
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  )
}

// Loading skeleton for Suspense fallback
function BillingPageSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Billing</h1>
        <p className="mt-1 text-neutral-500">
          Manage your subscription and billing information
        </p>
      </div>
      <div className="mx-auto max-w-4xl animate-pulse space-y-6">
        <div className="h-32 rounded-2xl bg-neutral-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-40 rounded-xl bg-neutral-200" />
          <div className="h-40 rounded-xl bg-neutral-200" />
          <div className="h-40 rounded-xl bg-neutral-200" />
        </div>
        <div className="h-48 rounded-2xl bg-neutral-200" />
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingPageSkeleton />}>
      <BillingPageContent />
    </Suspense>
  )
}

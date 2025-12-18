'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CreditCard,
  Package,
  Users,
  Zap,
  Check,
  Crown,
  Building2,
  Loader2,
  ExternalLink,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TenantSubscription {
  subscription_tier: string
  subscription_status: string
  trial_ends_at: string | null
  max_items: number
  max_users: number
  max_folders: number
}

interface UsageStats {
  items: number
  users: number
  folders: number
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For individuals getting started',
    features: [
      '100 inventory items',
      '1 user',
      '5 folders',
      'Basic reports',
      'Email support',
    ],
    limits: { items: 100, users: 1, folders: 5 },
    icon: Package,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    description: 'For small teams',
    features: [
      '1,000 inventory items',
      '5 users',
      '25 folders',
      'Advanced reports',
      'Priority support',
      'CSV export',
    ],
    limits: { items: 1000, users: 5, folders: 25 },
    icon: Zap,
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    description: 'For growing businesses',
    features: [
      '10,000 inventory items',
      '20 users',
      'Unlimited folders',
      'All reports',
      'API access',
      'AI Assistant',
      'Custom fields',
    ],
    limits: { items: 10000, users: 20, folders: -1 },
    icon: Crown,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: -1,
    description: 'For large organizations',
    features: [
      'Unlimited items',
      'Unlimited users',
      'Unlimited folders',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'SSO / SAML',
    ],
    limits: { items: -1, users: -1, folders: -1 },
    icon: Building2,
  },
]

export default function BillingPage() {
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null)
  const [usage, setUsage] = useState<UsageStats>({ items: 0, users: 0, folders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBillingData()
  }, [])

  async function loadBillingData() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile and tenant info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      // Get tenant subscription info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tenant } = await (supabase as any)
        .from('tenants')
        .select('subscription_tier, subscription_status, trial_ends_at, max_items, max_users, max_folders')
        .eq('id', profile.tenant_id)
        .single()

      if (tenant) {
        setSubscription(tenant)
      }

      // Get usage counts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [{ count: itemCount }, { count: userCount }, { count: folderCount }] = await Promise.all([
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

  function getUsagePercent(current: number, max: number): number {
    if (max <= 0) return 0
    return Math.min(100, Math.round((current / max) * 100))
  }

  function formatPrice(price: number): string {
    if (price < 0) return 'Contact us'
    if (price === 0) return 'Free'
    return `RM ${price}/mo`
  }

  const currentPlan = PLANS.find(p => p.id === subscription?.subscription_tier) || PLANS[0]
  const isTrialing = subscription?.subscription_status === 'trial'
  const trialDaysLeft = subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Billing & Subscription</h1>
        <p className="mt-1 text-neutral-500">
          Manage your subscription and billing information
        </p>
      </div>

      <div className="p-8 max-w-5xl">
        {/* Trial Banner */}
        {isTrialing && trialDaysLeft > 0 && (
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-pickle-50 border border-pickle-200 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pickle-500 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-pickle-900">
                Trial Period: {trialDaysLeft} days remaining
              </p>
              <p className="text-sm text-pickle-700">
                Your trial will end on {new Date(subscription?.trial_ends_at || '').toLocaleDateString()}
              </p>
            </div>
            <Button>Upgrade Now</Button>
          </div>
        )}

        {/* Current Plan */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Current Plan</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-pickle-100 text-pickle-600">
                <currentPlan.icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-neutral-900">{currentPlan.name}</h3>
                  {currentPlan.popular && (
                    <span className="rounded-full bg-pickle-100 px-2 py-0.5 text-xs font-medium text-pickle-700">
                      Popular
                    </span>
                  )}
                  {isTrialing && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      Trial
                    </span>
                  )}
                </div>
                <p className="text-neutral-500">{currentPlan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-900">
                  {formatPrice(currentPlan.price)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Usage Overview</h2>
          </div>
          <div className="p-6 grid gap-6 sm:grid-cols-3">
            {/* Items Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Inventory Items</span>
                <span className="text-sm text-neutral-500">
                  {usage.items.toLocaleString()} / {subscription?.max_items === -1 ? '∞' : subscription?.max_items?.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    getUsagePercent(usage.items, subscription?.max_items || 100) > 90
                      ? 'bg-red-500'
                      : getUsagePercent(usage.items, subscription?.max_items || 100) > 75
                      ? 'bg-yellow-500'
                      : 'bg-pickle-500'
                  }`}
                  style={{ width: `${getUsagePercent(usage.items, subscription?.max_items || 100)}%` }}
                />
              </div>
            </div>

            {/* Users Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Team Members</span>
                <span className="text-sm text-neutral-500">
                  {usage.users} / {subscription?.max_users === -1 ? '∞' : subscription?.max_users}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    getUsagePercent(usage.users, subscription?.max_users || 1) > 90
                      ? 'bg-red-500'
                      : getUsagePercent(usage.users, subscription?.max_users || 1) > 75
                      ? 'bg-yellow-500'
                      : 'bg-pickle-500'
                  }`}
                  style={{ width: `${getUsagePercent(usage.users, subscription?.max_users || 1)}%` }}
                />
              </div>
            </div>

            {/* Folders Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Folders</span>
                <span className="text-sm text-neutral-500">
                  {usage.folders} / {subscription?.max_folders === -1 ? '∞' : subscription?.max_folders}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    getUsagePercent(usage.folders, subscription?.max_folders || 5) > 90
                      ? 'bg-red-500'
                      : getUsagePercent(usage.folders, subscription?.max_folders || 5) > 75
                      ? 'bg-yellow-500'
                      : 'bg-pickle-500'
                  }`}
                  style={{ width: `${getUsagePercent(usage.folders, subscription?.max_folders || 5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Available Plans</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === subscription?.subscription_tier
                const PlanIcon = plan.icon

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border p-5 transition-all ${
                      isCurrent
                        ? 'border-pickle-500 bg-pickle-50 ring-1 ring-pickle-500'
                        : plan.popular
                        ? 'border-pickle-200 hover:border-pickle-400'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {plan.popular && !isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-pickle-500 px-3 py-0.5 text-xs font-medium text-white">
                        Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-pickle-600 px-3 py-0.5 text-xs font-medium text-white">
                        Current
                      </span>
                    )}

                    <div className="mb-4 flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isCurrent ? 'bg-pickle-500 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        <PlanIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{plan.name}</h3>
                        <p className="text-lg font-bold text-neutral-900">
                          {formatPrice(plan.price)}
                        </p>
                      </div>
                    </div>

                    <ul className="mb-4 space-y-2">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                          <Check className="h-4 w-4 shrink-0 text-pickle-500 mt-0.5" />
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
                      variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                      className="w-full"
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Current Plan' : plan.price < 0 ? 'Contact Sales' : 'Upgrade'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Payment Method (Placeholder) */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Payment Method</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <CreditCard className="h-6 w-6 text-neutral-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-900">No payment method on file</p>
                <p className="text-sm text-neutral-500">Add a payment method to upgrade your plan</p>
              </div>
              <Button variant="outline">
                Add Payment Method
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Billing History (Placeholder) */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Billing History</h2>
            <Button variant="ghost" size="sm">
              View All
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-neutral-500">No billing history yet</p>
              <p className="text-sm text-neutral-400">
                Your invoices and receipts will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  ExternalLink,
  FolderOpen,
  Rocket,
  Receipt,
  FileText,
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

export default function BillingPage() {
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
  const { formatCurrency, formatDate } = useFormatting()

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-neutral-200" />
          <div className="h-4 w-64 rounded bg-neutral-200" />
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
          <SettingsSection
            title={
              hasStripeSubscription
                ? 'Change Plan'
                : hasActiveSubscription
                  ? 'Upgrade Your Plan'
                  : 'Choose Your Plan'
            }
            description={
              hasStripeSubscription
                ? 'Use the Manage Subscription button below to change your plan'
                : hasActiveSubscription
                  ? 'Upgrade to unlock more features'
                  : 'Choose a plan that fits your needs'
            }
            icon={Zap}
          >
            {hasStripeSubscription ? (
              // User has a Stripe subscription - direct to portal for changes
              <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-primary/5 to-transparent py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-4 font-semibold text-neutral-900">
                  You&apos;re subscribed to {currentPlan.name}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Use the &quot;Manage Subscription&quot; button below to change
                  plans, update payment, or view invoices.
                </p>
              </div>
            ) : hasActiveSubscription ? (
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
                        disabled={isCurrent || !canUpgrade}
                      >
                        {isCurrent
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
        </div>

        {/* Billing History */}
        <SettingsSection
          title="Billing History"
          description="Your recent invoices and payments"
          icon={Receipt}
          headerAction={
            subscription?.stripe_customer_id && (
              <Button variant="outline" size="sm" onClick={openStripePortal}>
                View All
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )
          }
        >
          {subscription?.stripe_customer_id ? (
            <div className="divide-y divide-neutral-100">
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                    <FileText className="h-6 w-6 text-neutral-400" />
                  </div>
                  <p className="mt-3 text-sm text-neutral-500">
                    View your complete billing history in the Stripe portal
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={openStripePortal}
                  >
                    Open Billing Portal
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </SettingsSection>

        {/* Manage Subscription */}
        {subscription?.stripe_customer_id && (
          <SettingsSection
            title="Manage Subscription"
            description="Update payment method, view invoices, or cancel subscription"
            icon={CreditCard}
          >
            <div className="rounded-xl bg-gradient-to-r from-primary/5 to-transparent p-[1px]">
              <div className="flex items-center gap-4 rounded-[11px] bg-white p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">
                    Subscription Active
                  </p>
                  <p className="text-sm text-neutral-500">
                    Manage your payment method, view invoices, or update your
                    plan
                  </p>
                </div>
                <Button variant="outline" onClick={openStripePortal}>
                  Manage Subscription
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  )
}

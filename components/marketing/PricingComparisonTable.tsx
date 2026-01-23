'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type FeatureValue = boolean | string | { value: string; note?: string }

interface Feature {
  name: string
  icon?: string
  starter: FeatureValue
  growth: FeatureValue
  scale: FeatureValue
}

interface FeatureGroup {
  category: string
  features: Feature[]
}

const featureGroups: FeatureGroup[] = [
  {
    category: 'Plan Limits',
    features: [
      { name: 'Items (SKUs)', starter: '1,200', growth: '3,000', scale: '8,000' },
      { name: 'Users', starter: '3', growth: '5', scale: '8' },
      {
        name: 'AskZoe AI questions/mo',
        icon: 'icon-[tabler--sparkles]',
        starter: { value: '50', note: 'First 7 days only' },
        growth: '100',
        scale: '500',
      },
    ],
  },
  {
    category: 'Core Features',
    features: [
      { name: 'Barcode & QR scanning', starter: true, growth: true, scale: true },
      { name: 'Mobile app + offline', starter: true, growth: true, scale: true },
      { name: 'Low-stock alerts', starter: true, growth: true, scale: true },
      { name: 'CSV import/export', starter: true, growth: true, scale: true },
      { name: 'Label printing', starter: true, growth: true, scale: true },
    ],
  },
  {
    category: 'Operations',
    features: [
      { name: 'Purchase orders', starter: false, growth: true, scale: true },
      { name: 'Receiving & backorders', starter: false, growth: true, scale: true },
      { name: 'Check-in / check-out', starter: false, growth: true, scale: true },
      { name: 'Stock counts & cycle counting', starter: false, growth: true, scale: true },
      { name: 'Pick lists / fulfillment', starter: false, growth: true, scale: true },
    ],
  },
  {
    category: 'Advanced Tracking',
    features: [
      { name: 'Lot & batch tracking', starter: false, growth: false, scale: true },
      { name: 'Serial number tracking', starter: false, growth: false, scale: true },
    ],
  },
  {
    category: 'Controls & Compliance',
    features: [
      { name: 'Advanced role permissions', starter: false, growth: false, scale: true },
      { name: 'Approvals workflow', starter: false, growth: false, scale: true },
      { name: 'Full audit trail', starter: false, growth: false, scale: true },
      { name: 'Inventory lock / close period', starter: false, growth: false, scale: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Standard support', starter: true, growth: true, scale: true },
      { name: 'Priority support & onboarding', starter: false, growth: false, scale: true },
    ],
  },
]

const plans = [
  { id: 'starter', name: 'Starter', price: 18, href: '/signup?plan=starter', recommended: false },
  { id: 'growth', name: 'Growth', price: 39, href: '/signup?plan=growth', recommended: true },
  { id: 'scale', name: 'Scale', price: 79, href: '/signup?plan=scale', recommended: false },
] as const

type PlanId = (typeof plans)[number]['id']

function FeatureCell({ value, isHighlighted }: { value: FeatureValue; isHighlighted?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full',
          isHighlighted ? 'bg-success/20' : 'bg-success/10'
        )}
      >
        <span className="icon-[tabler--check] text-success size-4" />
      </span>
    ) : (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-base-200">
        <span className="icon-[tabler--minus] text-base-content/30 size-4" />
      </span>
    )
  }

  if (typeof value === 'string') {
    return <span className={cn('font-medium', isHighlighted && 'text-primary')}>{value}</span>
  }

  // Object with value and optional note
  return (
    <div className="flex flex-col items-center">
      <span className={cn('font-medium', isHighlighted && 'text-primary')}>{value.value}</span>
      {value.note && <span className="text-base-content/50 text-xs">({value.note})</span>}
    </div>
  )
}

// Mobile card view for a single plan
function MobilePlanCard({ planId, planIndex }: { planId: PlanId; planIndex: number }) {
  const plan = plans[planIndex]
  const isRecommended = plan.recommended

  return (
    <div
      className={cn(
        'card bg-base-100 shadow-sm',
        isRecommended && 'ring-2 ring-primary shadow-lg'
      )}
    >
      <div className="card-body gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="text-2xl font-bold">
              ${plan.price}
              <span className="text-base-content/50 text-sm font-normal">/mo</span>
            </div>
          </div>
          {isRecommended && (
            <span className="badge badge-primary text-white">
              <span className="icon-[tabler--star-filled] mr-1 size-3" />
              Best Value
            </span>
          )}
        </div>

        {/* Features by category */}
        {featureGroups.map((group) => (
          <div key={group.category}>
            <h4 className="text-base-content/60 mb-2 text-xs font-semibold uppercase tracking-wider">
              {group.category}
            </h4>
            <ul className="space-y-2">
              {group.features.map((feature) => {
                const value = feature[planId]
                const isIncluded = typeof value === 'boolean' ? value : true
                const displayValue =
                  typeof value === 'boolean'
                    ? null
                    : typeof value === 'string'
                      ? value
                      : value.value

                return (
                  <li
                    key={feature.name}
                    className={cn(
                      'flex items-center justify-between text-sm',
                      !isIncluded && 'text-base-content/40'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {feature.icon && (
                        <span className={cn(feature.icon, 'text-primary size-4')} />
                      )}
                      {feature.name}
                    </span>
                    {displayValue ? (
                      <span className="font-medium">{displayValue}</span>
                    ) : isIncluded ? (
                      <span className="icon-[tabler--check] text-success size-4" />
                    ) : (
                      <span className="icon-[tabler--minus] text-base-content/30 size-4" />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* CTA */}
        <Link
          href={plan.href}
          className={cn('btn mt-2', isRecommended ? 'btn-primary' : 'btn-outline btn-primary')}
        >
          Start Free Trial
        </Link>
      </div>
    </div>
  )
}

export function PricingComparisonTable() {
  const [activeMobilePlan, setActiveMobilePlan] = useState<PlanId>('growth')

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
            Compare All Features
          </h2>
          <p className="text-base-content/70 mt-3 text-lg">
            Every plan includes barcode scanning, mobile app, and offline mode.
          </p>
        </div>

        {/* Mobile view: Tab selector + cards */}
        <div className="mt-8 lg:hidden">
          {/* Plan tabs */}
          <div className="bg-base-200 flex rounded-xl p-1">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActiveMobilePlan(plan.id)}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  activeMobilePlan === plan.id
                    ? 'bg-base-100 text-base-content shadow-sm'
                    : 'text-base-content/60 hover:text-base-content'
                )}
              >
                <div>{plan.name}</div>
                <div className="text-xs opacity-70">${plan.price}/mo</div>
              </button>
            ))}
          </div>

          {/* Active plan card */}
          <div className="mt-6">
            <MobilePlanCard
              planId={activeMobilePlan}
              planIndex={plans.findIndex((p) => p.id === activeMobilePlan)}
            />
          </div>
        </div>

        {/* Desktop view: Full comparison table */}
        <div className="mt-10 hidden lg:block">
          <div className="relative rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
            {/* Highlighted column overlay for Growth plan */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-1/4 -translate-x-1/2 border-x-2 border-primary/40 bg-primary/[0.03]" />

            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
              <div className="grid grid-cols-4">
                {/* Empty corner cell */}
                <div className="p-4" />

                {/* Plan headers */}
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      'p-4 text-center relative',
                      plan.recommended && 'bg-primary/10'
                    )}
                  >
                    {plan.recommended && (
                      <>
                        <div className="absolute -top-px left-0 right-0 h-1.5 bg-primary" />
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                          Most Popular
                        </span>
                      </>
                    )}
                    <div className="flex flex-col items-center gap-1 pt-2">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          'text-lg font-semibold',
                          plan.recommended ? 'text-primary text-xl' : 'text-base-content'
                        )}>
                          {plan.name}
                        </h3>
                        {plan.recommended && (
                          <span className="icon-[tabler--star-filled] text-primary size-5" />
                        )}
                      </div>
                      <div className={cn(
                        'text-2xl font-bold',
                        plan.recommended ? 'text-primary text-3xl' : 'text-base-content'
                      )}>
                        ${plan.price}
                        <span className={cn(
                          'text-sm font-normal',
                          plan.recommended ? 'text-primary/70' : 'text-base-content/50'
                        )}>/mo</span>
                      </div>
                      <Link
                        href={plan.href}
                        className={cn(
                          'btn mt-2 w-full',
                          plan.recommended ? 'btn-primary btn-md shadow-lg' : 'btn-outline btn-primary btn-sm'
                        )}
                      >
                        Start Free Trial
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature groups */}
            {featureGroups.map((group, groupIndex) => (
              <div key={group.category}>
                {/* Category header */}
                <div className="bg-base-200/50 border-y border-base-300 px-4 py-2.5">
                  <h4 className="text-base-content/70 text-xs font-semibold uppercase tracking-wider">
                    {group.category}
                  </h4>
                </div>

                {/* Feature rows */}
                {group.features.map((feature, featureIndex) => (
                  <div
                    key={feature.name}
                    className={cn(
                      'grid grid-cols-4 transition-colors hover:bg-base-200/30',
                      featureIndex !== group.features.length - 1 && 'border-b border-base-200'
                    )}
                  >
                    {/* Feature name */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      {feature.icon && (
                        <span className={cn(feature.icon, 'text-primary size-4 shrink-0')} />
                      )}
                      <span className="text-base-content text-sm">{feature.name}</span>
                    </div>

                    {/* Plan values */}
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={cn(
                          'flex items-center justify-center px-4 py-3 text-sm',
                          plan.recommended && 'bg-primary/[0.08]'
                        )}
                      >
                        <FeatureCell value={feature[plan.id]} isHighlighted={plan.recommended} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Bottom CTA row */}
            <div className="grid grid-cols-4 border-t border-base-300 bg-base-200/30">
              <div className="p-4" />
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn('p-4 text-center', plan.recommended && 'bg-primary/10')}
                >
                  <Link
                    href={plan.href}
                    className={cn(
                      'btn w-full',
                      plan.recommended ? 'btn-primary shadow-lg' : 'btn-outline btn-primary'
                    )}
                  >
                    Start Free Trial
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Footnote */}
          <p className="text-base-content/50 mt-4 text-center text-xs">
            * Starter plan includes 50 AskZoe AI questions during the first 7 days only
          </p>
        </div>

        {/* Add-ons callout */}
        <div className="mt-8 text-center">
          <div className="bg-base-200/50 border-base-300 mx-auto inline-flex flex-col items-center gap-2 rounded-xl border px-6 py-4 sm:flex-row sm:gap-6">
            <span className="text-base-content/70 text-sm font-medium">Scale plan add-ons:</span>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="text-base-content">
                <span className="font-semibold">+$5</span>
                <span className="text-base-content/70">/user/month</span>
              </span>
              <span className="text-base-content/30">|</span>
              <span className="text-base-content">
                <span className="font-semibold">+$10</span>
                <span className="text-base-content/70">/1,000 items/month</span>
              </span>
            </div>
          </div>
        </div>

        {/* Enterprise callout */}
        <div className="mt-4 text-center">
          <p className="text-base-content/70">
            Need higher limits or custom integrations?{' '}
            <Link href="/demo" className="link link-primary link-animated font-medium">
              Contact us for Enterprise pricing
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

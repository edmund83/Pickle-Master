'use client'

import Link from 'next/link'
import { AlertTriangle, Clock, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { Tenant } from '@/lib/subscription/status'
import {
  getSubscriptionState,
  getDaysRemaining,
  getGraceDaysRemaining,
  isTrialActive,
  isInGracePeriod,
  isAccountPaused,
  isPaidSubscription,
} from '@/lib/subscription/status'

interface TrialBannerProps {
  tenant: Tenant
  dismissible?: boolean
}

export function TrialBanner({ tenant, dismissible = true }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show banner for paid subscriptions
  if (isPaidSubscription(tenant)) {
    return null
  }

  // Don't show if dismissed (only for non-critical states)
  if (isDismissed && isTrialActive(tenant) && getDaysRemaining(tenant) > 3) {
    return null
  }

  const state = getSubscriptionState(tenant)

  // Account paused - show critical banner
  if (isAccountPaused(tenant)) {
    return (
      <div className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Your account is paused. Upgrade now to restore access to your inventory.
            </p>
          </div>
          <Link
            href="/settings/billing"
            className="shrink-0 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    )
  }

  // Grace period - show urgent warning
  if (isInGracePeriod(tenant)) {
    const graceDays = getGraceDaysRemaining(tenant)
    return (
      <div className="bg-orange-500 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Your trial has ended. You have{' '}
              <span className="font-bold">
                {graceDays} day{graceDays === 1 ? '' : 's'}
              </span>{' '}
              left before your account is paused.
            </p>
          </div>
          <Link
            href="/settings/billing"
            className="shrink-0 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-orange-600 shadow-sm hover:bg-orange-50"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    )
  }

  // Trial active
  if (isTrialActive(tenant)) {
    const daysRemaining = getDaysRemaining(tenant)

    // Last 3 days - more urgent styling
    if (daysRemaining <= 3) {
      return (
        <div className="bg-yellow-500 text-yellow-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                Your trial ends in{' '}
                <span className="font-bold">
                  {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
                </span>
                . Upgrade to keep your inventory data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/settings/billing"
                className="shrink-0 rounded-lg bg-yellow-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-800"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Normal trial - subtle banner
    return (
      <div className="border-b border-primary/20 bg-primary/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-primary">
              <span className="font-medium">
                {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
              </span>{' '}
              left in your trial •{' '}
              <Link href="/settings/billing" className="font-medium underline hover:no-underline">
                View plans
              </Link>
            </p>
          </div>
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="shrink-0 rounded p-1 text-primary/60 hover:bg-primary/10 hover:text-primary"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}

/**
 * Account Paused Full-Screen Overlay
 * Shows when account is completely paused and user can only access billing
 */
export function AccountPausedOverlay({ tenant }: { tenant: Tenant }) {
  if (!isAccountPaused(tenant)) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Account Paused</h2>
        <p className="mt-3 text-neutral-600">
          Your trial has ended and your account is currently paused. Upgrade to a paid plan to
          restore access to your inventory.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Your data is safe and will be available once you upgrade.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/settings/billing"
            className="btn btn-primary btn-lg w-full"
          >
            Upgrade Now
          </Link>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/export" className="text-neutral-600 hover:text-neutral-900 hover:underline">
              Export Data
            </Link>
            <span className="text-neutral-300">•</span>
            <button
              onClick={() => {
                // Sign out logic would go here
                window.location.href = '/login'
              }}
              className="text-neutral-600 hover:text-neutral-900 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

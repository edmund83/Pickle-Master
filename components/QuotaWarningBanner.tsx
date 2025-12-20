'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type QuotaUsage = {
  resource_type: 'users' | 'items'
  current_usage: number
  max_allowed: number
  usage_percent: number
  is_warning: boolean
  is_exceeded: boolean
}

export function QuotaWarningBanner() {
  const [quotaData, setQuotaData] = useState<{
    items?: QuotaUsage
    users?: QuotaUsage
  } | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuota() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('get_quota_usage')

        if (error) {
          console.error('Error fetching quota:', error)
          return
        }

        const items = (data as QuotaUsage[])?.find(
          (u) => u.resource_type === 'items'
        )
        const users = (data as QuotaUsage[])?.find(
          (u) => u.resource_type === 'users'
        )

        setQuotaData({ items, users })
      } catch (err) {
        console.error('Failed to fetch quota usage:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuota()
  }, [])

  // Don't show anything while loading or if dismissed
  if (loading || dismissed) return null

  const itemsWarning = quotaData?.items?.is_warning
  const itemsExceeded = quotaData?.items?.is_exceeded
  const usersWarning = quotaData?.users?.is_warning
  const usersExceeded = quotaData?.users?.is_exceeded

  const hasWarning = itemsWarning || usersWarning
  const hasExceeded = itemsExceeded || usersExceeded

  // Don't show if no warning/exceeded state
  if (!hasWarning && !hasExceeded) return null

  // Determine which resource to highlight (prioritize exceeded, then items)
  const primaryResource = itemsExceeded
    ? quotaData?.items
    : usersExceeded
      ? quotaData?.users
      : itemsWarning
        ? quotaData?.items
        : quotaData?.users

  const resourceLabel = primaryResource?.resource_type === 'items' ? 'items' : 'team members'

  // Style based on exceeded vs warning
  const bannerStyles = hasExceeded
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-amber-50 border-amber-200 text-amber-800'

  const iconStyles = hasExceeded ? 'text-red-500' : 'text-amber-500'

  const progressBarStyles = hasExceeded
    ? 'bg-red-500'
    : 'bg-amber-500'

  return (
    <div
      className={`relative border-b px-4 py-3 ${bannerStyles}`}
      role="alert"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${iconStyles}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {hasExceeded ? (
                <>
                  {primaryResource?.resource_type === 'items' ? 'Item' : 'User'} limit reached
                </>
              ) : (
                <>
                  Approaching {resourceLabel} limit
                </>
              )}
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              {primaryResource?.current_usage} of {primaryResource?.max_allowed} {resourceLabel} used
              ({primaryResource?.usage_percent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Progress bar */}
          <div className="hidden sm:block w-24 h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressBarStyles} transition-all`}
              style={{ width: `${Math.min(primaryResource?.usage_percent ?? 0, 100)}%` }}
            />
          </div>

          {/* Upgrade link */}
          <Link
            href="/settings/billing"
            className={`inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline ${hasExceeded ? 'text-red-700' : 'text-amber-700'}`}
          >
            Upgrade
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react'
import { useFormatting } from '@/hooks/useFormatting'
import { toZonedTime } from 'date-fns-tz'
import type { ActivityLog } from '@/types/database.types'

const ITEMS_PER_PAGE = 5

interface RecentActivityProps {
  activities: ActivityLog[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const { formatTime: formatTimeHook, settings } = useFormatting()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedActivities = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Memoize timezone to avoid recalculating on every render
  const timezone = useMemo(() => settings.timezone, [settings.timezone])

  // Format relative time using tenant's timezone
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)
      const now = new Date()

      // Convert both dates to tenant's timezone for accurate comparison
      const zonedDate = toZonedTime(date, timezone)
      const zonedNow = toZonedTime(now, timezone)

      const diffMs = zonedNow.getTime() - zonedDate.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor(diffMs / (1000 * 60))

      if (diffMins < 60) {
        return `${diffMins}m ago`
      } else if (diffHours < 24) {
        return `${diffHours}h ago`
      } else {
        return formatTimeHook(date)
      }
    } catch {
      return formatTimeHook(dateString)
    }
  }

  // Format action text
  const formatAction = (actionType: string | null) => {
    if (!actionType) return 'performed action on'
    switch (actionType) {
      case 'quantity_adjusted':
        return 'updated'
      case 'created':
        return 'created'
      case 'updated':
        return 'updated'
      case 'deleted':
        return 'deleted'
      case 'checked_out':
        return 'checked out'
      case 'checked_in':
        return 'checked in'
      case 'moved':
        return 'moved'
      default:
        return actionType.replace(/_/g, ' ')
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
        <Link
          href="/reports/activity"
          className="text-sm font-medium text-primary hover:text-primary uppercase tracking-wide"
        >
          View Full Log
        </Link>
      </div>

      {activities.length > 0 ? (
        <>
          <div className="space-y-2">
            {paginatedActivities.map((activity) => (
              <Link
                key={activity.id}
                href={
                  activity.entity_type === 'item' && activity.entity_id
                    ? `/inventory/${activity.entity_id}`
                    : '#'
                }
                className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-neutral-50"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-900">
                    <span className="font-medium">{activity.user_name || 'System'}</span>
                    {' '}
                    <span className="text-neutral-500">{formatAction(activity.action_type)}</span>
                    {' '}
                    <span className="font-medium">{activity.entity_name || 'item'}</span>
                  </p>
                  <p className="text-xs text-primary mt-0.5">
                    {formatRelativeTime(activity.created_at)}
                  </p>
                </div>

                {/* Chevron */}
                <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">
                {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, activities.length)} of {activities.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-neutral-600 min-w-[3rem] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <RefreshCw className="h-8 w-8 text-primary/30 mx-auto mb-3" />
          <p className="text-neutral-500">No recent activity</p>
          <p className="mt-1 text-sm text-neutral-400">
            Activity will appear here when you start managing inventory
          </p>
        </div>
      )}
    </div>
  )
}

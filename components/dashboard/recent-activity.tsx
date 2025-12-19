'use client'

import Link from 'next/link'
import { RefreshCw, ChevronRight } from 'lucide-react'
import type { ActivityLog } from '@/types/database.types'

interface RecentActivityProps {
  activities: ActivityLog[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Format relative time
  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
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
          className="text-sm font-medium text-pickle-600 hover:text-pickle-700 uppercase tracking-wide"
        >
          View Full Log
        </Link>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((activity) => (
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pickle-50 text-pickle-500 group-hover:bg-pickle-100 group-hover:text-pickle-600 transition-colors">
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
                <p className="text-xs text-pickle-500 mt-0.5">
                  {formatTime(activity.created_at)}
                </p>
              </div>

              {/* Chevron */}
              <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <RefreshCw className="h-8 w-8 text-pickle-200 mx-auto mb-3" />
          <p className="text-neutral-500">No recent activity</p>
          <p className="mt-1 text-sm text-neutral-400">
            Activity will appear here when you start managing inventory
          </p>
        </div>
      )}
    </div>
  )
}

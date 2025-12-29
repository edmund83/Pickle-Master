'use client'

import { useState } from 'react'
import {
  Bell,
  Calendar,
  RefreshCw,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ItemReminderWithDetails } from '@/types/database.types'
import { toggleReminderStatus, deleteItemReminder } from '../actions/reminder-actions'
import { useFormatting } from '@/hooks/useFormatting'

interface ReminderListItemProps {
  reminder: ItemReminderWithDetails
  itemId: string
  onEdit: (reminder: ItemReminderWithDetails) => void
}

const REMINDER_ICONS = {
  low_stock: Bell,
  expiry: Calendar,
  restock: RefreshCw,
}

const REMINDER_COLORS = {
  low_stock: 'bg-yellow-100 text-yellow-600',
  expiry: 'bg-orange-100 text-orange-600',
  restock: 'bg-blue-100 text-blue-600',
}

const STATUS_BADGES = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-neutral-100 text-neutral-600',
  triggered: 'bg-purple-100 text-purple-700',
  expired: 'bg-red-100 text-red-700',
}

export function ReminderListItem({
  reminder,
  itemId,
  onEdit,
}: ReminderListItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { formatShortDate } = useFormatting()

  const Icon = REMINDER_ICONS[reminder.reminder_type]
  const colorClass = REMINDER_COLORS[reminder.reminder_type]
  const statusClass = STATUS_BADGES[reminder.status || 'active']

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await toggleReminderStatus(reminder.id, itemId)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    setIsLoading(true)
    try {
      await deleteItemReminder(reminder.id, itemId)
    } finally {
      setIsLoading(false)
    }
  }

  const canToggle = reminder.status === 'active' || reminder.status === 'paused'

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border border-neutral-100 p-3 transition-colors',
        'hover:bg-neutral-50',
        isLoading && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
          colorClass
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {reminder.title ||
                (reminder.reminder_type === 'low_stock'
                  ? 'Low Stock Alert'
                  : reminder.reminder_type === 'expiry'
                  ? 'Expiry Warning'
                  : 'Restock Reminder')}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {reminder.trigger_description}
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
              statusClass
            )}
          >
            {reminder.status}
          </span>
        </div>

        {/* Meta info */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
          {reminder.next_trigger_at && reminder.status === 'active' && (
            <span>
              Next: {formatShortDate(reminder.next_trigger_at)}
            </span>
          )}
          {reminder.last_triggered_at && (
            <span>
              Last: {formatShortDate(reminder.last_triggered_at)}
            </span>
          )}
          {(reminder.trigger_count ?? 0) > 0 && (
            <span>Triggered {reminder.trigger_count}x</span>
          )}
        </div>

        {/* Notification preferences */}
        <div className="mt-2 flex items-center gap-2">
          {reminder.notify_in_app && (
            <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">
              In-app
            </span>
          )}
          {reminder.notify_email && (
            <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">
              Email
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="relative flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowActions(!showActions)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
              {canToggle && (
                <button
                  onClick={() => {
                    setShowActions(false)
                    handleToggle()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  {reminder.status === 'active' ? 'Pause' : 'Resume'}
                </button>
              )}
              <button
                onClick={() => {
                  setShowActions(false)
                  onEdit(reminder)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  setShowActions(false)
                  handleDelete()
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

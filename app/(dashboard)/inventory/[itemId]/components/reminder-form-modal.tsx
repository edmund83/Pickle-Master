'use client'

import { useState, useEffect } from 'react'
import { X, Bell, Calendar, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  ItemReminderWithDetails,
  ReminderType,
  ReminderRecurrence,
} from '@/types/database.types'
import { createItemReminder, updateItemReminder } from '../actions/reminder-actions'

interface ReminderFormModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemMinQuantity?: number | null
  editReminder?: ItemReminderWithDetails | null
}

const REMINDER_TYPES = [
  {
    value: 'low_stock' as ReminderType,
    label: 'Low Stock',
    icon: Bell,
    description: 'Alert when quantity drops below threshold',
  },
  {
    value: 'expiry' as ReminderType,
    label: 'Expiry',
    icon: Calendar,
    description: 'Alert before items expire',
  },
  {
    value: 'restock' as ReminderType,
    label: 'Restock',
    icon: RefreshCw,
    description: 'Scheduled reminder to restock',
  },
]

const RECURRENCE_OPTIONS: { value: ReminderRecurrence; label: string }[] = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function ReminderFormModal({
  isOpen,
  onClose,
  itemId,
  itemMinQuantity,
  editReminder,
}: ReminderFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [reminderType, setReminderType] = useState<ReminderType>('low_stock')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [threshold, setThreshold] = useState<number>(itemMinQuantity || 10)
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState<number>(7)
  const [scheduledAt, setScheduledAt] = useState('')
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>('once')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(false)

  // Reset form when modal opens/closes or edit reminder changes
  useEffect(() => {
    if (isOpen) {
      if (editReminder) {
        setReminderType(editReminder.reminder_type)
        setTitle(editReminder.title || '')
        setMessage(editReminder.message || '')
        setThreshold(editReminder.threshold || itemMinQuantity || 10)
        setDaysBeforeExpiry(editReminder.days_before_expiry || 7)
        setScheduledAt(
          editReminder.scheduled_at
            ? new Date(editReminder.scheduled_at).toISOString().slice(0, 16)
            : ''
        )
        setRecurrence(editReminder.recurrence)
        setRecurrenceEndDate(editReminder.recurrence_end_date || '')
        setNotifyInApp(editReminder.notify_in_app)
        setNotifyEmail(editReminder.notify_email)
      } else {
        // Reset to defaults for new reminder
        setReminderType('low_stock')
        setTitle('')
        setMessage('')
        setThreshold(itemMinQuantity || 10)
        setDaysBeforeExpiry(7)
        setScheduledAt('')
        setRecurrence('once')
        setRecurrenceEndDate('')
        setNotifyInApp(true)
        setNotifyEmail(false)
      }
      setError(null)
    }
  }, [isOpen, editReminder, itemMinQuantity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editReminder) {
        // Update existing reminder
        const result = await updateItemReminder(editReminder.id, itemId, {
          title: title || undefined,
          message: message || undefined,
          threshold: reminderType === 'low_stock' ? threshold : undefined,
          daysBeforeExpiry: reminderType === 'expiry' ? daysBeforeExpiry : undefined,
          scheduledAt: reminderType === 'restock' && scheduledAt ? scheduledAt : undefined,
          recurrence: reminderType === 'restock' ? recurrence : undefined,
          recurrenceEndDate:
            reminderType === 'restock' && recurrenceEndDate
              ? recurrenceEndDate
              : undefined,
          notifyInApp,
          notifyEmail,
        })

        if (!result.success) {
          setError(result.error || 'Failed to update reminder')
          return
        }
      } else {
        // Create new reminder
        const result = await createItemReminder({
          itemId,
          reminderType,
          title: title || undefined,
          message: message || undefined,
          threshold: reminderType === 'low_stock' ? threshold : undefined,
          daysBeforeExpiry: reminderType === 'expiry' ? daysBeforeExpiry : undefined,
          scheduledAt: reminderType === 'restock' && scheduledAt ? scheduledAt : undefined,
          recurrence: reminderType === 'restock' ? recurrence : undefined,
          recurrenceEndDate:
            reminderType === 'restock' && recurrenceEndDate
              ? recurrenceEndDate
              : undefined,
          notifyInApp,
          notifyEmail,
        })

        if (!result.success) {
          setError(result.error || 'Failed to create reminder')
          return
        }
      }

      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isEditing = !!editReminder

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {isEditing ? 'Edit Reminder' : 'Add Reminder'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Reminder Type Selector (only for new reminders) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Reminder Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {REMINDER_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setReminderType(type.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors',
                        reminderType === type.value
                          ? 'border-pickle-500 bg-pickle-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          reminderType === type.value
                            ? 'text-pickle-600'
                            : 'text-neutral-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs font-medium',
                          reminderType === type.value
                            ? 'text-pickle-700'
                            : 'text-neutral-600'
                        )}
                      >
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {REMINDER_TYPES.find((t) => t.value === reminderType)?.description}
              </p>
            </div>
          )}

          {/* Type-specific fields */}
          {reminderType === 'low_stock' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Threshold Quantity
              </label>
              <input
                type="number"
                min={0}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                placeholder="e.g., 10"
                required
              />
              <p className="mt-1 text-xs text-neutral-500">
                Alert when quantity drops below this number
              </p>
            </div>
          )}

          {reminderType === 'expiry' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Days Before Expiry
              </label>
              <input
                type="number"
                min={1}
                value={daysBeforeExpiry}
                onChange={(e) => setDaysBeforeExpiry(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                placeholder="e.g., 7"
                required
              />
              <p className="mt-1 text-xs text-neutral-500">
                Alert this many days before lots expire
              </p>
            </div>
          )}

          {reminderType === 'restock' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) =>
                    setRecurrence(e.target.value as ReminderRecurrence)
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                >
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {recurrence !== 'once' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Leave empty for indefinite recurrence
                  </p>
                </div>
              )}
            </>
          )}

          {/* Custom Title (optional) */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Custom Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
              placeholder="e.g., Weekly Inventory Check"
            />
          </div>

          {/* Custom Message (optional) */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Custom Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500 resize-none"
              placeholder="Additional details for the notification..."
            />
          </div>

          {/* Notification Preferences */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notifications
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyInApp}
                  onChange={(e) => setNotifyInApp(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-pickle-600 focus:ring-pickle-500"
                />
                <span className="text-sm text-neutral-700">In-app notification</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-pickle-600 focus:ring-pickle-500"
                />
                <span className="text-sm text-neutral-700">Email notification</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Add Reminder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

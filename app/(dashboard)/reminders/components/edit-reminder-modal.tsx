'use client'

import { useState, useEffect } from 'react'
import { X, Package, FolderOpen, Bell, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateReminder, type GlobalReminder } from '../actions/reminder-actions'
import type { ComparisonOperator, ReminderRecurrence } from '@/types/database.types'

interface EditReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  reminder: GlobalReminder | null
}

const COMPARISON_OPTIONS: { value: ComparisonOperator; label: string }[] = [
  { value: 'lte', label: 'At OR Below' },
  { value: 'lt', label: 'Less than' },
  { value: 'gt', label: 'Greater than' },
  { value: 'gte', label: 'Greater than OR Equal' },
  { value: 'eq', label: 'Equal to' },
]

const RECURRENCE_OPTIONS: { value: ReminderRecurrence; label: string }[] = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function EditReminderModal({
  isOpen,
  onClose,
  onUpdated,
  reminder,
}: EditReminderModalProps) {
  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [threshold, setThreshold] = useState(10)
  const [comparisonOperator, setComparisonOperator] = useState<ComparisonOperator>('lte')
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(7)
  const [scheduledAt, setScheduledAt] = useState('')
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>('once')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(false)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form when modal opens with reminder data
  useEffect(() => {
    if (isOpen && reminder) {
      setTitle(reminder.title || '')
      setMessage(reminder.message || '')
      setThreshold(reminder.threshold || 10)
      setComparisonOperator(reminder.comparison_operator || 'lte')
      setDaysBeforeExpiry(reminder.days_before_expiry || 7)
      setScheduledAt(
        reminder.scheduled_at
          ? new Date(reminder.scheduled_at).toISOString().slice(0, 16)
          : ''
      )
      setRecurrence((reminder.recurrence as ReminderRecurrence) || 'once')
      setRecurrenceEndDate(reminder.recurrence_end_date || '')
      setNotifyInApp(reminder.notify_in_app)
      setNotifyEmail(reminder.notify_email)
      setError(null)
    }
  }, [isOpen, reminder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reminder) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateReminder(reminder.id, reminder.source_type, {
        title: title || undefined,
        message: message || undefined,
        threshold: reminder.reminder_type === 'low_stock' ? threshold : undefined,
        comparisonOperator: reminder.reminder_type === 'low_stock' ? comparisonOperator : undefined,
        daysBeforeExpiry: reminder.reminder_type === 'expiry' ? daysBeforeExpiry : undefined,
        scheduledAt: reminder.reminder_type === 'restock' && scheduledAt ? scheduledAt : undefined,
        recurrence: reminder.reminder_type === 'restock' ? recurrence : undefined,
        recurrenceEndDate: reminder.reminder_type === 'restock' && recurrenceEndDate ? recurrenceEndDate : undefined,
        notifyInApp,
        notifyEmail,
      })

      if (!result.success) {
        setError(result.error || 'Failed to update reminder')
        return
      }

      onUpdated()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = () => {
    switch (reminder?.reminder_type) {
      case 'low_stock':
        return <Bell className="h-5 w-5 text-yellow-600" />
      case 'expiry':
        return <Calendar className="h-5 w-5 text-orange-600" />
      case 'restock':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-neutral-600" />
    }
  }

  const getTypeLabel = () => {
    switch (reminder?.reminder_type) {
      case 'low_stock':
        return 'Low Stock Alert'
      case 'expiry':
        return 'Expiry Alert'
      case 'restock':
        return 'Restock Reminder'
      default:
        return 'Reminder'
    }
  }

  const getTargetName = () => {
    if (reminder?.source_type === 'folder') {
      return reminder.folder_name || 'Unknown Folder'
    }
    return reminder?.item_name || 'Unknown Item'
  }

  if (!isOpen || !reminder) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Edit Reminder</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Read-only: Reminder Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Reminder Type
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                {getTypeIcon()}
                <span className="text-sm font-medium text-neutral-700">{getTypeLabel()}</span>
              </div>
            </div>

            {/* Read-only: Target */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Applied to
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                {reminder.source_type === 'folder' ? (
                  <FolderOpen className="h-5 w-5 text-neutral-400" />
                ) : (
                  <Package className="h-5 w-5 text-neutral-400" />
                )}
                <span className="text-sm text-neutral-700">{getTargetName()}</span>
                <span className="ml-auto text-xs text-neutral-400 capitalize">
                  {reminder.source_type}
                </span>
              </div>
            </div>

            {/* Type-specific Config */}
            {reminder.reminder_type === 'low_stock' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Alert when quantity is
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={comparisonOperator}
                    onChange={(e) => setComparisonOperator(e.target.value as ComparisonOperator)}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {COMPARISON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-500">units</span>
                </div>
              </div>
            )}

            {reminder.reminder_type === 'expiry' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Alert days before expiry
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={daysBeforeExpiry}
                    onChange={(e) => setDaysBeforeExpiry(parseInt(e.target.value) || 1)}
                    className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-500">days</span>
                </div>
              </div>
            )}

            {reminder.reminder_type === 'restock' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Recurrence
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as ReminderRecurrence)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g., Weekly Inventory Check"
              />
            </div>

            {/* Custom Message (optional) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">In-app notification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">Email notification</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

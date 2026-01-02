'use client'

import { useState, useTransition } from 'react'
import { Plus, Bell, FolderOpen, Package, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReminderCard } from './reminder-card'
import { NewReminderModal } from './new-reminder-modal'
import { EditReminderModal } from './edit-reminder-modal'
import {
  getAllReminders,
  type GlobalReminder,
  type ReminderStats,
} from '../actions/reminder-actions'

interface RemindersClientProps {
  initialReminders: GlobalReminder[]
  initialTotal: number
  initialStats: ReminderStats
}

type FilterType = 'all' | 'low_stock' | 'expiry' | 'restock'
type FilterStatus = 'all' | 'active' | 'paused'
type FilterSource = 'all' | 'item' | 'folder'

export function RemindersClient({
  initialReminders,
  initialTotal,
  initialStats,
}: RemindersClientProps) {
  const [reminders, setReminders] = useState<GlobalReminder[]>(initialReminders)
  const [total, setTotal] = useState(initialTotal)
  const [stats, setStats] = useState(initialStats)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<GlobalReminder | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filters
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sourceFilter, setSourceFilter] = useState<FilterSource>('all')

  const refreshReminders = () => {
    startTransition(async () => {
      const result = await getAllReminders(
        typeFilter === 'all' ? undefined : typeFilter,
        statusFilter === 'all' ? undefined : statusFilter
      )
      setReminders(result.reminders)
      setTotal(result.total)
    })
  }

  const handleFilterChange = (
    newType?: FilterType,
    newStatus?: FilterStatus,
    newSource?: FilterSource
  ) => {
    if (newType !== undefined) setTypeFilter(newType)
    if (newStatus !== undefined) setStatusFilter(newStatus)
    if (newSource !== undefined) setSourceFilter(newSource)

    const type = newType ?? typeFilter
    const status = newStatus ?? statusFilter

    startTransition(async () => {
      const result = await getAllReminders(
        type === 'all' ? undefined : type,
        status === 'all' ? undefined : status
      )
      setReminders(result.reminders)
      setTotal(result.total)
    })
  }

  // Filter reminders by source client-side (since API doesn't support it directly)
  const filteredReminders = reminders.filter((r) => {
    if (sourceFilter === 'all') return true
    return r.source_type === sourceFilter
  })

  const handleReminderDeleted = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    setTotal((prev) => prev - 1)
  }

  const handleReminderToggled = (id: string, newStatus: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
  }

  const handleEditReminder = (reminder: GlobalReminder) => {
    setEditingReminder(reminder)
    setIsEditModalOpen(true)
  }

  const handleReminderUpdated = () => {
    refreshReminders()
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Reminders</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage alerts for your inventory items and folders
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Reminder
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                <p className="text-xs text-neutral-500">Total Reminders</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.active}</p>
                <p className="text-xs text-neutral-500">Active</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats.by_type.low_stock}
                </p>
                <p className="text-xs text-neutral-500">Low Stock</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <FolderOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats.by_type.expiry}
                </p>
                <p className="text-xs text-neutral-500">Expiry</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-500">Filter:</span>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
            disabled={isPending}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="low_stock">Low Stock</option>
            <option value="expiry">Expiry</option>
            <option value="restock">Restock</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              handleFilterChange(undefined, e.target.value as FilterStatus)
            }
            disabled={isPending}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) =>
              handleFilterChange(undefined, undefined, e.target.value as FilterSource)
            }
            disabled={isPending}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Sources</option>
            <option value="item">Items Only</option>
            <option value="folder">Folders Only</option>
          </select>

          {isPending && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
          )}
        </div>

        {/* Reminder List */}
        <div className="space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <Bell className="mx-auto h-12 w-12 text-neutral-300" />
              <h3 className="mt-4 text-lg font-medium text-neutral-900">
                No reminders found
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {typeFilter === 'all' && statusFilter === 'all' && sourceFilter === 'all'
                  ? 'Create your first reminder to get started'
                  : 'Try adjusting your filters'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary"
              >
                <Plus className="h-4 w-4" />
                New Reminder
              </button>
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onDeleted={() => handleReminderDeleted(reminder.id)}
                onToggled={(newStatus) => handleReminderToggled(reminder.id, newStatus)}
                onEdit={() => handleEditReminder(reminder)}
              />
            ))
          )}
        </div>

        {/* Pagination info */}
        {total > filteredReminders.length && (
          <p className="mt-4 text-center text-sm text-neutral-500">
            Showing {filteredReminders.length} of {total} reminders
          </p>
        )}
      </div>

      {/* New Reminder Modal */}
      <NewReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refreshReminders}
      />

      {/* Edit Reminder Modal */}
      <EditReminderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingReminder(null)
        }}
        onUpdated={handleReminderUpdated}
        reminder={editingReminder}
      />
    </div>
  )
}

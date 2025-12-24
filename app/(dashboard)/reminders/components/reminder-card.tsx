'use client'

import { useState } from 'react'
import {
  Bell,
  FolderOpen,
  Package,
  Calendar,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Clock,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  deleteReminder,
  toggleReminder,
  type GlobalReminder,
} from '../actions/reminder-actions'

interface ReminderCardProps {
  reminder: GlobalReminder
  onDeleted: () => void
  onToggled: (newStatus: string) => void
  onEdit?: () => void
}

export function ReminderCard({ reminder, onDeleted, onToggled, onEdit }: ReminderCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    setIsMenuOpen(false)
    try {
      const result = await toggleReminder(reminder.id, reminder.source_type)
      if (result.success && result.newStatus) {
        onToggled(result.newStatus)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reminder?')) return
    setIsLoading(true)
    setIsMenuOpen(false)
    try {
      const result = await deleteReminder(reminder.id, reminder.source_type)
      if (result.success) {
        onDeleted()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = () => {
    switch (reminder.reminder_type) {
      case 'low_stock':
        return <Package className="h-5 w-5" />
      case 'expiry':
        return <Calendar className="h-5 w-5" />
      case 'restock':
        return <Clock className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getTypeColor = () => {
    switch (reminder.reminder_type) {
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-600'
      case 'expiry':
        return 'bg-orange-100 text-orange-600'
      case 'restock':
        return 'bg-blue-100 text-blue-600'
      default:
        return 'bg-neutral-100 text-neutral-600'
    }
  }

  const getTypeLabel = () => {
    switch (reminder.reminder_type) {
      case 'low_stock':
        return 'Low Stock'
      case 'expiry':
        return 'Expiry'
      case 'restock':
        return 'Restock'
      default:
        return reminder.reminder_type
    }
  }

  const getTargetName = () => {
    if (reminder.source_type === 'folder') {
      return reminder.folder_name || 'Unknown Folder'
    }
    return reminder.item_name || 'Unknown Item'
  }

  return (
    <div
      className={cn(
        'relative rounded-xl bg-white p-4 shadow-sm transition-opacity',
        isLoading && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', getTypeColor())}>
          {getTypeIcon()}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-neutral-900">
                  {reminder.title || `${getTypeLabel()} Alert`}
                </h3>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    reminder.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-100 text-neutral-600'
                  )}
                >
                  {reminder.status === 'active' ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                {reminder.source_type === 'folder' ? (
                  <FolderOpen className="h-4 w-4 text-neutral-400" />
                ) : (
                  <Package className="h-4 w-4 text-neutral-400" />
                )}
                <span className="truncate">{getTargetName()}</span>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    {onEdit && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          onEdit()
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={handleToggle}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      {reminder.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Resume
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trigger Description */}
          <p className="mt-2 text-sm text-neutral-600">
            {reminder.trigger_description}
          </p>

          {/* Footer */}
          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
            <span>
              Created by {reminder.created_by_name || 'Unknown'}
            </span>
            <span>
              {formatDistanceToNow(new Date(reminder.created_at), {
                addSuffix: true,
              })}
            </span>
            {reminder.trigger_count > 0 && (
              <span>Triggered {reminder.trigger_count} times</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

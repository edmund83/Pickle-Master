'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ItemDetailCard } from './item-detail-card'
import { ReminderListItem } from './reminder-list-item'
import { ReminderFormModal } from './reminder-form-modal'
import { getItemReminders } from '../actions/reminder-actions'
import type { ItemReminderWithDetails } from '@/types/database.types'

interface ItemRemindersCardProps {
  itemId: string
  itemMinQuantity?: number | null
  className?: string
}

export function ItemRemindersCard({
  itemId,
  itemMinQuantity,
  className,
}: ItemRemindersCardProps) {
  const [reminders, setReminders] = useState<ItemReminderWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] =
    useState<ItemReminderWithDetails | null>(null)

  // Load reminders on mount
  useEffect(() => {
    loadReminders()
  }, [itemId])

  const loadReminders = async () => {
    setIsLoading(true)
    try {
      const data = await getItemReminders(itemId)
      setReminders(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingReminder(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (reminder: ItemReminderWithDetails) => {
    setEditingReminder(reminder)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingReminder(null)
    // Refresh reminders after modal closes
    loadReminders()
  }

  // Separate active and inactive reminders (DB enum: active | paused | triggered | expired)
  const activeReminders = reminders.filter(
    (r) => r.status === 'active' || r.status === 'paused'
  )
  const inactiveReminders = reminders.filter(
    (r) => r.status === 'triggered' || r.status === 'expired'
  )

  return (
    <>
      <ItemDetailCard
        title="Reminders"
        icon={<Bell className="h-5 w-5" />}
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
            onClick={handleAddClick}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
        className={className}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-10 w-10 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No reminders set</p>
            <p className="text-xs text-neutral-400 mt-1">
              Add a reminder to get notified about stock levels, expiry dates, or
              scheduled restocks
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleAddClick}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Reminder
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Reminders */}
            {activeReminders.length > 0 && (
              <div className="space-y-2">
                {activeReminders.map((reminder) => (
                  <ReminderListItem
                    key={reminder.id}
                    reminder={reminder}
                    itemId={itemId}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            )}

            {/* Inactive Reminders (collapsed by default) */}
            {inactiveReminders.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700">
                  {inactiveReminders.length} completed/expired reminder
                  {inactiveReminders.length > 1 ? 's' : ''}
                </summary>
                <div className="mt-2 space-y-2 opacity-60">
                  {inactiveReminders.map((reminder) => (
                    <ReminderListItem
                      key={reminder.id}
                      reminder={reminder}
                      itemId={itemId}
                      onEdit={handleEditClick}
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </ItemDetailCard>

      {/* Form Modal */}
      <ReminderFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        itemId={itemId}
        itemMinQuantity={itemMinQuantity}
        editReminder={editingReminder}
      />
    </>
  )
}

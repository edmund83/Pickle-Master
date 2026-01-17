'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X,
  Search,
  Package,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createBulkItemReminders,
  createFolderReminder,
  getItemsForSelection,
  getFoldersForSelection,
  getTeamMembers,
} from '../actions/reminder-actions'
import type { ReminderType, ComparisonOperator, Profile } from '@/types/database.types'

interface NewReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

type TargetType = 'items' | 'folder'

const COMPARISON_OPTIONS: { value: ComparisonOperator; label: string }[] = [
  { value: 'lte', label: 'At OR Below' },
  { value: 'lt', label: 'Less than' },
  { value: 'gt', label: 'Greater than' },
  { value: 'gte', label: 'Greater than OR Equal' },
  { value: 'eq', label: 'Equal to' },
]

export function NewReminderModal({
  isOpen,
  onClose,
  onCreated,
}: NewReminderModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Target selection
  const [targetType, setTargetType] = useState<TargetType>('items')
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  // Data
  const [items, setItems] = useState<{ id: string; name: string; folder_id: string | null }[]>([])
  const [folders, setFolders] = useState<{ id: string; name: string; parent_id: string | null; item_count: number }[]>([])
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Reminder config
  const [reminderType, setReminderType] = useState<ReminderType>('low_stock')
  const [threshold, setThreshold] = useState(10)
  const [comparisonOperator, setComparisonOperator] = useState<ComparisonOperator>('lte')
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(7)

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false)
  const membersDropdownRef = useRef<HTMLDivElement>(null)

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true)
      Promise.all([
        getItemsForSelection(),
        getFoldersForSelection(),
        getTeamMembers(),
      ])
        .then(([itemsData, foldersData, membersData]) => {
          setItems(itemsData)
          setFolders(foldersData)
          setTeamMembers(membersData)
        })
        .finally(() => setIsLoadingData(false))
    }
  }, [isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTargetType('items')
      setSelectedItemIds([])
      setSelectedFolderId(null)
      setSearchQuery('')
      setReminderType('low_stock')
      setThreshold(10)
      setComparisonOperator('lte')
      setDaysBeforeExpiry(7)
      setShowAdvanced(false)
      setSelectedMembers([])
      setError(null)
    }
  }, [isOpen])

  // Close members dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        membersDropdownRef.current &&
        !membersDropdownRef.current.contains(event.target as Node)
      ) {
        setMembersDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async () => {
    setError(null)

    if (targetType === 'items' && selectedItemIds.length === 0) {
      setError('Please select at least one item')
      return
    }
    if (targetType === 'folder' && !selectedFolderId) {
      setError('Please select a folder')
      return
    }

    setIsSubmitting(true)
    try {
      if (targetType === 'items') {
        const result = await createBulkItemReminders({
          itemIds: selectedItemIds,
          reminderType,
          threshold: reminderType === 'low_stock' ? threshold : undefined,
          comparisonOperator: reminderType === 'low_stock' ? comparisonOperator : undefined,
          daysBeforeExpiry: reminderType === 'expiry' ? daysBeforeExpiry : undefined,
          notifyInApp: true,
          notifyUserIds: selectedMembers.length > 0 ? selectedMembers : undefined,
        })

        if (!result.success) {
          setError(result.error || 'Failed to create reminders')
          return
        }
      } else {
        const result = await createFolderReminder({
          folderId: selectedFolderId!,
          reminderType,
          threshold: reminderType === 'low_stock' ? threshold : undefined,
          comparisonOperator: reminderType === 'low_stock' ? comparisonOperator : undefined,
          daysBeforeExpiry: reminderType === 'expiry' ? daysBeforeExpiry : undefined,
          notifyInApp: true,
          notifyUserIds: selectedMembers.length > 0 ? selectedMembers : undefined,
        })

        if (!result.success) {
          setError(result.error || 'Failed to create reminder')
          return
        }
      }

      onCreated()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getSelectedMemberNames = () => {
    if (selectedMembers.length === 0) return 'Select users...'
    const names = selectedMembers
      .map((id) => {
        const member = teamMembers.find((m) => m.id === id)
        return member?.full_name || member?.email || 'Unknown'
      })
      .filter(Boolean)
    if (names.length === 1) return names[0]
    if (names.length === 2) return names.join(' and ')
    return `${names[0]} and ${names.length - 1} others`
  }

  // Filter items/folders by search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Create Reminder</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Target Type Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Apply to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('items')
                      setSelectedFolderId(null)
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors',
                      targetType === 'items'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    <Package className="h-5 w-5" />
                    Specific Items
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('folder')
                      setSelectedItemIds([])
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors',
                      targetType === 'folder'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    <FolderOpen className="h-5 w-5 text-accent" fill="oklch(95% 0.08 85.79)" />
                    Entire Folder
                  </button>
                </div>
              </div>

              {/* Search & Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {targetType === 'items' ? 'Select Items' : 'Select Folder'}
                </label>

                {/* Search Input */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${targetType === 'items' ? 'items' : 'folders'}...`}
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Selection List */}
                <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200">
                  {targetType === 'items' ? (
                    filteredItems.length === 0 ? (
                      <p className="p-4 text-center text-sm text-neutral-500">
                        No items found
                      </p>
                    ) : (
                      filteredItems.map((item) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0 hover:bg-neutral-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                          />
                          <Package className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm text-neutral-700 truncate">
                            {item.name}
                          </span>
                        </label>
                      ))
                    )
                  ) : filteredFolders.length === 0 ? (
                    <p className="p-4 text-center text-sm text-neutral-500">
                      No folders found
                    </p>
                  ) : (
                    filteredFolders.map((folder) => (
                      <label
                        key={folder.id}
                        className="flex cursor-pointer items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0 hover:bg-neutral-50"
                      >
                        <input
                          type="radio"
                          name="folder"
                          checked={selectedFolderId === folder.id}
                          onChange={() => setSelectedFolderId(folder.id)}
                          className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary"
                        />
                        <FolderOpen className="h-4 w-4 text-accent" fill="oklch(95% 0.08 85.79)" />
                        <span className="text-sm text-neutral-700 truncate flex-1">
                          {folder.name}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {folder.item_count} items
                        </span>
                      </label>
                    ))
                  )}
                </div>

                {targetType === 'items' && selectedItemIds.length > 0 && (
                  <p className="mt-2 text-xs text-neutral-500">
                    {selectedItemIds.length} item{selectedItemIds.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Reminder Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Reminder Type
                </label>
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value as ReminderType)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="low_stock">Low Stock Alert</option>
                  <option value="expiry">Expiry Alert</option>
                </select>
              </div>

              {/* Type-specific Config */}
              {reminderType === 'low_stock' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Alert when quantity is
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={comparisonOperator}
                      onChange={(e) =>
                        setComparisonOperator(e.target.value as ComparisonOperator)
                      }
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

              {reminderType === 'expiry' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Alert days before expiry
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={daysBeforeExpiry}
                      onChange={(e) =>
                        setDaysBeforeExpiry(parseInt(e.target.value) || 1)
                      }
                      className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-sm text-neutral-500">days</span>
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-800"
                >
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-4">
                    {/* Team Members Multi-Select */}
                    <div ref={membersDropdownRef} className="relative">
                      <label className="block text-xs font-medium text-neutral-600 mb-2">
                        Notify Other Users
                      </label>
                      <button
                        type="button"
                        onClick={() => setMembersDropdownOpen(!membersDropdownOpen)}
                        className="w-full flex items-center justify-between rounded-lg border border-neutral-300 px-3 py-2 text-sm text-left hover:border-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <span
                          className={cn(
                            'truncate',
                            selectedMembers.length === 0
                              ? 'text-neutral-400'
                              : 'text-neutral-700'
                          )}
                        >
                          {getSelectedMemberNames()}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 text-neutral-400 transition-transform',
                            membersDropdownOpen && 'rotate-180'
                          )}
                        />
                      </button>
                      {membersDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border border-neutral-200 bg-white shadow-lg max-h-40 overflow-y-auto">
                          {teamMembers.map((member) => (
                            <label
                              key={member.id}
                              className="flex items-center gap-2 py-2 px-3 hover:bg-neutral-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedMembers.includes(member.id)}
                                onChange={() => toggleMember(member.id)}
                                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-neutral-700 truncate flex-1">
                                {member.full_name || member.email}
                              </span>
                              <span className="text-xs text-neutral-400 capitalize">
                                {member.role}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

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
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingData}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary',
              (isSubmitting || isLoadingData) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create Reminder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

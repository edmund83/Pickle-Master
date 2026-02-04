'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, BellOff, Calendar, X, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getItemReminders,
  createItemReminder,
  deleteItemReminder,
  getTeamMembers,
} from '../actions/reminder-actions'
import type {
  ItemReminderWithDetails,
  ReminderType,
  ComparisonOperator,
  Profile,
} from '@/types/database.types'

interface InlineRemindersProps {
  itemId: string
  minQuantity?: number | null
  className?: string
}

const COMPARISON_OPTIONS: { value: ComparisonOperator; label: string }[] = [
  { value: 'lte', label: 'At OR Below' },
  { value: 'lt', label: 'Less than' },
  { value: 'gt', label: 'Greater than' },
  { value: 'gte', label: 'Greater than OR Equal' },
  { value: 'eq', label: 'Equal to' },
]

export function InlineReminders({
  itemId,
  minQuantity,
  className,
}: InlineRemindersProps) {
  const [reminders, setReminders] = useState<ItemReminderWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<ReminderType | null>(null)

  // Popover state
  const [showLowStockPopover, setShowLowStockPopover] = useState(false)
  const [showExpiryPopover, setShowExpiryPopover] = useState(false)

  // Low stock form state
  const [lowStockThreshold, setLowStockThreshold] = useState(minQuantity || 10)
  const [comparisonOperator, setComparisonOperator] = useState<ComparisonOperator>('lte')
  const [lowStockShowAdvanced, setLowStockShowAdvanced] = useState(false)
  const [lowStockSelectedMembers, setLowStockSelectedMembers] = useState<string[]>([])
  const [lowStockEmails, setLowStockEmails] = useState('')

  // Expiry form state
  const [expiryDays, setExpiryDays] = useState(7)
  const [expiryShowAdvanced, setExpiryShowAdvanced] = useState(false)
  const [expirySelectedMembers, setExpirySelectedMembers] = useState<string[]>([])
  const [expiryEmails, setExpiryEmails] = useState('')

  // Team members
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [lowStockUsersDropdownOpen, setLowStockUsersDropdownOpen] = useState(false)
  const [expiryUsersDropdownOpen, setExpiryUsersDropdownOpen] = useState(false)

  const lowStockPopoverRef = useRef<HTMLDivElement>(null)
  const expiryPopoverRef = useRef<HTMLDivElement>(null)
  const lowStockUsersDropdownRef = useRef<HTMLDivElement>(null)
  const expiryUsersDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReminders()
  }, [itemId])

  // Close popovers and dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        lowStockPopoverRef.current &&
        !lowStockPopoverRef.current.contains(event.target as Node)
      ) {
        setShowLowStockPopover(false)
        setLowStockShowAdvanced(false)
        setLowStockUsersDropdownOpen(false)
      }
      if (
        expiryPopoverRef.current &&
        !expiryPopoverRef.current.contains(event.target as Node)
      ) {
        setShowExpiryPopover(false)
        setExpiryShowAdvanced(false)
        setExpiryUsersDropdownOpen(false)
      }
      // Close user dropdowns when clicking outside them (but inside popover)
      if (
        lowStockUsersDropdownRef.current &&
        !lowStockUsersDropdownRef.current.contains(event.target as Node)
      ) {
        setLowStockUsersDropdownOpen(false)
      }
      if (
        expiryUsersDropdownRef.current &&
        !expiryUsersDropdownRef.current.contains(event.target as Node)
      ) {
        setExpiryUsersDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadReminders = async () => {
    setIsLoading(true)
    try {
      const data = await getItemReminders(itemId)
      setReminders(data)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    if (teamMembers.length > 0) return // Already loaded
    setLoadingMembers(true)
    try {
      const members = await getTeamMembers()
      setTeamMembers(members)
    } finally {
      setLoadingMembers(false)
    }
  }

  // Get item-specific reminders (not folder)
  const getItemLowStockReminder = () =>
    reminders.find((r) => r.reminder_type === 'low_stock' && r.status === 'active' && r.source_type !== 'folder')
  const getItemExpiryReminder = () =>
    reminders.find((r) => r.reminder_type === 'expiry' && r.status === 'active' && r.source_type !== 'folder')

  // Get folder-level reminders
  const getFolderReminders = () =>
    reminders.filter((r) => r.source_type === 'folder' && r.status === 'active')

  const handleLowStockClick = async () => {
    const existing = getItemLowStockReminder()
    if (existing) {
      // Turn off - delete immediately
      setIsUpdating('low_stock')
      try {
        await deleteItemReminder(existing.id, itemId)
        await loadReminders()
      } finally {
        setIsUpdating(null)
      }
    } else {
      // Turn on - show popover to configure
      setLowStockThreshold(minQuantity || 10)
      setComparisonOperator('lte')
      setLowStockSelectedMembers([])
      setLowStockEmails('')
      setLowStockShowAdvanced(false)
      setShowLowStockPopover(true)
    }
  }

  const handleExpiryClick = async () => {
    const existing = getItemExpiryReminder()
    if (existing) {
      // Turn off - delete immediately
      setIsUpdating('expiry')
      try {
        await deleteItemReminder(existing.id, itemId)
        await loadReminders()
      } finally {
        setIsUpdating(null)
      }
    } else {
      // Turn on - show popover to configure
      setExpiryDays(7)
      setExpirySelectedMembers([])
      setExpiryEmails('')
      setExpiryShowAdvanced(false)
      setShowExpiryPopover(true)
    }
  }

  const handleEnableLowStock = async () => {
    setShowLowStockPopover(false)
    setIsUpdating('low_stock')
    try {
      await createItemReminder({
        itemId,
        reminderType: 'low_stock',
        threshold: lowStockThreshold,
        comparisonOperator,
        notifyInApp: true,
        notifyEmail: lowStockEmails.trim().length > 0 || lowStockSelectedMembers.length > 0,
        notifyUserIds: lowStockSelectedMembers.length > 0 ? lowStockSelectedMembers : undefined,
      })
      await loadReminders()
    } finally {
      setIsUpdating(null)
    }
  }

  const handleEnableExpiry = async () => {
    setShowExpiryPopover(false)
    setIsUpdating('expiry')
    try {
      await createItemReminder({
        itemId,
        reminderType: 'expiry',
        daysBeforeExpiry: expiryDays,
        notifyInApp: true,
        notifyEmail: expiryEmails.trim().length > 0 || expirySelectedMembers.length > 0,
        notifyUserIds: expirySelectedMembers.length > 0 ? expirySelectedMembers : undefined,
      })
      await loadReminders()
    } finally {
      setIsUpdating(null)
    }
  }

  const toggleMember = (memberId: string, isLowStock: boolean) => {
    if (isLowStock) {
      setLowStockSelectedMembers((prev) =>
        prev.includes(memberId)
          ? prev.filter((id) => id !== memberId)
          : [...prev, memberId]
      )
    } else {
      setExpirySelectedMembers((prev) =>
        prev.includes(memberId)
          ? prev.filter((id) => id !== memberId)
          : [...prev, memberId]
      )
    }
  }

  const getSelectedMemberNames = (selectedIds: string[]) => {
    if (selectedIds.length === 0) return 'Select users...'
    const names = selectedIds
      .map((id) => {
        const member = teamMembers.find((m) => m.id === id)
        return member?.full_name || member?.email || 'Unknown'
      })
      .filter(Boolean)
    if (names.length === 1) return names[0]
    if (names.length === 2) return names.join(' and ')
    return `${names[0]} and ${names.length - 1} others`
  }

  const getComparisonLabel = (op: ComparisonOperator | null | undefined) => {
    switch (op) {
      case 'lte': return '≤'
      case 'lt': return '<'
      case 'gt': return '>'
      case 'gte': return '≥'
      case 'eq': return '='
      default: return '≤'
    }
  }

  const lowStockActive = !!getItemLowStockReminder()
  const expiryActive = !!getItemExpiryReminder()
  const folderReminders = getFolderReminders()

  // Check if folder already has specific reminder types
  const hasFolderLowStock = folderReminders.some((r) => r.reminder_type === 'low_stock')
  const hasFolderExpiry = folderReminders.some((r) => r.reminder_type === 'expiry')

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-4 w-4 animate-spin rounded-full border border-neutral-200 border-t-primary" />
        <span className="text-xs text-neutral-400">Loading...</span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-xs font-medium text-neutral-500 mb-1">Alerts</p>
      <div className="flex flex-wrap gap-2">
        {/* Low Stock Alert Toggle */}
        <div className="relative" ref={lowStockPopoverRef}>
          <button
            type="button"
            onClick={handleLowStockClick}
            disabled={isUpdating !== null || hasFolderLowStock}
            title={hasFolderLowStock ? 'Folder already has a Low Stock reminder' : undefined}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              lowStockActive
                ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
              isUpdating === 'low_stock' && 'opacity-50 cursor-wait',
              hasFolderLowStock && 'opacity-50 cursor-not-allowed hover:bg-neutral-100'
            )}
          >
            {isUpdating === 'low_stock' ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
            ) : lowStockActive ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5" />
            )}
            Low Stock
            {lowStockActive && (
              <span className="text-[10px] opacity-75">
                ({getComparisonLabel(getItemLowStockReminder()?.comparison_operator)}{getItemLowStockReminder()?.threshold || minQuantity || 10})
              </span>
            )}
          </button>

          {/* Low Stock Popover */}
          {showLowStockPopover && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 rounded-lg border border-neutral-200 bg-white shadow-lg">
              <div className="p-3 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-800">Alert me when Quantity is:</span>
                  <button
                    type="button"
                    onClick={() => setShowLowStockPopover(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Comparison Operator Dropdown */}
                <select
                  value={comparisonOperator}
                  onChange={(e) => setComparisonOperator(e.target.value as ComparisonOperator)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm mb-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {COMPARISON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Threshold Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-500">units</span>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => {
                    setLowStockShowAdvanced(!lowStockShowAdvanced)
                    if (!lowStockShowAdvanced) loadTeamMembers()
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-800"
                >
                  {lowStockShowAdvanced ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  Advanced Options
                </button>

                {lowStockShowAdvanced && (
                  <div className="mt-3 space-y-3">
                    {/* Team Members Multi-Select Dropdown */}
                    <div ref={lowStockUsersDropdownRef} className="relative">
                      <label className="block text-xs font-medium text-neutral-600 mb-2">
                        Notify Other Users
                      </label>
                      {loadingMembers ? (
                        <div className="flex items-center gap-2 py-2">
                          <div className="h-3 w-3 animate-spin rounded-full border border-neutral-300 border-t-primary" />
                          <span className="text-xs text-neutral-400">Loading...</span>
                        </div>
                      ) : teamMembers.length > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setLowStockUsersDropdownOpen(!lowStockUsersDropdownOpen)}
                            className="w-full flex items-center justify-between rounded-lg border border-neutral-300 px-3 py-2 text-xs text-left hover:border-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <span className={cn(
                              'truncate',
                              lowStockSelectedMembers.length === 0 ? 'text-neutral-400' : 'text-neutral-700'
                            )}>
                              {getSelectedMemberNames(lowStockSelectedMembers)}
                            </span>
                            <ChevronDown className={cn(
                              'h-3.5 w-3.5 text-neutral-400 transition-transform',
                              lowStockUsersDropdownOpen && 'rotate-180'
                            )} />
                          </button>
                          {lowStockUsersDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border border-neutral-200 bg-white shadow-lg max-h-32 overflow-y-auto">
                              {teamMembers.map((member) => (
                                <label
                                  key={member.id}
                                  className="flex items-center gap-2 py-1.5 px-3 hover:bg-neutral-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={lowStockSelectedMembers.includes(member.id)}
                                    onChange={() => toggleMember(member.id, true)}
                                    className="h-3.5 w-3.5 rounded border-neutral-300 text-primary focus:ring-primary"
                                  />
                                  <span className="text-xs text-neutral-700 truncate flex-1">
                                    {member.full_name || member.email}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 capitalize">
                                    {member.role}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-neutral-400">No team members found</p>
                      )}
                    </div>

                    {/* Email Addresses */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Email addresses (optional)
                      </label>
                      <input
                        type="text"
                        value={lowStockEmails}
                        onChange={(e) => setLowStockEmails(e.target.value)}
                        placeholder="email1@example.com, email2@..."
                        className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Comma separated</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 p-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowLowStockPopover(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEnableLowStock}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary"
                >
                  Enable
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Expiry Alert Toggle */}
        <div className="relative" ref={expiryPopoverRef}>
          <button
            type="button"
            onClick={handleExpiryClick}
            disabled={isUpdating !== null || hasFolderExpiry}
            title={hasFolderExpiry ? 'Folder already has an Expiry reminder' : undefined}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              expiryActive
                ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
              isUpdating === 'expiry' && 'opacity-50 cursor-wait',
              hasFolderExpiry && 'opacity-50 cursor-not-allowed hover:bg-neutral-100'
            )}
          >
            {isUpdating === 'expiry' ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
            ) : expiryActive ? (
              <Calendar className="h-3.5 w-3.5" />
            ) : (
              <Calendar className="h-3.5 w-3.5 opacity-50" />
            )}
            Expiry
            {expiryActive && (
              <span className="text-[10px] opacity-75">
                ({getItemExpiryReminder()?.days_before_expiry || 7}d before)
              </span>
            )}
          </button>

          {/* Expiry Popover */}
          {showExpiryPopover && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 rounded-lg border border-neutral-200 bg-white shadow-lg">
              <div className="p-3 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-800">Alert days before expiry:</span>
                  <button
                    type="button"
                    onClick={() => setShowExpiryPopover(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Days Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
                    className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-500">days</span>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => {
                    setExpiryShowAdvanced(!expiryShowAdvanced)
                    if (!expiryShowAdvanced) loadTeamMembers()
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-800"
                >
                  {expiryShowAdvanced ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  Advanced Options
                </button>

                {expiryShowAdvanced && (
                  <div className="mt-3 space-y-3">
                    {/* Team Members Multi-Select Dropdown */}
                    <div ref={expiryUsersDropdownRef} className="relative">
                      <label className="block text-xs font-medium text-neutral-600 mb-2">
                        Notify Other Users
                      </label>
                      {loadingMembers ? (
                        <div className="flex items-center gap-2 py-2">
                          <div className="h-3 w-3 animate-spin rounded-full border border-neutral-300 border-t-primary" />
                          <span className="text-xs text-neutral-400">Loading...</span>
                        </div>
                      ) : teamMembers.length > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setExpiryUsersDropdownOpen(!expiryUsersDropdownOpen)}
                            className="w-full flex items-center justify-between rounded-lg border border-neutral-300 px-3 py-2 text-xs text-left hover:border-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <span className={cn(
                              'truncate',
                              expirySelectedMembers.length === 0 ? 'text-neutral-400' : 'text-neutral-700'
                            )}>
                              {getSelectedMemberNames(expirySelectedMembers)}
                            </span>
                            <ChevronDown className={cn(
                              'h-3.5 w-3.5 text-neutral-400 transition-transform',
                              expiryUsersDropdownOpen && 'rotate-180'
                            )} />
                          </button>
                          {expiryUsersDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border border-neutral-200 bg-white shadow-lg max-h-32 overflow-y-auto">
                              {teamMembers.map((member) => (
                                <label
                                  key={member.id}
                                  className="flex items-center gap-2 py-1.5 px-3 hover:bg-neutral-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={expirySelectedMembers.includes(member.id)}
                                    onChange={() => toggleMember(member.id, false)}
                                    className="h-3.5 w-3.5 rounded border-neutral-300 text-primary focus:ring-primary"
                                  />
                                  <span className="text-xs text-neutral-700 truncate flex-1">
                                    {member.full_name || member.email}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 capitalize">
                                    {member.role}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-neutral-400">No team members found</p>
                      )}
                    </div>

                    {/* Email Addresses */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Email addresses (optional)
                      </label>
                      <input
                        type="text"
                        value={expiryEmails}
                        onChange={(e) => setExpiryEmails(e.target.value)}
                        placeholder="email1@example.com, email2@..."
                        className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Comma separated</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 p-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowExpiryPopover(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEnableExpiry}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary"
                >
                  Enable
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Folder Reminders (read-only) */}
      {folderReminders.length > 0 && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 mb-1.5">From folder</p>
          <div className="flex flex-wrap gap-2">
            {folderReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200"
                title={`Folder reminder from "${reminder.folder_name}"`}
              >
                <FolderOpen className="h-3 w-3 opacity-70" />
                {reminder.reminder_type === 'low_stock' && (
                  <>
                    Low Stock
                    <span className="text-[10px] opacity-75">
                      ({getComparisonLabel(reminder.comparison_operator)}{reminder.threshold})
                    </span>
                  </>
                )}
                {reminder.reminder_type === 'expiry' && (
                  <>
                    Expiry
                    <span className="text-[10px] opacity-75">
                      ({reminder.days_before_expiry}d)
                    </span>
                  </>
                )}
                {reminder.reminder_type === 'restock' && (
                  <>
                    Restock
                    <span className="text-[10px] opacity-75">
                      ({reminder.recurrence})
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

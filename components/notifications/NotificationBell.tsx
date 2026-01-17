'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import Link from 'next/link'
import { Bell, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import { useTenantSettings } from '@/contexts/TenantSettingsContext'
import { toZonedTime } from 'date-fns-tz'
import { getNotificationIcon, getNotificationColor, getEntityRoute } from '@/lib/notifications/notification-utils'
import type { Notification } from '@/types/database.types'

// Polling interval: 60 seconds (increased from 30s to reduce API load)
const POLL_INTERVAL_MS = 60000

// Explicit columns to select (avoid select('*'))
const NOTIFICATION_COLUMNS = 'id, title, message, notification_type, notification_subtype, entity_type, entity_id, created_at'

interface NotificationBellProps {
  className?: string
  variant?: 'default' | 'sidebar' | 'mobile'
  isExpanded?: boolean
}

export function NotificationBell({ className, variant = 'default', isExpanded = false }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { formatShortDate } = useFormatting()
  const settings = useTenantSettings()

  // Get userId from auth store (no need to call auth.getUser() every time)
  const userId = useAuthStore((state) => state.userId)
  const fetchAuthIfNeeded = useAuthStore((state) => state.fetchAuthIfNeeded)

  // Load notifications - optimized to use cached userId and denormalized count
  const loadNotifications = useCallback(async () => {
    const supabase = createClient()

    try {
      // Use cached userId from store, or fetch if needed
      let currentUserId = userId
      if (!currentUserId) {
        const authResult = await fetchAuthIfNeeded()
        currentUserId = authResult?.userId ?? null
      }

      if (!currentUserId) return

      // Fetch unread_notification_count from profile (single row, no count: exact needed)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('unread_notification_count')
        .eq('id', currentUserId)
        .single()

      // Get recent unread notifications with explicit columns (limit 5 for dropdown)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('notifications')
        .select(NOTIFICATION_COLUMNS)
        .eq('user_id', currentUserId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5)

      setNotifications((data || []) as Notification[])
      setUnreadCount(profile?.unread_notification_count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [userId, fetchAuthIfNeeded])

  // Load notifications on mount and set up polling with visibility API
  useEffect(() => {
    loadNotifications()

    // Set up polling only when tab is visible
    const startPolling = () => {
      if (intervalRef.current) return // Already polling
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadNotifications()
        }
      }, POLL_INTERVAL_MS)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Immediately fetch when tab becomes visible
        loadNotifications()
        startPolling()
      } else {
        stopPolling()
      }
    }

    // Start polling if visible
    if (document.visibilityState === 'visible') {
      startPolling()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markAsRead(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    setNotifications(notifications.filter(n => n.id !== id))
    setUnreadCount(prev => Math.max(0, prev - 1))

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
  }

  async function markAllAsRead() {
    // Use cached userId
    let currentUserId = userId
    if (!currentUserId) {
      const authResult = await fetchAuthIfNeeded()
      currentUserId = authResult?.userId ?? null
    }
    if (!currentUserId) return

    // Optimistic update
    setNotifications([])
    setUnreadCount(0)
    setIsOpen(false)

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUserId)
      .eq('is_read', false)
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    // Convert both dates to tenant timezone for accurate relative time
    const timezone = settings.timezone || 'UTC'
    const zonedDate = toZonedTime(date, timezone)
    const zonedNow = toZonedTime(new Date(), timezone)
    const diffMs = zonedNow.getTime() - zonedDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatShortDate(date)
  }

  // Sidebar variant - shows icon with optional label when expanded
  if (variant === 'sidebar') {
    return (
      <Link
        href="/notifications"
        className={cn(
          'relative flex items-center rounded-xl transition-colors',
          'text-white/70 hover:bg-white/10 hover:text-white',
          isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
          className
        )}
        title={!isExpanded ? 'Notifications' : undefined}
      >
        <Bell className="h-5 w-5 shrink-0" />
        {isExpanded && (
          <span className="text-sm font-medium">Notifications</span>
        )}
        {unreadCount > 0 && (
          <span className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white',
            isExpanded ? 'ml-auto' : 'absolute -top-0.5 -right-0.5'
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    )
  }

  // Mobile variant - simpler, links to notifications page
  if (variant === 'mobile') {
    return (
      <Link
        href="/notifications"
        className={cn(
          'relative flex items-center justify-center',
          'w-10 h-10 rounded-xl',
          'text-neutral-500 hover:text-neutral-700',
          'hover:bg-neutral-100',
          'transition-colors duration-200',
          'active:scale-95',
          className
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    )
  }

  // Default variant - full dropdown
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center justify-center',
          'w-10 h-10 rounded-xl',
          'text-neutral-500 hover:text-neutral-700',
          'hover:bg-neutral-100',
          'transition-colors duration-200'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h3 className="font-semibold text-neutral-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-neutral-100">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.notification_type, notification.notification_subtype)
                  const colorClass = getNotificationColor(notification.notification_type, notification.notification_subtype)
                  const href = getEntityRoute(notification.entity_type, notification.entity_id)

                  return (
                    <li key={notification.id} className="group relative">
                      <Link
                        href={href}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-neutral-500 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {notification.created_at ? formatTimeAgo(notification.created_at) : ''}
                          </p>
                        </div>
                        <button
                          onClick={(e) => markAsRead(notification.id, e)}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-neutral-400 hover:text-primary"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Bell className="h-8 w-8 text-neutral-300" />
                <p className="mt-2 text-sm text-neutral-500">No new notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-4 py-2">
            <Link
              href="/notifications"
              className="block text-center text-sm text-primary hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

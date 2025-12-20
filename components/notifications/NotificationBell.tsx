'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Bell, Check, AlertTriangle, Package, Users, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/database.types'

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  low_stock: AlertTriangle,
  order_update: Package,
  system: Settings,
  team: Users,
  alert: Bell,
}

const NOTIFICATION_COLORS: Record<string, string> = {
  low_stock: 'bg-yellow-100 text-yellow-600',
  order_update: 'bg-blue-100 text-blue-600',
  system: 'bg-neutral-100 text-neutral-600',
  team: 'bg-purple-100 text-purple-600',
  alert: 'bg-red-100 text-red-600',
}

interface NotificationBellProps {
  className?: string
  variant?: 'default' | 'sidebar' | 'mobile'
}

export function NotificationBell({ className, variant = 'default' }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

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

  async function loadNotifications() {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get recent unread notifications (limit 5 for dropdown)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, count } = await (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5)

      setNotifications((data || []) as Notification[])
      setUnreadCount(count || 0)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    setNotifications(notifications.filter(n => n.id !== id))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotifications([])
    setUnreadCount(0)
    setIsOpen(false)
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Sidebar variant - just shows the icon with badge
  if (variant === 'sidebar') {
    return (
      <Link
        href="/notifications"
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          'text-white/70 hover:bg-white/10 hover:text-white',
          className
        )}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
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
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pickle-500 text-[10px] font-medium text-white">
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
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pickle-500 text-[10px] font-medium text-white">
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
                  className="text-xs text-pickle-600 hover:text-pickle-700"
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
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-pickle-500" />
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-neutral-100">
                {notifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.notification_type] || Bell
                  const colorClass = NOTIFICATION_COLORS[notification.notification_type] || NOTIFICATION_COLORS.system

                  return (
                    <li key={notification.id} className="group relative">
                      <Link
                        href={notification.entity_id ? `/inventory/${notification.entity_id}` : '/notifications'}
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
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-neutral-400 hover:text-pickle-600"
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
              className="block text-center text-sm text-pickle-600 hover:text-pickle-700"
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

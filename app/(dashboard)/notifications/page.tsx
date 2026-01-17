'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, CheckCheck, Trash2, Loader2, AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFormatting } from '@/hooks/useFormatting'
import { getNotificationIcon, getNotificationColor, getEntityRoute } from '@/lib/notifications/notification-utils'
import type { Notification } from '@/types/database.types'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all')
  const { formatDateTime } = useFormatting()

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      setNotifications((data || []) as Notification[])
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ))
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

    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  async function deleteNotification(id: string) {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', id)

    setNotifications(notifications.filter(n => n.id !== id))
  }

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.is_read)
    }
    if (filter === 'mentions') {
      return notifications.filter(n =>
        n.notification_type === 'chatter' &&
        n.notification_subtype === 'mention'
      )
    }
    return notifications
  }, [notifications, filter])

  const unreadCount = notifications.filter(n => !n.is_read).length
  const mentionsCount = notifications.filter(
    n => n.notification_type === 'chatter' &&
         n.notification_subtype === 'mention' &&
         !n.is_read
  ).length

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Notifications</h1>
            <p className="mt-1 text-neutral-500">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="hidden sm:flex">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-neutral-200 bg-white px-4 sm:px-8 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === 'mentions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('mentions')}
          >
            <AtSign className="mr-1 h-3.5 w-3.5" />
            Mentions
            {mentionsCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-xs text-indigo-600">
                {mentionsCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white">
            <ul className="divide-y divide-neutral-200">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.notification_type, notification.notification_subtype)
                const colorClass = getNotificationColor(notification.notification_type, notification.notification_subtype)
                const href = getEntityRoute(notification.entity_type, notification.entity_id)
                const isClickable = notification.entity_type && notification.entity_id

                const notificationContent = (
                  <>
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-sm ${!notification.is_read ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="mt-0.5 text-sm text-neutral-500 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-neutral-400">
                            {notification.created_at ? formatDateTime(notification.created_at) : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )

                if (isClickable) {
                  return (
                    <li key={notification.id}>
                      <Link
                        href={href}
                        className={`flex items-start gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors ${!notification.is_read ? 'bg-primary/5' : ''}`}
                        onClick={() => {
                          if (!notification.is_read) markAsRead(notification.id)
                        }}
                      >
                        {notificationContent}
                      </Link>
                    </li>
                  )
                }

                return (
                  <li
                    key={notification.id}
                    className={`flex items-start gap-4 px-6 py-4 ${!notification.is_read ? 'bg-primary/5' : ''}`}
                  >
                    {notificationContent}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              {filter === 'mentions' ? (
                <AtSign className="h-8 w-8 text-neutral-400" />
              ) : (
                <Bell className="h-8 w-8 text-neutral-400" />
              )}
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">
              {filter === 'unread' ? 'No unread notifications' : filter === 'mentions' ? 'No mentions yet' : 'No notifications yet'}
            </h3>
            <p className="mt-1 text-neutral-500 text-center">
              {filter === 'unread'
                ? "You're all caught up!"
                : filter === 'mentions'
                ? "You'll see notifications here when someone @mentions you"
                : "We'll notify you when something important happens"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle,
  WifiOff,
  Loader2,
  AlertCircle,
  CloudOff,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOfflineSync } from '@/lib/hooks/useOfflineSync'

interface SyncStatusIndicatorProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Visual indicator for sync status
 *
 * Shows the current sync state: synced, syncing, offline, pending, or error.
 * Tappable to retry sync when there are errors.
 */
export function SyncStatusIndicator({
  className,
  showLabel = true,
  size = 'md',
}: SyncStatusIndicatorProps) {
  const {
    status,
    statusMessage,
    isOnline,
    isSyncing,
    pendingCount,
    syncError,
    processQueue,
    retryFailed,
  } = useOfflineSync()

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size]

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size]

  const handleClick = () => {
    if (status === 'error') {
      retryFailed()
    } else if (pendingCount > 0 && isOnline && !isSyncing) {
      processQueue()
    }
  }

  const isClickable = status === 'error' || (pendingCount > 0 && isOnline && !isSyncing)

  const renderContent = () => {
    switch (status) {
      case 'synced':
        return (
          <>
            <CheckCircle className={cn(iconSize, 'text-green-500')} />
            {showLabel && (
              <span className={cn(textSize, 'text-green-600')}>
                {statusMessage}
              </span>
            )}
          </>
        )

      case 'syncing':
        return (
          <>
            <Loader2 className={cn(iconSize, 'text-blue-500 animate-spin')} />
            {showLabel && (
              <span className={cn(textSize, 'text-blue-600')}>
                {statusMessage}
              </span>
            )}
          </>
        )

      case 'offline':
        return (
          <>
            <WifiOff className={cn(iconSize, 'text-amber-500')} />
            {showLabel && (
              <span className={cn(textSize, 'text-amber-600')}>
                {statusMessage}
              </span>
            )}
          </>
        )

      case 'pending':
        return (
          <>
            <CloudOff className={cn(iconSize, 'text-amber-500')} />
            {showLabel && (
              <span className={cn(textSize, 'text-amber-600')}>
                {statusMessage}
              </span>
            )}
          </>
        )

      case 'error':
        return (
          <>
            <AlertCircle className={cn(iconSize, 'text-red-500')} />
            {showLabel && (
              <span className={cn(textSize, 'text-red-600')}>
                Sync failed
              </span>
            )}
            <RefreshCw className={cn(iconSize, 'text-red-500 ml-1')} />
          </>
        )

      case 'initializing':
        return (
          <>
            <Loader2 className={cn(iconSize, 'text-neutral-400 animate-spin')} />
            {showLabel && (
              <span className={cn(textSize, 'text-neutral-500')}>
                {statusMessage}
              </span>
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isClickable}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2 py-1 transition-all',
        isClickable && 'hover:bg-neutral-100 cursor-pointer active:scale-95',
        !isClickable && 'cursor-default',
        className
      )}
      title={syncError || statusMessage}
    >
      {renderContent()}
    </button>
  )
}

/**
 * Compact sync status badge for use in headers
 */
export function SyncStatusBadge({ className }: { className?: string }) {
  const { status, pendingCount, isOnline } = useOfflineSync()

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Only show badge when there's something to indicate
  if (status === 'synced' && pendingCount === 0) {
    return null
  }

  const bgColor = {
    synced: 'bg-green-100',
    syncing: 'bg-blue-100',
    offline: 'bg-amber-100',
    pending: 'bg-amber-100',
    error: 'bg-red-100',
    initializing: 'bg-neutral-100',
  }[status]

  const dotColor = {
    synced: 'bg-green-500',
    syncing: 'bg-blue-500',
    offline: 'bg-amber-500',
    pending: 'bg-amber-500',
    error: 'bg-red-500',
    initializing: 'bg-neutral-400',
  }[status]

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full px-2 py-0.5',
        bgColor,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          dotColor,
          status === 'syncing' && 'animate-pulse'
        )}
      />
      {!isOnline && (
        <WifiOff className="h-3 w-3 text-amber-600" />
      )}
      {pendingCount > 0 && (
        <span className="text-xs font-medium text-neutral-700">
          {pendingCount}
        </span>
      )}
    </div>
  )
}

export default SyncStatusIndicator

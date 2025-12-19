'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'

interface UseOnlineStatusOptions {
  // How often to check connectivity (ms)
  pingInterval?: number
  // URL to ping for connectivity check
  pingUrl?: string
  // Timeout for ping requests (ms)
  pingTimeout?: number
}

const DEFAULT_OPTIONS: Required<UseOnlineStatusOptions> = {
  pingInterval: 30000, // 30 seconds
  pingUrl: '/api/health',
  pingTimeout: 5000, // 5 seconds
}

/**
 * Hook to detect online/offline status
 *
 * Uses browser events plus periodic connectivity checks for reliability.
 * Updates the global sync store when status changes.
 */
export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const { pingInterval, pingUrl, pingTimeout } = { ...DEFAULT_OPTIONS, ...options }

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const { setOnline } = useSyncStore()
  const wasOfflineRef = useRef(!isOnline)

  // Ping the server to verify actual connectivity
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), pingTimeout)

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }, [pingUrl, pingTimeout])

  // Handle status change
  const handleStatusChange = useCallback(
    (online: boolean) => {
      const wasOffline = wasOfflineRef.current
      wasOfflineRef.current = !online

      setIsOnline(online)
      setOnline(online)

      // Dispatch custom event when coming back online
      if (online && wasOffline) {
        window.dispatchEvent(new CustomEvent('pickle:online'))
      }

      // Dispatch custom event when going offline
      if (!online && !wasOffline) {
        window.dispatchEvent(new CustomEvent('pickle:offline'))
      }
    },
    [setOnline]
  )

  useEffect(() => {
    // Initial check
    const initialCheck = async () => {
      if (navigator.onLine) {
        const actuallyOnline = await checkConnectivity()
        handleStatusChange(actuallyOnline)
      } else {
        handleStatusChange(false)
      }
    }
    initialCheck()

    // Browser online/offline events
    const handleOnline = () => {
      // Verify with ping before confirming online
      checkConnectivity().then((online) => {
        handleStatusChange(online)
      })
    }

    const handleOffline = () => {
      handleStatusChange(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check
    const intervalId = setInterval(async () => {
      if (navigator.onLine) {
        const actuallyOnline = await checkConnectivity()
        if (actuallyOnline !== isOnline) {
          handleStatusChange(actuallyOnline)
        }
      } else {
        if (isOnline) {
          handleStatusChange(false)
        }
      }
    }, pingInterval)

    // Visibility change - check when page becomes visible
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const online = await checkConnectivity()
        handleStatusChange(online)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(intervalId)
    }
  }, [checkConnectivity, handleStatusChange, isOnline, pingInterval])

  return isOnline
}

/**
 * Hook to listen for online/offline events
 */
export function useOnlineEvent(callback: () => void) {
  useEffect(() => {
    window.addEventListener('pickle:online', callback)
    return () => {
      window.removeEventListener('pickle:online', callback)
    }
  }, [callback])
}

/**
 * Hook to listen for offline events
 */
export function useOfflineEvent(callback: () => void) {
  useEffect(() => {
    window.addEventListener('pickle:offline', callback)
    return () => {
      window.removeEventListener('pickle:offline', callback)
    }
  }, [callback])
}

export default useOnlineStatus

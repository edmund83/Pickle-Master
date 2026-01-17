'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'

// Singleton state for online status
let globalIsOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
let globalListeners = new Set<() => void>()
let isInitialized = false
let intervalId: ReturnType<typeof setInterval> | null = null

const PING_INTERVAL = 30000 // 30 seconds
const PING_URL = '/api/health'
const PING_TIMEOUT = 5000 // 5 seconds

// Notify all subscribers of state change
function notifyListeners() {
  globalListeners.forEach((listener) => listener())
}

// Set online status globally
function setGlobalOnline(online: boolean) {
  const wasOffline = !globalIsOnline
  if (globalIsOnline !== online) {
    globalIsOnline = online
    notifyListeners()

    // Dispatch custom events
    if (online && wasOffline) {
      window.dispatchEvent(new CustomEvent('stockzip:online'))
    }
    if (!online && !wasOffline) {
      window.dispatchEvent(new CustomEvent('stockzip:offline'))
    }
  }
}

// Check actual connectivity via ping
async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT)

    const response = await fetch(PING_URL, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

// Initialize singleton (runs once globally)
function initializeSingleton() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true

  // Initial connectivity check
  if (navigator.onLine) {
    checkConnectivity().then(setGlobalOnline)
  } else {
    setGlobalOnline(false)
  }

  // Browser online/offline events
  const handleOnline = () => {
    checkConnectivity().then(setGlobalOnline)
  }

  const handleOffline = () => {
    setGlobalOnline(false)
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Periodic connectivity check (single interval for all consumers)
  intervalId = setInterval(async () => {
    if (navigator.onLine) {
      const actuallyOnline = await checkConnectivity()
      setGlobalOnline(actuallyOnline)
    } else {
      setGlobalOnline(false)
    }
  }, PING_INTERVAL)

  // Check on visibility change
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      const online = await checkConnectivity()
      setGlobalOnline(online)
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
}

// Subscribe function for useSyncExternalStore
function subscribe(listener: () => void) {
  globalListeners.add(listener)
  initializeSingleton()
  return () => {
    globalListeners.delete(listener)
  }
}

// Snapshot function for useSyncExternalStore
function getSnapshot() {
  return globalIsOnline
}

// Server snapshot (always true for SSR)
function getServerSnapshot() {
  return true
}

/**
 * Hook to detect online/offline status
 *
 * Uses a singleton pattern - only one polling interval runs globally,
 * regardless of how many components use this hook.
 */
export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const { setOnline } = useSyncStore()

  // Sync with global store
  useEffect(() => {
    setOnline(isOnline)
  }, [isOnline, setOnline])

  return isOnline
}

/**
 * Hook to listen for online/offline events
 */
export function useOnlineEvent(callback: () => void) {
  useEffect(() => {
    window.addEventListener('stockzip:online', callback)
    return () => {
      window.removeEventListener('stockzip:online', callback)
    }
  }, [callback])
}

/**
 * Hook to listen for offline events
 */
export function useOfflineEvent(callback: () => void) {
  useEffect(() => {
    window.addEventListener('stockzip:offline', callback)
    return () => {
      window.removeEventListener('stockzip:offline', callback)
    }
  }, [callback])
}

export default useOnlineStatus

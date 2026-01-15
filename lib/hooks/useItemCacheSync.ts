'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useOnlineStatus } from './useOnlineStatus'
import { syncItemCache, isCacheStale, getCacheStats } from '@/lib/offline/item-cache'
import { isIndexedDBAvailable } from '@/lib/offline/db'
import { useAuth } from '@/lib/stores/auth-store'

interface UseItemCacheSyncOptions {
  // Automatically sync cache on mount if stale
  autoSync?: boolean
  // Sync interval in milliseconds (0 = disabled)
  syncInterval?: number
}

const DEFAULT_OPTIONS: Required<UseItemCacheSyncOptions> = {
  autoSync: true,
  syncInterval: 5 * 60 * 1000, // 5 minutes
}

/**
 * Hook to manage background item cache synchronization
 *
 * Syncs inventory items with barcodes/SKUs to IndexedDB for offline lookup.
 * Runs in the background and doesn't block the UI.
 */
export function useItemCacheSync(options: UseItemCacheSyncOptions = {}) {
  const { autoSync, syncInterval } = { ...DEFAULT_OPTIONS, ...options }

  const isOnline = useOnlineStatus()
  const { setCacheReady } = useSyncStore()
  const { tenantId, userId, fetchAuthIfNeeded } = useAuth()
  const syncInProgressRef = useRef(false)
  const lastSyncRef = useRef<Date | null>(null)

  const resolveScope = useCallback(async () => {
    if (tenantId) {
      return { tenantId, userId }
    }
    const auth = await fetchAuthIfNeeded()
    if (!auth?.tenantId) return null
    return { tenantId: auth.tenantId, userId: auth.userId }
  }, [tenantId, userId, fetchAuthIfNeeded])

  // Perform cache sync
  const sync = useCallback(async () => {
    const scope = await resolveScope()
    if (!scope) {
      return { success: false, reason: 'no_tenant' }
    }

    // Skip if not online or sync already in progress
    if (!isOnline || syncInProgressRef.current) {
      return { success: false, reason: !isOnline ? 'offline' : 'in_progress' }
    }

    // Skip if IndexedDB is not available
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, skipping cache sync')
      return { success: false, reason: 'indexeddb_unavailable' }
    }

    syncInProgressRef.current = true

    try {
      const result = await syncItemCache(scope)
      lastSyncRef.current = new Date()

      if (result.error) {
        console.error('Cache sync error:', result.error)
        return { success: false, reason: result.error }
      }

      console.log(
        `Cache sync complete: ${result.itemsUpdated} items synced, ${result.totalCached} total cached`
      )

      setCacheReady(true)
      return { success: true, ...result }
    } catch (error) {
      console.error('Cache sync failed:', error)
      return {
        success: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      syncInProgressRef.current = false
    }
  }, [isOnline, resolveScope, setCacheReady])

  // Check if sync is needed and perform it
  const syncIfNeeded = useCallback(async () => {
    const scope = await resolveScope()
    if (!scope) {
      return { success: false, reason: 'no_tenant' }
    }

    const stale = await isCacheStale(scope)
    if (stale) {
      return sync()
    }
    // Cache is fresh, mark as ready
    setCacheReady(true)
    return { success: true, reason: 'cache_fresh' }
  }, [resolveScope, sync, setCacheReady])

  // Initial sync on mount
  useEffect(() => {
    if (!autoSync) return

    // Small delay to not block initial render
    const timeoutId = setTimeout(() => {
      syncIfNeeded()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [autoSync, syncIfNeeded])

  // Periodic sync
  useEffect(() => {
    if (!syncInterval || syncInterval <= 0) return

    const intervalId = setInterval(() => {
      if (isOnline) {
        sync()
      }
    }, syncInterval)

    return () => clearInterval(intervalId)
  }, [syncInterval, isOnline, sync])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && lastSyncRef.current) {
      // Check if we've been offline for a while
      const timeSinceLastSync = Date.now() - lastSyncRef.current.getTime()
      if (timeSinceLastSync > 60000) {
        // More than 1 minute
        sync()
      }
    }
  }, [isOnline, sync])

  const getScopedCacheStats = useCallback(async () => {
    const scope = await resolveScope()
    if (!scope) {
      return { itemCount: 0, lastSync: null, isStale: true }
    }
    return getCacheStats(scope)
  }, [resolveScope])

  return {
    sync,
    syncIfNeeded,
    getCacheStats: getScopedCacheStats,
  }
}

export default useItemCacheSync

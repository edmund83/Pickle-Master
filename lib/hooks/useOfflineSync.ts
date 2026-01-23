'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useSyncStore, useSyncStatus } from '@/lib/stores/sync-store'
import { useOnlineStatus, useOnlineEvent } from './useOnlineStatus'
import {
  getPendingChanges,
  getPendingChangeCount,
  queueChange as dbQueueChange,
  markChangeSyncing,
  markChangeCompleted,
  markChangeFailed,
  updateCachedItemQuantity,
  lookupItemByBarcode,
  lookupItemBySku,
  lookupItemById,
  setLastSuccessfulSync,
  requeueSyncingChanges,
  resetFailedChanges,
} from '@/lib/offline/db'
import type { PendingChange, QuantityAdjustPayload } from '@/lib/offline/types'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/stores/auth-store'

interface UseOfflineSyncOptions {
  // Auto-sync when coming online
  autoSync?: boolean
  // Delay before auto-sync starts (ms)
  autoSyncDelay?: number
}

const DEFAULT_OPTIONS: Required<UseOfflineSyncOptions> = {
  autoSync: true,
  autoSyncDelay: 2000, // 2 seconds
}

/**
 * Hook for managing offline sync operations
 *
 * Provides methods to queue changes, process the sync queue,
 * and look up items from the offline cache.
 */
export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const { autoSync, autoSyncDelay } = { ...DEFAULT_OPTIONS, ...options }

  const isOnline = useOnlineStatus()
  const syncStatus = useSyncStatus()
  const {
    isSyncing,
    pendingCount,
    setSyncing,
    setPendingCount,
    incrementPending,
    decrementPending,
    setLastSync,
    setSyncError,
  } = useSyncStore()
  const { tenantId, userId, fetchAuthIfNeeded } = useAuth()

  const syncInProgressRef = useRef(false)
  const supabaseRef = useRef(createClient())

  const resolveScope = useCallback(async () => {
    if (tenantId) {
      return { tenantId, userId }
    }
    const auth = await fetchAuthIfNeeded()
    if (!auth?.tenantId) return null
    return { tenantId: auth.tenantId, userId: auth.userId }
  }, [tenantId, userId, fetchAuthIfNeeded])

  // Update pending count from IndexedDB on mount
  useEffect(() => {
    const updateCount = async () => {
      const scope = await resolveScope()
      if (!scope) {
        setPendingCount(0)
        return
      }
      const count = await getPendingChangeCount(scope)
      setPendingCount(count)
    }
    updateCount()
  }, [resolveScope, setPendingCount])

  useEffect(() => {
    const recoverSyncing = async () => {
      const scope = await resolveScope()
      if (!scope) return
      await requeueSyncingChanges(scope)
    }
    recoverSyncing()
  }, [resolveScope])

  /**
   * Queue a change for sync
   */
  const queueChange = useCallback(
    async (change: Omit<PendingChange, 'id' | 'created_at' | 'retry_count' | 'status' | 'tenant_id' | 'user_id'>) => {
      const scope = await resolveScope()
      if (!scope) {
        throw new Error('Offline sync unavailable: no tenant context')
      }
      await dbQueueChange(scope, change)
      incrementPending()

      // If online, trigger immediate sync
      if (isOnline && !isSyncing) {
        // Small delay to batch rapid changes
        setTimeout(() => {
          processQueue()
        }, 500)
      }
    },
    [resolveScope, isOnline, isSyncing, incrementPending]
  )

  /**
   * Queue a quantity adjustment
   */
  const queueQuantityAdjustment = useCallback(
    async (payload: QuantityAdjustPayload) => {
      const scope = await resolveScope()
      if (!scope) {
        throw new Error('Offline sync unavailable: no tenant context')
      }

      // Update local cache immediately
      await updateCachedItemQuantity(scope, payload.item_id, payload.new_quantity)

      // Queue for sync
      await queueChange({
        type: 'quantity_adjust',
        entity_type: 'inventory_item',
        entity_id: payload.item_id,
        payload,
      })
    },
    [resolveScope, queueChange]
  )

  /**
   * Sync a single change to the server
   */
  const syncChange = useCallback(
    async (change: PendingChange): Promise<void> => {
      const scope = await resolveScope()
      if (!scope) {
        throw new Error('Offline sync unavailable: no tenant context')
      }
      const supabase = supabaseRef.current

      switch (change.type) {
        case 'quantity_adjust': {
          const payload = change.payload as QuantityAdjustPayload

          // Update the item quantity
           
          const updatedAt = new Date().toISOString()
          let updateQuery = (supabase as any)
            .from('inventory_items')
            .update({
              quantity: payload.new_quantity,
              updated_at: updatedAt,
            })
            .eq('id', payload.item_id)
            .eq('tenant_id', scope.tenantId)

          if (payload.last_known_updated_at) {
            updateQuery = updateQuery.eq('updated_at', payload.last_known_updated_at)
          }

          const { data: updatedRows, error: updateError } = await updateQuery.select('id')

          if (updateError) {
            throw new Error(updateError.message)
          }

          if (!updatedRows || updatedRows.length === 0) {
            throw new Error('Conflict detected: item was updated elsewhere')
          }

          await updateCachedItemQuantity(
            scope,
            payload.item_id,
            payload.new_quantity,
            updatedAt
          )

          // Log activity
           
          const { error: activityError } = await (supabase as any).from('activity_logs').insert({
            tenant_id: scope.tenantId,
            user_id: scope.userId ?? null,
            entity_type: 'item',
            entity_id: payload.item_id,
            action_type: 'quantity_adjusted',
            changes: {
              field: 'quantity',
              old_value: payload.previous_quantity,
              new_value: payload.new_quantity,
              adjustment: payload.adjustment,
              reason: payload.reason || 'Synced from offline',
            },
          })
          if (activityError) {
            console.warn('Activity log insert failed:', activityError)
          }
          break
        }

        case 'checkout':
        case 'checkin':
          // TODO: Implement checkout/checkin sync
          console.log('Sync not implemented for:', change.type)
          break

        default:
          console.warn('Unknown change type:', change.type)
      }
    },
    [resolveScope]
  )

  /**
   * Process the sync queue
   */
  const processQueue = useCallback(async () => {
    // Prevent concurrent processing
    if (syncInProgressRef.current || !isOnline) {
      return
    }

    const scope = await resolveScope()
    if (!scope) {
      return
    }

    syncInProgressRef.current = true
    setSyncing(true)
    setSyncError(null)

    try {
      await requeueSyncingChanges(scope)
      const pending = await getPendingChanges(scope)

      if (pending.length === 0) {
        syncInProgressRef.current = false
        setSyncing(false)
        return
      }

      let successCount = 0
      let failCount = 0

      for (const change of pending) {
        try {
          await markChangeSyncing(scope, change.id)
          await syncChange(change)
          await markChangeCompleted(scope, change.id)
          decrementPending()
          successCount++
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
          await markChangeFailed(scope, change.id, errorMessage)
          failCount++
        }
      }

      if (failCount > 0) {
        setSyncError(`${failCount} change(s) failed to sync`)
      }

      if (successCount > 0) {
        setLastSync(new Date())
        await setLastSuccessfulSync(scope, new Date())
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sync failed'
      setSyncError(errorMessage)
    } finally {
      syncInProgressRef.current = false
      setSyncing(false)
    }
  }, [isOnline, resolveScope, setSyncing, setSyncError, decrementPending, setLastSync, syncChange])

  /**
   * Retry all failed changes
   */
  const retryFailed = useCallback(async () => {
    const scope = await resolveScope()
    if (!scope) return
    await resetFailedChanges(scope)
    await processQueue()
  }, [resolveScope, processQueue])

  /**
   * Look up an item offline by barcode or SKU
   */
  const lookupItemOffline = useCallback(
    async (code: string) => {
      const scope = await resolveScope()
      if (!scope) return undefined
      // Try barcode first
      let item = await lookupItemByBarcode(scope, code)
      if (item) return item

      // Try SKU
      item = await lookupItemBySku(scope, code)
      return item
    },
    [resolveScope]
  )

  /**
   * Look up an item offline by ID
   */
  const lookupItemByIdOffline = useCallback(
    async (id: string) => {
      const scope = await resolveScope()
      if (!scope) return undefined
      return lookupItemById(scope, id)
    },
    [resolveScope]
  )

  // Auto-sync when coming online
  useOnlineEvent(
    useCallback(() => {
      if (autoSync && pendingCount > 0) {
        setTimeout(() => {
          processQueue()
        }, autoSyncDelay)
      }
    }, [autoSync, autoSyncDelay, pendingCount, processQueue])
  )

  return {
    // Status
    ...syncStatus,

    // Actions
    queueChange,
    queueQuantityAdjustment,
    processQueue,
    retryFailed,

    // Offline lookups
    lookupItemOffline,
    lookupItemByIdOffline,
  }
}

export default useOfflineSync

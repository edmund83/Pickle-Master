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
} from '@/lib/offline/db'
import type { PendingChange, QuantityAdjustPayload } from '@/lib/offline/types'
import { createClient } from '@/lib/supabase/client'

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

  const syncInProgressRef = useRef(false)
  const supabaseRef = useRef(createClient())

  // Update pending count from IndexedDB on mount
  useEffect(() => {
    const updateCount = async () => {
      const count = await getPendingChangeCount()
      setPendingCount(count)
    }
    updateCount()
  }, [setPendingCount])

  /**
   * Queue a change for sync
   */
  const queueChange = useCallback(
    async (change: Omit<PendingChange, 'id' | 'created_at' | 'retry_count' | 'status'>) => {
      await dbQueueChange(change)
      incrementPending()

      // If online, trigger immediate sync
      if (isOnline && !isSyncing) {
        // Small delay to batch rapid changes
        setTimeout(() => {
          processQueue()
        }, 500)
      }
    },
    [isOnline, isSyncing, incrementPending]
  )

  /**
   * Queue a quantity adjustment
   */
  const queueQuantityAdjustment = useCallback(
    async (payload: QuantityAdjustPayload) => {
      // Update local cache immediately
      await updateCachedItemQuantity(payload.item_id, payload.new_quantity)

      // Queue for sync
      await queueChange({
        type: 'quantity_adjust',
        entity_type: 'inventory_item',
        entity_id: payload.item_id,
        payload,
      })
    },
    [queueChange]
  )

  /**
   * Sync a single change to the server
   */
  const syncChange = useCallback(
    async (change: PendingChange): Promise<void> => {
      const supabase = supabaseRef.current

      switch (change.type) {
        case 'quantity_adjust': {
          const payload = change.payload as QuantityAdjustPayload

          // Update the item quantity
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: updateError } = await (supabase as any)
            .from('inventory_items')
            .update({
              quantity: payload.new_quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', payload.item_id)

          if (updateError) {
            throw new Error(updateError.message)
          }

          // Log activity
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('activity_logs').insert({
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
    []
  )

  /**
   * Process the sync queue
   */
  const processQueue = useCallback(async () => {
    // Prevent concurrent processing
    if (syncInProgressRef.current || !isOnline) {
      return
    }

    syncInProgressRef.current = true
    setSyncing(true)
    setSyncError(null)

    try {
      const pending = await getPendingChanges()

      if (pending.length === 0) {
        syncInProgressRef.current = false
        setSyncing(false)
        return
      }

      let successCount = 0
      let failCount = 0

      for (const change of pending) {
        try {
          await markChangeSyncing(change.id)
          await syncChange(change)
          await markChangeCompleted(change.id)
          decrementPending()
          successCount++
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
          await markChangeFailed(change.id, errorMessage)
          failCount++
        }
      }

      if (failCount > 0) {
        setSyncError(`${failCount} change(s) failed to sync`)
      }

      if (successCount > 0) {
        setLastSync(new Date())
        await setLastSuccessfulSync(new Date())
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sync failed'
      setSyncError(errorMessage)
    } finally {
      syncInProgressRef.current = false
      setSyncing(false)
    }
  }, [isOnline, setSyncing, setSyncError, decrementPending, setLastSync, syncChange])

  /**
   * Retry all failed changes
   */
  const retryFailed = useCallback(async () => {
    // Reset failed changes to pending, then process
    // This is done via the processQueue which will pick them up
    await processQueue()
  }, [processQueue])

  /**
   * Look up an item offline by barcode or SKU
   */
  const lookupItemOffline = useCallback(
    async (code: string) => {
      // Try barcode first
      let item = await lookupItemByBarcode(code)
      if (item) return item

      // Try SKU
      item = await lookupItemBySku(code)
      return item
    },
    []
  )

  /**
   * Look up an item offline by ID
   */
  const lookupItemByIdOffline = useCallback(async (id: string) => {
    return lookupItemById(id)
  }, [])

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

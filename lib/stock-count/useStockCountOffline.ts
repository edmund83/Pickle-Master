'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useStockCountStore, useStockCountProgress } from './stock-count-store'
import { useSyncStore } from '@/lib/stores/sync-store'
import { queueChange, getPendingChanges, markChangeCompleted, markChangeFailed } from '@/lib/offline/db'
import { recordCount as recordCountAction } from '@/app/actions/stock-counts'
import type { StockCountItemWithDetails } from '@/app/actions/stock-counts'
import type { OfflineStockCountItem, StockCountRecordPayload } from '@/lib/offline/types'

interface UseStockCountOfflineOptions {
  stockCountId: string
  displayId: string | null
  name: string | null
  serverItems: StockCountItemWithDetails[]
  onSyncComplete?: () => void
}

/**
 * Transform server items to offline items
 */
function transformToOfflineItems(
  stockCountId: string,
  items: StockCountItemWithDetails[]
): OfflineStockCountItem[] {
  return items.map((item) => ({
    id: item.id,
    stock_count_id: stockCountId,
    item_id: item.item_id,
    item_name: item.item_name,
    item_sku: item.item_sku,
    item_image: item.item_image,
    expected_quantity: item.expected_quantity,
    counted_quantity: item.counted_quantity,
    variance: item.variance,
    status: item.status,
    synced: true,
    updated_at: new Date(),
  }))
}

/**
 * Hook for offline-first stock counting
 *
 * Features:
 * - Local state management for counts
 * - Automatic sync when online
 * - Queue management for offline counts
 * - Conflict resolution with server state
 */
export function useStockCountOffline({
  stockCountId,
  displayId,
  name,
  serverItems,
  onSyncComplete,
}: UseStockCountOfflineOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncAttemptRef = useRef<number>(0)

  // Sync store for online status
  const { isOnline, incrementPending, decrementPending, setPendingCount } = useSyncStore()

  // Stock count store
  const {
    activeSession,
    items,
    pendingCounts,
    setActiveSession,
    setItems,
    updateItem,
    recordCount: storeRecordCount,
    markCountSynced,
    clearPendingCounts,
    getPendingCounts,
    reset,
  } = useStockCountStore()

  // Progress stats
  const progress = useStockCountProgress()

  /**
   * Initialize the store with server data
   */
  const initialize = useCallback(() => {
    // Check if we already have this session loaded
    if (activeSession?.stock_count_id === stockCountId) {
      // Merge server state with local state
      const offlineItems = transformToOfflineItems(stockCountId, serverItems)
      const mergedItems = offlineItems.map((serverItem) => {
        const localItem = items.find((i) => i.id === serverItem.id)
        // If we have a local unsynced change, prefer local state
        if (localItem && !localItem.synced) {
          return localItem
        }
        return serverItem
      })
      setItems(mergedItems)
    } else {
      // New session - initialize from server
      setActiveSession({
        id: crypto.randomUUID(),
        stock_count_id: stockCountId,
        display_id: displayId,
        name,
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      })
      setItems(transformToOfflineItems(stockCountId, serverItems))
    }

    setIsLoading(false)
  }, [stockCountId, displayId, name, serverItems, activeSession, items, setActiveSession, setItems])

  /**
   * Record a count (works offline)
   */
  const recordCountOffline = useCallback(
    async (itemId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
      const item = items.find((i) => i.id === itemId)
      if (!item) {
        return { success: false, error: 'Item not found' }
      }

      // Update local state immediately
      storeRecordCount(itemId, quantity)
      incrementPending()

      // If online, try to sync immediately
      if (isOnline) {
        try {
          const result = await recordCountAction(itemId, quantity)
          if (result.success) {
            markCountSynced(itemId)
            decrementPending()
            return { success: true }
          } else {
            // Failed - queue for retry
            await queueChange({
              type: 'stock_count_record',
              entity_type: 'stock_count_item',
              entity_id: itemId,
              payload: {
                stock_count_id: stockCountId,
                stock_count_item_id: itemId,
                item_id: item.item_id,
                item_name: item.item_name,
                counted_quantity: quantity,
                expected_quantity: item.expected_quantity,
                variance: quantity - item.expected_quantity,
                counted_at: new Date().toISOString(),
              } as StockCountRecordPayload,
            })
            return { success: true } // Local update succeeded
          }
        } catch (error) {
          console.error('Error syncing count:', error)
          // Queue for offline sync
          await queueChange({
            type: 'stock_count_record',
            entity_type: 'stock_count_item',
            entity_id: itemId,
            payload: {
              stock_count_id: stockCountId,
              stock_count_item_id: itemId,
              item_id: item.item_id,
              item_name: item.item_name,
              counted_quantity: quantity,
              expected_quantity: item.expected_quantity,
              variance: quantity - item.expected_quantity,
              counted_at: new Date().toISOString(),
            } as StockCountRecordPayload,
          })
          return { success: true } // Local update succeeded
        }
      } else {
        // Offline - queue for later sync
        await queueChange({
          type: 'stock_count_record',
          entity_type: 'stock_count_item',
          entity_id: itemId,
          payload: {
            stock_count_id: stockCountId,
            stock_count_item_id: itemId,
            item_id: item.item_id,
            item_name: item.item_name,
            counted_quantity: quantity,
            expected_quantity: item.expected_quantity,
            variance: quantity - item.expected_quantity,
            counted_at: new Date().toISOString(),
          } as StockCountRecordPayload,
        })
        return { success: true }
      }
    },
    [items, stockCountId, isOnline, storeRecordCount, incrementPending, decrementPending, markCountSynced]
  )

  /**
   * Sync pending changes to server
   */
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || isSyncing) return

    // Rate limit sync attempts
    const now = Date.now()
    if (now - lastSyncAttemptRef.current < 5000) return
    lastSyncAttemptRef.current = now

    setIsSyncing(true)
    setSyncError(null)

    try {
      const pendingChanges = await getPendingChanges()
      const stockCountChanges = pendingChanges.filter(
        (c) => c.type === 'stock_count_record' && c.entity_type === 'stock_count_item'
      )

      for (const change of stockCountChanges) {
        try {
          const payload = change.payload as StockCountRecordPayload
          const result = await recordCountAction(
            payload.stock_count_item_id,
            payload.counted_quantity
          )

          if (result.success) {
            await markChangeCompleted(change.id)
            markCountSynced(payload.stock_count_item_id)
            decrementPending()
          } else {
            await markChangeFailed(change.id, result.error || 'Unknown error')
          }
        } catch (error) {
          console.error('Error syncing change:', error)
          await markChangeFailed(
            change.id,
            error instanceof Error ? error.message : 'Unknown error'
          )
        }
      }

      // Update pending count
      const remaining = await getPendingChanges()
      setPendingCount(remaining.filter((c) => c.type === 'stock_count_record').length)

      // Clear synced pending counts from local store
      clearPendingCounts()

      onSyncComplete?.()
    } catch (error) {
      console.error('Error during sync:', error)
      setSyncError(error instanceof Error ? error.message : 'Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }, [
    isOnline,
    isSyncing,
    decrementPending,
    markCountSynced,
    clearPendingCounts,
    setPendingCount,
    onSyncComplete,
  ])

  /**
   * Force refresh from server
   */
  const refreshFromServer = useCallback(() => {
    setItems(transformToOfflineItems(stockCountId, serverItems))
  }, [stockCountId, serverItems, setItems])

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && !isLoading) {
      // Debounce sync attempts
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      syncTimeoutRef.current = setTimeout(() => {
        syncPendingChanges()
      }, 1000)
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [isOnline, isLoading, syncPendingChanges])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Data
    items,
    progress,
    isOnline,
    isLoading,
    isSyncing,
    syncError,
    pendingCounts: getPendingCounts(),

    // Actions
    recordCount: recordCountOffline,
    syncPendingChanges,
    refreshFromServer,
    reset,
  }
}

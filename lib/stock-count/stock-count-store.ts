'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OfflineStockCountItem, OfflineStockCountSession } from '@/lib/offline/types'

/**
 * Stock Count state for offline-first counting
 */
export interface StockCountState {
  // Current active session
  activeSession: OfflineStockCountSession | null
  // Items in the active session
  items: OfflineStockCountItem[]
  // Pending count records waiting to sync
  pendingCounts: Array<{
    id: string
    stock_count_item_id: string
    counted_quantity: number
    created_at: Date
    synced: boolean
  }>
  // Whether the store is initialized
  isInitialized: boolean

  // Actions
  setActiveSession: (session: OfflineStockCountSession | null) => void
  setItems: (items: OfflineStockCountItem[]) => void
  updateItem: (itemId: string, updates: Partial<OfflineStockCountItem>) => void
  recordCount: (itemId: string, quantity: number) => void
  markCountSynced: (itemId: string) => void
  clearPendingCounts: () => void
  getPendingCounts: () => Array<{
    id: string
    stock_count_item_id: string
    counted_quantity: number
    created_at: Date
    synced: boolean
  }>
  reset: () => void
}

const initialState = {
  activeSession: null as OfflineStockCountSession | null,
  items: [] as OfflineStockCountItem[],
  pendingCounts: [] as Array<{
    id: string
    stock_count_item_id: string
    counted_quantity: number
    created_at: Date
    synced: boolean
  }>,
  isInitialized: false,
}

/**
 * Zustand store for stock count session management
 *
 * Provides offline-first counting with local state persistence.
 * Counts are stored locally and synced when online.
 */
export const useStockCountStore = create<StockCountState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveSession: (session: OfflineStockCountSession | null) =>
        set({ activeSession: session, isInitialized: true }),

      setItems: (items: OfflineStockCountItem[]) => set({ items }),

      updateItem: (itemId: string, updates: Partial<OfflineStockCountItem>) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, ...updates, updated_at: new Date() }
              : item
          ),
        })),

      recordCount: (itemId: string, quantity: number) => {
        const state = get()
        const item = state.items.find((i) => i.id === itemId)
        if (!item) return

        const variance = quantity - item.expected_quantity
        const pendingId = crypto.randomUUID()

        set((state) => ({
          // Update the item locally
          items: state.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  counted_quantity: quantity,
                  variance,
                  status: 'counted' as const,
                  synced: false,
                  updated_at: new Date(),
                }
              : i
          ),
          // Add to pending counts queue
          pendingCounts: [
            ...state.pendingCounts,
            {
              id: pendingId,
              stock_count_item_id: itemId,
              counted_quantity: quantity,
              created_at: new Date(),
              synced: false,
            },
          ],
        }))
      },

      markCountSynced: (itemId: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, synced: true } : item
          ),
          pendingCounts: state.pendingCounts.map((pc) =>
            pc.stock_count_item_id === itemId ? { ...pc, synced: true } : pc
          ),
        })),

      clearPendingCounts: () =>
        set((state) => ({
          pendingCounts: state.pendingCounts.filter((pc) => !pc.synced),
        })),

      getPendingCounts: () => get().pendingCounts.filter((pc) => !pc.synced),

      reset: () => set(initialState),
    }),
    {
      name: 'nook-stock-count-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist the active session and pending counts
        activeSession: state.activeSession,
        items: state.items,
        pendingCounts: state.pendingCounts,
      }),
    }
  )
)

/**
 * Hook to get stock count progress
 */
export function useStockCountProgress() {
  const { items, pendingCounts } = useStockCountStore()

  const total = items.length
  const counted = items.filter((i) => i.status !== 'pending').length
  const pending = items.filter((i) => i.status === 'pending').length
  const variance = items.filter(
    (i) => i.variance !== null && i.variance !== 0
  ).length
  const unsynced = pendingCounts.filter((pc) => !pc.synced).length
  const percent = total > 0 ? Math.round((counted / total) * 100) : 0

  return {
    total,
    counted,
    pending,
    variance,
    unsynced,
    percent,
    allCounted: pending === 0,
    allSynced: unsynced === 0,
  }
}

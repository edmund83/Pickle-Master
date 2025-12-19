'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Sync state for offline/online synchronization
 */
export interface SyncState {
  // Connection status
  isOnline: boolean
  // Whether sync is currently in progress
  isSyncing: boolean
  // Number of pending changes waiting to sync
  pendingCount: number
  // Last successful sync timestamp
  lastSyncAt: Date | null
  // Last sync error message
  syncError: string | null
  // Whether initial cache sync is complete
  cacheReady: boolean

  // Actions
  setOnline: (status: boolean) => void
  setSyncing: (status: boolean) => void
  setPendingCount: (count: number) => void
  incrementPending: () => void
  decrementPending: () => void
  setLastSync: (date: Date) => void
  setSyncError: (error: string | null) => void
  setCacheReady: (ready: boolean) => void
  reset: () => void
}

const initialState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,
  syncError: null,
  cacheReady: false,
}

/**
 * Zustand store for sync state management
 *
 * Tracks online/offline status, pending changes count, and sync progress.
 * Persisted to localStorage to survive page refreshes.
 */
export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      ...initialState,

      setOnline: (status: boolean) =>
        set({ isOnline: status, syncError: status ? null : 'You are offline' }),

      setSyncing: (status: boolean) => set({ isSyncing: status }),

      setPendingCount: (count: number) => set({ pendingCount: count }),

      incrementPending: () =>
        set((state) => ({ pendingCount: state.pendingCount + 1 })),

      decrementPending: () =>
        set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),

      setLastSync: (date: Date) =>
        set({ lastSyncAt: date, syncError: null }),

      setSyncError: (error: string | null) => set({ syncError: error }),

      setCacheReady: (ready: boolean) => set({ cacheReady: ready }),

      reset: () => set(initialState),
    }),
    {
      name: 'pickle-sync-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        lastSyncAt: state.lastSyncAt,
        pendingCount: state.pendingCount,
        cacheReady: state.cacheReady,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, update online status
        if (state) {
          state.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
        }
      },
    }
  )
)

/**
 * Hook to get sync status summary
 */
export function useSyncStatus() {
  const { isOnline, isSyncing, pendingCount, syncError, lastSyncAt, cacheReady } =
    useSyncStore()

  const status = (() => {
    if (syncError && !isOnline) return 'offline'
    if (syncError) return 'error'
    if (isSyncing) return 'syncing'
    if (pendingCount > 0) return 'pending'
    if (!cacheReady) return 'initializing'
    return 'synced'
  })()

  const statusMessage = (() => {
    switch (status) {
      case 'offline':
        return pendingCount > 0
          ? `Offline - ${pendingCount} change${pendingCount === 1 ? '' : 's'} pending`
          : 'Offline'
      case 'error':
        return syncError || 'Sync error'
      case 'syncing':
        return 'Syncing...'
      case 'pending':
        return `${pendingCount} change${pendingCount === 1 ? '' : 's'} pending`
      case 'initializing':
        return 'Loading...'
      case 'synced':
        return 'All synced'
      default:
        return ''
    }
  })()

  return {
    status,
    statusMessage,
    isOnline,
    isSyncing,
    pendingCount,
    syncError,
    lastSyncAt,
    cacheReady,
  }
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Auto-Sync Tests
 *
 * Tests for automatic sync functionality:
 * - Auto-sync triggers on reconnect
 * - Ping verification every 30 seconds
 * - Custom events for online/offline
 */

interface SyncState {
  isOnline: boolean
  lastPing: number | null
  pendingSync: number
  syncInProgress: boolean
}

// Auto-sync manager
class AutoSyncManager {
  private state: SyncState = {
    isOnline: true,
    lastPing: null,
    pendingSync: 0,
    syncInProgress: false,
  }

  private pingInterval: ReturnType<typeof setInterval> | null = null
  private syncDelay: number = 2000 // 2 second delay after reconnect
  private pendingSyncTimeout: ReturnType<typeof setTimeout> | null = null
  private eventListeners: Map<string, Array<() => void>> = new Map()

  constructor(private pingIntervalMs: number = 30000) {}

  // Get current state
  getState(): SyncState {
    return { ...this.state }
  }

  // Add pending sync items
  addPendingSync(count: number = 1): void {
    this.state.pendingSync += count
  }

  // Set online status
  setOnline(online: boolean): void {
    const wasOffline = !this.state.isOnline

    this.state.isOnline = online

    if (online && wasOffline) {
      // Dispatch custom event
      this.dispatchEvent('stockzip:online')

      // Trigger auto-sync with delay
      this.scheduleSync()
    } else if (!online) {
      // Dispatch custom event
      this.dispatchEvent('stockzip:offline')

      // Cancel any pending sync
      if (this.pendingSyncTimeout) {
        clearTimeout(this.pendingSyncTimeout)
        this.pendingSyncTimeout = null
      }
    }
  }

  // Schedule sync after delay
  private scheduleSync(): void {
    if (this.pendingSyncTimeout) {
      clearTimeout(this.pendingSyncTimeout)
    }

    this.pendingSyncTimeout = setTimeout(() => {
      this.performSync()
    }, this.syncDelay)
  }

  // Perform sync
  private async performSync(): Promise<void> {
    if (this.state.syncInProgress || this.state.pendingSync === 0) {
      return
    }

    this.state.syncInProgress = true

    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 100))

    this.state.pendingSync = 0
    this.state.syncInProgress = false
  }

  // Start ping verification
  startPingVerification(pingFn: () => Promise<boolean>): void {
    if (this.pingInterval) {
      return
    }

    this.pingInterval = setInterval(async () => {
      try {
        const success = await pingFn()
        this.state.lastPing = Date.now()
        this.setOnline(success)
      } catch {
        this.setOnline(false)
      }
    }, this.pingIntervalMs)
  }

  // Stop ping verification
  stopPingVerification(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // Perform immediate ping
  async ping(pingFn: () => Promise<boolean>): Promise<boolean> {
    try {
      const success = await pingFn()
      this.state.lastPing = Date.now()
      this.setOnline(success)
      return success
    } catch {
      this.setOnline(false)
      return false
    }
  }

  // Add event listener
  addEventListener(event: string, callback: () => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  // Remove event listener
  removeEventListener(event: string, callback: () => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Dispatch event
  private dispatchEvent(event: string): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => callback())
    }
  }

  // Get sync delay for testing
  getSyncDelay(): number {
    return this.syncDelay
  }

  // Force sync for testing
  async forceSyncNow(): Promise<void> {
    await this.performSync()
  }

  // Cleanup
  destroy(): void {
    this.stopPingVerification()
    if (this.pendingSyncTimeout) {
      clearTimeout(this.pendingSyncTimeout)
    }
    this.eventListeners.clear()
  }
}

describe('Auto-Sync', () => {
  let manager: AutoSyncManager

  beforeEach(() => {
    vi.useFakeTimers()
    manager = new AutoSyncManager(30000) // 30 second ping interval
  })

  afterEach(() => {
    manager.destroy()
    vi.useRealTimers()
  })

  describe('Auto-Sync on Reconnect', () => {
    it('triggers on reconnect with delay', async () => {
      manager.addPendingSync(5)
      manager.setOnline(false)

      expect(manager.getState().isOnline).toBe(false)

      // Reconnect
      manager.setOnline(true)

      // Pending sync should still be there immediately
      expect(manager.getState().pendingSync).toBe(5)

      // After delay, sync should happen
      await vi.advanceTimersByTimeAsync(manager.getSyncDelay() + 100)

      expect(manager.getState().pendingSync).toBe(0)
    })

    it('cancels pending sync on disconnect', () => {
      manager.addPendingSync(5)
      manager.setOnline(false)
      manager.setOnline(true) // Reconnect

      // Disconnect before sync completes
      manager.setOnline(false)

      // Advance past sync delay
      vi.advanceTimersByTime(manager.getSyncDelay() + 100)

      // Sync should not have happened
      expect(manager.getState().pendingSync).toBe(5)
    })

    it('does not trigger if no pending changes', async () => {
      manager.setOnline(false)
      manager.setOnline(true)

      expect(manager.getState().pendingSync).toBe(0)

      await vi.advanceTimersByTimeAsync(manager.getSyncDelay() + 100)

      expect(manager.getState().pendingSync).toBe(0)
    })
  })

  describe('Ping Verification', () => {
    it('pings /api/health every 30 seconds', async () => {
      let pingCount = 0
      const pingFn = vi.fn(async () => {
        pingCount++
        return true
      })

      manager.startPingVerification(pingFn)

      // Initial state - no ping yet
      expect(pingCount).toBe(0)

      // After 30 seconds
      await vi.advanceTimersByTimeAsync(30000)
      expect(pingCount).toBe(1)

      // After another 30 seconds
      await vi.advanceTimersByTimeAsync(30000)
      expect(pingCount).toBe(2)

      // After another 30 seconds
      await vi.advanceTimersByTimeAsync(30000)
      expect(pingCount).toBe(3)
    })

    it('updates lastPing timestamp', async () => {
      const now = Date.now()
      vi.setSystemTime(now)

      await manager.ping(async () => true)

      expect(manager.getState().lastPing).toBe(now)
    })

    it('sets offline on ping failure', async () => {
      manager.setOnline(true)

      await manager.ping(async () => false)

      expect(manager.getState().isOnline).toBe(false)
    })

    it('sets offline on ping error', async () => {
      manager.setOnline(true)

      await manager.ping(async () => {
        throw new Error('Network error')
      })

      expect(manager.getState().isOnline).toBe(false)
    })
  })

  describe('Custom Events', () => {
    it('dispatches stockzip:online on reconnect', () => {
      const onlineHandler = vi.fn()
      manager.addEventListener('stockzip:online', onlineHandler)

      manager.setOnline(false)
      manager.setOnline(true)

      expect(onlineHandler).toHaveBeenCalledTimes(1)
    })

    it('dispatches stockzip:offline on disconnect', () => {
      const offlineHandler = vi.fn()
      manager.addEventListener('stockzip:offline', offlineHandler)

      manager.setOnline(false)

      expect(offlineHandler).toHaveBeenCalledTimes(1)
    })

    it('does not dispatch event if already in that state', () => {
      const onlineHandler = vi.fn()
      manager.addEventListener('stockzip:online', onlineHandler)

      manager.setOnline(true) // Already online

      expect(onlineHandler).not.toHaveBeenCalled()
    })

    it('allows removing event listeners', () => {
      const handler = vi.fn()
      manager.addEventListener('stockzip:online', handler)

      manager.setOnline(false)
      manager.setOnline(true)
      expect(handler).toHaveBeenCalledTimes(1)

      manager.removeEventListener('stockzip:online', handler)

      manager.setOnline(false)
      manager.setOnline(true)
      expect(handler).toHaveBeenCalledTimes(1) // Not called again
    })

    it('supports multiple listeners for same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      manager.addEventListener('stockzip:offline', handler1)
      manager.addEventListener('stockzip:offline', handler2)

      manager.setOnline(false)

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })
  })
})

import { describe, it, expect } from 'vitest'

/**
 * Offline & Sync Tests
 *
 * Tests for offline functionality:
 * - Queue management
 * - Sync operations
 * - Offline lookup
 * - Online status detection
 */

interface QueuedChange {
  id: string
  type: 'create' | 'update' | 'delete' | 'quantity_adjustment'
  entityType: 'item' | 'folder' | 'checkout'
  entityId: string
  data: Record<string, unknown>
  timestamp: number
  retryCount: number
  status: 'pending' | 'syncing' | 'failed' | 'completed'
}

interface SyncResult {
  success: boolean
  changeId: string
  error?: string
}

// Queue management
class OfflineQueue {
  private queue: Map<string, QueuedChange> = new Map()
  private isSyncing = false

  queueChange(change: Omit<QueuedChange, 'id' | 'timestamp' | 'retryCount' | 'status'>): string {
    const id = `change-${Date.now()}-${Math.random().toString(36).slice(2)}`
    this.queue.set(id, {
      ...change,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    })
    return id
  }

  queueQuantityAdjustment(itemId: string, delta: number): string {
    return this.queueChange({
      type: 'quantity_adjustment',
      entityType: 'item',
      entityId: itemId,
      data: { delta },
    })
  }

  getPendingCount(): number {
    return Array.from(this.queue.values()).filter(c => c.status === 'pending').length
  }

  getFailedCount(): number {
    return Array.from(this.queue.values()).filter(c => c.status === 'failed').length
  }

  getAll(): QueuedChange[] {
    return Array.from(this.queue.values())
  }

  getPending(): QueuedChange[] {
    return Array.from(this.queue.values()).filter(c => c.status === 'pending')
  }

  getFailed(): QueuedChange[] {
    return Array.from(this.queue.values()).filter(c => c.status === 'failed')
  }

  clear(): void {
    this.queue.clear()
  }

  async processQueue(
    processor: (change: QueuedChange) => Promise<boolean>
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress')
    }

    this.isSyncing = true
    const errors: string[] = []
    let successCount = 0
    let failedCount = 0

    const pending = this.getPending()

    for (const change of pending) {
      change.status = 'syncing'

      try {
        const success = await processor(change)

        if (success) {
          change.status = 'completed'
          successCount++
        } else {
          change.status = 'failed'
          change.retryCount++
          failedCount++
          errors.push(`Failed to sync ${change.id}`)
        }
      } catch (err) {
        change.status = 'failed'
        change.retryCount++
        failedCount++
        errors.push(`Error syncing ${change.id}: ${err}`)
      }
    }

    this.isSyncing = false
    return { successCount, failedCount, errors }
  }

  async retryFailed(
    processor: (change: QueuedChange) => Promise<boolean>
  ): Promise<{ successCount: number; failedCount: number }> {
    const failed = this.getFailed()
    let successCount = 0
    let failedCount = 0

    for (const change of failed) {
      change.status = 'pending'
    }

    const result = await this.processQueue(processor)
    return {
      successCount: result.successCount,
      failedCount: result.failedCount,
    }
  }

  isSyncInProgress(): boolean {
    return this.isSyncing
  }
}

// Offline item cache
class OfflineCache {
  private cache: Map<string, {
    id: string
    name: string
    sku: string | null
    barcode: string | null
    quantity: number
  }> = new Map()

  private barcodeIndex: Map<string, string> = new Map()
  private skuIndex: Map<string, string> = new Map()

  addItem(item: { id: string; name: string; sku: string | null; barcode: string | null; quantity: number }): void {
    this.cache.set(item.id, item)

    if (item.barcode) {
      this.barcodeIndex.set(item.barcode, item.id)
    }
    if (item.sku) {
      this.skuIndex.set(item.sku, item.id)
    }
  }

  lookupItemOffline(query: string): typeof this.cache extends Map<string, infer T> ? T | null : never {
    // Try barcode first
    const byBarcode = this.barcodeIndex.get(query)
    if (byBarcode) {
      return this.cache.get(byBarcode) ?? null
    }

    // Try SKU
    const bySku = this.skuIndex.get(query)
    if (bySku) {
      return this.cache.get(bySku) ?? null
    }

    return null
  }

  lookupItemByIdOffline(id: string): typeof this.cache extends Map<string, infer T> ? T | null : never {
    return this.cache.get(id) ?? null
  }

  updateLocalQuantity(itemId: string, delta: number): boolean {
    const item = this.cache.get(itemId)
    if (!item) return false

    item.quantity += delta
    return true
  }

  clear(): void {
    this.cache.clear()
    this.barcodeIndex.clear()
    this.skuIndex.clear()
  }
}

// Online status manager
class OnlineStatusManager {
  private isOnline: boolean = true
  private listeners: Array<(online: boolean) => void> = []
  private pingInterval: ReturnType<typeof setInterval> | null = null

  getStatus(): boolean {
    return this.isOnline
  }

  setOnline(online: boolean): void {
    if (this.isOnline !== online) {
      this.isOnline = online
      this.notifyListeners()
    }
  }

  addListener(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.isOnline)
    }
  }

  startPing(pingFn: () => Promise<boolean>, intervalMs: number = 30000): void {
    if (this.pingInterval) return

    this.pingInterval = setInterval(async () => {
      try {
        const success = await pingFn()
        this.setOnline(success)
      } catch {
        this.setOnline(false)
      }
    }, intervalMs)
  }

  stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }
}

describe('Offline & Sync', () => {
  describe('Queue Management', () => {
    it('queues change in storage', () => {
      const queue = new OfflineQueue()

      const id = queue.queueChange({
        type: 'update',
        entityType: 'item',
        entityId: 'item-1',
        data: { quantity: 10 },
      })

      expect(id).toBeDefined()
      expect(queue.getPendingCount()).toBe(1)
    })

    it('queues quantity adjustment with local cache update', () => {
      const queue = new OfflineQueue()
      const cache = new OfflineCache()

      cache.addItem({ id: 'item-1', name: 'Laptop', sku: 'LAP-001', barcode: '123456', quantity: 50 })

      queue.queueQuantityAdjustment('item-1', -5)
      cache.updateLocalQuantity('item-1', -5)

      expect(queue.getPendingCount()).toBe(1)
      expect(cache.lookupItemByIdOffline('item-1')?.quantity).toBe(45)
    })

    it('tracks pending count', () => {
      const queue = new OfflineQueue()

      queue.queueChange({ type: 'create', entityType: 'item', entityId: 'item-1', data: {} })
      queue.queueChange({ type: 'update', entityType: 'item', entityId: 'item-2', data: {} })
      queue.queueChange({ type: 'delete', entityType: 'item', entityId: 'item-3', data: {} })

      expect(queue.getPendingCount()).toBe(3)
    })

    it('persists through clear and re-add', () => {
      const queue = new OfflineQueue()

      queue.queueChange({ type: 'create', entityType: 'item', entityId: 'item-1', data: {} })
      expect(queue.getPendingCount()).toBe(1)

      queue.clear()
      expect(queue.getPendingCount()).toBe(0)

      queue.queueChange({ type: 'update', entityType: 'item', entityId: 'item-2', data: {} })
      expect(queue.getPendingCount()).toBe(1)
    })
  })

  describe('Sync Operations', () => {
    it('processes all pending changes', async () => {
      const queue = new OfflineQueue()

      queue.queueChange({ type: 'create', entityType: 'item', entityId: 'item-1', data: {} })
      queue.queueChange({ type: 'update', entityType: 'item', entityId: 'item-2', data: {} })

      const result = await queue.processQueue(async () => true)

      expect(result.successCount).toBe(2)
      expect(result.failedCount).toBe(0)
    })

    it('retries failed operations', async () => {
      const queue = new OfflineQueue()
      let callCount = 0

      queue.queueChange({ type: 'create', entityType: 'item', entityId: 'item-1', data: {} })

      // First attempt fails
      await queue.processQueue(async () => {
        callCount++
        return false
      })

      expect(queue.getFailedCount()).toBe(1)

      // Retry succeeds
      await queue.retryFailed(async () => {
        callCount++
        return true
      })

      expect(queue.getFailedCount()).toBe(0)
      expect(callCount).toBe(2)
    })

    it('prevents concurrent syncs', async () => {
      const queue = new OfflineQueue()

      queue.queueChange({ type: 'create', entityType: 'item', entityId: 'item-1', data: {} })

      const sync1 = queue.processQueue(async () => {
        await new Promise(r => setTimeout(r, 10))
        return true
      })

      await expect(queue.processQueue(async () => true)).rejects.toThrow('Sync already in progress')

      await sync1
    })

    it('collects sync errors', async () => {
      const queue = new OfflineQueue()

      queue.queueChange({ type: 'create', entityType: 'item', entityId: 'item-1', data: {} })
      queue.queueChange({ type: 'update', entityType: 'item', entityId: 'item-2', data: {} })

      const result = await queue.processQueue(async () => false)

      expect(result.errors.length).toBe(2)
    })
  })

  describe('Offline Lookup', () => {
    it('finds item by barcode', () => {
      const cache = new OfflineCache()

      cache.addItem({ id: 'item-1', name: 'Laptop', sku: 'LAP-001', barcode: '123456789', quantity: 50 })

      const item = cache.lookupItemOffline('123456789')

      expect(item).toBeDefined()
      expect(item!.name).toBe('Laptop')
    })

    it('finds item by SKU', () => {
      const cache = new OfflineCache()

      cache.addItem({ id: 'item-1', name: 'Laptop', sku: 'LAP-001', barcode: null, quantity: 50 })

      const item = cache.lookupItemOffline('LAP-001')

      expect(item).toBeDefined()
      expect(item!.name).toBe('Laptop')
    })

    it('finds item by UUID', () => {
      const cache = new OfflineCache()

      cache.addItem({ id: 'item-uuid-123', name: 'Laptop', sku: 'LAP-001', barcode: null, quantity: 50 })

      const item = cache.lookupItemByIdOffline('item-uuid-123')

      expect(item).toBeDefined()
      expect(item!.name).toBe('Laptop')
    })

    it('returns null for cache miss', () => {
      const cache = new OfflineCache()

      const item = cache.lookupItemOffline('nonexistent')

      expect(item).toBeNull()
    })

    it('returns null for non-existent ID', () => {
      const cache = new OfflineCache()

      const item = cache.lookupItemByIdOffline('nonexistent-id')

      expect(item).toBeNull()
    })
  })

  describe('Online Status', () => {
    it('detects initial online status', () => {
      const manager = new OnlineStatusManager()

      expect(manager.getStatus()).toBe(true)
    })

    it('responds to status changes', () => {
      const manager = new OnlineStatusManager()

      manager.setOnline(false)
      expect(manager.getStatus()).toBe(false)

      manager.setOnline(true)
      expect(manager.getStatus()).toBe(true)
    })

    it('notifies listeners on change', () => {
      const manager = new OnlineStatusManager()
      let lastStatus: boolean | null = null

      manager.addListener((online) => {
        lastStatus = online
      })

      manager.setOnline(false)
      expect(lastStatus).toBe(false)

      manager.setOnline(true)
      expect(lastStatus).toBe(true)
    })

    it('does not notify if status unchanged', () => {
      const manager = new OnlineStatusManager()
      let notifyCount = 0

      manager.addListener(() => {
        notifyCount++
      })

      manager.setOnline(true) // Already true
      expect(notifyCount).toBe(0)

      manager.setOnline(false)
      expect(notifyCount).toBe(1)

      manager.setOnline(false) // Already false
      expect(notifyCount).toBe(1)
    })

    it('removes listener correctly', () => {
      const manager = new OnlineStatusManager()
      let notifyCount = 0

      const unsubscribe = manager.addListener(() => {
        notifyCount++
      })

      manager.setOnline(false)
      expect(notifyCount).toBe(1)

      unsubscribe()

      manager.setOnline(true)
      expect(notifyCount).toBe(1) // Not incremented after unsubscribe
    })
  })
})

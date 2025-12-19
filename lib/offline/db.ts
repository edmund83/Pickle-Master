import Dexie, { type Table } from 'dexie'
import type {
  OfflineItem,
  PendingChange,
  ScanSession,
  SyncMetadata,
} from './types'

/**
 * Pickle Offline Database
 *
 * Uses Dexie.js (IndexedDB wrapper) for persistent offline storage.
 * Stores cached inventory items, pending changes queue, and scan sessions.
 */
class PickleOfflineDB extends Dexie {
  // Tables
  items!: Table<OfflineItem, string>
  pendingChanges!: Table<PendingChange, string>
  scanSessions!: Table<ScanSession, string>
  syncMetadata!: Table<SyncMetadata, string>

  constructor() {
    super('PickleOfflineDB')

    // Schema version 1
    this.version(1).stores({
      // Items: indexed by id, barcode, sku for quick lookup
      items: 'id, barcode, sku, folder_id, status, synced_at',
      // Pending changes: indexed by status and creation time for FIFO processing
      pendingChanges: 'id, type, entity_type, entity_id, status, created_at',
      // Scan sessions: indexed by id and creation time
      scanSessions: 'id, created_at, updated_at',
      // Sync metadata: key-value store for sync timestamps etc
      syncMetadata: 'key',
    })
  }
}

// Singleton database instance
let db: PickleOfflineDB | null = null

/**
 * Get the database instance (lazy initialization)
 */
export function getDB(): PickleOfflineDB {
  if (!db) {
    db = new PickleOfflineDB()
  }
  return db
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

// ============================================================================
// Item Cache Operations
// ============================================================================

/**
 * Cache an item for offline lookup
 */
export async function cacheItem(item: OfflineItem): Promise<void> {
  const db = getDB()
  await db.items.put(item)
}

/**
 * Cache multiple items (bulk operation)
 */
export async function cacheItems(items: OfflineItem[]): Promise<void> {
  const db = getDB()
  await db.items.bulkPut(items)
}

/**
 * Look up an item by barcode
 */
export async function lookupItemByBarcode(barcode: string): Promise<OfflineItem | undefined> {
  const db = getDB()
  return db.items.where('barcode').equals(barcode).first()
}

/**
 * Look up an item by SKU
 */
export async function lookupItemBySku(sku: string): Promise<OfflineItem | undefined> {
  const db = getDB()
  return db.items.where('sku').equals(sku).first()
}

/**
 * Look up an item by ID
 */
export async function lookupItemById(id: string): Promise<OfflineItem | undefined> {
  const db = getDB()
  return db.items.get(id)
}

/**
 * Update a cached item's quantity
 */
export async function updateCachedItemQuantity(
  id: string,
  newQuantity: number
): Promise<void> {
  const db = getDB()
  await db.items.update(id, {
    quantity: newQuantity,
    status: newQuantity <= 0 ? 'out_of_stock' : 'in_stock',
    synced_at: new Date(),
  })
}

/**
 * Get all cached items (for debugging/export)
 */
export async function getAllCachedItems(): Promise<OfflineItem[]> {
  const db = getDB()
  return db.items.toArray()
}

/**
 * Get cached item count
 */
export async function getCachedItemCount(): Promise<number> {
  const db = getDB()
  return db.items.count()
}

/**
 * Clear all cached items
 */
export async function clearItemCache(): Promise<void> {
  const db = getDB()
  await db.items.clear()
}

// ============================================================================
// Pending Changes Queue Operations
// ============================================================================

/**
 * Add a change to the pending queue
 */
export async function queueChange(
  change: Omit<PendingChange, 'id' | 'created_at' | 'retry_count' | 'status'>
): Promise<string> {
  const db = getDB()
  const id = crypto.randomUUID()
  await db.pendingChanges.add({
    ...change,
    id,
    created_at: new Date(),
    retry_count: 0,
    status: 'pending',
  })
  return id
}

/**
 * Get all pending changes (ordered by creation time)
 */
export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = getDB()
  return db.pendingChanges
    .where('status')
    .equals('pending')
    .sortBy('created_at')
}

/**
 * Get pending change count
 */
export async function getPendingChangeCount(): Promise<number> {
  const db = getDB()
  return db.pendingChanges.where('status').equals('pending').count()
}

/**
 * Mark a change as syncing
 */
export async function markChangeSyncing(id: string): Promise<void> {
  const db = getDB()
  await db.pendingChanges.update(id, { status: 'syncing' })
}

/**
 * Mark a change as completed and remove it
 */
export async function markChangeCompleted(id: string): Promise<void> {
  const db = getDB()
  await db.pendingChanges.delete(id)
}

/**
 * Mark a change as failed with error
 */
export async function markChangeFailed(
  id: string,
  error: string
): Promise<void> {
  const db = getDB()
  const change = await db.pendingChanges.get(id)
  if (change) {
    const newRetryCount = change.retry_count + 1
    await db.pendingChanges.update(id, {
      status: newRetryCount >= 3 ? 'failed' : 'pending',
      retry_count: newRetryCount,
      last_error: error,
    })
  }
}

/**
 * Reset a failed change to pending (manual retry)
 */
export async function resetFailedChange(id: string): Promise<void> {
  const db = getDB()
  await db.pendingChanges.update(id, {
    status: 'pending',
    retry_count: 0,
    last_error: undefined,
  })
}

/**
 * Get failed changes
 */
export async function getFailedChanges(): Promise<PendingChange[]> {
  const db = getDB()
  return db.pendingChanges.where('status').equals('failed').toArray()
}

/**
 * Clear all completed/synced changes
 */
export async function clearCompletedChanges(): Promise<void> {
  const db = getDB()
  await db.pendingChanges.where('status').equals('completed').delete()
}

// ============================================================================
// Scan Session Operations
// ============================================================================

/**
 * Create a new scan session
 */
export async function createScanSession(
  session: Omit<ScanSession, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const db = getDB()
  const id = crypto.randomUUID()
  const now = new Date()
  await db.scanSessions.add({
    ...session,
    id,
    created_at: now,
    updated_at: now,
  })
  return id
}

/**
 * Get a scan session by ID
 */
export async function getScanSession(id: string): Promise<ScanSession | undefined> {
  const db = getDB()
  return db.scanSessions.get(id)
}

/**
 * Get the most recent active scan session
 */
export async function getActiveSession(): Promise<ScanSession | undefined> {
  const db = getDB()
  return db.scanSessions
    .orderBy('updated_at')
    .reverse()
    .filter((s) => !s.completed_at)
    .first()
}

/**
 * Update a scan session
 */
export async function updateScanSession(
  id: string,
  updates: Partial<ScanSession>
): Promise<void> {
  const db = getDB()
  await db.scanSessions.update(id, {
    ...updates,
    updated_at: new Date(),
  })
}

/**
 * Add an item to a scan session
 */
export async function addItemToSession(
  sessionId: string,
  item: Omit<import('./types').BatchScanItem, 'id' | 'scanned_at'>
): Promise<void> {
  const db = getDB()
  const session = await db.scanSessions.get(sessionId)
  if (session) {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      scanned_at: new Date(),
    }
    await db.scanSessions.update(sessionId, {
      items: [...session.items, newItem],
      updated_at: new Date(),
    })
  }
}

/**
 * Complete a scan session
 */
export async function completeScanSession(id: string): Promise<void> {
  const db = getDB()
  await db.scanSessions.update(id, {
    completed_at: new Date(),
    updated_at: new Date(),
  })
}

/**
 * Delete a scan session
 */
export async function deleteScanSession(id: string): Promise<void> {
  const db = getDB()
  await db.scanSessions.delete(id)
}

/**
 * Get all scan sessions
 */
export async function getAllScanSessions(): Promise<ScanSession[]> {
  const db = getDB()
  return db.scanSessions.orderBy('created_at').reverse().toArray()
}

// ============================================================================
// Sync Metadata Operations
// ============================================================================

/**
 * Set a sync metadata value
 */
export async function setSyncMetadata(key: string, value: string): Promise<void> {
  const db = getDB()
  await db.syncMetadata.put({
    key,
    value,
    updated_at: new Date(),
  })
}

/**
 * Get a sync metadata value
 */
export async function getSyncMetadata(key: string): Promise<string | undefined> {
  const db = getDB()
  const record = await db.syncMetadata.get(key)
  return record?.value
}

/**
 * Get last cache sync timestamp
 */
export async function getLastCacheSync(): Promise<Date | null> {
  const value = await getSyncMetadata('last_cache_sync')
  return value ? new Date(value) : null
}

/**
 * Set last cache sync timestamp
 */
export async function setLastCacheSync(date: Date): Promise<void> {
  await setSyncMetadata('last_cache_sync', date.toISOString())
}

/**
 * Get last successful sync timestamp
 */
export async function getLastSuccessfulSync(): Promise<Date | null> {
  const value = await getSyncMetadata('last_successful_sync')
  return value ? new Date(value) : null
}

/**
 * Set last successful sync timestamp
 */
export async function setLastSuccessfulSync(date: Date): Promise<void> {
  await setSyncMetadata('last_successful_sync', date.toISOString())
}

// ============================================================================
// Database Utilities
// ============================================================================

/**
 * Clear all data from the database
 */
export async function clearAllData(): Promise<void> {
  const db = getDB()
  await Promise.all([
    db.items.clear(),
    db.pendingChanges.clear(),
    db.scanSessions.clear(),
    db.syncMetadata.clear(),
  ])
}

/**
 * Get database storage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number
  quota: number
  percentage: number
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentage: estimate.quota
        ? ((estimate.usage || 0) / estimate.quota) * 100
        : 0,
    }
  }
  return null
}

// Export the database class for advanced usage
export { PickleOfflineDB }
export default getDB

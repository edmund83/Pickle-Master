import Dexie, { type Table } from 'dexie'
import type {
  OfflineItem,
  PendingChange,
  ScanSession,
  SyncMetadata,
} from './types'

export type OfflineScope = {
  tenantId: string
  userId?: string | null
}

function buildScopedSyncKey(tenantId: string, key: string): string {
  return `${tenantId}:${key}`
}

/**
 * StockZip Offline Database
 *
 * Uses Dexie.js (IndexedDB wrapper) for persistent offline storage.
 * Stores cached inventory items, pending changes queue, and scan sessions.
 */
class StockZipOfflineDB extends Dexie {
  // Tables
  items!: Table<OfflineItem, string>
  pendingChanges!: Table<PendingChange, string>
  scanSessions!: Table<ScanSession, string>
  syncMetadata!: Table<SyncMetadata, string>

  constructor() {
    super('StockZipOfflineDB')

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

    // Schema version 2 - tenant-scoped offline storage
    this.version(2)
      .stores({
        // Items: indexed by tenant_id for scoped lookup
        items: 'id, tenant_id, barcode, sku, folder_id, status, synced_at, updated_at',
        // Pending changes: indexed by tenant_id for scoped processing
        pendingChanges: 'id, tenant_id, status, created_at',
        // Scan sessions: indexed by tenant_id for scoped retrieval
        scanSessions: 'id, tenant_id, created_at, updated_at',
        // Sync metadata: tenant-scoped key-value store
        syncMetadata: 'key, tenant_id',
      })
      .upgrade(async (tx) => {
        await Promise.all([
          tx.table('items').clear(),
          tx.table('pendingChanges').clear(),
          tx.table('scanSessions').clear(),
          tx.table('syncMetadata').clear(),
        ])
      })
  }
}

// Singleton database instance
let db: StockZipOfflineDB | null = null

/**
 * Get the database instance (lazy initialization)
 */
export function getDB(): StockZipOfflineDB {
  if (!db) {
    db = new StockZipOfflineDB()
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
export async function cacheItem(
  scope: OfflineScope,
  item: OfflineItem
): Promise<void> {
  const db = getDB()
  await db.items.put({ ...item, tenant_id: scope.tenantId })
}

/**
 * Cache multiple items (bulk operation)
 */
export async function cacheItems(
  scope: OfflineScope,
  items: OfflineItem[]
): Promise<void> {
  const db = getDB()
  const scopedItems = items.map((item) => ({
    ...item,
    tenant_id: scope.tenantId,
  }))
  await db.items.bulkPut(scopedItems)
}

/**
 * Look up an item by barcode
 */
export async function lookupItemByBarcode(
  scope: OfflineScope,
  barcode: string
): Promise<OfflineItem | undefined> {
  const db = getDB()
  return db.items
    .where('barcode')
    .equals(barcode)
    .and((item) => item.tenant_id === scope.tenantId)
    .first()
}

/**
 * Look up an item by SKU
 */
export async function lookupItemBySku(
  scope: OfflineScope,
  sku: string
): Promise<OfflineItem | undefined> {
  const db = getDB()
  return db.items
    .where('sku')
    .equals(sku)
    .and((item) => item.tenant_id === scope.tenantId)
    .first()
}

/**
 * Look up an item by ID
 */
export async function lookupItemById(
  scope: OfflineScope,
  id: string
): Promise<OfflineItem | undefined> {
  const db = getDB()
  const item = await db.items.get(id)
  if (!item || item.tenant_id !== scope.tenantId) return undefined
  return item
}

/**
 * Update a cached item's quantity
 */
export async function updateCachedItemQuantity(
  scope: OfflineScope,
  id: string,
  newQuantity: number,
  updatedAt?: string
): Promise<void> {
  const db = getDB()
  const updates: Partial<OfflineItem> = {
    quantity: newQuantity,
    status: newQuantity <= 0 ? 'out_of_stock' : 'in_stock',
    synced_at: new Date(),
  }
  if (updatedAt) {
    updates.updated_at = updatedAt
  }

  await db.items
    .where('id')
    .equals(id)
    .and((item) => item.tenant_id === scope.tenantId)
    .modify(updates)
}

/**
 * Get all cached items (for debugging/export)
 */
export async function getAllCachedItems(scope: OfflineScope): Promise<OfflineItem[]> {
  const db = getDB()
  return db.items.where('tenant_id').equals(scope.tenantId).toArray()
}

/**
 * Get cached item count
 */
export async function getCachedItemCount(scope: OfflineScope): Promise<number> {
  const db = getDB()
  return db.items.where('tenant_id').equals(scope.tenantId).count()
}

/**
 * Clear all cached items
 */
export async function clearItemCache(scope: OfflineScope): Promise<void> {
  const db = getDB()
  await db.items.where('tenant_id').equals(scope.tenantId).delete()
}

/**
 * Remove cached items by ID for a tenant
 */
export async function removeCachedItems(
  scope: OfflineScope,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return
  const db = getDB()
  await db.items
    .where('tenant_id')
    .equals(scope.tenantId)
    .filter((item) => ids.includes(item.id))
    .delete()
}

// ============================================================================
// Pending Changes Queue Operations
// ============================================================================

/**
 * Add a change to the pending queue
 */
export async function queueChange(
  scope: OfflineScope,
  change: Omit<PendingChange, 'id' | 'created_at' | 'retry_count' | 'status' | 'tenant_id' | 'user_id'>
): Promise<string> {
  const db = getDB()
  const id = crypto.randomUUID()
  await db.pendingChanges.add({
    ...change,
    tenant_id: scope.tenantId,
    user_id: scope.userId ?? null,
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
export async function getPendingChanges(
  scope: OfflineScope
): Promise<PendingChange[]> {
  const db = getDB()
  return db.pendingChanges
    .where('tenant_id')
    .equals(scope.tenantId)
    .and((change) => change.status === 'pending')
    .sortBy('created_at')
}

/**
 * Get pending change count
 */
export async function getPendingChangeCount(scope: OfflineScope): Promise<number> {
  const db = getDB()
  return db.pendingChanges
    .where('tenant_id')
    .equals(scope.tenantId)
    .and((change) => change.status === 'pending')
    .count()
}

/**
 * Mark a change as syncing
 */
export async function markChangeSyncing(
  scope: OfflineScope,
  id: string
): Promise<void> {
  const db = getDB()
  const change = await db.pendingChanges.get(id)
  if (!change || change.tenant_id !== scope.tenantId) return
  await db.pendingChanges.update(id, { status: 'syncing' })
}

/**
 * Mark a change as completed and remove it
 */
export async function markChangeCompleted(
  scope: OfflineScope,
  id: string
): Promise<void> {
  const db = getDB()
  const change = await db.pendingChanges.get(id)
  if (!change || change.tenant_id !== scope.tenantId) return
  await db.pendingChanges.delete(id)
}

/**
 * Mark a change as failed with error
 */
export async function markChangeFailed(
  scope: OfflineScope,
  id: string,
  error: string
): Promise<void> {
  const db = getDB()
  const change = await db.pendingChanges.get(id)
  if (change && change.tenant_id === scope.tenantId) {
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
export async function resetFailedChange(
  scope: OfflineScope,
  id: string
): Promise<void> {
  const db = getDB()
  const change = await db.pendingChanges.get(id)
  if (!change || change.tenant_id !== scope.tenantId) return
  await db.pendingChanges.update(id, {
    status: 'pending',
    retry_count: 0,
    last_error: undefined,
  })
}

/**
 * Get failed changes
 */
export async function getFailedChanges(
  scope: OfflineScope
): Promise<PendingChange[]> {
  const db = getDB()
  return db.pendingChanges
    .where('tenant_id')
    .equals(scope.tenantId)
    .and((change) => change.status === 'failed')
    .toArray()
}

/**
 * Clear all completed/synced changes
 */
export async function clearCompletedChanges(scope: OfflineScope): Promise<void> {
  const db = getDB()
  await db.pendingChanges
    .where('tenant_id')
    .equals(scope.tenantId)
    .and((change) => change.status === 'completed')
    .delete()
}

/**
 * Requeue syncing changes for retry (e.g., after a reload)
 */
export async function requeueSyncingChanges(
  scope: OfflineScope
): Promise<number> {
  const db = getDB()
  const syncing = await db.pendingChanges
    .where('tenant_id')
    .equals(scope.tenantId)
    .and((change) => change.status === 'syncing')
    .toArray()

  await Promise.all(
    syncing.map((change) =>
      db.pendingChanges.update(change.id, { status: 'pending' })
    )
  )

  return syncing.length
}

/**
 * Reset failed changes back to pending for a tenant
 */
export async function resetFailedChanges(
  scope: OfflineScope
): Promise<number> {
  const db = getDB()
  const failed = await db.pendingChanges
    .where('tenant_id')
    .equals(scope.tenantId)
    .and((change) => change.status === 'failed')
    .toArray()

  await Promise.all(
    failed.map((change) =>
      db.pendingChanges.update(change.id, {
        status: 'pending',
        retry_count: 0,
        last_error: undefined,
      })
    )
  )

  return failed.length
}

// ============================================================================
// Scan Session Operations
// ============================================================================

/**
 * Create a new scan session
 */
export async function createScanSession(
  scope: OfflineScope,
  session: Omit<ScanSession, 'id' | 'created_at' | 'updated_at' | 'tenant_id' | 'user_id'>
): Promise<string> {
  const db = getDB()
  const id = crypto.randomUUID()
  const now = new Date()
  await db.scanSessions.add({
    ...session,
    tenant_id: scope.tenantId,
    user_id: scope.userId ?? null,
    id,
    created_at: now,
    updated_at: now,
  })
  return id
}

/**
 * Get a scan session by ID
 */
export async function getScanSession(
  scope: OfflineScope,
  id: string
): Promise<ScanSession | undefined> {
  const db = getDB()
  const session = await db.scanSessions.get(id)
  if (!session || session.tenant_id !== scope.tenantId) return undefined
  return session
}

/**
 * Get the most recent active scan session
 */
export async function getActiveSession(
  scope: OfflineScope
): Promise<ScanSession | undefined> {
  const db = getDB()
  return db.scanSessions
    .where('tenant_id')
    .equals(scope.tenantId)
    .orderBy('updated_at')
    .reverse()
    .filter((s) => !s.completed_at)
    .first()
}

/**
 * Update a scan session
 */
export async function updateScanSession(
  scope: OfflineScope,
  id: string,
  updates: Partial<ScanSession>
): Promise<void> {
  const db = getDB()
  const session = await db.scanSessions.get(id)
  if (!session || session.tenant_id !== scope.tenantId) return
  await db.scanSessions.update(id, {
    ...updates,
    updated_at: new Date(),
  })
}

/**
 * Add an item to a scan session
 */
export async function addItemToSession(
  scope: OfflineScope,
  sessionId: string,
  item: Omit<import('./types').BatchScanItem, 'id' | 'scanned_at'>
): Promise<void> {
  const db = getDB()
  const session = await db.scanSessions.get(sessionId)
  if (session && session.tenant_id === scope.tenantId) {
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
export async function completeScanSession(
  scope: OfflineScope,
  id: string
): Promise<void> {
  const db = getDB()
  const session = await db.scanSessions.get(id)
  if (!session || session.tenant_id !== scope.tenantId) return
  await db.scanSessions.update(id, {
    completed_at: new Date(),
    updated_at: new Date(),
  })
}

/**
 * Delete a scan session
 */
export async function deleteScanSession(
  scope: OfflineScope,
  id: string
): Promise<void> {
  const db = getDB()
  const session = await db.scanSessions.get(id)
  if (!session || session.tenant_id !== scope.tenantId) return
  await db.scanSessions.delete(id)
}

/**
 * Get all scan sessions
 */
export async function getAllScanSessions(
  scope: OfflineScope
): Promise<ScanSession[]> {
  const db = getDB()
  return db.scanSessions
    .where('tenant_id')
    .equals(scope.tenantId)
    .orderBy('created_at')
    .reverse()
    .toArray()
}

// ============================================================================
// Sync Metadata Operations
// ============================================================================

/**
 * Set a sync metadata value
 */
export async function setSyncMetadata(
  scope: OfflineScope,
  key: string,
  value: string
): Promise<void> {
  const db = getDB()
  const scopedKey = buildScopedSyncKey(scope.tenantId, key)
  await db.syncMetadata.put({
    tenant_id: scope.tenantId,
    user_id: scope.userId ?? null,
    key: scopedKey,
    value,
    updated_at: new Date(),
  })
}

/**
 * Get a sync metadata value
 */
export async function getSyncMetadata(
  scope: OfflineScope,
  key: string
): Promise<string | undefined> {
  const db = getDB()
  const scopedKey = buildScopedSyncKey(scope.tenantId, key)
  const record = await db.syncMetadata
    .where('tenant_id')
    .equals(scope.tenantId)
    .and((entry) => entry.key === scopedKey || entry.key === key)
    .first()
  return record?.value
}

/**
 * Get last cache sync timestamp
 */
export async function getLastCacheSync(
  scope: OfflineScope
): Promise<Date | null> {
  const value = await getSyncMetadata(scope, 'last_cache_sync')
  return value ? new Date(value) : null
}

/**
 * Set last cache sync timestamp
 */
export async function setLastCacheSync(
  scope: OfflineScope,
  date: Date
): Promise<void> {
  await setSyncMetadata(scope, 'last_cache_sync', date.toISOString())
}

/**
 * Get last successful sync timestamp
 */
export async function getLastSuccessfulSync(
  scope: OfflineScope
): Promise<Date | null> {
  const value = await getSyncMetadata(scope, 'last_successful_sync')
  return value ? new Date(value) : null
}

/**
 * Set last successful sync timestamp
 */
export async function setLastSuccessfulSync(
  scope: OfflineScope,
  date: Date
): Promise<void> {
  await setSyncMetadata(scope, 'last_successful_sync', date.toISOString())
}

// ============================================================================
// Database Utilities
// ============================================================================

/**
 * Clear all data from the database
 */
export async function clearAllData(scope?: OfflineScope): Promise<void> {
  const db = getDB()
  if (!scope) {
    await Promise.all([
      db.items.clear(),
      db.pendingChanges.clear(),
      db.scanSessions.clear(),
      db.syncMetadata.clear(),
    ])
    return
  }

  await Promise.all([
    db.items.where('tenant_id').equals(scope.tenantId).delete(),
    db.pendingChanges.where('tenant_id').equals(scope.tenantId).delete(),
    db.scanSessions.where('tenant_id').equals(scope.tenantId).delete(),
    db.syncMetadata.where('tenant_id').equals(scope.tenantId).delete(),
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
export { StockZipOfflineDB }
export default getDB

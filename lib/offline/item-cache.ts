import { createClient } from '@/lib/supabase/client'
import {
  cacheItems,
  getLastCacheSync,
  setLastCacheSync,
  getCachedItemCount,
  clearItemCache,
} from './db'
import type { OfflineItem } from './types'

// Cache is considered stale after 24 hours
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000

// How many items to fetch per batch
const BATCH_SIZE = 100

/**
 * Transform a database item to an OfflineItem for caching
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformToOfflineItem(item: any): OfflineItem {
  const quantity = item.quantity ?? 0
  const minQuantity = item.min_quantity ?? 0

  let status: OfflineItem['status'] = 'in_stock'
  if (quantity <= 0) {
    status = 'out_of_stock'
  } else if (minQuantity > 0 && quantity <= minQuantity) {
    status = 'low_stock'
  }

  return {
    id: item.id,
    barcode: item.barcode || null,
    sku: item.sku || null,
    name: item.name,
    quantity,
    min_quantity: item.min_quantity || null,
    price: item.price || null,
    image_url: item.image_urls?.[0] || null,
    folder_id: item.folder_id || null,
    folder_name: item.folders?.name || null,
    status,
    updated_at: item.updated_at,
    synced_at: new Date(),
  }
}

/**
 * Check if the item cache is stale
 */
export async function isCacheStale(): Promise<boolean> {
  const lastSync = await getLastCacheSync()
  if (!lastSync) return true

  const age = Date.now() - lastSync.getTime()
  return age > CACHE_MAX_AGE_MS
}

/**
 * Sync items with barcodes from the server to the local cache
 *
 * Uses incremental sync if possible (only fetches items updated since last sync).
 * Falls back to full sync if no previous sync exists.
 */
export async function syncItemCache(): Promise<{
  itemsAdded: number
  itemsUpdated: number
  totalCached: number
  error?: string
}> {
  const supabase = createClient()
  const result = {
    itemsAdded: 0,
    itemsUpdated: 0,
    totalCached: 0,
    error: undefined as string | undefined,
  }

  try {
    const lastSync = await getLastCacheSync()
    const since = lastSync?.toISOString() || new Date(0).toISOString()

    let cursor = since
    let hasMore = true
    const allItems: OfflineItem[] = []

    // Fetch items with barcodes or SKUs (scan-relevant items)
    while (hasMore) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('inventory_items')
        .select(
          `
          id,
          name,
          sku,
          barcode,
          quantity,
          min_quantity,
          price,
          image_urls,
          folder_id,
          updated_at,
          folders (name)
        `
        )
        .gt('updated_at', cursor)
        .is('deleted_at', null)
        .or('barcode.not.is.null,sku.not.is.null')
        .order('updated_at', { ascending: true })
        .limit(BATCH_SIZE)

      if (error) {
        throw new Error(error.message)
      }

      if (!data || data.length === 0) {
        hasMore = false
        continue
      }

      // Transform and add to collection
      const transformedItems = data.map(transformToOfflineItem)
      allItems.push(...transformedItems)

      // Update cursor for next batch
      cursor = data[data.length - 1].updated_at
      hasMore = data.length === BATCH_SIZE
    }

    // Bulk upsert to IndexedDB
    if (allItems.length > 0) {
      const countBefore = await getCachedItemCount()
      await cacheItems(allItems)
      const countAfter = await getCachedItemCount()

      result.itemsUpdated = allItems.length
      result.itemsAdded = countAfter - countBefore
    }

    // Update last sync timestamp
    await setLastCacheSync(new Date())
    result.totalCached = await getCachedItemCount()
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to sync item cache:', error)
  }

  return result
}

/**
 * Perform a full cache refresh (clears existing cache first)
 */
export async function fullCacheRefresh(): Promise<{
  itemsCached: number
  error?: string
}> {
  const result = {
    itemsCached: 0,
    error: undefined as string | undefined,
  }

  try {
    // Clear existing cache
    await clearItemCache()

    // Reset last sync to force full sync
    await setLastCacheSync(new Date(0))

    // Perform sync
    const syncResult = await syncItemCache()
    result.itemsCached = syncResult.totalCached
    result.error = syncResult.error
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to refresh cache:', error)
  }

  return result
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  itemCount: number
  lastSync: Date | null
  isStale: boolean
}> {
  const [itemCount, lastSync, isStale] = await Promise.all([
    getCachedItemCount(),
    getLastCacheSync(),
    isCacheStale(),
  ])

  return { itemCount, lastSync, isStale }
}

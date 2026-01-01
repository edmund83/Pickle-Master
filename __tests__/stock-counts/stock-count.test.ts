import { describe, it, expect } from 'vitest'
import { testItems, TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'
import type { InventoryItem } from '@/types/database.types'

/**
 * Stock Count Tests
 *
 * Tests for stock count functionality:
 * - Create stock count (full, folder, custom scope)
 * - Update stock count
 * - Count items and variance calculation
 * - Status transitions
 */

interface StockCount {
  id: string
  tenant_id: string
  display_id: string
  name: string
  status: 'draft' | 'in_progress' | 'review' | 'completed'
  scope: 'full' | 'folder' | 'custom'
  folder_id: string | null
  item_ids: string[] | null
  assigned_to: string | null
  due_date: string | null
  created_at: string
  completed_at: string | null
}

interface StockCountItem {
  id: string
  stock_count_id: string
  item_id: string
  item_name: string
  expected_quantity: number
  counted_quantity: number | null
  variance: number | null
  status: 'pending' | 'counted' | 'verified'
  counted_by: string | null
  counted_at: string | null
  variance_notes: string | null
}

// Simulate display ID generation
function generateDisplayId(prefix: string, tenantCode: string, sequence: number): string {
  return `${prefix}-${tenantCode}-${String(sequence).padStart(5, '0')}`
}

// Simulate create stock count
function createStockCount(params: {
  tenantId: string
  name: string
  scope: 'full' | 'folder' | 'custom'
  folderId?: string
  itemIds?: string[]
  assignedTo?: string
  dueDate?: string
  sequence: number
}): StockCount {
  return {
    id: `sc-${Date.now()}`,
    tenant_id: params.tenantId,
    display_id: generateDisplayId('SC', 'XXX', params.sequence),
    name: params.name,
    status: 'draft',
    scope: params.scope,
    folder_id: params.folderId ?? null,
    item_ids: params.itemIds ?? null,
    assigned_to: params.assignedTo ?? null,
    due_date: params.dueDate ?? null,
    created_at: new Date().toISOString(),
    completed_at: null,
  }
}

// Simulate get stock count items based on scope
function getStockCountItems(
  stockCount: StockCount,
  allItems: InventoryItem[]
): StockCountItem[] {
  let itemsToCount: InventoryItem[]

  switch (stockCount.scope) {
    case 'full':
      itemsToCount = allItems.filter(i => i.tenant_id === stockCount.tenant_id && !i.deleted_at)
      break
    case 'folder':
      itemsToCount = allItems.filter(
        i => i.tenant_id === stockCount.tenant_id &&
             i.folder_id === stockCount.folder_id &&
             !i.deleted_at
      )
      break
    case 'custom':
      itemsToCount = allItems.filter(
        i => i.tenant_id === stockCount.tenant_id &&
             stockCount.item_ids?.includes(i.id) &&
             !i.deleted_at
      )
      break
  }

  return itemsToCount.map(item => ({
    id: `sci-${item.id}`,
    stock_count_id: stockCount.id,
    item_id: item.id,
    item_name: item.name,
    expected_quantity: item.quantity,
    counted_quantity: null,
    variance: null,
    status: 'pending' as const,
    counted_by: null,
    counted_at: null,
    variance_notes: null,
  }))
}

// Simulate update stock count item
function updateStockCountItem(
  item: StockCountItem,
  countedQuantity: number,
  countedBy: string
): StockCountItem {
  const variance = item.expected_quantity - countedQuantity
  return {
    ...item,
    counted_quantity: countedQuantity,
    variance,
    status: 'counted',
    counted_by: countedBy,
    counted_at: new Date().toISOString(),
  }
}

// Simulate status transition
function updateStockCountStatus(
  stockCount: StockCount,
  newStatus: StockCount['status']
): { success: boolean; stockCount?: StockCount; error?: string } {
  const validTransitions: Record<string, string[]> = {
    draft: ['in_progress'],
    in_progress: ['review', 'draft'],
    review: ['completed', 'in_progress'],
    completed: [],
  }

  if (!validTransitions[stockCount.status].includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${stockCount.status} to ${newStatus}`
    }
  }

  const updated: StockCount = {
    ...stockCount,
    status: newStatus,
    completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
  }

  return { success: true, stockCount: updated }
}

// Simulate record variance
function recordVariance(
  item: StockCountItem,
  notes: string
): StockCountItem {
  return {
    ...item,
    variance_notes: notes,
    status: 'verified',
  }
}

// Simulate approve variance and adjust inventory
function approveVarianceAndAdjust(
  item: StockCountItem,
  inventoryItem: InventoryItem
): { adjustedItem: InventoryItem; resolved: boolean } {
  if (item.counted_quantity === null) {
    return { adjustedItem: inventoryItem, resolved: false }
  }

  const adjustedItem: InventoryItem = {
    ...inventoryItem,
    quantity: item.counted_quantity,
    updated_at: new Date().toISOString(),
  }

  return { adjustedItem, resolved: true }
}

describe('Stock Counts', () => {
  const activeItems = testItems.filter(i => !i.deleted_at && i.tenant_id === TEST_TENANT_ID)

  describe('Create Stock Count', () => {
    it('creates stock count with full scope', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Monthly Count',
        scope: 'full',
        sequence: 1,
      })

      expect(stockCount.scope).toBe('full')
      expect(stockCount.folder_id).toBeNull()
      expect(stockCount.item_ids).toBeNull()
    })

    it('creates stock count with folder scope', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Electronics Count',
        scope: 'folder',
        folderId: 'folder-1',
        sequence: 2,
      })

      expect(stockCount.scope).toBe('folder')
      expect(stockCount.folder_id).toBe('folder-1')
    })

    it('creates stock count with custom scope', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Selected Items Count',
        scope: 'custom',
        itemIds: ['item-1', 'item-2'],
        sequence: 3,
      })

      expect(stockCount.scope).toBe('custom')
      expect(stockCount.item_ids).toEqual(['item-1', 'item-2'])
    })

    it('generates display ID with correct format', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Test Count',
        scope: 'full',
        sequence: 1,
      })

      expect(stockCount.display_id).toBe('SC-XXX-00001')
    })

    it('creates with draft status', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Test Count',
        scope: 'full',
        sequence: 1,
      })

      expect(stockCount.status).toBe('draft')
    })

    it('saves assigned user', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Assigned Count',
        scope: 'full',
        assignedTo: TEST_USER_ID,
        sequence: 1,
      })

      expect(stockCount.assigned_to).toBe(TEST_USER_ID)
    })

    it('saves due date', () => {
      const dueDate = '2024-12-31T00:00:00Z'
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Due Date Count',
        scope: 'full',
        dueDate,
        sequence: 1,
      })

      expect(stockCount.due_date).toBe(dueDate)
    })
  })

  describe('Get Stock Count Items', () => {
    it('returns all tenant items for full scope', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Full Count',
        scope: 'full',
        sequence: 1,
      })

      const items = getStockCountItems(stockCount, testItems)

      expect(items.length).toBe(activeItems.length)
    })

    it('returns only folder items for folder scope', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Folder Count',
        scope: 'folder',
        folderId: 'folder-1',
        sequence: 1,
      })

      const items = getStockCountItems(stockCount, testItems)
      const expectedItems = activeItems.filter(i => i.folder_id === 'folder-1')

      expect(items.length).toBe(expectedItems.length)
    })

    it('returns only specified items for custom scope', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Custom Count',
        scope: 'custom',
        itemIds: ['item-1', 'item-2'],
        sequence: 1,
      })

      const items = getStockCountItems(stockCount, testItems)

      expect(items.length).toBe(2)
      expect(items.map(i => i.item_id)).toContain('item-1')
      expect(items.map(i => i.item_id)).toContain('item-2')
    })

    it('returns items with expected quantities', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Full Count',
        scope: 'full',
        sequence: 1,
      })

      const items = getStockCountItems(stockCount, testItems)

      items.forEach(item => {
        const originalItem = testItems.find(i => i.id === item.item_id)
        expect(item.expected_quantity).toBe(originalItem?.quantity)
      })
    })

    it('excludes deleted items', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Full Count',
        scope: 'full',
        sequence: 1,
      })

      const items = getStockCountItems(stockCount, testItems)

      // item-5 is deleted, should not be included
      expect(items.find(i => i.item_id === 'item-5')).toBeUndefined()
    })
  })

  describe('Update Stock Count Item', () => {
    it('records counted quantity', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: null,
        variance: null,
        status: 'pending',
        counted_by: null,
        counted_at: null,
        variance_notes: null,
      }

      const updated = updateStockCountItem(countItem, 48, TEST_USER_ID)

      expect(updated.counted_quantity).toBe(48)
    })

    it('calculates variance correctly', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: null,
        variance: null,
        status: 'pending',
        counted_by: null,
        counted_at: null,
        variance_notes: null,
      }

      const updated = updateStockCountItem(countItem, 48, TEST_USER_ID)

      // Variance = expected - counted = 50 - 48 = 2
      expect(updated.variance).toBe(2)
    })

    it('calculates negative variance for excess', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: null,
        variance: null,
        status: 'pending',
        counted_by: null,
        counted_at: null,
        variance_notes: null,
      }

      const updated = updateStockCountItem(countItem, 55, TEST_USER_ID)

      // Variance = expected - counted = 50 - 55 = -5
      expect(updated.variance).toBe(-5)
    })

    it('updates status to counted', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: null,
        variance: null,
        status: 'pending',
        counted_by: null,
        counted_at: null,
        variance_notes: null,
      }

      const updated = updateStockCountItem(countItem, 50, TEST_USER_ID)

      expect(updated.status).toBe('counted')
    })

    it('records who counted', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: null,
        variance: null,
        status: 'pending',
        counted_by: null,
        counted_at: null,
        variance_notes: null,
      }

      const updated = updateStockCountItem(countItem, 50, TEST_USER_ID)

      expect(updated.counted_by).toBe(TEST_USER_ID)
    })

    it('records when counted', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: null,
        variance: null,
        status: 'pending',
        counted_by: null,
        counted_at: null,
        variance_notes: null,
      }

      const updated = updateStockCountItem(countItem, 50, TEST_USER_ID)

      expect(updated.counted_at).toBeDefined()
    })
  })

  describe('Status Transitions', () => {
    it('allows draft to in_progress', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Test',
        scope: 'full',
        sequence: 1,
      })

      const result = updateStockCountStatus(stockCount, 'in_progress')

      expect(result.success).toBe(true)
      expect(result.stockCount?.status).toBe('in_progress')
    })

    it('allows in_progress to review', () => {
      const stockCount: StockCount = {
        ...createStockCount({
          tenantId: TEST_TENANT_ID,
          name: 'Test',
          scope: 'full',
          sequence: 1,
        }),
        status: 'in_progress',
      }

      const result = updateStockCountStatus(stockCount, 'review')

      expect(result.success).toBe(true)
      expect(result.stockCount?.status).toBe('review')
    })

    it('allows review to completed', () => {
      const stockCount: StockCount = {
        ...createStockCount({
          tenantId: TEST_TENANT_ID,
          name: 'Test',
          scope: 'full',
          sequence: 1,
        }),
        status: 'review',
      }

      const result = updateStockCountStatus(stockCount, 'completed')

      expect(result.success).toBe(true)
      expect(result.stockCount?.status).toBe('completed')
    })

    it('sets completed_at when completing', () => {
      const stockCount: StockCount = {
        ...createStockCount({
          tenantId: TEST_TENANT_ID,
          name: 'Test',
          scope: 'full',
          sequence: 1,
        }),
        status: 'review',
      }

      const result = updateStockCountStatus(stockCount, 'completed')

      expect(result.stockCount?.completed_at).toBeDefined()
    })

    it('rejects invalid transition', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Test',
        scope: 'full',
        sequence: 1,
      })

      const result = updateStockCountStatus(stockCount, 'completed')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot transition')
    })

    it('rejects transitions from completed', () => {
      const stockCount: StockCount = {
        ...createStockCount({
          tenantId: TEST_TENANT_ID,
          name: 'Test',
          scope: 'full',
          sequence: 1,
        }),
        status: 'completed',
      }

      const result = updateStockCountStatus(stockCount, 'draft')

      expect(result.success).toBe(false)
    })
  })

  describe('Variance Handling', () => {
    it('records variance notes', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: 48,
        variance: 2,
        status: 'counted',
        counted_by: TEST_USER_ID,
        counted_at: new Date().toISOString(),
        variance_notes: null,
      }

      const updated = recordVariance(countItem, 'Found 2 items damaged and disposed')

      expect(updated.variance_notes).toBe('Found 2 items damaged and disposed')
    })

    it('updates status to verified', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: 48,
        variance: 2,
        status: 'counted',
        counted_by: TEST_USER_ID,
        counted_at: new Date().toISOString(),
        variance_notes: null,
      }

      const updated = recordVariance(countItem, 'Verified')

      expect(updated.status).toBe('verified')
    })

    it('adjusts inventory quantity on approval', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: 48,
        variance: 2,
        status: 'verified',
        counted_by: TEST_USER_ID,
        counted_at: new Date().toISOString(),
        variance_notes: 'Approved',
      }

      const inventoryItem = testItems[0] // Laptop with qty 50

      const result = approveVarianceAndAdjust(countItem, inventoryItem)

      expect(result.adjustedItem.quantity).toBe(48)
      expect(result.resolved).toBe(true)
    })

    it('does not adjust if not counted', () => {
      const countItem: StockCountItem = {
        id: 'sci-1',
        stock_count_id: 'sc-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        expected_quantity: 50,
        counted_quantity: null,
        variance: null,
        status: 'pending',
        counted_by: null,
        counted_at: null,
        variance_notes: null,
      }

      const inventoryItem = testItems[0]

      const result = approveVarianceAndAdjust(countItem, inventoryItem)

      expect(result.adjustedItem.quantity).toBe(inventoryItem.quantity)
      expect(result.resolved).toBe(false)
    })
  })

  describe('Tenant Isolation', () => {
    it('only returns counts for current tenant', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Test',
        scope: 'full',
        sequence: 1,
      })

      expect(stockCount.tenant_id).toBe(TEST_TENANT_ID)
    })

    it('only includes tenant items in count', () => {
      const stockCount = createStockCount({
        tenantId: TEST_TENANT_ID,
        name: 'Test',
        scope: 'full',
        sequence: 1,
      })

      const items = getStockCountItems(stockCount, testItems)

      // Should not include other-item from OTHER_TENANT_ID
      expect(items.find(i => i.item_id === 'other-item')).toBeUndefined()
    })
  })
})

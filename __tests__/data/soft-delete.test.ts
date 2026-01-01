import { describe, it, expect } from 'vitest'
import {
  testItems,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem } from '@/types/database.types'

/**
 * Soft Delete Tests
 *
 * Tests for soft delete filtering behavior mentioned in todo.md:
 * - Items filtered by deleted_at IS NULL
 * - Deleted items excluded from lists
 * - Recovery possible by clearing deleted_at
 */

describe('Soft Delete Behavior', () => {
  describe('Items Filtered by deleted_at IS NULL', () => {
    it('filters out items with deleted_at set', () => {
      const activeItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      // All returned items should have deleted_at === null
      expect(activeItems.every(i => i.deleted_at === null)).toBe(true)
    })

    it('includes items with deleted_at === null', () => {
      const activeItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      // Should include items without deleted_at
      expect(activeItems.length).toBe(4) // 5 items - 1 deleted
    })

    it('excludes specific deleted item', () => {
      const activeItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      // item-5 has deleted_at set
      expect(activeItems.find(i => i.id === 'item-5')).toBeUndefined()
    })
  })

  describe('Deleted Items Excluded from Lists', () => {
    it('deleted items not in active inventory lists', () => {
      const activeItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      // Verify deleted item is not in results
      const deletedItem = testItems.find(i => i.id === 'item-5')
      expect(deletedItem?.deleted_at).not.toBeNull()
      expect(activeItems.find(i => i.id === deletedItem?.id)).toBeUndefined()
    })

    it('deleted items not counted in inventory totals', () => {
      const activeItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      const totalQuantity = activeItems.reduce((sum, i) => sum + i.quantity, 0)

      // Calculate expected (without deleted item)
      const expectedQuantity = testItems
        .filter(i => i.deleted_at === null && i.tenant_id === TEST_TENANT_ID)
        .reduce((sum, i) => sum + i.quantity, 0)

      expect(totalQuantity).toBe(expectedQuantity)
    })

    it('deleted items not in search results', () => {
      // Simulate search by filtering with status
      const searchResults = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
        status: ['in_stock'],
      })

      // Even though item-5 is in_stock, it should be excluded because deleted
      expect(searchResults.find(i => i.id === 'item-5')).toBeUndefined()
    })

    it('deleted items not in folder contents', () => {
      // item-5 belongs to folder-2
      const folderItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
        folderId: 'folder-2',
      })

      // Only item-3 should be in folder-2 (item-5 is deleted)
      expect(folderItems.length).toBe(1)
      expect(folderItems[0].name).toBe('Printer Paper')
    })
  })

  describe('Recovery Simulation', () => {
    it('item can be recovered by clearing deleted_at', () => {
      // Simulate recovery by creating item with null deleted_at
      const recoveredItem: InventoryItem = {
        ...testItems.find(i => i.id === 'item-5')!,
        deleted_at: null, // Cleared for recovery
      }

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const activeItems = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      // Recovered item should now be in active list
      expect(activeItems.find(i => i.id === 'item-5')).toBeDefined()
      expect(activeItems.length).toBe(5) // All 5 items now active
    })

    it('recovered item appears in correct folder', () => {
      // Simulate recovery
      const recoveredItem: InventoryItem = {
        ...testItems.find(i => i.id === 'item-5')!,
        deleted_at: null,
      }

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const folderItems = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
        folderId: 'folder-2',
      })

      // Both item-3 and recovered item-5 should be in folder-2
      expect(folderItems.length).toBe(2)
      expect(folderItems.map(i => i.name).sort()).toEqual(['Deleted Item', 'Printer Paper'])
    })

    it('recovered item contributes to totals', () => {
      // Simulate recovery
      const recoveredItem: InventoryItem = {
        ...testItems.find(i => i.id === 'item-5')!,
        deleted_at: null,
      }

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const activeItems = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      const totalValue = activeItems.reduce((sum, i) => sum + i.quantity * (i.price ?? 0), 0)

      // Recovered item (10 qty × 100 price = 1000) should be included
      // Original: 75000 + 250 + 0 + 300 = 75550
      // With recovered: 75550 + 1000 = 76550
      expect(totalValue).toBe(76550)
    })
  })

  describe('Multiple Deleted Items', () => {
    it('handles multiple deleted items correctly', () => {
      // Create additional deleted items
      const itemsWithMultipleDeleted: InventoryItem[] = [
        ...testItems,
        {
          ...testItems[0],
          id: 'deleted-item-2',
          deleted_at: new Date().toISOString(),
        },
        {
          ...testItems[0],
          id: 'deleted-item-3',
          deleted_at: new Date().toISOString(),
        },
      ]

      const activeItems = filterItems(itemsWithMultipleDeleted, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      // Should only include the 4 active items from testItems
      expect(activeItems.length).toBe(4)
      expect(activeItems.find(i => i.id === 'deleted-item-2')).toBeUndefined()
      expect(activeItems.find(i => i.id === 'deleted-item-3')).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles all items deleted', () => {
      const allDeleted: InventoryItem[] = testItems.map(i => ({
        ...i,
        deleted_at: new Date().toISOString(),
      }))

      const activeItems = filterItems(allDeleted, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      expect(activeItems.length).toBe(0)
    })

    it('handles no items deleted', () => {
      const noneDeleted: InventoryItem[] = testItems.map(i => ({
        ...i,
        deleted_at: null,
      }))

      const activeItems = filterItems(noneDeleted, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      expect(activeItems.length).toBe(5)
    })

    it('preserves item data when filtering', () => {
      const activeItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      // Verify item data is preserved
      const laptop = activeItems.find(i => i.name === 'Laptop')
      expect(laptop).toBeDefined()
      expect(laptop?.quantity).toBe(50)
      expect(laptop?.price).toBe(1500)
      expect(laptop?.cost_price).toBe(1200)
      expect(laptop?.sku).toBe('LAP-001')
    })

    it('deleted_at timestamp is preserved for record', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')

      expect(deletedItem?.deleted_at).toBeDefined()
      expect(deletedItem?.deleted_at).toBe('2024-01-10T00:00:00Z')
    })
  })

  describe('Query Behavior', () => {
    it('filterItems correctly applies deletedAt filter', () => {
      // Without deletedAt filter, should include all tenant items
      const allItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
      })

      expect(allItems.length).toBe(5) // All items including deleted

      // With deletedAt filter, should exclude deleted
      const activeItems = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      expect(activeItems.length).toBe(4) // Excludes deleted
    })

    it('combines deletedAt filter with other filters', () => {
      // Filter by status AND deletedAt
      const lowStockActive = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
        status: ['low_stock', 'out_of_stock'],
      })

      expect(lowStockActive.length).toBe(2) // Mouse (low) + Printer Paper (out)
      expect(lowStockActive.every(i => i.deleted_at === null)).toBe(true)
    })
  })
})

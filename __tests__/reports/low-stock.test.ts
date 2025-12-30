import { describe, it, expect } from 'vitest'
import {
  testItems,
  testFolders,
  getActiveItems,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem } from '@/types/database.types'

/**
 * Low Stock Report Tests
 *
 * The low stock report should:
 * 1. Return items with status 'low_stock' or 'out_of_stock'
 * 2. Filter out deleted items (deleted_at IS NULL)
 * 3. Sort by quantity ascending
 * 4. Correctly count out_of_stock vs low_stock items
 */

// Simulate the data fetching logic from low-stock/page.tsx
function getLowStockItems(items: InventoryItem[], tenantId: string): InventoryItem[] {
  return filterItems(items, {
    tenantId,
    deletedAt: null,
    status: ['low_stock', 'out_of_stock'],
  }).sort((a, b) => a.quantity - b.quantity)
}

describe('Low Stock Report', () => {
  describe('Data Filtering', () => {
    it('returns items with status low_stock or out_of_stock', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)

      // Should only include items with low_stock or out_of_stock status
      expect(lowStockItems.every(i => ['low_stock', 'out_of_stock'].includes(i.status))).toBe(true)

      // Verify we have both types
      const hasLowStock = lowStockItems.some(i => i.status === 'low_stock')
      const hasOutOfStock = lowStockItems.some(i => i.status === 'out_of_stock')
      expect(hasLowStock).toBe(true)
      expect(hasOutOfStock).toBe(true)
    })

    it('filters out deleted items', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)

      // No item should have deleted_at set
      expect(lowStockItems.every(i => i.deleted_at === null)).toBe(true)

      // Verify deleted item (item-5) is not included
      expect(lowStockItems.find(i => i.id === 'item-5')).toBeUndefined()
    })

    it('sorts by quantity ascending', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)

      // Verify ascending order
      for (let i = 1; i < lowStockItems.length; i++) {
        expect(lowStockItems[i].quantity).toBeGreaterThanOrEqual(lowStockItems[i - 1].quantity)
      }
    })

    it('only returns items for the specified tenant', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)

      expect(lowStockItems.every(i => i.tenant_id === TEST_TENANT_ID)).toBe(true)
    })
  })

  describe('Status Counting', () => {
    it('correctly counts out_of_stock items', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)
      const outOfStock = lowStockItems.filter(i => i.status === 'out_of_stock')

      // Based on test data, item-3 (Printer Paper) is out_of_stock
      expect(outOfStock.length).toBe(1)
      expect(outOfStock[0].name).toBe('Printer Paper')
      expect(outOfStock[0].quantity).toBe(0)
    })

    it('correctly counts low_stock items', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)
      const lowStock = lowStockItems.filter(i => i.status === 'low_stock')

      // Based on test data, item-2 (Mouse) is low_stock
      expect(lowStock.length).toBe(1)
      expect(lowStock[0].name).toBe('Mouse')
      expect(lowStock[0].quantity).toBe(5)
      expect(lowStock[0].min_quantity).toBe(10)
    })
  })

  describe('Edge Cases', () => {
    it('returns empty array when no low stock items exist', () => {
      // Create items with all in_stock status
      const inStockItems: InventoryItem[] = testItems.map(i => ({
        ...i,
        status: 'in_stock' as const,
        quantity: 100,
        deleted_at: null,
      }))

      const lowStockItems = getLowStockItems(inStockItems, TEST_TENANT_ID)
      expect(lowStockItems).toHaveLength(0)
    })

    it('handles items with quantity equal to min_quantity', () => {
      const itemAtMin: InventoryItem = {
        ...testItems[0],
        id: 'item-at-min',
        quantity: 10,
        min_quantity: 10,
        status: 'in_stock',
        deleted_at: null,
      }

      const items = [...testItems, itemAtMin]
      const lowStockItems = getLowStockItems(items, TEST_TENANT_ID)

      // Item at min should not appear in low stock (status is in_stock)
      expect(lowStockItems.find(i => i.id === 'item-at-min')).toBeUndefined()
    })
  })

  describe('Data Accuracy', () => {
    it('displays correct quantity vs min_quantity comparison', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)

      lowStockItems.forEach(item => {
        // All items should have quantity less than min_quantity OR be at zero
        if (item.status === 'out_of_stock') {
          expect(item.quantity).toBe(0)
        } else if (item.status === 'low_stock') {
          expect(item.quantity).toBeLessThan(item.min_quantity ?? 0)
        }
      })
    })

    it('includes all required display fields', () => {
      const lowStockItems = getLowStockItems(testItems, TEST_TENANT_ID)

      lowStockItems.forEach(item => {
        // Required fields for display
        expect(item.id).toBeDefined()
        expect(item.name).toBeDefined()
        expect(item.quantity).toBeDefined()
        expect(item.min_quantity).toBeDefined()
        expect(item.status).toBeDefined()
        // Optional fields that should exist
        expect('sku' in item).toBe(true)
        expect('image_urls' in item).toBe(true)
        expect('unit' in item).toBe(true)
      })
    })
  })
})

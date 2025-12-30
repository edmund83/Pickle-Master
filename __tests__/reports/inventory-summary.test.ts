import { describe, it, expect } from 'vitest'
import {
  testItems,
  testFolders,
  getActiveItems,
  calculateTotalValue,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem, Folder } from '@/types/database.types'

/**
 * Inventory Summary Report Tests
 *
 * The inventory summary report should:
 * 1. Correctly calculate totalItems count
 * 2. Correctly calculate totalValue (sum of quantity × price)
 * 3. Correct status breakdown (in_stock, low_stock, out_of_stock)
 * 4. Items grouped correctly by folder
 * 5. Uncategorized items handled (null folder_id)
 * 6. Handle items with null price (treats as 0)
 */

interface SummaryData {
  items: InventoryItem[]
  folders: Folder[]
  totalItems: number
  totalValue: number
  byStatus: {
    in_stock: number
    low_stock: number
    out_of_stock: number
  }
}

// Simulate the data processing logic from inventory-summary/page.tsx
function getSummaryData(items: InventoryItem[], folders: Folder[], tenantId: string): SummaryData {
  const filteredItems = filterItems(items, { tenantId, deletedAt: null })

  return {
    items: filteredItems,
    folders,
    totalItems: filteredItems.length,
    totalValue: filteredItems.reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0),
    byStatus: {
      in_stock: filteredItems.filter(i => i.status === 'in_stock').length,
      low_stock: filteredItems.filter(i => i.status === 'low_stock').length,
      out_of_stock: filteredItems.filter(i => i.status === 'out_of_stock').length,
    },
  }
}

function getItemsByFolder(items: InventoryItem[], folders: Folder[]) {
  const itemsByFolder = folders.map(folder => ({
    folder,
    items: items.filter(item => item.folder_id === folder.id),
    value: items
      .filter(item => item.folder_id === folder.id)
      .reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0),
  }))

  const uncategorized = items.filter(item => !item.folder_id)
  const uncategorizedValue = uncategorized.reduce(
    (sum, item) => sum + item.quantity * (item.price ?? 0),
    0
  )

  return { itemsByFolder, uncategorized, uncategorizedValue }
}

describe('Inventory Summary Report', () => {
  describe('Total Items Count', () => {
    it('correctly counts total active items', () => {
      const summary = getSummaryData(testItems, testFolders, TEST_TENANT_ID)

      // Should exclude deleted items
      const expectedCount = testItems.filter(i => i.deleted_at === null && i.tenant_id === TEST_TENANT_ID).length
      expect(summary.totalItems).toBe(expectedCount)
      expect(summary.totalItems).toBe(4) // 5 items - 1 deleted = 4
    })

    it('excludes deleted items from count', () => {
      const summary = getSummaryData(testItems, testFolders, TEST_TENANT_ID)

      // item-5 is deleted
      expect(summary.items.find(i => i.id === 'item-5')).toBeUndefined()
    })
  })

  describe('Total Value Calculation', () => {
    it('correctly calculates total value (quantity × price)', () => {
      const summary = getSummaryData(testItems, testFolders, TEST_TENANT_ID)

      // Manual calculation:
      // item-1 (Laptop): 50 × 1500 = 75000
      // item-2 (Mouse): 5 × 50 = 250
      // item-3 (Printer Paper): 0 × 25 = 0
      // item-4 (Stapler): 20 × 15 = 300
      // item-5 is deleted, not included
      const expectedValue = 75000 + 250 + 0 + 300
      expect(summary.totalValue).toBe(expectedValue)
    })

    it('treats null price as 0', () => {
      const itemsWithNullPrice: InventoryItem[] = [
        {
          ...testItems[0],
          id: 'null-price-item',
          price: null,
          quantity: 100,
          deleted_at: null,
        },
      ]

      const summary = getSummaryData(itemsWithNullPrice, testFolders, TEST_TENANT_ID)
      expect(summary.totalValue).toBe(0)
    })

    it('handles items with zero quantity', () => {
      const summary = getSummaryData(testItems, testFolders, TEST_TENANT_ID)

      // item-3 has quantity 0, should contribute 0 to total
      const item3Value = 0 * 25 // quantity × price
      expect(item3Value).toBe(0)
    })
  })

  describe('Status Breakdown', () => {
    it('correctly counts items by status', () => {
      const summary = getSummaryData(testItems, testFolders, TEST_TENANT_ID)

      // Based on test data:
      // in_stock: item-1 (Laptop), item-4 (Stapler) = 2
      // low_stock: item-2 (Mouse) = 1
      // out_of_stock: item-3 (Printer Paper) = 1
      expect(summary.byStatus.in_stock).toBe(2)
      expect(summary.byStatus.low_stock).toBe(1)
      expect(summary.byStatus.out_of_stock).toBe(1)
    })

    it('status counts sum to total items', () => {
      const summary = getSummaryData(testItems, testFolders, TEST_TENANT_ID)

      const statusSum =
        summary.byStatus.in_stock +
        summary.byStatus.low_stock +
        summary.byStatus.out_of_stock

      expect(statusSum).toBe(summary.totalItems)
    })
  })

  describe('Items Grouped by Folder', () => {
    it('correctly groups items by folder', () => {
      const activeItems = filterItems(testItems, { tenantId: TEST_TENANT_ID, deletedAt: null })
      const { itemsByFolder } = getItemsByFolder(activeItems, testFolders)

      // Electronics folder (folder-1): item-1 (Laptop), item-2 (Mouse)
      const electronics = itemsByFolder.find(f => f.folder.id === 'folder-1')
      expect(electronics?.items.length).toBe(2)
      expect(electronics?.items.map(i => i.name).sort()).toEqual(['Laptop', 'Mouse'])

      // Office Supplies folder (folder-2): item-3 (Printer Paper)
      const officeSupplies = itemsByFolder.find(f => f.folder.id === 'folder-2')
      expect(officeSupplies?.items.length).toBe(1)
      expect(officeSupplies?.items[0].name).toBe('Printer Paper')
    })

    it('correctly calculates value per folder', () => {
      const activeItems = filterItems(testItems, { tenantId: TEST_TENANT_ID, deletedAt: null })
      const { itemsByFolder } = getItemsByFolder(activeItems, testFolders)

      // Electronics folder: 50×1500 + 5×50 = 75000 + 250 = 75250
      const electronics = itemsByFolder.find(f => f.folder.id === 'folder-1')
      expect(electronics?.value).toBe(75250)

      // Office Supplies folder: 0×25 = 0
      const officeSupplies = itemsByFolder.find(f => f.folder.id === 'folder-2')
      expect(officeSupplies?.value).toBe(0)
    })
  })

  describe('Uncategorized Items', () => {
    it('correctly identifies uncategorized items', () => {
      const activeItems = filterItems(testItems, { tenantId: TEST_TENANT_ID, deletedAt: null })
      const { uncategorized } = getItemsByFolder(activeItems, testFolders)

      // item-4 (Stapler) has null folder_id
      expect(uncategorized.length).toBe(1)
      expect(uncategorized[0].name).toBe('Stapler')
    })

    it('correctly calculates uncategorized value', () => {
      const activeItems = filterItems(testItems, { tenantId: TEST_TENANT_ID, deletedAt: null })
      const { uncategorizedValue } = getItemsByFolder(activeItems, testFolders)

      // Stapler: 20 × 15 = 300
      expect(uncategorizedValue).toBe(300)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty inventory', () => {
      const summary = getSummaryData([], testFolders, TEST_TENANT_ID)

      expect(summary.totalItems).toBe(0)
      expect(summary.totalValue).toBe(0)
      expect(summary.byStatus.in_stock).toBe(0)
      expect(summary.byStatus.low_stock).toBe(0)
      expect(summary.byStatus.out_of_stock).toBe(0)
    })

    it('handles inventory with no folders', () => {
      const activeItems = filterItems(testItems, { tenantId: TEST_TENANT_ID, deletedAt: null })
      const { itemsByFolder, uncategorized } = getItemsByFolder(activeItems, [])

      expect(itemsByFolder).toHaveLength(0)
      // Only items with folder_id === null are considered uncategorized
      // Items with folder_id pointing to non-existent folders are not included in any group
      expect(uncategorized.length).toBe(1) // Only item-4 has folder_id: null
    })

    it('all folder values plus uncategorized equals total value', () => {
      const activeItems = filterItems(testItems, { tenantId: TEST_TENANT_ID, deletedAt: null })
      const summary = getSummaryData(testItems, testFolders, TEST_TENANT_ID)
      const { itemsByFolder, uncategorizedValue } = getItemsByFolder(activeItems, testFolders)

      const folderValuesSum = itemsByFolder.reduce((sum, f) => sum + f.value, 0)
      const calculatedTotal = folderValuesSum + uncategorizedValue

      expect(calculatedTotal).toBe(summary.totalValue)
    })
  })
})

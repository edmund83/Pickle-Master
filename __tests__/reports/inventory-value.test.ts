import { describe, it, expect } from 'vitest'
import {
  testItems,
  testFolders,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem, Folder } from '@/types/database.types'

/**
 * Inventory Value Report Tests
 *
 * The inventory value report should:
 * 1. Total value calculation accurate (quantity × price)
 * 2. Average value per item calculation correct
 * 3. Value by folder aggregation correct
 * 4. Top 10 items sorted by value correctly
 * 5. Handle null prices as 0
 */

interface ValueByFolder {
  folder: Folder | null
  itemCount: number
  totalValue: number
  totalQuantity: number
}

// Simulate the data processing logic from inventory-value/page.tsx
function getInventoryValueData(items: InventoryItem[], folders: Folder[], tenantId: string) {
  const filteredItems = filterItems(items, { tenantId, deletedAt: null })

  // Calculate value by folder
  const folderMap = new Map<string | null, ValueByFolder>()

  // Initialize with null for uncategorized
  folderMap.set(null, {
    folder: null,
    itemCount: 0,
    totalValue: 0,
    totalQuantity: 0,
  })

  // Initialize folders
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      folder,
      itemCount: 0,
      totalValue: 0,
      totalQuantity: 0,
    })
  })

  // Aggregate items
  filteredItems.forEach(item => {
    const folderId = item.folder_id
    const existing = folderMap.get(folderId) || folderMap.get(null)!
    existing.itemCount++
    existing.totalQuantity += item.quantity
    existing.totalValue += item.quantity * (item.price ?? 0)
  })

  const valueByFolder = Array.from(folderMap.values())
    .filter(v => v.itemCount > 0)
    .sort((a, b) => b.totalValue - a.totalValue)

  return { items: filteredItems, folders, valueByFolder }
}

function calculateStats(items: InventoryItem[]) {
  const totalValue = items.reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0)
  const totalItems = items.length
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const avgValuePerItem = totalItems > 0 ? totalValue / totalItems : 0

  return { totalValue, totalItems, totalQuantity, avgValuePerItem }
}

function getTopItems(items: InventoryItem[], limit: number = 10) {
  return [...items]
    .map(item => ({ ...item, value: item.quantity * (item.price ?? 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

describe('Inventory Value Report', () => {
  describe('Total Value Calculation', () => {
    it('correctly calculates total inventory value', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)
      const stats = calculateStats(data.items)

      // Manual calculation:
      // item-1: 50 × 1500 = 75000
      // item-2: 5 × 50 = 250
      // item-3: 0 × 25 = 0
      // item-4: 20 × 15 = 300
      const expectedValue = 75000 + 250 + 0 + 300
      expect(stats.totalValue).toBe(expectedValue)
    })

    it('treats null price as 0', () => {
      const itemsWithNull: InventoryItem[] = [
        { ...testItems[0], id: 'null-price', price: null, quantity: 100, deleted_at: null },
      ]

      const stats = calculateStats(itemsWithNull)
      expect(stats.totalValue).toBe(0)
    })
  })

  describe('Average Value Per Item', () => {
    it('correctly calculates average value per item', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)
      const stats = calculateStats(data.items)

      const expectedAvg = stats.totalValue / stats.totalItems
      expect(stats.avgValuePerItem).toBe(expectedAvg)
    })

    it('returns 0 when no items exist', () => {
      const stats = calculateStats([])
      expect(stats.avgValuePerItem).toBe(0)
    })
  })

  describe('Value by Folder Aggregation', () => {
    it('correctly aggregates value by folder', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)

      // Electronics: 75000 + 250 = 75250
      const electronics = data.valueByFolder.find(v => v.folder?.id === 'folder-1')
      expect(electronics?.totalValue).toBe(75250)
      expect(electronics?.itemCount).toBe(2)

      // Office Supplies: 0 (Printer Paper has qty 0)
      const officeSupplies = data.valueByFolder.find(v => v.folder?.id === 'folder-2')
      expect(officeSupplies?.totalValue).toBe(0)
      expect(officeSupplies?.itemCount).toBe(1)
    })

    it('includes uncategorized items', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)

      const uncategorized = data.valueByFolder.find(v => v.folder === null)
      expect(uncategorized?.itemCount).toBe(1) // Stapler
      expect(uncategorized?.totalValue).toBe(300) // 20 × 15
    })

    it('sorts folders by value descending', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)

      for (let i = 1; i < data.valueByFolder.length; i++) {
        expect(data.valueByFolder[i].totalValue).toBeLessThanOrEqual(
          data.valueByFolder[i - 1].totalValue
        )
      }
    })

    it('calculates correct percentage for each folder', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)
      const stats = calculateStats(data.items)

      data.valueByFolder.forEach(entry => {
        const percentage = stats.totalValue > 0 ? (entry.totalValue / stats.totalValue) * 100 : 0
        expect(percentage).toBeGreaterThanOrEqual(0)
        expect(percentage).toBeLessThanOrEqual(100)
      })

      // Sum of all percentages should equal 100%
      const totalPercentage = data.valueByFolder.reduce((sum, entry) => {
        return sum + (stats.totalValue > 0 ? (entry.totalValue / stats.totalValue) * 100 : 0)
      }, 0)
      expect(Math.round(totalPercentage)).toBe(100)
    })
  })

  describe('Top 10 Valuable Items', () => {
    it('returns top items sorted by value descending', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)
      const topItems = getTopItems(data.items, 10)

      // Verify descending order
      for (let i = 1; i < topItems.length; i++) {
        expect(topItems[i].value).toBeLessThanOrEqual(topItems[i - 1].value)
      }
    })

    it('returns at most 10 items', () => {
      // Create 15 items
      const manyItems: InventoryItem[] = Array.from({ length: 15 }, (_, i) => ({
        ...testItems[0],
        id: `item-${i}`,
        name: `Item ${i}`,
        quantity: 10 + i,
        price: 100,
        deleted_at: null,
      }))

      const topItems = getTopItems(manyItems, 10)
      expect(topItems.length).toBe(10)
    })

    it('calculates item value correctly (quantity × price)', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)
      const topItems = getTopItems(data.items, 10)

      topItems.forEach(item => {
        const expectedValue = item.quantity * (item.price ?? 0)
        expect(item.value).toBe(expectedValue)
      })
    })

    it('highest value item is first', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)
      const topItems = getTopItems(data.items, 10)

      // Laptop should be first: 50 × 1500 = 75000
      expect(topItems[0].name).toBe('Laptop')
      expect(topItems[0].value).toBe(75000)
    })
  })

  describe('Total Quantity', () => {
    it('correctly sums total quantity', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)
      const stats = calculateStats(data.items)

      // 50 + 5 + 0 + 20 = 75
      expect(stats.totalQuantity).toBe(75)
    })

    it('correctly sums quantity per folder', () => {
      const data = getInventoryValueData(testItems, testFolders, TEST_TENANT_ID)

      // Electronics: 50 + 5 = 55
      const electronics = data.valueByFolder.find(v => v.folder?.id === 'folder-1')
      expect(electronics?.totalQuantity).toBe(55)

      // Office Supplies: 0
      const officeSupplies = data.valueByFolder.find(v => v.folder?.id === 'folder-2')
      expect(officeSupplies?.totalQuantity).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty inventory', () => {
      const data = getInventoryValueData([], testFolders, TEST_TENANT_ID)
      const stats = calculateStats(data.items)

      expect(stats.totalValue).toBe(0)
      expect(stats.totalItems).toBe(0)
      expect(stats.avgValuePerItem).toBe(0)
      expect(data.valueByFolder.length).toBe(0)
    })

    it('handles items with zero price', () => {
      const zeroPrice: InventoryItem[] = [
        { ...testItems[0], id: 'zero-price', price: 0, quantity: 100, deleted_at: null },
      ]

      const stats = calculateStats(zeroPrice)
      expect(stats.totalValue).toBe(0)
    })

    it('handles very large values', () => {
      const largeValueItem: InventoryItem[] = [
        { ...testItems[0], id: 'large', price: 1000000, quantity: 1000, deleted_at: null },
      ]

      const stats = calculateStats(largeValueItem)
      expect(stats.totalValue).toBe(1000000000)
    })
  })
})

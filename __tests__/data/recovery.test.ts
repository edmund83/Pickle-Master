import { describe, it, expect } from 'vitest'
import {
  testItems,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem } from '@/types/database.types'

/**
 * Soft Delete Recovery Tests
 *
 * Tests for item recovery functionality:
 * - Can undelete by clearing deleted_at
 * - Recovered items appear in active lists
 * - Recovered items contribute to totals
 */

// Simulate recovery function
function recoverItem(item: InventoryItem): InventoryItem {
  return {
    ...item,
    deleted_at: null,
    updated_at: new Date().toISOString(),
  }
}

// Check if item is recoverable
function isRecoverable(item: InventoryItem): boolean {
  return item.deleted_at !== null
}

describe('Soft Delete Recovery', () => {
  describe('Can undelete by clearing deleted_at', () => {
    it('clears deleted_at timestamp for recovery', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')!
      expect(deletedItem.deleted_at).not.toBeNull()

      const recovered = recoverItem(deletedItem)

      expect(recovered.deleted_at).toBeNull()
      expect(recovered.id).toBe(deletedItem.id)
    })

    it('preserves all other fields during recovery', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const recovered = recoverItem(deletedItem)

      expect(recovered.name).toBe(deletedItem.name)
      expect(recovered.quantity).toBe(deletedItem.quantity)
      expect(recovered.price).toBe(deletedItem.price)
      expect(recovered.sku).toBe(deletedItem.sku)
      expect(recovered.tenant_id).toBe(deletedItem.tenant_id)
      expect(recovered.folder_id).toBe(deletedItem.folder_id)
    })

    it('updates updated_at timestamp on recovery', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const originalUpdatedAt = deletedItem.updated_at

      const recovered = recoverItem(deletedItem)

      expect(recovered.updated_at).not.toBe(originalUpdatedAt)
    })

    it('identifies recoverable items correctly', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const activeItem = testItems.find(i => i.id === 'item-1')!

      expect(isRecoverable(deletedItem)).toBe(true)
      expect(isRecoverable(activeItem)).toBe(false)
    })
  })

  describe('Recovered items appear in active lists', () => {
    it('recovered item included in active items filter', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const recoveredItem = recoverItem(deletedItem)

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const activeItems = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      expect(activeItems.find(i => i.id === 'item-5')).toBeDefined()
    })

    it('recovered item appears in correct folder', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const recoveredItem = recoverItem(deletedItem)

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const folderItems = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
        folderId: deletedItem.folder_id,
      })

      expect(folderItems.find(i => i.id === 'item-5')).toBeDefined()
    })

    it('total count increases after recovery', () => {
      const beforeRecovery = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const recoveredItem = recoverItem(deletedItem)

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const afterRecovery = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      expect(afterRecovery.length).toBe(beforeRecovery.length + 1)
    })
  })

  describe('Recovered items contribute to totals', () => {
    it('recovered item value added to total', () => {
      const beforeRecovery = filterItems(testItems, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })
      const valueBefore = beforeRecovery.reduce(
        (sum, i) => sum + i.quantity * (i.price ?? 0),
        0
      )

      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const recoveredItem = recoverItem(deletedItem)

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const afterRecovery = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })
      const valueAfter = afterRecovery.reduce(
        (sum, i) => sum + i.quantity * (i.price ?? 0),
        0
      )

      const expectedIncrease = deletedItem.quantity * (deletedItem.price ?? 0)
      expect(valueAfter).toBe(valueBefore + expectedIncrease)
    })

    it('recovered item counted in status breakdown', () => {
      const deletedItem = testItems.find(i => i.id === 'item-5')!
      const recoveredItem = recoverItem(deletedItem)

      const itemsWithRecovered = [
        ...testItems.filter(i => i.id !== 'item-5'),
        recoveredItem,
      ]

      const afterRecovery = filterItems(itemsWithRecovered, {
        tenantId: TEST_TENANT_ID,
        deletedAt: null,
      })

      const inStockCount = afterRecovery.filter(i => i.status === 'in_stock').length
      expect(inStockCount).toBe(3) // Original 2 + recovered item
    })
  })

  describe('Multiple recovery scenarios', () => {
    it('can recover multiple items', () => {
      const itemsWithMultipleDeleted: InventoryItem[] = [
        ...testItems,
        { ...testItems[0], id: 'deleted-2', deleted_at: '2024-01-01' },
        { ...testItems[0], id: 'deleted-3', deleted_at: '2024-01-02' },
      ]

      const deletedItems = itemsWithMultipleDeleted.filter(i => i.deleted_at !== null)
      expect(deletedItems.length).toBe(3)

      const recoveredItems = deletedItems.map(i => recoverItem(i))
      expect(recoveredItems.every(i => i.deleted_at === null)).toBe(true)
    })

    it('recovery is idempotent for active items', () => {
      const activeItem = testItems.find(i => i.id === 'item-1')!
      const result = recoverItem(activeItem)

      // Should still be valid after "recovery"
      expect(result.deleted_at).toBeNull()
      expect(result.id).toBe(activeItem.id)
    })
  })
})

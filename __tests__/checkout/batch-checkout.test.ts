import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Batch Checkout Tests
 *
 * Tests for batch checkout operations:
 * - Multiple items in single operation
 * - Partial failure handling
 * - Error aggregation
 */

interface CheckoutItem {
  itemId: string
  quantity: number
  serialIds?: string[]
}

interface CheckoutResult {
  itemId: string
  success: boolean
  checkoutId?: string
  error?: string
}

interface BatchCheckoutResult {
  successCount: number
  failedCount: number
  results: CheckoutResult[]
}

interface InventoryItem {
  id: string
  name: string
  quantity: number
  hasSerials: boolean
}

// Simulate batch checkout
function batchCheckout(
  items: CheckoutItem[],
  inventory: Map<string, InventoryItem>,
  assignee: { name: string; type: string }
): BatchCheckoutResult {
  const results: CheckoutResult[] = []

  for (const item of items) {
    const inventoryItem = inventory.get(item.itemId)

    if (!inventoryItem) {
      results.push({
        itemId: item.itemId,
        success: false,
        error: 'Item not found',
      })
      continue
    }

    if (item.quantity <= 0) {
      results.push({
        itemId: item.itemId,
        success: false,
        error: 'Invalid quantity',
      })
      continue
    }

    if (inventoryItem.quantity < item.quantity) {
      results.push({
        itemId: item.itemId,
        success: false,
        error: 'Insufficient stock',
      })
      continue
    }

    // For serialized items, require serial IDs
    if (inventoryItem.hasSerials && (!item.serialIds || item.serialIds.length !== item.quantity)) {
      results.push({
        itemId: item.itemId,
        success: false,
        error: 'Serial IDs required for serialized items',
      })
      continue
    }

    // Success - decrement inventory
    inventoryItem.quantity -= item.quantity

    results.push({
      itemId: item.itemId,
      success: true,
      checkoutId: `co-${Date.now()}-${item.itemId}`,
    })
  }

  return {
    successCount: results.filter(r => r.success).length,
    failedCount: results.filter(r => !r.success).length,
    results,
  }
}

// Get failed items with errors
function getFailedItems(result: BatchCheckoutResult): Array<{ itemId: string; error: string }> {
  return result.results
    .filter(r => !r.success)
    .map(r => ({ itemId: r.itemId, error: r.error! }))
}

// Check if batch had any failures
function hasFailures(result: BatchCheckoutResult): boolean {
  return result.failedCount > 0
}

// Check if batch completely failed
function allFailed(result: BatchCheckoutResult): boolean {
  return result.successCount === 0 && result.failedCount > 0
}

describe('Batch Checkout', () => {
  describe('Process Multiple Items', () => {
    it('processes array of items', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 10, hasSerials: false }],
        ['item-2', { id: 'item-2', name: 'Mouse', quantity: 20, hasSerials: false }],
      ])

      const result = batchCheckout(
        [
          { itemId: 'item-1', quantity: 2 },
          { itemId: 'item-2', quantity: 5 },
        ],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.results.length).toBe(2)
    })

    it('decrements all item quantities', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 10, hasSerials: false }],
        ['item-2', { id: 'item-2', name: 'Mouse', quantity: 20, hasSerials: false }],
      ])

      batchCheckout(
        [
          { itemId: 'item-1', quantity: 2 },
          { itemId: 'item-2', quantity: 5 },
        ],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(inventory.get('item-1')!.quantity).toBe(8)
      expect(inventory.get('item-2')!.quantity).toBe(15)
    })

    it('returns success count', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 10, hasSerials: false }],
        ['item-2', { id: 'item-2', name: 'Mouse', quantity: 20, hasSerials: false }],
      ])

      const result = batchCheckout(
        [
          { itemId: 'item-1', quantity: 2 },
          { itemId: 'item-2', quantity: 5 },
        ],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.successCount).toBe(2)
    })

    it('generates checkout IDs for successful items', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 10, hasSerials: false }],
      ])

      const result = batchCheckout(
        [{ itemId: 'item-1', quantity: 2 }],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.results[0].checkoutId).toBeDefined()
    })
  })

  describe('Partial Failure Handling', () => {
    it('continues processing after failure', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 1, hasSerials: false }],
        ['item-2', { id: 'item-2', name: 'Mouse', quantity: 20, hasSerials: false }],
      ])

      const result = batchCheckout(
        [
          { itemId: 'item-1', quantity: 5 }, // Will fail - insufficient
          { itemId: 'item-2', quantity: 5 }, // Should still succeed
        ],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.successCount).toBe(1)
      expect(result.failedCount).toBe(1)
    })

    it('returns success count and failed items array', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 1, hasSerials: false }],
        ['item-2', { id: 'item-2', name: 'Mouse', quantity: 20, hasSerials: false }],
        ['item-3', { id: 'item-3', name: 'Keyboard', quantity: 0, hasSerials: false }],
      ])

      const result = batchCheckout(
        [
          { itemId: 'item-1', quantity: 5 }, // Fail - insufficient
          { itemId: 'item-2', quantity: 5 }, // Success
          { itemId: 'item-3', quantity: 1 }, // Fail - insufficient
        ],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.successCount).toBe(1)
      expect(result.failedCount).toBe(2)

      const failed = getFailedItems(result)
      expect(failed.length).toBe(2)
    })

    it('does not modify inventory for failed items', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 1, hasSerials: false }],
      ])

      batchCheckout(
        [{ itemId: 'item-1', quantity: 5 }],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(inventory.get('item-1')!.quantity).toBe(1) // Unchanged
    })
  })

  describe('Error Aggregation', () => {
    it('collects all errors with item references', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 1, hasSerials: false }],
      ])

      const result = batchCheckout(
        [
          { itemId: 'item-1', quantity: 5 }, // Insufficient
          { itemId: 'item-nonexistent', quantity: 1 }, // Not found
          { itemId: 'item-1', quantity: -1 }, // Invalid quantity
        ],
        inventory,
        { name: 'John', type: 'employee' }
      )

      const failed = getFailedItems(result)

      expect(failed.length).toBe(3)
      expect(failed[0]).toEqual({ itemId: 'item-1', error: 'Insufficient stock' })
      expect(failed[1]).toEqual({ itemId: 'item-nonexistent', error: 'Item not found' })
      expect(failed[2]).toEqual({ itemId: 'item-1', error: 'Invalid quantity' })
    })

    it('detects if batch had failures', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 1, hasSerials: false }],
      ])

      const result = batchCheckout(
        [{ itemId: 'item-1', quantity: 5 }],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(hasFailures(result)).toBe(true)
    })

    it('detects if batch completely failed', () => {
      const inventory = new Map<string, InventoryItem>()

      const result = batchCheckout(
        [{ itemId: 'item-1', quantity: 1 }],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(allFailed(result)).toBe(true)
    })
  })

  describe('Mixed Serial/Non-Serial Items', () => {
    it('handles non-serial items normally', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Paper', quantity: 100, hasSerials: false }],
      ])

      const result = batchCheckout(
        [{ itemId: 'item-1', quantity: 10 }],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.successCount).toBe(1)
    })

    it('requires serial IDs for serialized items', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 10, hasSerials: true }],
      ])

      const result = batchCheckout(
        [{ itemId: 'item-1', quantity: 2 }], // No serial IDs
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.failedCount).toBe(1)
      expect(result.results[0].error).toBe('Serial IDs required for serialized items')
    })

    it('validates serial count matches quantity', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 10, hasSerials: true }],
      ])

      const result = batchCheckout(
        [{ itemId: 'item-1', quantity: 3, serialIds: ['sn-1', 'sn-2'] }], // Only 2 serials for 3 qty
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.failedCount).toBe(1)
    })

    it('succeeds with correct serial count', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Laptop', quantity: 10, hasSerials: true }],
      ])

      const result = batchCheckout(
        [{ itemId: 'item-1', quantity: 2, serialIds: ['sn-1', 'sn-2'] }],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.successCount).toBe(1)
    })

    it('handles mixed items in same batch', () => {
      const inventory = new Map<string, InventoryItem>([
        ['item-1', { id: 'item-1', name: 'Paper', quantity: 100, hasSerials: false }],
        ['item-2', { id: 'item-2', name: 'Laptop', quantity: 10, hasSerials: true }],
      ])

      const result = batchCheckout(
        [
          { itemId: 'item-1', quantity: 10 }, // Non-serial
          { itemId: 'item-2', quantity: 2, serialIds: ['sn-1', 'sn-2'] }, // Serial
        ],
        inventory,
        { name: 'John', type: 'employee' }
      )

      expect(result.successCount).toBe(2)
    })
  })
})

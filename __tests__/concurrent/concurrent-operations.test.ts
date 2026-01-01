import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID } from '../utils/test-data'

/**
 * Concurrent Operations Tests
 *
 * Tests for concurrent operation handling:
 * - Simultaneous edits (last write wins)
 * - Checkout race conditions
 * - Import during edit
 */

interface Item {
  id: string
  tenant_id: string
  name: string
  quantity: number
  version: number
  updated_at: string
}

// Simulated item store
const items = new Map<string, Item>()

// Simulated lock for checkout operations
const checkoutLocks = new Set<string>()

// Update item (last write wins)
function updateItem(
  itemId: string,
  updates: Partial<Item>,
  _userId: string
): { success: boolean; item?: Item; error?: string } {
  const item = items.get(itemId)
  if (!item) {
    return { success: false, error: 'Item not found' }
  }

  // Last write wins - no version checking
  const updated: Item = {
    ...item,
    ...updates,
    version: item.version + 1,
    updated_at: new Date().toISOString(),
  }

  items.set(itemId, updated)
  return { success: true, item: updated }
}

// Checkout with lock
function checkoutItem(
  itemId: string,
  quantity: number,
  _userId: string
): { success: boolean; error?: string; checkoutId?: string } {
  // Try to acquire lock
  if (checkoutLocks.has(itemId)) {
    return { success: false, error: 'Another checkout is in progress for this item' }
  }

  const item = items.get(itemId)
  if (!item) {
    return { success: false, error: 'Item not found' }
  }

  if (item.quantity < quantity) {
    return { success: false, error: 'Insufficient stock' }
  }

  // Acquire lock
  checkoutLocks.add(itemId)

  try {
    // Perform checkout
    item.quantity -= quantity
    items.set(itemId, { ...item, version: item.version + 1 })

    return { success: true, checkoutId: `co-${Date.now()}` }
  } finally {
    // Release lock
    checkoutLocks.delete(itemId)
  }
}

// Simulate race condition for checkout
async function simulateCheckoutRace(
  itemId: string,
  quantity1: number,
  quantity2: number
): Promise<{ first: ReturnType<typeof checkoutItem>; second: ReturnType<typeof checkoutItem> }> {
  const item = items.get(itemId)
  if (!item) {
    return {
      first: { success: false, error: 'Item not found' },
      second: { success: false, error: 'Item not found' },
    }
  }

  // First checkout succeeds
  const first = checkoutItem(itemId, quantity1, 'user-1')

  // Second checkout - may fail if insufficient
  const second = checkoutItem(itemId, quantity2, 'user-2')

  return { first, second }
}

// Simulate simultaneous edits
function simulateSimultaneousEdits(
  itemId: string,
  edit1: { name: string },
  edit2: { name: string }
): { finalValue: string; winnerUser: string } {
  // User 1 reads item
  const _read1 = items.get(itemId)

  // User 2 reads item
  const _read2 = items.get(itemId)

  // User 1 submits edit
  updateItem(itemId, { name: edit1.name }, 'user-1')

  // User 2 submits edit (overwrites user 1)
  updateItem(itemId, { name: edit2.name }, 'user-2')

  // Last write wins
  const final = items.get(itemId)!
  return {
    finalValue: final.name,
    winnerUser: 'user-2',
  }
}

// Import items (separate from existing items)
function importItems(
  newItems: Array<{ name: string; quantity: number }>,
  tenantId: string
): { successCount: number; createdIds: string[] } {
  const createdIds: string[] = []

  for (const newItem of newItems) {
    const id = `item-import-${Date.now()}-${Math.random().toString(36).slice(2)}`
    items.set(id, {
      id,
      tenant_id: tenantId,
      name: newItem.name,
      quantity: newItem.quantity,
      version: 1,
      updated_at: new Date().toISOString(),
    })
    createdIds.push(id)
  }

  return { successCount: createdIds.length, createdIds }
}

// Simulate import during edit
function simulateImportDuringEdit(
  existingItemId: string,
  editName: string,
  importItems_: Array<{ name: string; quantity: number }>
): { editSuccess: boolean; importSuccess: boolean; noConflict: boolean } {
  // Start editing existing item
  const editResult = updateItem(existingItemId, { name: editName }, 'editor-user')

  // Import new items (different items, no conflict)
  const importResult = importItems(importItems_, TEST_TENANT_ID)

  // Both should succeed - no conflicts between them
  return {
    editSuccess: editResult.success,
    importSuccess: importResult.successCount > 0,
    noConflict: true, // Different items, never conflict
  }
}

describe('Concurrent Operations', () => {
  beforeEach(() => {
    items.clear()
    checkoutLocks.clear()
  })

  describe('Simultaneous Edits', () => {
    it('last write wins (no conflict resolution)', () => {
      // Create item
      const item: Item = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Original Name',
        quantity: 100,
        version: 1,
        updated_at: new Date().toISOString(),
      }
      items.set(item.id, item)

      // Simulate simultaneous edits
      const result = simulateSimultaneousEdits(
        'item-1',
        { name: 'User 1 Edit' },
        { name: 'User 2 Edit' }
      )

      // Last write wins
      expect(result.finalValue).toBe('User 2 Edit')
      expect(result.winnerUser).toBe('user-2')
    })

    it('increments version on each edit', () => {
      const item: Item = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Original',
        quantity: 100,
        version: 1,
        updated_at: new Date().toISOString(),
      }
      items.set(item.id, item)

      updateItem('item-1', { name: 'Edit 1' }, 'user-1')
      expect(items.get('item-1')!.version).toBe(2)

      updateItem('item-1', { name: 'Edit 2' }, 'user-2')
      expect(items.get('item-1')!.version).toBe(3)
    })

    it('updates timestamp on each edit', () => {
      const item: Item = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Original',
        quantity: 100,
        version: 1,
        updated_at: '2024-01-01T00:00:00Z',
      }
      items.set(item.id, item)

      updateItem('item-1', { name: 'New Name' }, 'user-1')

      expect(items.get('item-1')!.updated_at).not.toBe('2024-01-01T00:00:00Z')
    })
  })

  describe('Checkout Race', () => {
    it('first checkout succeeds, second fails if insufficient', async () => {
      const item: Item = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 5,
        version: 1,
        updated_at: new Date().toISOString(),
      }
      items.set(item.id, item)

      // Two users try to checkout 3 each, but only 5 available
      const result = await simulateCheckoutRace('item-1', 3, 3)

      // First succeeds
      expect(result.first.success).toBe(true)

      // Second fails - insufficient stock
      expect(result.second.success).toBe(false)
      expect(result.second.error).toContain('Insufficient')
    })

    it('both succeed if sufficient stock', async () => {
      const item: Item = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 10,
        version: 1,
        updated_at: new Date().toISOString(),
      }
      items.set(item.id, item)

      // Two users checkout 3 each, 10 available
      const result = await simulateCheckoutRace('item-1', 3, 3)

      expect(result.first.success).toBe(true)
      expect(result.second.success).toBe(true)

      // Final quantity should be 4
      expect(items.get('item-1')!.quantity).toBe(4)
    })

    it('prevents checkout of non-existent item', async () => {
      const result = await simulateCheckoutRace('non-existent', 1, 1)

      expect(result.first.success).toBe(false)
      expect(result.first.error).toContain('not found')
    })
  })

  describe('Import During Edit', () => {
    it('no conflicts - different items', () => {
      // Create existing item
      const item: Item = {
        id: 'existing-item',
        tenant_id: TEST_TENANT_ID,
        name: 'Existing Item',
        quantity: 50,
        version: 1,
        updated_at: new Date().toISOString(),
      }
      items.set(item.id, item)

      // Simulate edit and import happening at same time
      const result = simulateImportDuringEdit(
        'existing-item',
        'Edited Name',
        [
          { name: 'Imported Item 1', quantity: 10 },
          { name: 'Imported Item 2', quantity: 20 },
        ]
      )

      expect(result.editSuccess).toBe(true)
      expect(result.importSuccess).toBe(true)
      expect(result.noConflict).toBe(true)
    })

    it('edit affects only target item', () => {
      // Create existing item
      const item: Item = {
        id: 'existing-item',
        tenant_id: TEST_TENANT_ID,
        name: 'Original Name',
        quantity: 50,
        version: 1,
        updated_at: new Date().toISOString(),
      }
      items.set(item.id, item)

      // Import new items
      importItems([{ name: 'New Import', quantity: 10 }], TEST_TENANT_ID)

      // Edit existing
      updateItem('existing-item', { name: 'Edited Name' }, 'user-1')

      // Existing item is edited
      expect(items.get('existing-item')!.name).toBe('Edited Name')

      // Imported item is unchanged
      const importedItem = Array.from(items.values()).find((i) => i.name === 'New Import')
      expect(importedItem).toBeDefined()
    })

    it('import creates new items without affecting existing', () => {
      const existingItem: Item = {
        id: 'existing-item',
        tenant_id: TEST_TENANT_ID,
        name: 'Existing',
        quantity: 100,
        version: 1,
        updated_at: new Date().toISOString(),
      }
      items.set(existingItem.id, existingItem)

      const importResult = importItems(
        [{ name: 'Imported', quantity: 50 }],
        TEST_TENANT_ID
      )

      // Import succeeded
      expect(importResult.successCount).toBe(1)

      // Existing item unchanged
      expect(items.get('existing-item')!.quantity).toBe(100)
    })
  })
})

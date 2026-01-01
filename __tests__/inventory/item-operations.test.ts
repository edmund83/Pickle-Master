import { describe, it, expect } from 'vitest'
import { testItems, testFolders, TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'
import type { InventoryItem } from '@/types/database.types'

/**
 * Item Operations Tests
 *
 * Tests for item CRUD operations:
 * - Duplicate item
 * - Move item to folder
 * - Update item tags
 * - Delete item (soft delete)
 */

// Simulate duplicate item function
function duplicateItem(
  item: InventoryItem,
  options: { newId: string; timestamp: string }
): InventoryItem {
  return {
    ...item,
    id: options.newId,
    sku: item.sku ? `${item.sku}-COPY` : null,
    barcode: null, // Barcode is reset
    created_at: options.timestamp,
    updated_at: options.timestamp,
    deleted_at: null,
  }
}

// Simulate move item function
function moveItemToFolder(
  item: InventoryItem,
  folderId: string | null,
  timestamp: string
): InventoryItem {
  return {
    ...item,
    folder_id: folderId,
    updated_at: timestamp,
  }
}

// Simulate tag update function
function updateItemTags(
  item: InventoryItem,
  tags: string[],
  timestamp: string
): InventoryItem {
  return {
    ...item,
    tags,
    updated_at: timestamp,
  }
}

// Simulate soft delete function
function softDeleteItem(
  item: InventoryItem,
  timestamp: string
): InventoryItem {
  return {
    ...item,
    deleted_at: timestamp,
    updated_at: timestamp,
  }
}

describe('Item Operations', () => {
  const testItem = testItems[0] // Laptop

  describe('Duplicate Item', () => {
    it('creates new item with same data except id/timestamps', () => {
      const timestamp = new Date().toISOString()
      const duplicated = duplicateItem(testItem, {
        newId: 'new-item-id',
        timestamp,
      })

      expect(duplicated.id).toBe('new-item-id')
      expect(duplicated.id).not.toBe(testItem.id)
      expect(duplicated.name).toBe(testItem.name)
      expect(duplicated.quantity).toBe(testItem.quantity)
      expect(duplicated.price).toBe(testItem.price)
      expect(duplicated.cost_price).toBe(testItem.cost_price)
      expect(duplicated.folder_id).toBe(testItem.folder_id)
    })

    it('modifies SKU with -COPY suffix', () => {
      const duplicated = duplicateItem(testItem, {
        newId: 'new-item-id',
        timestamp: new Date().toISOString(),
      })

      expect(duplicated.sku).toBe('LAP-001-COPY')
      expect(duplicated.sku).not.toBe(testItem.sku)
    })

    it('handles item without SKU', () => {
      const itemWithoutSku: InventoryItem = {
        ...testItem,
        sku: null,
      }

      const duplicated = duplicateItem(itemWithoutSku, {
        newId: 'new-item-id',
        timestamp: new Date().toISOString(),
      })

      expect(duplicated.sku).toBeNull()
    })

    it('resets barcode to null', () => {
      const itemWithBarcode: InventoryItem = {
        ...testItem,
        barcode: '1234567890',
      }

      const duplicated = duplicateItem(itemWithBarcode, {
        newId: 'new-item-id',
        timestamp: new Date().toISOString(),
      })

      expect(duplicated.barcode).toBeNull()
    })

    it('sets new timestamps', () => {
      const timestamp = new Date().toISOString()
      const duplicated = duplicateItem(testItem, {
        newId: 'new-item-id',
        timestamp,
      })

      expect(duplicated.created_at).toBe(timestamp)
      expect(duplicated.updated_at).toBe(timestamp)
    })

    it('sets deleted_at to null', () => {
      const deletedItem: InventoryItem = {
        ...testItem,
        deleted_at: '2024-01-01T00:00:00Z',
      }

      const duplicated = duplicateItem(deletedItem, {
        newId: 'new-item-id',
        timestamp: new Date().toISOString(),
      })

      expect(duplicated.deleted_at).toBeNull()
    })

    it('copies tags array', () => {
      const itemWithTags: InventoryItem = {
        ...testItem,
        tags: ['electronics', 'portable'],
      }

      const duplicated = duplicateItem(itemWithTags, {
        newId: 'new-item-id',
        timestamp: new Date().toISOString(),
      })

      expect(duplicated.tags).toEqual(['electronics', 'portable'])
    })
  })

  describe('Move Item to Folder', () => {
    it('updates folder_id to specified folder', () => {
      const timestamp = new Date().toISOString()
      const moved = moveItemToFolder(testItem, 'folder-2', timestamp)

      expect(moved.folder_id).toBe('folder-2')
    })

    it('moves to root (null folder_id)', () => {
      const timestamp = new Date().toISOString()
      const moved = moveItemToFolder(testItem, null, timestamp)

      expect(moved.folder_id).toBeNull()
    })

    it('updates updated_at timestamp', () => {
      const timestamp = new Date().toISOString()
      const moved = moveItemToFolder(testItem, 'folder-2', timestamp)

      expect(moved.updated_at).toBe(timestamp)
    })

    it('preserves other item fields', () => {
      const timestamp = new Date().toISOString()
      const moved = moveItemToFolder(testItem, 'folder-2', timestamp)

      expect(moved.id).toBe(testItem.id)
      expect(moved.name).toBe(testItem.name)
      expect(moved.quantity).toBe(testItem.quantity)
      expect(moved.price).toBe(testItem.price)
    })

    it('handles move to same folder (no-op)', () => {
      const timestamp = new Date().toISOString()
      const moved = moveItemToFolder(testItem, testItem.folder_id, timestamp)

      expect(moved.folder_id).toBe(testItem.folder_id)
    })
  })

  describe('Update Item Tags', () => {
    it('adds tags to item', () => {
      const timestamp = new Date().toISOString()
      const updated = updateItemTags(testItem, ['electronics', 'laptop'], timestamp)

      expect(updated.tags).toEqual(['electronics', 'laptop'])
    })

    it('removes all tags with empty array', () => {
      const itemWithTags: InventoryItem = {
        ...testItem,
        tags: ['electronics', 'laptop'],
      }

      const timestamp = new Date().toISOString()
      const updated = updateItemTags(itemWithTags, [], timestamp)

      expect(updated.tags).toEqual([])
    })

    it('replaces existing tags', () => {
      const itemWithTags: InventoryItem = {
        ...testItem,
        tags: ['old-tag-1', 'old-tag-2'],
      }

      const timestamp = new Date().toISOString()
      const updated = updateItemTags(itemWithTags, ['new-tag'], timestamp)

      expect(updated.tags).toEqual(['new-tag'])
      expect(updated.tags).not.toContain('old-tag-1')
    })

    it('updates updated_at timestamp', () => {
      const timestamp = new Date().toISOString()
      const updated = updateItemTags(testItem, ['tag'], timestamp)

      expect(updated.updated_at).toBe(timestamp)
    })

    it('handles multiple tags', () => {
      const timestamp = new Date().toISOString()
      const updated = updateItemTags(testItem, ['tag1', 'tag2', 'tag3'], timestamp)

      expect(updated.tags).toHaveLength(3)
      expect(updated.tags).toContain('tag1')
      expect(updated.tags).toContain('tag2')
      expect(updated.tags).toContain('tag3')
    })
  })

  describe('Soft Delete Item', () => {
    it('sets deleted_at timestamp', () => {
      const timestamp = new Date().toISOString()
      const deleted = softDeleteItem(testItem, timestamp)

      expect(deleted.deleted_at).toBe(timestamp)
    })

    it('updates updated_at timestamp', () => {
      const timestamp = new Date().toISOString()
      const deleted = softDeleteItem(testItem, timestamp)

      expect(deleted.updated_at).toBe(timestamp)
    })

    it('preserves item data', () => {
      const timestamp = new Date().toISOString()
      const deleted = softDeleteItem(testItem, timestamp)

      expect(deleted.id).toBe(testItem.id)
      expect(deleted.name).toBe(testItem.name)
      expect(deleted.quantity).toBe(testItem.quantity)
      expect(deleted.price).toBe(testItem.price)
    })

    it('item is excluded from active queries after delete', () => {
      const timestamp = new Date().toISOString()
      const deleted = softDeleteItem(testItem, timestamp)

      // Simulate filter for active items
      const isActive = deleted.deleted_at === null
      expect(isActive).toBe(false)
    })
  })

  describe('Quota Checking', () => {
    // Simulate quota check function
    function checkQuota(currentCount: number, limit: number): {
      allowed: boolean
      remaining: number
      message?: string
    } {
      const remaining = limit - currentCount
      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          message: 'Item quota exceeded. Upgrade your plan to add more items.',
        }
      }
      return { allowed: true, remaining }
    }

    it('allows creation when within quota', () => {
      const result = checkQuota(50, 100)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(50)
    })

    it('blocks creation when quota exceeded', () => {
      const result = checkQuota(100, 100)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.message).toContain('quota exceeded')
    })

    it('blocks creation when over quota', () => {
      const result = checkQuota(105, 100)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('returns correct remaining count', () => {
      const result = checkQuota(75, 100)

      expect(result.remaining).toBe(25)
    })
  })

  describe('Field Validation', () => {
    // Simulate field validation
    function validateItemFields(item: Partial<InventoryItem>): {
      valid: boolean
      errors: string[]
    } {
      const errors: string[] = []

      if (!item.name || item.name.trim() === '') {
        errors.push('Name is required')
      }

      if (item.quantity !== undefined && item.quantity < 0) {
        errors.push('Quantity cannot be negative')
      }

      if (item.min_quantity !== undefined && item.min_quantity < 0) {
        errors.push('Minimum quantity cannot be negative')
      }

      if (item.price !== undefined && item.price !== null && item.price < 0) {
        errors.push('Price cannot be negative')
      }

      return { valid: errors.length === 0, errors }
    }

    it('validates required name field', () => {
      const result = validateItemFields({ name: '' })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')
    })

    it('validates against negative quantity', () => {
      const result = validateItemFields({ name: 'Test', quantity: -5 })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Quantity cannot be negative')
    })

    it('validates against negative price', () => {
      const result = validateItemFields({ name: 'Test', price: -10 })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Price cannot be negative')
    })

    it('passes valid item', () => {
      const result = validateItemFields({
        name: 'Test Item',
        quantity: 10,
        price: 100,
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('allows zero quantity', () => {
      const result = validateItemFields({ name: 'Test', quantity: 0 })

      expect(result.valid).toBe(true)
    })

    it('allows null price', () => {
      const result = validateItemFields({ name: 'Test', price: null })

      expect(result.valid).toBe(true)
    })
  })
})

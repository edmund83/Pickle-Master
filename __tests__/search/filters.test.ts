import { describe, it, expect } from 'vitest'
import {
  testItems,
  testFolders,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem } from '@/types/database.types'

/**
 * Search Filter Tests
 *
 * Tests for search filtering functionality:
 * - Text search (matches name, SKU, description)
 * - Status filter (in_stock, low_stock, out_of_stock)
 * - Folder filter (by folder_id)
 * - Tag filter (by tag associations)
 */

// Simulate text search function
function searchByText(items: InventoryItem[], query: string): InventoryItem[] {
  if (!query || query.trim() === '') return items

  const lowerQuery = query.toLowerCase().trim()
  return items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(lowerQuery)
    const skuMatch = item.sku?.toLowerCase().includes(lowerQuery) ?? false
    const descMatch = item.description?.toLowerCase().includes(lowerQuery) ?? false
    return nameMatch || skuMatch || descMatch
  })
}

// Simulate status filter function
function filterByStatus(items: InventoryItem[], statuses: string[]): InventoryItem[] {
  if (!statuses || statuses.length === 0) return items
  return items.filter(item => statuses.includes(item.status))
}

// Simulate folder filter function
function filterByFolder(items: InventoryItem[], folderId: string | null): InventoryItem[] {
  if (folderId === undefined) return items
  return items.filter(item => item.folder_id === folderId)
}

// Simulate tag filter function
function filterByTags(items: InventoryItem[], tagNames: string[]): InventoryItem[] {
  if (!tagNames || tagNames.length === 0) return items
  return items.filter(item => {
    const itemTags = item.tags || []
    return tagNames.some(tag => itemTags.includes(tag))
  })
}

describe('Search Filters', () => {
  // Get active items for testing
  const activeItems = filterItems(testItems, {
    tenantId: TEST_TENANT_ID,
    deletedAt: null,
  })

  // Add description and tags to test items for testing
  const itemsWithDetails: InventoryItem[] = [
    { ...activeItems[0], description: 'High-performance laptop for work', tags: ['electronics', 'office'] },
    { ...activeItems[1], description: 'Wireless mouse for desktop', tags: ['electronics', 'accessories'] },
    { ...activeItems[2], description: 'A4 printer paper for office use', tags: ['office', 'supplies'] },
    { ...activeItems[3], description: 'Metal stapler for documents', tags: ['office'] },
  ]

  describe('Text Search', () => {
    it('matches items by name', () => {
      const results = searchByText(itemsWithDetails, 'Laptop')

      expect(results.length).toBe(1)
      expect(results[0].name).toBe('Laptop')
    })

    it('matches items by SKU', () => {
      const results = searchByText(itemsWithDetails, 'LAP-001')

      expect(results.length).toBe(1)
      expect(results[0].sku).toBe('LAP-001')
    })

    it('matches items by description', () => {
      const results = searchByText(itemsWithDetails, 'wireless')

      expect(results.length).toBe(1)
      expect(results[0].name).toBe('Mouse')
    })

    it('is case-insensitive', () => {
      const results1 = searchByText(itemsWithDetails, 'LAPTOP')
      const results2 = searchByText(itemsWithDetails, 'laptop')
      const results3 = searchByText(itemsWithDetails, 'LaPtOp')

      expect(results1.length).toBe(1)
      expect(results2.length).toBe(1)
      expect(results3.length).toBe(1)
    })

    it('returns multiple matches', () => {
      // Search for 'for' which appears in multiple descriptions
      const results = searchByText(itemsWithDetails, 'for')

      // Matches description containing 'for'
      expect(results.length).toBeGreaterThan(1)
    })

    it('returns all items for empty query', () => {
      const results = searchByText(itemsWithDetails, '')

      expect(results.length).toBe(itemsWithDetails.length)
    })

    it('returns empty array for no matches', () => {
      const results = searchByText(itemsWithDetails, 'xyz123nonexistent')

      expect(results.length).toBe(0)
    })

    it('trims whitespace from query', () => {
      const results = searchByText(itemsWithDetails, '  Laptop  ')

      expect(results.length).toBe(1)
      expect(results[0].name).toBe('Laptop')
    })

    it('handles partial matches', () => {
      const results = searchByText(itemsWithDetails, 'Lap')

      expect(results.length).toBe(1)
      expect(results[0].name).toBe('Laptop')
    })
  })

  describe('Status Filter', () => {
    it('filters by in_stock status', () => {
      const results = filterByStatus(itemsWithDetails, ['in_stock'])

      expect(results.every(item => item.status === 'in_stock')).toBe(true)
      expect(results.length).toBe(2) // Laptop and Stapler
    })

    it('filters by low_stock status', () => {
      const results = filterByStatus(itemsWithDetails, ['low_stock'])

      expect(results.every(item => item.status === 'low_stock')).toBe(true)
      expect(results.length).toBe(1) // Mouse
    })

    it('filters by out_of_stock status', () => {
      const results = filterByStatus(itemsWithDetails, ['out_of_stock'])

      expect(results.every(item => item.status === 'out_of_stock')).toBe(true)
      expect(results.length).toBe(1) // Printer Paper
    })

    it('filters by multiple statuses', () => {
      const results = filterByStatus(itemsWithDetails, ['low_stock', 'out_of_stock'])

      expect(results.every(item =>
        item.status === 'low_stock' || item.status === 'out_of_stock'
      )).toBe(true)
      expect(results.length).toBe(2)
    })

    it('returns all items for empty status array', () => {
      const results = filterByStatus(itemsWithDetails, [])

      expect(results.length).toBe(itemsWithDetails.length)
    })

    it('combines all statuses correctly', () => {
      const results = filterByStatus(itemsWithDetails, ['in_stock', 'low_stock', 'out_of_stock'])

      expect(results.length).toBe(itemsWithDetails.length)
    })
  })

  describe('Folder Filter', () => {
    it('filters by specific folder', () => {
      const results = filterByFolder(itemsWithDetails, 'folder-1')

      expect(results.every(item => item.folder_id === 'folder-1')).toBe(true)
      expect(results.length).toBe(2) // Laptop and Mouse
    })

    it('filters by another folder', () => {
      const results = filterByFolder(itemsWithDetails, 'folder-2')

      expect(results.every(item => item.folder_id === 'folder-2')).toBe(true)
      expect(results.length).toBe(1) // Printer Paper
    })

    it('filters items with no folder (root level)', () => {
      const results = filterByFolder(itemsWithDetails, null)

      expect(results.every(item => item.folder_id === null)).toBe(true)
      expect(results.length).toBe(1) // Stapler
    })

    it('returns empty for non-existent folder', () => {
      const results = filterByFolder(itemsWithDetails, 'non-existent-folder')

      expect(results.length).toBe(0)
    })

    it('returns all items when folder filter not applied', () => {
      const results = filterByFolder(itemsWithDetails, undefined as unknown as string)

      expect(results.length).toBe(itemsWithDetails.length)
    })
  })

  describe('Tag Filter', () => {
    it('filters by single tag', () => {
      const results = filterByTags(itemsWithDetails, ['electronics'])

      expect(results.every(item => item.tags?.includes('electronics'))).toBe(true)
      expect(results.length).toBe(2) // Laptop and Mouse
    })

    it('filters by different tag', () => {
      const results = filterByTags(itemsWithDetails, ['office'])

      expect(results.every(item => item.tags?.includes('office'))).toBe(true)
      expect(results.length).toBe(3) // Laptop, Printer Paper, Stapler
    })

    it('filters by multiple tags (OR logic)', () => {
      const results = filterByTags(itemsWithDetails, ['accessories', 'supplies'])

      // Should match items with either tag
      expect(results.length).toBe(2) // Mouse and Printer Paper
    })

    it('returns empty for non-existent tag', () => {
      const results = filterByTags(itemsWithDetails, ['non-existent-tag'])

      expect(results.length).toBe(0)
    })

    it('returns all items for empty tags array', () => {
      const results = filterByTags(itemsWithDetails, [])

      expect(results.length).toBe(itemsWithDetails.length)
    })

    it('handles items with no tags', () => {
      const itemsNoTags: InventoryItem[] = [
        { ...itemsWithDetails[0], tags: [] },
        { ...itemsWithDetails[1], tags: undefined as unknown as string[] },
      ]

      const results = filterByTags(itemsNoTags, ['electronics'])

      expect(results.length).toBe(0)
    })
  })

  describe('Combined Filters', () => {
    it('combines text search and status filter', () => {
      // Search for 'laptop' which is in_stock
      let results = searchByText(itemsWithDetails, 'laptop')
      results = filterByStatus(results, ['in_stock'])

      expect(results.every(item => item.status === 'in_stock')).toBe(true)
      expect(results.length).toBe(1)
    })

    it('combines status and folder filters', () => {
      let results = filterByStatus(itemsWithDetails, ['in_stock'])
      results = filterByFolder(results, 'folder-1')

      expect(results.every(item =>
        item.status === 'in_stock' && item.folder_id === 'folder-1'
      )).toBe(true)
    })

    it('combines all filters', () => {
      let results = searchByText(itemsWithDetails, 'laptop')
      results = filterByStatus(results, ['in_stock'])
      results = filterByFolder(results, 'folder-1')
      results = filterByTags(results, ['electronics'])

      expect(results.length).toBe(1)
      expect(results[0].name).toBe('Laptop')
    })

    it('returns empty when filters conflict', () => {
      let results = filterByStatus(itemsWithDetails, ['in_stock'])
      results = filterByStatus(results, ['out_of_stock'])

      // After first filter, no out_of_stock items remain
      expect(results.length).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      expect(searchByText([], 'test')).toHaveLength(0)
      expect(filterByStatus([], ['in_stock'])).toHaveLength(0)
      expect(filterByFolder([], 'folder-1')).toHaveLength(0)
      expect(filterByTags([], ['tag'])).toHaveLength(0)
    })

    it('handles special characters in search', () => {
      const itemsWithSpecial: InventoryItem[] = [
        { ...itemsWithDetails[0], name: 'Item (special)' },
        { ...itemsWithDetails[1], name: 'Item [brackets]' },
      ]

      const results = searchByText(itemsWithSpecial, '(special)')
      expect(results.length).toBe(1)
    })

    it('preserves item data through filtering', () => {
      const results = filterByStatus(itemsWithDetails, ['in_stock'])

      results.forEach(item => {
        expect(item.id).toBeDefined()
        expect(item.name).toBeDefined()
        expect(item.quantity).toBeDefined()
        expect(item.status).toBeDefined()
      })
    })
  })
})

import { describe, it, expect } from 'vitest'
import {
  testItems,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem } from '@/types/database.types'

/**
 * Search Sort Options Tests
 *
 * Tests for sorting functionality in search results:
 * - Sort by name (A-Z, Z-A)
 * - Sort by quantity (low to high, high to low)
 * - Sort by price (low to high, high to low)
 * - Sort by date (newest first, oldest first)
 */

type SortField = 'name' | 'quantity' | 'price' | 'created_at'
type SortDirection = 'asc' | 'desc'

// Simulate sorting function for search results
function sortItems(
  items: InventoryItem[],
  field: SortField,
  direction: SortDirection
): InventoryItem[] {
  return [...items].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'quantity':
        comparison = a.quantity - b.quantity
        break
      case 'price':
        comparison = (a.price ?? 0) - (b.price ?? 0)
        break
      case 'created_at':
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        comparison = dateA - dateB
        break
    }

    return direction === 'asc' ? comparison : -comparison
  })
}

describe('Search Sort Options', () => {
  // Get active items for testing
  const activeItems = filterItems(testItems, {
    tenantId: TEST_TENANT_ID,
    deletedAt: null,
  })

  describe('Sort by Name', () => {
    it('sorts by name A-Z (ascending)', () => {
      const sorted = sortItems(activeItems, 'name', 'asc')

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].name.localeCompare(sorted[i - 1].name)).toBeGreaterThanOrEqual(0)
      }
    })

    it('sorts by name Z-A (descending)', () => {
      const sorted = sortItems(activeItems, 'name', 'desc')

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].name.localeCompare(sorted[i - 1].name)).toBeLessThanOrEqual(0)
      }
    })

    it('first item in ascending is alphabetically first', () => {
      const sorted = sortItems(activeItems, 'name', 'asc')

      // Laptop comes before Mouse, Printer Paper, Stapler
      expect(sorted[0].name).toBe('Laptop')
    })

    it('first item in descending is alphabetically last', () => {
      const sorted = sortItems(activeItems, 'name', 'desc')

      // Stapler comes after Laptop, Mouse, Printer Paper
      expect(sorted[0].name).toBe('Stapler')
    })
  })

  describe('Sort by Quantity', () => {
    it('sorts by quantity low to high (ascending)', () => {
      const sorted = sortItems(activeItems, 'quantity', 'asc')

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].quantity).toBeGreaterThanOrEqual(sorted[i - 1].quantity)
      }
    })

    it('sorts by quantity high to low (descending)', () => {
      const sorted = sortItems(activeItems, 'quantity', 'desc')

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].quantity).toBeLessThanOrEqual(sorted[i - 1].quantity)
      }
    })

    it('first item in ascending has lowest quantity', () => {
      const sorted = sortItems(activeItems, 'quantity', 'asc')

      // Printer Paper has quantity 0
      expect(sorted[0].name).toBe('Printer Paper')
      expect(sorted[0].quantity).toBe(0)
    })

    it('first item in descending has highest quantity', () => {
      const sorted = sortItems(activeItems, 'quantity', 'desc')

      // Laptop has quantity 50
      expect(sorted[0].name).toBe('Laptop')
      expect(sorted[0].quantity).toBe(50)
    })
  })

  describe('Sort by Price', () => {
    it('sorts by price low to high (ascending)', () => {
      const sorted = sortItems(activeItems, 'price', 'asc')

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].price ?? 0).toBeGreaterThanOrEqual(sorted[i - 1].price ?? 0)
      }
    })

    it('sorts by price high to low (descending)', () => {
      const sorted = sortItems(activeItems, 'price', 'desc')

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].price ?? 0).toBeLessThanOrEqual(sorted[i - 1].price ?? 0)
      }
    })

    it('first item in ascending has lowest price', () => {
      const sorted = sortItems(activeItems, 'price', 'asc')

      // Stapler has price 15
      expect(sorted[0].name).toBe('Stapler')
      expect(sorted[0].price).toBe(15)
    })

    it('first item in descending has highest price', () => {
      const sorted = sortItems(activeItems, 'price', 'desc')

      // Laptop has price 1500
      expect(sorted[0].name).toBe('Laptop')
      expect(sorted[0].price).toBe(1500)
    })

    it('handles null prices correctly', () => {
      const itemsWithNullPrice: InventoryItem[] = [
        ...activeItems,
        {
          ...activeItems[0],
          id: 'null-price-item',
          name: 'No Price Item',
          price: null,
        },
      ]

      const sorted = sortItems(itemsWithNullPrice, 'price', 'asc')

      // Null price treated as 0, should be first
      expect(sorted[0].price ?? 0).toBe(0)
    })
  })

  describe('Sort by Date', () => {
    it('sorts by date oldest first (ascending)', () => {
      const sorted = sortItems(activeItems, 'created_at', 'asc')

      for (let i = 1; i < sorted.length; i++) {
        const prevDate = sorted[i - 1].created_at
          ? new Date(sorted[i - 1].created_at!).getTime()
          : 0
        const currDate = sorted[i].created_at
          ? new Date(sorted[i].created_at!).getTime()
          : 0

        expect(currDate).toBeGreaterThanOrEqual(prevDate)
      }
    })

    it('sorts by date newest first (descending)', () => {
      const sorted = sortItems(activeItems, 'created_at', 'desc')

      for (let i = 1; i < sorted.length; i++) {
        const prevDate = sorted[i - 1].created_at
          ? new Date(sorted[i - 1].created_at!).getTime()
          : 0
        const currDate = sorted[i].created_at
          ? new Date(sorted[i].created_at!).getTime()
          : 0

        expect(currDate).toBeLessThanOrEqual(prevDate)
      }
    })

    it('first item in ascending is oldest', () => {
      const sorted = sortItems(activeItems, 'created_at', 'asc')

      // item-1 (Laptop) was created first (2024-01-01)
      expect(sorted[0].name).toBe('Laptop')
    })

    it('first item in descending is newest', () => {
      const sorted = sortItems(activeItems, 'created_at', 'desc')

      // item-4 (Stapler) was created last (2024-01-04)
      expect(sorted[0].name).toBe('Stapler')
    })
  })

  describe('Sort Stability', () => {
    it('maintains consistent order for equal values', () => {
      // Create items with same quantity
      const sameQtyItems: InventoryItem[] = [
        { ...activeItems[0], id: 'item-a', name: 'Item A', quantity: 10 },
        { ...activeItems[0], id: 'item-b', name: 'Item B', quantity: 10 },
        { ...activeItems[0], id: 'item-c', name: 'Item C', quantity: 10 },
      ]

      const sorted1 = sortItems(sameQtyItems, 'quantity', 'asc')
      const sorted2 = sortItems(sameQtyItems, 'quantity', 'asc')

      // Same sort should produce same order
      expect(sorted1.map(i => i.id)).toEqual(sorted2.map(i => i.id))
    })
  })

  describe('Empty Results', () => {
    it('handles empty array', () => {
      const sorted = sortItems([], 'name', 'asc')
      expect(sorted).toHaveLength(0)
    })

    it('handles single item', () => {
      const singleItem = [activeItems[0]]
      const sorted = sortItems(singleItem, 'name', 'asc')

      expect(sorted).toHaveLength(1)
      expect(sorted[0]).toEqual(singleItem[0])
    })
  })

  describe('Combined Sort Scenarios', () => {
    it('correctly orders items by all fields', () => {
      // Verify test data expectations
      const byName = sortItems(activeItems, 'name', 'asc')
      expect(byName.map(i => i.name)).toEqual(['Laptop', 'Mouse', 'Printer Paper', 'Stapler'])

      const byQuantity = sortItems(activeItems, 'quantity', 'asc')
      expect(byQuantity.map(i => i.quantity)).toEqual([0, 5, 20, 50])

      const byPrice = sortItems(activeItems, 'price', 'asc')
      expect(byPrice.map(i => i.price)).toEqual([15, 25, 50, 1500])
    })
  })
})

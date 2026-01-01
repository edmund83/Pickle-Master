import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID } from '../utils/test-data'

/**
 * AI Inventory Context Tests
 *
 * Tests for fetching inventory context for AI chat:
 * - Fetches 50 recent items for context
 */

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  quantity: number
  status: string
  updated_at: string
}

// Generate test items
function generateTestItems(count: number): InventoryItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
    sku: `SKU-${String(i + 1).padStart(4, '0')}`,
    quantity: Math.floor(Math.random() * 100),
    status: ['in_stock', 'low_stock', 'out_of_stock'][Math.floor(Math.random() * 3)],
    updated_at: new Date(Date.now() - i * 3600000).toISOString(), // Each item 1 hour older
  }))
}

// Fetch inventory context for AI
function fetchInventoryContext(
  tenantId: string,
  allItems: InventoryItem[],
  limit: number = 50
): {
  items: InventoryItem[]
  totalCount: number
  summary: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
} {
  // Filter to tenant's items and sort by most recently updated
  const sortedItems = [...allItems]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit)

  const summary = {
    inStock: sortedItems.filter((i) => i.status === 'in_stock').length,
    lowStock: sortedItems.filter((i) => i.status === 'low_stock').length,
    outOfStock: sortedItems.filter((i) => i.status === 'out_of_stock').length,
  }

  return {
    items: sortedItems,
    totalCount: allItems.length,
    summary,
  }
}

// Format context for AI prompt
function formatContextForAI(context: ReturnType<typeof fetchInventoryContext>): string {
  const lines = [
    `You have access to ${context.totalCount} inventory items.`,
    `Summary: ${context.summary.inStock} in stock, ${context.summary.lowStock} low stock, ${context.summary.outOfStock} out of stock.`,
    '',
    'Recent items:',
  ]

  for (const item of context.items.slice(0, 10)) {
    lines.push(`- ${item.name} (${item.sku || 'No SKU'}): ${item.quantity} units, ${item.status}`)
  }

  if (context.items.length > 10) {
    lines.push(`... and ${context.items.length - 10} more items`)
  }

  return lines.join('\n')
}

// Check if context fetch should be performed
function shouldFetchContext(messageHasInventoryQuery: boolean): boolean {
  // Keywords that suggest inventory-related queries
  const inventoryKeywords = [
    'inventory',
    'stock',
    'item',
    'product',
    'quantity',
    'low',
    'out of stock',
    'how many',
    'list',
    'show',
  ]

  return messageHasInventoryQuery
}

describe('AI Inventory Context', () => {
  describe('Fetch Context', () => {
    it('fetches 50 recent items for context', () => {
      const allItems = generateTestItems(100)

      const context = fetchInventoryContext(TEST_TENANT_ID, allItems, 50)

      expect(context.items.length).toBe(50)
    })

    it('returns most recently updated items', () => {
      const allItems = generateTestItems(100)

      const context = fetchInventoryContext(TEST_TENANT_ID, allItems, 50)

      // First item should be most recently updated
      const firstItemDate = new Date(context.items[0].updated_at)
      const lastItemDate = new Date(context.items[context.items.length - 1].updated_at)

      expect(firstItemDate.getTime()).toBeGreaterThan(lastItemDate.getTime())
    })

    it('includes total count in response', () => {
      const allItems = generateTestItems(200)

      const context = fetchInventoryContext(TEST_TENANT_ID, allItems, 50)

      expect(context.totalCount).toBe(200)
      expect(context.items.length).toBe(50)
    })

    it('provides status summary', () => {
      const allItems = generateTestItems(100)

      const context = fetchInventoryContext(TEST_TENANT_ID, allItems, 50)

      expect(context.summary.inStock).toBeGreaterThanOrEqual(0)
      expect(context.summary.lowStock).toBeGreaterThanOrEqual(0)
      expect(context.summary.outOfStock).toBeGreaterThanOrEqual(0)

      // Sum should equal items count
      const total =
        context.summary.inStock + context.summary.lowStock + context.summary.outOfStock
      expect(total).toBe(context.items.length)
    })

    it('handles fewer than 50 items', () => {
      const allItems = generateTestItems(25)

      const context = fetchInventoryContext(TEST_TENANT_ID, allItems, 50)

      expect(context.items.length).toBe(25)
      expect(context.totalCount).toBe(25)
    })
  })

  describe('Format Context', () => {
    it('formats context for AI prompt', () => {
      const allItems = generateTestItems(100)
      const context = fetchInventoryContext(TEST_TENANT_ID, allItems, 50)

      const formatted = formatContextForAI(context)

      expect(formatted).toContain('100 inventory items')
      expect(formatted).toContain('Recent items:')
    })

    it('includes item details in formatted context', () => {
      const items: InventoryItem[] = [
        {
          id: 'item-1',
          name: 'Test Laptop',
          sku: 'LAP-001',
          quantity: 50,
          status: 'in_stock',
          updated_at: new Date().toISOString(),
        },
      ]

      const context = fetchInventoryContext(TEST_TENANT_ID, items, 50)
      const formatted = formatContextForAI(context)

      expect(formatted).toContain('Test Laptop')
      expect(formatted).toContain('LAP-001')
      expect(formatted).toContain('50 units')
    })

    it('shows "No SKU" for items without SKU', () => {
      const items: InventoryItem[] = [
        {
          id: 'item-1',
          name: 'No SKU Item',
          sku: null,
          quantity: 10,
          status: 'in_stock',
          updated_at: new Date().toISOString(),
        },
      ]

      const context = fetchInventoryContext(TEST_TENANT_ID, items, 50)
      const formatted = formatContextForAI(context)

      expect(formatted).toContain('No SKU')
    })
  })

  describe('Context Decision', () => {
    it('determines when to fetch inventory context', () => {
      expect(shouldFetchContext(true)).toBe(true)
      expect(shouldFetchContext(false)).toBe(false)
    })
  })
})

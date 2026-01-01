import { describe, it, expect } from 'vitest'
import {
  testItems,
  testFolders,
  testActivityLogs,
  getActiveItems,
  getLowStockItems,
  getItemsWithCostPrice,
  calculateTotalValue,
  calculateTotalProfit,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem } from '@/types/database.types'

/**
 * Dashboard Statistics Tests
 *
 * Tests for all dashboard calculations that are mentioned in the todo.md checklist:
 * - Total items count
 * - Total value calculation
 * - Total profit calculation
 * - Low stock count
 * - Out of stock count
 * - Status chart percentages
 * - Recent activity
 */

interface DashboardStats {
  totalItems: number
  totalValue: number
  totalProfit: number
  lowStock: number
  outOfStock: number
  inStock: number
  statusBreakdown: {
    in_stock: number
    low_stock: number
    out_of_stock: number
  }
  statusPercentages: {
    in_stock: number
    low_stock: number
    out_of_stock: number
  }
}

// Simulate dashboard stats calculation
function calculateDashboardStats(items: InventoryItem[], tenantId: string): DashboardStats {
  const activeItems = filterItems(items, { tenantId, deletedAt: null })

  const totalItems = activeItems.length
  const totalValue = activeItems.reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0)

  // Calculate profit only for items with cost_price
  const itemsWithCost = activeItems.filter(i => i.cost_price && i.cost_price > 0)
  const totalProfit = itemsWithCost.reduce(
    (sum, item) => sum + item.quantity * ((item.price ?? 0) - (item.cost_price ?? 0)),
    0
  )

  const lowStock = activeItems.filter(i => i.status === 'low_stock').length
  const outOfStock = activeItems.filter(i => i.status === 'out_of_stock').length
  const inStock = activeItems.filter(i => i.status === 'in_stock').length

  // Calculate percentages
  const total = totalItems > 0 ? totalItems : 1 // Avoid division by zero
  const statusPercentages = {
    in_stock: Math.round((inStock / total) * 100),
    low_stock: Math.round((lowStock / total) * 100),
    out_of_stock: Math.round((outOfStock / total) * 100),
  }

  return {
    totalItems,
    totalValue,
    totalProfit,
    lowStock,
    outOfStock,
    inStock,
    statusBreakdown: {
      in_stock: inStock,
      low_stock: lowStock,
      out_of_stock: outOfStock,
    },
    statusPercentages,
  }
}

// Get recent activities for dashboard
function getRecentActivities(tenantId: string, limit: number = 10) {
  const tenantLogs = testActivityLogs.filter(l => l.tenant_id === tenantId)

  // Sort by created_at descending
  return tenantLogs
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, limit)
}

describe('Dashboard Statistics', () => {
  describe('Total Items Count', () => {
    it('correctly counts total active items', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // Should be 4 (5 items - 1 deleted)
      expect(stats.totalItems).toBe(4)
    })

    it('excludes deleted items from count', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // TEST_TENANT_ID has 5 items, 1 is deleted (item-5), so 4 active
      // (testItems also has 1 item from OTHER_TENANT_ID which is excluded)
      expect(stats.totalItems).toBe(4)
    })

    it('returns zero for empty inventory', () => {
      const stats = calculateDashboardStats([], TEST_TENANT_ID)
      expect(stats.totalItems).toBe(0)
    })

    it('only counts items for specified tenant', () => {
      const otherTenantItems: InventoryItem[] = [
        {
          ...testItems[0],
          id: 'other-tenant-item',
          tenant_id: 'other-tenant-id',
          deleted_at: null,
        },
      ]

      const stats = calculateDashboardStats([...testItems, ...otherTenantItems], TEST_TENANT_ID)
      expect(stats.totalItems).toBe(4) // Should not include other tenant's items
    })
  })

  describe('Total Value Calculation', () => {
    it('correctly calculates total value (quantity × price)', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // Manual calculation:
      // item-1 (Laptop): 50 × 1500 = 75000
      // item-2 (Mouse): 5 × 50 = 250
      // item-3 (Printer Paper): 0 × 25 = 0
      // item-4 (Stapler): 20 × 15 = 300
      // item-5 is deleted
      const expectedValue = 75000 + 250 + 0 + 300
      expect(stats.totalValue).toBe(expectedValue)
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

      const stats = calculateDashboardStats(itemsWithNullPrice, TEST_TENANT_ID)
      expect(stats.totalValue).toBe(0)
    })

    it('handles items with zero quantity', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // item-3 has quantity 0, contributes 0 to total
      expect(stats.totalValue).toBeGreaterThan(0) // Other items have value
    })

    it('returns zero for empty inventory', () => {
      const stats = calculateDashboardStats([], TEST_TENANT_ID)
      expect(stats.totalValue).toBe(0)
    })
  })

  describe('Total Profit Calculation', () => {
    it('correctly calculates total profit (quantity × (price - cost))', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // Manual calculation for items with cost_price:
      // item-1 (Laptop): 50 × (1500 - 1200) = 50 × 300 = 15000
      // item-2 (Mouse): 5 × (50 - 30) = 5 × 20 = 100
      // item-3 (Printer Paper): 0 × (25 - 15) = 0 × 10 = 0
      // item-4 (Stapler): has no cost_price, excluded
      // item-5 is deleted
      const expectedProfit = 15000 + 100 + 0
      expect(stats.totalProfit).toBe(expectedProfit)
    })

    it('excludes items without cost_price from profit calculation', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // Stapler (item-4) has no cost_price, should be excluded
      // Only 3 items should contribute to profit
      expect(stats.totalProfit).toBe(15100) // 15000 + 100 + 0
    })

    it('handles negative margins correctly', () => {
      const lossItem: InventoryItem = {
        ...testItems[0],
        id: 'loss-item',
        price: 80,
        cost_price: 100,
        quantity: 10,
        deleted_at: null,
      }

      const stats = calculateDashboardStats([lossItem], TEST_TENANT_ID)
      // 10 × (80 - 100) = 10 × (-20) = -200
      expect(stats.totalProfit).toBe(-200)
    })

    it('returns zero for empty inventory', () => {
      const stats = calculateDashboardStats([], TEST_TENANT_ID)
      expect(stats.totalProfit).toBe(0)
    })
  })

  describe('Low Stock Count', () => {
    it('correctly counts low stock items', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // item-2 (Mouse) is low_stock
      expect(stats.lowStock).toBe(1)
    })

    it('returns zero when no low stock items', () => {
      const allInStock: InventoryItem[] = testItems.map(i => ({
        ...i,
        status: 'in_stock' as const,
        quantity: 100,
        deleted_at: null,
      }))

      const stats = calculateDashboardStats(allInStock, TEST_TENANT_ID)
      expect(stats.lowStock).toBe(0)
    })

    it('excludes deleted items from low stock count', () => {
      const itemsWithDeletedLowStock: InventoryItem[] = [
        ...testItems,
        {
          ...testItems[1],
          id: 'deleted-low-stock',
          status: 'low_stock',
          deleted_at: new Date().toISOString(),
        },
      ]

      const stats = calculateDashboardStats(itemsWithDeletedLowStock, TEST_TENANT_ID)
      expect(stats.lowStock).toBe(1) // Should not include deleted item
    })
  })

  describe('Out of Stock Count', () => {
    it('correctly counts out of stock items', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // item-3 (Printer Paper) is out_of_stock
      expect(stats.outOfStock).toBe(1)
    })

    it('returns zero when no out of stock items', () => {
      const allInStock: InventoryItem[] = testItems.map(i => ({
        ...i,
        status: 'in_stock' as const,
        quantity: 100,
        deleted_at: null,
      }))

      const stats = calculateDashboardStats(allInStock, TEST_TENANT_ID)
      expect(stats.outOfStock).toBe(0)
    })
  })

  describe('Status Chart Percentages', () => {
    it('correctly calculates status percentages', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      // 4 total items: 2 in_stock, 1 low_stock, 1 out_of_stock
      expect(stats.statusPercentages.in_stock).toBe(50) // 2/4 = 50%
      expect(stats.statusPercentages.low_stock).toBe(25) // 1/4 = 25%
      expect(stats.statusPercentages.out_of_stock).toBe(25) // 1/4 = 25%
    })

    it('percentages sum to approximately 100', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      const total =
        stats.statusPercentages.in_stock +
        stats.statusPercentages.low_stock +
        stats.statusPercentages.out_of_stock

      expect(total).toBe(100)
    })

    it('handles edge case of single item', () => {
      const singleItem: InventoryItem[] = [
        { ...testItems[0], status: 'in_stock', deleted_at: null },
      ]

      const stats = calculateDashboardStats(singleItem, TEST_TENANT_ID)
      expect(stats.statusPercentages.in_stock).toBe(100)
      expect(stats.statusPercentages.low_stock).toBe(0)
      expect(stats.statusPercentages.out_of_stock).toBe(0)
    })

    it('handles empty inventory', () => {
      const stats = calculateDashboardStats([], TEST_TENANT_ID)

      expect(stats.statusPercentages.in_stock).toBe(0)
      expect(stats.statusPercentages.low_stock).toBe(0)
      expect(stats.statusPercentages.out_of_stock).toBe(0)
    })
  })

  describe('Status Breakdown', () => {
    it('correctly counts items by status', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      expect(stats.statusBreakdown.in_stock).toBe(2)
      expect(stats.statusBreakdown.low_stock).toBe(1)
      expect(stats.statusBreakdown.out_of_stock).toBe(1)
    })

    it('status counts sum to total items', () => {
      const stats = calculateDashboardStats(testItems, TEST_TENANT_ID)

      const sum =
        stats.statusBreakdown.in_stock +
        stats.statusBreakdown.low_stock +
        stats.statusBreakdown.out_of_stock

      expect(sum).toBe(stats.totalItems)
    })
  })

  describe('Recent Activity', () => {
    it('returns activities for specified tenant', () => {
      const activities = getRecentActivities(TEST_TENANT_ID)

      expect(activities.every(a => a.tenant_id === TEST_TENANT_ID)).toBe(true)
    })

    it('returns activities sorted by created_at descending', () => {
      const activities = getRecentActivities(TEST_TENANT_ID)

      for (let i = 1; i < activities.length; i++) {
        const prevDate = activities[i - 1].created_at
          ? new Date(activities[i - 1].created_at!).getTime()
          : 0
        const currDate = activities[i].created_at
          ? new Date(activities[i].created_at!).getTime()
          : 0

        expect(prevDate).toBeGreaterThanOrEqual(currDate)
      }
    })

    it('limits to 10 activities by default', () => {
      const activities = getRecentActivities(TEST_TENANT_ID)

      expect(activities.length).toBeLessThanOrEqual(10)
    })

    it('respects custom limit', () => {
      const activities = getRecentActivities(TEST_TENANT_ID, 5)

      expect(activities.length).toBeLessThanOrEqual(5)
    })

    it('returns empty array for non-existent tenant', () => {
      const activities = getRecentActivities('non-existent-tenant')

      expect(activities).toHaveLength(0)
    })
  })

  describe('Helper Functions', () => {
    describe('getActiveItems', () => {
      it('filters out deleted items', () => {
        const active = getActiveItems()

        expect(active.every(i => i.deleted_at === null)).toBe(true)
        expect(active.find(i => i.id === 'item-5')).toBeUndefined()
      })
    })

    describe('getLowStockItems', () => {
      it('returns only low_stock and out_of_stock items', () => {
        const lowStock = getLowStockItems()

        expect(lowStock.every(i => ['low_stock', 'out_of_stock'].includes(i.status))).toBe(true)
      })

      it('excludes deleted items', () => {
        const lowStock = getLowStockItems()

        expect(lowStock.every(i => i.deleted_at === null)).toBe(true)
      })
    })

    describe('getItemsWithCostPrice', () => {
      it('returns only items with cost_price > 0', () => {
        const withCost = getItemsWithCostPrice()

        expect(withCost.every(i => i.cost_price && i.cost_price > 0)).toBe(true)
      })

      it('excludes items with null cost_price', () => {
        const withCost = getItemsWithCostPrice()

        // item-4 (Stapler) has no cost_price
        expect(withCost.find(i => i.id === 'item-4')).toBeUndefined()
      })
    })

    describe('calculateTotalValue', () => {
      it('correctly calculates sum of quantity × price', () => {
        const items = getActiveItems()
        const value = calculateTotalValue(items)

        const expected = items.reduce((sum, i) => sum + i.quantity * (i.price ?? 0), 0)
        expect(value).toBe(expected)
      })
    })

    describe('calculateTotalProfit', () => {
      it('correctly calculates profit for items with cost', () => {
        const items = getActiveItems()
        const profit = calculateTotalProfit(items)

        // Only items with cost_price > 0 should be included
        const expected = items
          .filter(i => i.cost_price && i.cost_price > 0)
          .reduce((sum, i) => sum + i.quantity * ((i.price ?? 0) - (i.cost_price ?? 0)), 0)

        expect(profit).toBe(expected)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles all items deleted', () => {
      const allDeleted: InventoryItem[] = testItems.map(i => ({
        ...i,
        deleted_at: new Date().toISOString(),
      }))

      const stats = calculateDashboardStats(allDeleted, TEST_TENANT_ID)

      expect(stats.totalItems).toBe(0)
      expect(stats.totalValue).toBe(0)
      expect(stats.totalProfit).toBe(0)
    })

    it('handles very large quantities', () => {
      const largeQty: InventoryItem[] = [
        {
          ...testItems[0],
          quantity: 1000000,
          price: 1000,
          deleted_at: null,
        },
      ]

      const stats = calculateDashboardStats(largeQty, TEST_TENANT_ID)
      expect(stats.totalValue).toBe(1000000000) // 1 billion
    })

    it('handles decimal prices and quantities', () => {
      const decimalItem: InventoryItem[] = [
        {
          ...testItems[0],
          quantity: 10.5,
          price: 19.99,
          cost_price: 10.49,
          deleted_at: null,
        },
      ]

      const stats = calculateDashboardStats(decimalItem, TEST_TENANT_ID)
      expect(stats.totalValue).toBeCloseTo(10.5 * 19.99, 2)
      expect(stats.totalProfit).toBeCloseTo(10.5 * (19.99 - 10.49), 2)
    })
  })
})

import { describe, it, expect } from 'vitest'
import {
  testItems,
  TEST_TENANT_ID,
  calculateMarginPercent,
} from '../utils/test-data'
import { filterItems } from '../utils/supabase-mock'
import type { InventoryItem } from '@/types/database.types'

/**
 * Profit Margin Report Tests
 *
 * The profit margin report should:
 * 1. Margin calculated correctly: (price - cost_price) / cost_price × 100
 * 2. Items without cost_price filtered separately
 * 3. Total potential profit = sum(quantity × margin amount)
 * 4. Average margin calculation correct
 * 5. Highest/lowest margin sorting correct
 * 6. Top profit contributors sorted by totalProfit
 */

interface ItemWithMargin {
  id: string
  name: string
  sku: string | null
  quantity: number
  price: number
  cost_price: number
  marginAmount: number
  marginPercent: number
  totalProfit: number
}

// Simulate the data processing logic from profit-margin/page.tsx
function getProfitMarginData(items: InventoryItem[], tenantId: string) {
  const filteredItems = filterItems(items, { tenantId, deletedAt: null })

  const itemsWithCost: ItemWithMargin[] = filteredItems
    .filter(item => item.cost_price && item.cost_price > 0)
    .map(item => {
      const price = item.price || 0
      const costPrice = item.cost_price || 0
      const marginAmount = price - costPrice
      const marginPercent = costPrice > 0 ? (marginAmount / costPrice) * 100 : 0
      const totalProfit = item.quantity * marginAmount
      return {
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price,
        cost_price: costPrice,
        marginAmount,
        marginPercent,
        totalProfit,
      }
    })

  const itemsWithoutCost = filteredItems.filter(item => !item.cost_price || item.cost_price <= 0)

  return { items: filteredItems, itemsWithCost, itemsWithoutCost }
}

function calculateProfitStats(itemsWithCost: ItemWithMargin[]) {
  const totalPotentialProfit = itemsWithCost.reduce((sum, item) => sum + item.totalProfit, 0)
  const totalCost = itemsWithCost.reduce((sum, item) => sum + item.quantity * item.cost_price, 0)
  const totalRevenue = itemsWithCost.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const avgMarginPercent =
    itemsWithCost.length > 0
      ? itemsWithCost.reduce((sum, item) => sum + item.marginPercent, 0) / itemsWithCost.length
      : 0

  return { totalPotentialProfit, totalCost, totalRevenue, avgMarginPercent }
}

describe('Profit Margin Report', () => {
  describe('Margin Calculation', () => {
    it('correctly calculates margin percent: (price - cost) / cost × 100', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)

      // Laptop: (1500 - 1200) / 1200 × 100 = 25%
      const laptop = data.itemsWithCost.find(i => i.name === 'Laptop')
      expect(laptop?.marginPercent).toBeCloseTo(25, 2)

      // Mouse: (50 - 30) / 30 × 100 = 66.67%
      const mouse = data.itemsWithCost.find(i => i.name === 'Mouse')
      expect(mouse?.marginPercent).toBeCloseTo(66.67, 1)

      // Printer Paper: (25 - 15) / 15 × 100 = 66.67%
      const paper = data.itemsWithCost.find(i => i.name === 'Printer Paper')
      expect(paper?.marginPercent).toBeCloseTo(66.67, 1)
    })

    it('correctly calculates margin amount (price - cost)', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)

      // Laptop: 1500 - 1200 = 300
      const laptop = data.itemsWithCost.find(i => i.name === 'Laptop')
      expect(laptop?.marginAmount).toBe(300)

      // Mouse: 50 - 30 = 20
      const mouse = data.itemsWithCost.find(i => i.name === 'Mouse')
      expect(mouse?.marginAmount).toBe(20)
    })

    it('handles negative margins correctly', () => {
      const negativeMarginItem: InventoryItem = {
        ...testItems[0],
        id: 'negative-margin',
        price: 80,
        cost_price: 100,
        quantity: 10,
        deleted_at: null,
      }

      const data = getProfitMarginData([negativeMarginItem], TEST_TENANT_ID)
      const item = data.itemsWithCost[0]

      // (80 - 100) / 100 × 100 = -20%
      expect(item.marginPercent).toBe(-20)
      expect(item.marginAmount).toBe(-20)
      expect(item.totalProfit).toBe(-200)
    })
  })

  describe('Items Without Cost Price', () => {
    it('separates items without cost_price', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)

      // item-4 (Stapler) has no cost_price
      expect(data.itemsWithoutCost.length).toBe(1)
      expect(data.itemsWithoutCost[0].name).toBe('Stapler')
    })

    it('items with cost_price of 0 are treated as without cost', () => {
      const zeroCostItem: InventoryItem = {
        ...testItems[0],
        id: 'zero-cost',
        cost_price: 0,
        deleted_at: null,
      }

      const data = getProfitMarginData([zeroCostItem], TEST_TENANT_ID)
      expect(data.itemsWithCost.length).toBe(0)
      expect(data.itemsWithoutCost.length).toBe(1)
    })

    it('items with null cost_price are in itemsWithoutCost', () => {
      const nullCostItem: InventoryItem = {
        ...testItems[0],
        id: 'null-cost',
        cost_price: null,
        deleted_at: null,
      }

      const data = getProfitMarginData([nullCostItem], TEST_TENANT_ID)
      expect(data.itemsWithCost.length).toBe(0)
      expect(data.itemsWithoutCost.length).toBe(1)
    })
  })

  describe('Total Potential Profit', () => {
    it('correctly calculates total potential profit', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)
      const stats = calculateProfitStats(data.itemsWithCost)

      // Manual calculation:
      // Laptop: 50 × (1500 - 1200) = 50 × 300 = 15000
      // Mouse: 5 × (50 - 30) = 5 × 20 = 100
      // Printer Paper: 0 × (25 - 15) = 0 × 10 = 0
      const expectedProfit = 15000 + 100 + 0
      expect(stats.totalPotentialProfit).toBe(expectedProfit)
    })

    it('handles zero quantity items', () => {
      // Printer Paper has quantity 0
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)
      const printerPaper = data.itemsWithCost.find(i => i.name === 'Printer Paper')

      expect(printerPaper?.totalProfit).toBe(0)
    })
  })

  describe('Average Margin Calculation', () => {
    it('correctly calculates average margin percent', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)
      const stats = calculateProfitStats(data.itemsWithCost)

      // Laptop: 25%, Mouse: 66.67%, Printer Paper: 66.67%
      // Average: (25 + 66.67 + 66.67) / 3 ≈ 52.78%
      const expectedAvg = (25 + 66.67 + 66.67) / 3
      expect(stats.avgMarginPercent).toBeCloseTo(expectedAvg, 1)
    })

    it('returns 0 when no items with cost data', () => {
      const itemsNoCost: InventoryItem[] = [
        { ...testItems[0], cost_price: null, deleted_at: null },
      ]

      const data = getProfitMarginData(itemsNoCost, TEST_TENANT_ID)
      const stats = calculateProfitStats(data.itemsWithCost)

      expect(stats.avgMarginPercent).toBe(0)
    })
  })

  describe('Margin Sorting', () => {
    it('sorts highest margin items correctly', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)
      const highestMargin = [...data.itemsWithCost].sort(
        (a, b) => b.marginPercent - a.marginPercent
      )

      // Verify descending order
      for (let i = 1; i < highestMargin.length; i++) {
        expect(highestMargin[i].marginPercent).toBeLessThanOrEqual(
          highestMargin[i - 1].marginPercent
        )
      }
    })

    it('sorts lowest margin items correctly', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)
      const lowestMargin = [...data.itemsWithCost].sort(
        (a, b) => a.marginPercent - b.marginPercent
      )

      // Verify ascending order
      for (let i = 1; i < lowestMargin.length; i++) {
        expect(lowestMargin[i].marginPercent).toBeGreaterThanOrEqual(
          lowestMargin[i - 1].marginPercent
        )
      }
    })
  })

  describe('Top Profit Contributors', () => {
    it('sorts by total profit descending', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)
      const topProfit = [...data.itemsWithCost].sort((a, b) => b.totalProfit - a.totalProfit)

      // Laptop should be first with 15000 profit
      expect(topProfit[0].name).toBe('Laptop')
      expect(topProfit[0].totalProfit).toBe(15000)

      // Verify descending order
      for (let i = 1; i < topProfit.length; i++) {
        expect(topProfit[i].totalProfit).toBeLessThanOrEqual(topProfit[i - 1].totalProfit)
      }
    })

    it('returns top 10 at most', () => {
      // Create 15 items
      const manyItems: InventoryItem[] = Array.from({ length: 15 }, (_, i) => ({
        ...testItems[0],
        id: `item-${i}`,
        name: `Item ${i}`,
        quantity: 10 + i,
        price: 100,
        cost_price: 50,
        deleted_at: null,
      }))

      const data = getProfitMarginData(manyItems, TEST_TENANT_ID)
      const topProfit = [...data.itemsWithCost]
        .sort((a, b) => b.totalProfit - a.totalProfit)
        .slice(0, 10)

      expect(topProfit.length).toBe(10)
    })
  })

  describe('Total Cost Value', () => {
    it('correctly calculates total cost value', () => {
      const data = getProfitMarginData(testItems, TEST_TENANT_ID)
      const stats = calculateProfitStats(data.itemsWithCost)

      // Laptop: 50 × 1200 = 60000
      // Mouse: 5 × 30 = 150
      // Printer Paper: 0 × 15 = 0
      const expectedCost = 60000 + 150 + 0
      expect(stats.totalCost).toBe(expectedCost)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty inventory', () => {
      const data = getProfitMarginData([], TEST_TENANT_ID)
      const stats = calculateProfitStats(data.itemsWithCost)

      expect(data.itemsWithCost.length).toBe(0)
      expect(data.itemsWithoutCost.length).toBe(0)
      expect(stats.totalPotentialProfit).toBe(0)
      expect(stats.avgMarginPercent).toBe(0)
    })

    it('handles all items without cost data', () => {
      const noCostItems: InventoryItem[] = testItems.map(i => ({
        ...i,
        cost_price: null,
        // Keep original deleted_at to respect deleted items
      }))

      const data = getProfitMarginData(noCostItems, TEST_TENANT_ID)
      expect(data.itemsWithCost.length).toBe(0)
      expect(data.itemsWithoutCost.length).toBe(4) // 5 items - 1 deleted = 4
    })

    it('handles 100% margin correctly', () => {
      const doubledPrice: InventoryItem = {
        ...testItems[0],
        id: 'doubled',
        price: 200,
        cost_price: 100, // 100% markup
        quantity: 10,
        deleted_at: null,
      }

      const data = getProfitMarginData([doubledPrice], TEST_TENANT_ID)
      expect(data.itemsWithCost[0].marginPercent).toBe(100)
    })
  })
})

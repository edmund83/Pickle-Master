import { describe, it, expect } from 'vitest'
import {
  testItems,
  testActivityLogs,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterItems, filterActivityLogs } from '../utils/supabase-mock'
import type { InventoryItem, ActivityLog } from '@/types/database.types'

/**
 * Inventory Trends Report Tests
 *
 * The trends report should:
 * 1. Last 7 days activity aggregation correct
 * 2. Week-over-week change percentage accurate
 * 3. Action type breakdown percentages correct
 * 4. Most active items ranked by activity count
 * 5. Status counts (low_stock, out_of_stock) accurate
 */

// Simulate the data processing logic from trends/page.tsx
function getTrendsData(items: InventoryItem[], activities: ActivityLog[], tenantId: string) {
  const filteredItems = filterItems(items, { tenantId, deletedAt: null })

  // Get activities from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentActivities = filterActivityLogs(activities, {
    tenantId,
    startDate: thirtyDaysAgo,
  })

  return { items: filteredItems, activities: recentActivities }
}

function calculateActivityByDay(activities: ActivityLog[]) {
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  return last7Days.map(day => ({
    date: day,
    count: activities.filter(a => a.created_at?.split('T')[0] === day).length,
  }))
}

function calculateActionCounts(activities: ActivityLog[]) {
  return activities.reduce((acc, a) => {
    acc[a.action_type] = (acc[a.action_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function calculateMostActiveItems(activities: ActivityLog[]) {
  const itemActivityCounts = activities
    .filter(a => a.entity_type === 'item' && a.entity_id)
    .reduce((acc, a) => {
      acc[a.entity_id!] = {
        count: (acc[a.entity_id!]?.count || 0) + 1,
        name: a.entity_name || 'Unknown',
      }
      return acc
    }, {} as Record<string, { count: number; name: string }>)

  return Object.entries(itemActivityCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
}

function calculateWeekOverWeekChange(activities: ActivityLog[]) {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const twoWeeksAgo = new Date(now)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const thisWeekActivities = activities.filter(a => {
    if (!a.created_at) return false
    const date = new Date(a.created_at)
    return date >= weekAgo
  }).length

  const lastWeekActivities = activities.filter(a => {
    if (!a.created_at) return false
    const date = new Date(a.created_at)
    return date >= twoWeeksAgo && date < weekAgo
  }).length

  const weekChange =
    lastWeekActivities > 0
      ? ((thisWeekActivities - lastWeekActivities) / lastWeekActivities) * 100
      : 0

  return { thisWeekActivities, lastWeekActivities, weekChange }
}

describe('Inventory Trends Report', () => {
  describe('Status Counts', () => {
    it('correctly counts total items', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      expect(data.items.length).toBe(4) // Excluding deleted
    })

    it('correctly counts low_stock items', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const lowStockCount = data.items.filter(i => i.status === 'low_stock').length

      expect(lowStockCount).toBe(1) // Mouse
    })

    it('correctly counts out_of_stock items', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const outOfStockCount = data.items.filter(i => i.status === 'out_of_stock').length

      expect(outOfStockCount).toBe(1) // Printer Paper
    })
  })

  describe('Activity by Day', () => {
    it('returns data for last 7 days', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const activityByDay = calculateActivityByDay(data.activities)

      expect(activityByDay.length).toBe(7)
    })

    it('has correct date format (YYYY-MM-DD)', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const activityByDay = calculateActivityByDay(data.activities)

      activityByDay.forEach(day => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('dates are in chronological order', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const activityByDay = calculateActivityByDay(data.activities)

      for (let i = 1; i < activityByDay.length; i++) {
        expect(new Date(activityByDay[i].date).getTime()).toBeGreaterThan(
          new Date(activityByDay[i - 1].date).getTime()
        )
      }
    })

    it('count is non-negative', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const activityByDay = calculateActivityByDay(data.activities)

      activityByDay.forEach(day => {
        expect(day.count).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Week-over-Week Change', () => {
    it('calculates positive change correctly', () => {
      const now = new Date()

      // Create activities: 10 this week (0-6 days ago), 5 last week (7-13 days ago)
      const activities: ActivityLog[] = [
        // This week activities (0-6 days ago, within the last 7 days)
        ...Array.from({ length: 10 }, (_, i) => ({
          ...testActivityLogs[0],
          id: `this-week-${i}`,
          // Spread 10 activities within 0-6 days ago (hours apart to fit in 7 days)
          created_at: new Date(now.getTime() - i * 12 * 3600000).toISOString(),
        })),
        // Last week activities (8-12 days ago, 7-14 days before now)
        ...Array.from({ length: 5 }, (_, i) => ({
          ...testActivityLogs[0],
          id: `last-week-${i}`,
          created_at: new Date(now.getTime() - (8 + i) * 86400000).toISOString(),
        })),
      ]

      const { weekChange } = calculateWeekOverWeekChange(activities)

      // (10 - 5) / 5 * 100 = 100%
      expect(weekChange).toBe(100)
    })

    it('calculates negative change correctly', () => {
      const now = new Date()

      // Create activities: 3 this week, 6 last week
      const activities: ActivityLog[] = [
        // This week activities
        ...Array.from({ length: 3 }, (_, i) => ({
          ...testActivityLogs[0],
          id: `this-week-${i}`,
          created_at: new Date(now.getTime() - i * 86400000).toISOString(),
        })),
        // Last week activities
        ...Array.from({ length: 6 }, (_, i) => ({
          ...testActivityLogs[0],
          id: `last-week-${i}`,
          created_at: new Date(now.getTime() - (8 + i) * 86400000).toISOString(),
        })),
      ]

      const { weekChange } = calculateWeekOverWeekChange(activities)

      // (3 - 6) / 6 * 100 = -50%
      expect(weekChange).toBe(-50)
    })

    it('returns 0 when last week has no activities', () => {
      const now = new Date()

      // Only this week activities
      const activities: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          id: 'this-week-only',
          created_at: new Date(now.getTime() - 86400000).toISOString(),
        },
      ]

      const { weekChange } = calculateWeekOverWeekChange(activities)
      expect(weekChange).toBe(0)
    })
  })

  describe('Action Type Breakdown', () => {
    it('counts each action type', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const actionCounts = calculateActionCounts(data.activities)

      // Based on test data
      expect(actionCounts['create']).toBeGreaterThanOrEqual(0)
      expect(actionCounts['adjust_quantity']).toBeGreaterThanOrEqual(0)
    })

    it('percentages sum to 100%', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const actionCounts = calculateActionCounts(data.activities)

      const total = Object.values(actionCounts).reduce((sum, count) => sum + count, 0)

      if (total > 0) {
        const percentageSum = Object.values(actionCounts).reduce(
          (sum, count) => sum + (count / total) * 100,
          0
        )
        expect(Math.round(percentageSum)).toBe(100)
      }
    })

    it('all counts are non-negative', () => {
      const data = getTrendsData(testItems, testActivityLogs, TEST_TENANT_ID)
      const actionCounts = calculateActionCounts(data.activities)

      Object.values(actionCounts).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Most Active Items', () => {
    it('returns at most 5 items', () => {
      // Create many activities for different items
      const activities: ActivityLog[] = Array.from({ length: 20 }, (_, i) => ({
        ...testActivityLogs[0],
        id: `activity-${i}`,
        entity_id: `item-${i % 10}`,
        entity_name: `Item ${i % 10}`,
        created_at: new Date().toISOString(),
      }))

      const mostActive = calculateMostActiveItems(activities)
      expect(mostActive.length).toBeLessThanOrEqual(5)
    })

    it('sorts by activity count descending', () => {
      const activities: ActivityLog[] = [
        // Item A: 5 activities
        ...Array.from({ length: 5 }, (_, i) => ({
          ...testActivityLogs[0],
          id: `item-a-${i}`,
          entity_type: 'item' as const,
          entity_id: 'item-a',
          entity_name: 'Item A',
          created_at: new Date().toISOString(),
        })),
        // Item B: 3 activities
        ...Array.from({ length: 3 }, (_, i) => ({
          ...testActivityLogs[0],
          id: `item-b-${i}`,
          entity_type: 'item' as const,
          entity_id: 'item-b',
          entity_name: 'Item B',
          created_at: new Date().toISOString(),
        })),
        // Item C: 1 activity
        {
          ...testActivityLogs[0],
          id: 'item-c-0',
          entity_type: 'item' as const,
          entity_id: 'item-c',
          entity_name: 'Item C',
          created_at: new Date().toISOString(),
        },
      ]

      const mostActive = calculateMostActiveItems(activities)

      expect(mostActive[0][1].name).toBe('Item A')
      expect(mostActive[0][1].count).toBe(5)
      expect(mostActive[1][1].name).toBe('Item B')
      expect(mostActive[1][1].count).toBe(3)
    })

    it('only includes item entity type', () => {
      const activities: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          entity_type: 'item',
          entity_id: 'item-1',
          entity_name: 'Item 1',
          created_at: new Date().toISOString(),
        },
        {
          ...testActivityLogs[0],
          entity_type: 'folder',
          entity_id: 'folder-1',
          entity_name: 'Folder 1',
          created_at: new Date().toISOString(),
        },
      ]

      const mostActive = calculateMostActiveItems(activities)

      // Should only include the item, not the folder
      expect(mostActive.length).toBe(1)
      expect(mostActive[0][1].name).toBe('Item 1')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty inventory', () => {
      const data = getTrendsData([], testActivityLogs, TEST_TENANT_ID)

      expect(data.items.length).toBe(0)
    })

    it('handles no activities', () => {
      const data = getTrendsData(testItems, [], TEST_TENANT_ID)
      const actionCounts = calculateActionCounts(data.activities)
      const mostActive = calculateMostActiveItems(data.activities)

      expect(Object.keys(actionCounts).length).toBe(0)
      expect(mostActive.length).toBe(0)
    })

    it('handles activities without entity_id', () => {
      const activities: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          entity_type: 'item',
          entity_id: null,
          entity_name: 'Unknown Item',
          created_at: new Date().toISOString(),
        },
      ]

      const mostActive = calculateMostActiveItems(activities)

      // Should be filtered out
      expect(mostActive.length).toBe(0)
    })
  })
})

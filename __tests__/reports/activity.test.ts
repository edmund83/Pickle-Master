import { describe, it, expect } from 'vitest'
import {
  testActivityLogs,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterActivityLogs } from '../utils/supabase-mock'
import type { ActivityLog } from '@/types/database.types'

/**
 * Activity Log Report Tests
 *
 * The activity log report should:
 * 1. Filter by date range correctly
 * 2. Filter by action_type correctly
 * 3. Filter by entity_type correctly
 * 4. Order by created_at descending
 * 5. CSV export contains correct data
 * 6. Empty state when no activities
 */

// Simulate the filtering logic from activity/page.tsx
function getActivityLogs(
  logs: ActivityLog[],
  tenantId: string,
  filter: {
    actionType?: string
    entityType?: string
    dateRange: number // days
  }
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - filter.dateRange)

  let filtered = filterActivityLogs(logs, {
    tenantId,
    startDate,
    actionType: filter.actionType || undefined,
    entityType: filter.entityType || undefined,
  })

  // Sort by created_at descending
  filtered = filtered.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })

  return filtered.slice(0, 200) // Limit to 200
}

function exportToCSV(activities: ActivityLog[]): string {
  const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity Name', 'Details']
  const rows = activities.map(a => [
    a.created_at ? new Date(a.created_at).toLocaleString() : '',
    a.user_name || 'System',
    a.action_type,
    a.entity_type,
    a.entity_name || '',
    a.quantity_delta ? `Qty: ${a.quantity_delta > 0 ? '+' : ''}${a.quantity_delta}` : '',
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

describe('Activity Log Report', () => {
  describe('Date Range Filtering', () => {
    it('filters activities within last 7 days', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 7,
      })

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      activities.forEach(activity => {
        if (activity.created_at) {
          const activityDate = new Date(activity.created_at)
          expect(activityDate.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime())
        }
      })
    })

    it('filters activities within last 30 days', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
      })

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      activities.forEach(activity => {
        if (activity.created_at) {
          const activityDate = new Date(activity.created_at)
          expect(activityDate.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime())
        }
      })
    })

    it('returns more results with longer date range', () => {
      const activities7Days = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 7,
      })

      const activities30Days = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
      })

      expect(activities30Days.length).toBeGreaterThanOrEqual(activities7Days.length)
    })
  })

  describe('Action Type Filtering', () => {
    it('filters by create action', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
        actionType: 'create',
      })

      expect(activities.every(a => a.action_type === 'create')).toBe(true)
    })

    it('filters by adjust_quantity action', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
        actionType: 'adjust_quantity',
      })

      expect(activities.every(a => a.action_type === 'adjust_quantity')).toBe(true)
      // These should have quantity_delta
      expect(activities.every(a => a.quantity_delta !== null)).toBe(true)
    })

    it('filters by move action', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
        actionType: 'move',
      })

      expect(activities.every(a => a.action_type === 'move')).toBe(true)
      // Move actions should have folder info
      expect(activities.every(a => a.from_folder_name || a.to_folder_name)).toBe(true)
    })
  })

  describe('Entity Type Filtering', () => {
    it('filters by item entity type', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
        entityType: 'item',
      })

      expect(activities.every(a => a.entity_type === 'item')).toBe(true)
    })

    it('filters by folder entity type', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
        entityType: 'folder',
      })

      expect(activities.every(a => a.entity_type === 'folder')).toBe(true)
    })
  })

  describe('Sorting', () => {
    it('orders by created_at descending (newest first)', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
      })

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
  })

  describe('Combined Filters', () => {
    it('combines action and entity type filters', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
        actionType: 'create',
        entityType: 'item',
      })

      activities.forEach(a => {
        expect(a.action_type).toBe('create')
        expect(a.entity_type).toBe('item')
      })
    })
  })

  describe('CSV Export', () => {
    it('generates valid CSV with headers', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
      })

      const csv = exportToCSV(activities)
      const lines = csv.split('\n')

      // First line should be headers
      expect(lines[0]).toBe('Date,User,Action,Entity Type,Entity Name,Details')
    })

    it('includes all activities in CSV', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
      })

      const csv = exportToCSV(activities)
      const lines = csv.split('\n')

      // Header + data rows
      expect(lines.length).toBe(activities.length + 1)
    })

    it('formats quantity delta correctly in CSV', () => {
      const adjustActivity: ActivityLog = {
        ...testActivityLogs[0],
        id: 'adj-test',
        action_type: 'adjust_quantity',
        quantity_delta: 5,
        created_at: new Date().toISOString(),
      }

      const csv = exportToCSV([adjustActivity])
      expect(csv).toContain('Qty: +5')
    })

    it('handles negative quantity delta', () => {
      const adjustActivity: ActivityLog = {
        ...testActivityLogs[0],
        id: 'adj-test-neg',
        action_type: 'adjust_quantity',
        quantity_delta: -3,
        created_at: new Date().toISOString(),
      }

      const csv = exportToCSV([adjustActivity])
      expect(csv).toContain('Qty: -3')
    })

    it('handles null user_name as System', () => {
      const systemActivity: ActivityLog = {
        ...testActivityLogs[0],
        user_name: null,
        created_at: new Date().toISOString(),
      }

      const csv = exportToCSV([systemActivity])
      expect(csv).toContain(',System,')
    })
  })

  describe('Limit', () => {
    it('limits results to 200 activities', () => {
      // Create 250 activities
      const manyActivities: ActivityLog[] = Array.from({ length: 250 }, (_, i) => ({
        ...testActivityLogs[0],
        id: `activity-${i}`,
        created_at: new Date().toISOString(),
      }))

      const activities = getActivityLogs(manyActivities, TEST_TENANT_ID, {
        dateRange: 30,
      })

      expect(activities.length).toBe(200)
    })
  })

  describe('Empty State', () => {
    it('returns empty array when no activities match', () => {
      const activities = getActivityLogs([], TEST_TENANT_ID, {
        dateRange: 30,
      })

      expect(activities).toHaveLength(0)
    })

    it('returns empty when no activities in date range', () => {
      // All test activities are within 30 days, but filter for 0 days
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 0,
      })

      expect(activities).toHaveLength(0)
    })
  })

  describe('Data Integrity', () => {
    it('preserves all activity fields', () => {
      const activities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
      })

      activities.forEach(activity => {
        expect(activity.id).toBeDefined()
        expect(activity.tenant_id).toBe(TEST_TENANT_ID)
        expect(activity.action_type).toBeDefined()
        expect(activity.entity_type).toBeDefined()
      })
    })

    it('includes folder movement details', () => {
      const moveActivities = getActivityLogs(testActivityLogs, TEST_TENANT_ID, {
        dateRange: 30,
        actionType: 'move',
      })

      moveActivities.forEach(activity => {
        expect(activity.from_folder_name || activity.to_folder_name).toBeTruthy()
      })
    })
  })
})

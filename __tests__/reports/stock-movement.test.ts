import { describe, it, expect } from 'vitest'
import {
  testActivityLogs,
  TEST_TENANT_ID,
} from '../utils/test-data'
import { filterActivityLogs } from '../utils/supabase-mock'
import type { ActivityLog } from '@/types/database.types'

/**
 * Stock Movement Report Tests
 *
 * The stock movement report should:
 * 1. Filter to only 'move' and 'adjust_quantity' actions
 * 2. Total moves count correct
 * 3. Total adjustments count correct
 * 4. Net quantity change calculation accurate
 * 5. Date range filtering works
 * 6. CSV export data accurate
 */

// Simulate the data processing logic from stock-movement/page.tsx
function getStockMovements(
  logs: ActivityLog[],
  tenantId: string,
  dateRange: number // days
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - dateRange)

  let filtered = filterActivityLogs(logs, {
    tenantId,
    startDate,
    actionTypes: ['move', 'adjust_quantity'],
  })

  // Sort by created_at descending
  filtered = filtered.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })

  return filtered.slice(0, 200)
}

function calculateMovementStats(movements: ActivityLog[]) {
  const totalMoves = movements.filter(m => m.action_type === 'move').length
  const totalAdjustments = movements.filter(m => m.action_type === 'adjust_quantity').length
  const netQuantityChange = movements.reduce((sum, m) => sum + (m.quantity_delta || 0), 0)

  return { totalMoves, totalAdjustments, netQuantityChange }
}

function exportToCSV(movements: ActivityLog[]): string {
  const headers = ['Date', 'User', 'Item', 'Action', 'From', 'To', 'Quantity Change']
  const rows = movements.map(m => [
    m.created_at ? new Date(m.created_at).toLocaleString() : '',
    m.user_name || 'System',
    m.entity_name || '',
    m.action_type,
    m.from_folder_name || '-',
    m.to_folder_name || '-',
    m.quantity_delta ? `${m.quantity_delta > 0 ? '+' : ''}${m.quantity_delta}` : '-',
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

describe('Stock Movement Report', () => {
  describe('Action Type Filtering', () => {
    it('only includes move and adjust_quantity actions', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)

      movements.forEach(m => {
        expect(['move', 'adjust_quantity']).toContain(m.action_type)
      })
    })

    it('excludes create actions', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const createActions = movements.filter(m => m.action_type === 'create')

      expect(createActions.length).toBe(0)
    })

    it('excludes update actions', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const updateActions = movements.filter(m => m.action_type === 'update')

      expect(updateActions.length).toBe(0)
    })

    it('excludes delete actions', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const deleteActions = movements.filter(m => m.action_type === 'delete')

      expect(deleteActions.length).toBe(0)
    })
  })

  describe('Total Moves Count', () => {
    it('correctly counts move actions', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const stats = calculateMovementStats(movements)

      // Based on test data, log-3 is a move action
      const expectedMoves = testActivityLogs.filter(
        l => l.action_type === 'move' && l.tenant_id === TEST_TENANT_ID
      ).length

      expect(stats.totalMoves).toBe(expectedMoves)
    })

    it('move actions have folder information', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const moveActions = movements.filter(m => m.action_type === 'move')

      moveActions.forEach(m => {
        // Move actions should have at least one of from_folder_name or to_folder_name
        expect(m.from_folder_name || m.to_folder_name).toBeTruthy()
      })
    })
  })

  describe('Total Adjustments Count', () => {
    it('correctly counts adjust_quantity actions', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const stats = calculateMovementStats(movements)

      // Based on test data, log-2 and log-5 are adjust_quantity actions
      const expectedAdjustments = testActivityLogs.filter(
        l => l.action_type === 'adjust_quantity' && l.tenant_id === TEST_TENANT_ID
      ).length

      expect(stats.totalAdjustments).toBe(expectedAdjustments)
    })

    it('adjust_quantity actions have quantity_delta', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const adjustActions = movements.filter(m => m.action_type === 'adjust_quantity')

      adjustActions.forEach(m => {
        expect(m.quantity_delta).not.toBeNull()
      })
    })
  })

  describe('Net Quantity Change', () => {
    it('correctly calculates net quantity change', () => {
      const now = new Date()
      const movements: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          id: 'adj-1',
          action_type: 'adjust_quantity',
          quantity_delta: 10,
          created_at: now.toISOString(),
        },
        {
          ...testActivityLogs[0],
          id: 'adj-2',
          action_type: 'adjust_quantity',
          quantity_delta: -3,
          created_at: now.toISOString(),
        },
        {
          ...testActivityLogs[0],
          id: 'move-1',
          action_type: 'move',
          quantity_delta: null, // Moves don't have quantity_delta
          created_at: now.toISOString(),
        },
      ]

      const stats = calculateMovementStats(movements)
      expect(stats.netQuantityChange).toBe(7) // 10 + (-3) + 0
    })

    it('handles all positive adjustments', () => {
      const now = new Date()
      const movements: ActivityLog[] = Array.from({ length: 5 }, (_, i) => ({
        ...testActivityLogs[0],
        id: `adj-${i}`,
        action_type: 'adjust_quantity' as const,
        quantity_delta: 10,
        created_at: now.toISOString(),
      }))

      const stats = calculateMovementStats(movements)
      expect(stats.netQuantityChange).toBe(50)
    })

    it('handles all negative adjustments', () => {
      const now = new Date()
      const movements: ActivityLog[] = Array.from({ length: 5 }, (_, i) => ({
        ...testActivityLogs[0],
        id: `adj-${i}`,
        action_type: 'adjust_quantity' as const,
        quantity_delta: -10,
        created_at: now.toISOString(),
      }))

      const stats = calculateMovementStats(movements)
      expect(stats.netQuantityChange).toBe(-50)
    })

    it('returns 0 when only moves (no quantity changes)', () => {
      const now = new Date()
      const movements: ActivityLog[] = Array.from({ length: 5 }, (_, i) => ({
        ...testActivityLogs[0],
        id: `move-${i}`,
        action_type: 'move' as const,
        quantity_delta: null,
        created_at: now.toISOString(),
      }))

      const stats = calculateMovementStats(movements)
      expect(stats.netQuantityChange).toBe(0)
    })
  })

  describe('Date Range Filtering', () => {
    it('filters movements within last 7 days', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 7)

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      movements.forEach(m => {
        if (m.created_at) {
          const movementDate = new Date(m.created_at)
          expect(movementDate.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime())
        }
      })
    })

    it('filters movements within last 30 days', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      movements.forEach(m => {
        if (m.created_at) {
          const movementDate = new Date(m.created_at)
          expect(movementDate.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime())
        }
      })
    })

    it('filters movements within last 90 days', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 90)

      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      movements.forEach(m => {
        if (m.created_at) {
          const movementDate = new Date(m.created_at)
          expect(movementDate.getTime()).toBeGreaterThanOrEqual(ninetyDaysAgo.getTime())
        }
      })
    })
  })

  describe('Sorting', () => {
    it('orders by created_at descending (newest first)', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)

      for (let i = 1; i < movements.length; i++) {
        const prevDate = movements[i - 1].created_at
          ? new Date(movements[i - 1].created_at!).getTime()
          : 0
        const currDate = movements[i].created_at
          ? new Date(movements[i].created_at!).getTime()
          : 0

        expect(prevDate).toBeGreaterThanOrEqual(currDate)
      }
    })
  })

  describe('CSV Export', () => {
    it('generates valid CSV with correct headers', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const csv = exportToCSV(movements)
      const lines = csv.split('\n')

      expect(lines[0]).toBe('Date,User,Item,Action,From,To,Quantity Change')
    })

    it('includes all movements in CSV', () => {
      const movements = getStockMovements(testActivityLogs, TEST_TENANT_ID, 30)
      const csv = exportToCSV(movements)
      const lines = csv.split('\n')

      expect(lines.length).toBe(movements.length + 1) // Header + data
    })

    it('formats positive quantity change with +', () => {
      const movements: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          action_type: 'adjust_quantity',
          quantity_delta: 5,
          created_at: new Date().toISOString(),
        },
      ]

      const csv = exportToCSV(movements)
      expect(csv).toContain('+5')
    })

    it('formats negative quantity change without +', () => {
      const movements: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          action_type: 'adjust_quantity',
          quantity_delta: -5,
          created_at: new Date().toISOString(),
        },
      ]

      const csv = exportToCSV(movements)
      expect(csv).toContain('-5')
      expect(csv).not.toContain('+-5')
    })

    it('uses - for moves without quantity change', () => {
      const movements: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          action_type: 'move',
          quantity_delta: null,
          from_folder_name: 'Folder A',
          to_folder_name: 'Folder B',
          created_at: new Date().toISOString(),
        },
      ]

      const csv = exportToCSV(movements)
      const lines = csv.split('\n')
      const dataRow = lines[1]

      // Last column should be '-'
      expect(dataRow.endsWith('-')).toBe(true)
    })

    it('uses - for missing folder names', () => {
      const movements: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          action_type: 'adjust_quantity',
          quantity_delta: 10,
          from_folder_name: null,
          to_folder_name: null,
          created_at: new Date().toISOString(),
        },
      ]

      const csv = exportToCSV(movements)
      expect(csv).toContain(',-,-,')
    })
  })

  describe('Limit', () => {
    it('limits results to 200 movements', () => {
      const now = new Date()
      const manyMovements: ActivityLog[] = Array.from({ length: 250 }, (_, i) => ({
        ...testActivityLogs[0],
        id: `movement-${i}`,
        action_type: 'adjust_quantity' as const,
        quantity_delta: 1,
        created_at: now.toISOString(),
      }))

      const movements = getStockMovements(manyMovements, TEST_TENANT_ID, 30)
      expect(movements.length).toBe(200)
    })
  })

  describe('Edge Cases', () => {
    it('returns empty array when no movements match', () => {
      const movements = getStockMovements([], TEST_TENANT_ID, 30)
      expect(movements).toHaveLength(0)
    })

    it('returns empty stats for empty movements', () => {
      const stats = calculateMovementStats([])

      expect(stats.totalMoves).toBe(0)
      expect(stats.totalAdjustments).toBe(0)
      expect(stats.netQuantityChange).toBe(0)
    })

    it('handles movements with null quantity_delta', () => {
      const movements: ActivityLog[] = [
        {
          ...testActivityLogs[0],
          action_type: 'adjust_quantity',
          quantity_delta: null,
          created_at: new Date().toISOString(),
        },
      ]

      const stats = calculateMovementStats(movements)
      expect(stats.netQuantityChange).toBe(0)
    })
  })
})

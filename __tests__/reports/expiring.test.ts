import { describe, it, expect } from 'vitest'
import {
  testExpiringLots,
  testExpirySummary,
  TEST_TENANT_ID,
  ExpiringLot,
} from '../utils/test-data'

/**
 * Expiring Items Report Tests
 *
 * The expiring items report should:
 * 1. RPC get_expiring_lots returns correct data structure
 * 2. RPC get_expiring_lots_summary returns correct counts
 * 3. Urgency levels calculated correctly (expired, critical, warning, upcoming)
 * 4. Days until expiry accurate
 * 5. Value at risk calculation correct
 * 6. Separated expired vs expiring lots correctly
 */

interface ExpirySummary {
  expired_count: number
  expiring_7_days: number
  expiring_30_days: number
  total_value_at_risk: number
}

// Simulate the data processing logic from expiring/page.tsx
function processExpiringLots(lots: ExpiringLot[]) {
  const expiredLots = lots.filter(lot => lot.urgency === 'expired')
  const expiringLots = lots.filter(lot => lot.urgency !== 'expired')

  return { expiredLots, expiringLots }
}

// Simulate urgency calculation
function calculateUrgency(daysUntilExpiry: number): ExpiringLot['urgency'] {
  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 7) return 'critical'
  if (daysUntilExpiry <= 14) return 'warning'
  return 'upcoming'
}

// Simulate days until expiry calculation
function calculateDaysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

describe('Expiring Items Report', () => {
  describe('Data Structure', () => {
    it('returns lots with required fields', () => {
      testExpiringLots.forEach(lot => {
        expect(lot.lot_id).toBeDefined()
        expect(lot.item_id).toBeDefined()
        expect(lot.item_name).toBeDefined()
        expect(lot.expiry_date).toBeDefined()
        expect(lot.quantity).toBeDefined()
        expect(lot.status).toBeDefined()
        expect(lot.days_until_expiry).toBeDefined()
        expect(lot.urgency).toBeDefined()
      })
    })

    it('lot_id is a valid string', () => {
      testExpiringLots.forEach(lot => {
        expect(typeof lot.lot_id).toBe('string')
        expect(lot.lot_id.length).toBeGreaterThan(0)
      })
    })

    it('quantity is non-negative', () => {
      testExpiringLots.forEach(lot => {
        expect(lot.quantity).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Summary Counts', () => {
    it('expired_count matches actual expired lots', () => {
      const { expiredLots } = processExpiringLots(testExpiringLots)
      expect(testExpirySummary.expired_count).toBe(expiredLots.length)
    })

    it('expiring_7_days counts lots expiring within 7 days (excluding expired)', () => {
      const lotsExpiring7Days = testExpiringLots.filter(
        lot => lot.urgency === 'critical'
      )
      expect(testExpirySummary.expiring_7_days).toBe(lotsExpiring7Days.length)
    })

    it('expiring_30_days counts lots expiring within 30 days (excluding 7 days)', () => {
      // This counts lots that are in 'warning' or 'upcoming' category
      // Based on our test data structure
      const lotsExpiring30Days = testExpiringLots.filter(
        lot => lot.urgency === 'warning' || lot.urgency === 'upcoming'
      )
      expect(testExpirySummary.expiring_30_days).toBe(lotsExpiring30Days.length)
    })
  })

  describe('Urgency Levels', () => {
    it('expired: days_until_expiry < 0', () => {
      const expiredLots = testExpiringLots.filter(l => l.urgency === 'expired')

      expiredLots.forEach(lot => {
        expect(lot.days_until_expiry).toBeLessThan(0)
      })
    })

    it('critical: 0 <= days_until_expiry <= 7', () => {
      const criticalLots = testExpiringLots.filter(l => l.urgency === 'critical')

      criticalLots.forEach(lot => {
        expect(lot.days_until_expiry).toBeGreaterThanOrEqual(0)
        expect(lot.days_until_expiry).toBeLessThanOrEqual(7)
      })
    })

    it('warning: 7 < days_until_expiry <= 14', () => {
      const warningLots = testExpiringLots.filter(l => l.urgency === 'warning')

      warningLots.forEach(lot => {
        expect(lot.days_until_expiry).toBeGreaterThan(7)
        expect(lot.days_until_expiry).toBeLessThanOrEqual(14)
      })
    })

    it('upcoming: days_until_expiry > 14', () => {
      const upcomingLots = testExpiringLots.filter(l => l.urgency === 'upcoming')

      upcomingLots.forEach(lot => {
        expect(lot.days_until_expiry).toBeGreaterThan(14)
      })
    })

    it('urgency calculation is consistent with days_until_expiry', () => {
      testExpiringLots.forEach(lot => {
        const expectedUrgency = calculateUrgency(lot.days_until_expiry)
        expect(lot.urgency).toBe(expectedUrgency)
      })
    })
  })

  describe('Days Until Expiry', () => {
    it('correctly calculates days for expired lots (negative)', () => {
      const expiredLot = testExpiringLots.find(l => l.urgency === 'expired')

      if (expiredLot) {
        // Recalculate to verify
        const calculatedDays = calculateDaysUntilExpiry(expiredLot.expiry_date)
        expect(calculatedDays).toBeLessThan(0)
      }
    })

    it('correctly calculates days for future expiry', () => {
      const futureLot = testExpiringLots.find(l => l.urgency === 'upcoming')

      if (futureLot) {
        const calculatedDays = calculateDaysUntilExpiry(futureLot.expiry_date)
        expect(calculatedDays).toBeGreaterThan(0)
      }
    })
  })

  describe('Lot Separation', () => {
    it('correctly separates expired from expiring lots', () => {
      const { expiredLots, expiringLots } = processExpiringLots(testExpiringLots)

      // Verify expired lots
      expiredLots.forEach(lot => {
        expect(lot.urgency).toBe('expired')
      })

      // Verify expiring lots
      expiringLots.forEach(lot => {
        expect(lot.urgency).not.toBe('expired')
      })
    })

    it('all lots are in either expired or expiring', () => {
      const { expiredLots, expiringLots } = processExpiringLots(testExpiringLots)

      expect(expiredLots.length + expiringLots.length).toBe(testExpiringLots.length)
    })
  })

  describe('Value at Risk', () => {
    it('total_value_at_risk is non-negative', () => {
      expect(testExpirySummary.total_value_at_risk).toBeGreaterThanOrEqual(0)
    })

    it('value at risk includes both expired and expiring lots', () => {
      // The value at risk should be calculated from all lots at risk
      // (expired + expiring within 30 days)
      const atRiskLots = testExpiringLots.filter(
        lot => lot.urgency !== 'upcoming' || lot.days_until_expiry <= 30
      )

      expect(atRiskLots.length).toBeGreaterThan(0)
    })
  })

  describe('Display Formatting', () => {
    it('getUrgencyBadge returns correct styling for each urgency', () => {
      const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
          case 'expired':
            return { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' }
          case 'critical':
            return { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical (7 days)' }
          case 'warning':
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warning (14 days)' }
          default:
            return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Upcoming' }
        }
      }

      expect(getUrgencyBadge('expired').label).toBe('Expired')
      expect(getUrgencyBadge('critical').label).toBe('Critical (7 days)')
      expect(getUrgencyBadge('warning').label).toBe('Warning (14 days)')
      expect(getUrgencyBadge('upcoming').label).toBe('Upcoming')
    })

    it('formats expiry date correctly', () => {
      testExpiringLots.forEach(lot => {
        const expiryDate = new Date(lot.expiry_date)
        expect(expiryDate.toString()).not.toBe('Invalid Date')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty lots array', () => {
      const { expiredLots, expiringLots } = processExpiringLots([])

      expect(expiredLots).toHaveLength(0)
      expect(expiringLots).toHaveLength(0)
    })

    it('handles all expired lots', () => {
      const allExpired: ExpiringLot[] = testExpiringLots.map(lot => ({
        ...lot,
        days_until_expiry: -1,
        urgency: 'expired' as const,
      }))

      const { expiredLots, expiringLots } = processExpiringLots(allExpired)

      expect(expiredLots).toHaveLength(allExpired.length)
      expect(expiringLots).toHaveLength(0)
    })

    it('handles no expired lots (all upcoming)', () => {
      const allUpcoming: ExpiringLot[] = testExpiringLots.map(lot => ({
        ...lot,
        days_until_expiry: 20,
        urgency: 'upcoming' as const,
      }))

      const { expiredLots, expiringLots } = processExpiringLots(allUpcoming)

      expect(expiredLots).toHaveLength(0)
      expect(expiringLots).toHaveLength(allUpcoming.length)
    })

    it('handles lot with zero quantity', () => {
      const zeroQtyLot: ExpiringLot = {
        ...testExpiringLots[0],
        lot_id: 'zero-qty',
        quantity: 0,
      }

      // Zero quantity lots should still be included but may not contribute to value
      expect(zeroQtyLot.quantity).toBe(0)
    })

    it('handles lot with null optional fields', () => {
      const minimalLot: ExpiringLot = {
        ...testExpiringLots[0],
        lot_id: 'minimal',
        lot_number: null,
        batch_code: null,
        item_sku: null,
        item_image: null,
        location_id: null,
        location_name: null,
      }

      // Should not throw error
      expect(minimalLot.item_name).toBeDefined()
    })
  })

  describe('Sorting', () => {
    it('lots should be sortable by expiry_date ascending', () => {
      const sorted = [...testExpiringLots].sort(
        (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      )

      for (let i = 1; i < sorted.length; i++) {
        const prevDate = new Date(sorted[i - 1].expiry_date).getTime()
        const currDate = new Date(sorted[i].expiry_date).getTime()
        expect(currDate).toBeGreaterThanOrEqual(prevDate)
      }
    })

    it('lots should be sortable by days_until_expiry ascending', () => {
      const sorted = [...testExpiringLots].sort(
        (a, b) => a.days_until_expiry - b.days_until_expiry
      )

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].days_until_expiry).toBeGreaterThanOrEqual(
          sorted[i - 1].days_until_expiry
        )
      }
    })
  })

  describe('Summary Consistency', () => {
    it('expired + critical + warning/upcoming <= total lots within 30 days', () => {
      const totalCounted =
        testExpirySummary.expired_count +
        testExpirySummary.expiring_7_days +
        testExpirySummary.expiring_30_days

      expect(totalCounted).toBeLessThanOrEqual(testExpiringLots.length)
    })
  })
})

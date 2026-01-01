import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Serialized Checkout/Return Tests
 *
 * Tests for checkout and return of serialized items:
 * - Serial number selection
 * - Per-serial condition tracking
 * - Serial status updates
 */

interface SerialNumber {
  id: string
  item_id: string
  serial_number: string
  status: 'available' | 'checked_out' | 'damaged' | 'retired'
  checkout_id: string | null
}

interface SerializedCheckout {
  id: string
  item_id: string
  serial_ids: string[]
  assignee_name: string
  checked_out_at: string
  returned_at: string | null
}

interface SerialReturnResult {
  serialId: string
  condition: 'good' | 'damaged' | 'lost'
  newStatus: SerialNumber['status']
}

// Checkout with serials
function checkoutWithSerials(
  itemId: string,
  serialIds: string[],
  serials: Map<string, SerialNumber>,
  assignee: string
): { success: boolean; checkout?: SerializedCheckout; error?: string } {
  // Validate all serials exist and are available
  for (const serialId of serialIds) {
    const serial = serials.get(serialId)

    if (!serial) {
      return { success: false, error: `Serial ${serialId} not found` }
    }

    if (serial.item_id !== itemId) {
      return { success: false, error: `Serial ${serialId} does not belong to item` }
    }

    if (serial.status !== 'available') {
      return { success: false, error: `Serial ${serialId} is not available` }
    }
  }

  // Create checkout
  const checkoutId = `co-${Date.now()}`
  const checkout: SerializedCheckout = {
    id: checkoutId,
    item_id: itemId,
    serial_ids: serialIds,
    assignee_name: assignee,
    checked_out_at: new Date().toISOString(),
    returned_at: null,
  }

  // Update serial statuses
  for (const serialId of serialIds) {
    const serial = serials.get(serialId)!
    serial.status = 'checked_out'
    serial.checkout_id = checkoutId
  }

  return { success: true, checkout }
}

// Get serials for a checkout
function getCheckoutSerials(
  checkoutId: string,
  serials: Map<string, SerialNumber>
): SerialNumber[] {
  return Array.from(serials.values()).filter(s => s.checkout_id === checkoutId)
}

// Return checkout with per-serial conditions
function returnCheckoutSerials(
  checkoutId: string,
  serialConditions: Array<{ serialId: string; condition: 'good' | 'damaged' | 'lost' }>,
  serials: Map<string, SerialNumber>,
  checkout: SerializedCheckout
): { success: boolean; results: SerialReturnResult[]; error?: string } {
  const results: SerialReturnResult[] = []

  for (const { serialId, condition } of serialConditions) {
    const serial = serials.get(serialId)

    if (!serial) {
      return { success: false, results, error: `Serial ${serialId} not found` }
    }

    if (serial.checkout_id !== checkoutId) {
      return { success: false, results, error: `Serial ${serialId} not part of this checkout` }
    }

    // Update status based on condition
    let newStatus: SerialNumber['status']
    if (condition === 'good') {
      newStatus = 'available'
    } else if (condition === 'damaged') {
      newStatus = 'damaged'
    } else {
      newStatus = 'retired' // Lost items are retired
    }

    serial.status = newStatus
    serial.checkout_id = null

    results.push({
      serialId,
      condition,
      newStatus,
    })
  }

  // Mark checkout as returned
  checkout.returned_at = new Date().toISOString()

  return { success: true, results }
}

// Check if checkout allows partial return
function allowsPartialReturn(checkout: SerializedCheckout, returnedCount: number): boolean {
  return returnedCount > 0 && returnedCount < checkout.serial_ids.length
}

describe('Serialized Checkout', () => {
  describe('Select Serials', () => {
    it('associates specific serial numbers', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'available', checkout_id: null }],
        ['sn-2', { id: 'sn-2', item_id: 'item-1', serial_number: 'ABC124', status: 'available', checkout_id: null }],
      ])

      const result = checkoutWithSerials('item-1', ['sn-1', 'sn-2'], serials, 'John')

      expect(result.success).toBe(true)
      expect(result.checkout!.serial_ids).toEqual(['sn-1', 'sn-2'])
    })

    it('updates serial status to checked_out', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'available', checkout_id: null }],
      ])

      checkoutWithSerials('item-1', ['sn-1'], serials, 'John')

      expect(serials.get('sn-1')!.status).toBe('checked_out')
    })

    it('links serial to checkout', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'available', checkout_id: null }],
      ])

      const result = checkoutWithSerials('item-1', ['sn-1'], serials, 'John')

      expect(serials.get('sn-1')!.checkout_id).toBe(result.checkout!.id)
    })

    it('handles multiple serials in single checkout', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'available', checkout_id: null }],
        ['sn-2', { id: 'sn-2', item_id: 'item-1', serial_number: 'ABC124', status: 'available', checkout_id: null }],
        ['sn-3', { id: 'sn-3', item_id: 'item-1', serial_number: 'ABC125', status: 'available', checkout_id: null }],
      ])

      const result = checkoutWithSerials('item-1', ['sn-1', 'sn-2', 'sn-3'], serials, 'John')

      expect(result.success).toBe(true)
      expect(result.checkout!.serial_ids.length).toBe(3)
    })

    it('rejects non-existent serial', () => {
      const serials = new Map<string, SerialNumber>()

      const result = checkoutWithSerials('item-1', ['sn-nonexistent'], serials, 'John')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('rejects serial from wrong item', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-2', serial_number: 'ABC123', status: 'available', checkout_id: null }],
      ])

      const result = checkoutWithSerials('item-1', ['sn-1'], serials, 'John')

      expect(result.success).toBe(false)
      expect(result.error).toContain('does not belong')
    })

    it('rejects already checked out serial', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-old' }],
      ])

      const result = checkoutWithSerials('item-1', ['sn-1'], serials, 'John')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not available')
    })
  })

  describe('Get Checkout Serials', () => {
    it('returns list of serials for checkout', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-1' }],
        ['sn-2', { id: 'sn-2', item_id: 'item-1', serial_number: 'ABC124', status: 'checked_out', checkout_id: 'co-1' }],
        ['sn-3', { id: 'sn-3', item_id: 'item-1', serial_number: 'ABC125', status: 'available', checkout_id: null }],
      ])

      const checkoutSerials = getCheckoutSerials('co-1', serials)

      expect(checkoutSerials.length).toBe(2)
      expect(checkoutSerials.map(s => s.id)).toContain('sn-1')
      expect(checkoutSerials.map(s => s.id)).toContain('sn-2')
    })

    it('returns empty array for non-existent checkout', () => {
      const serials = new Map<string, SerialNumber>()

      const checkoutSerials = getCheckoutSerials('co-nonexistent', serials)

      expect(checkoutSerials).toEqual([])
    })
  })

  describe('Serialized Return', () => {
    it('records condition for each serial', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-1' }],
        ['sn-2', { id: 'sn-2', item_id: 'item-1', serial_number: 'ABC124', status: 'checked_out', checkout_id: 'co-1' }],
      ])

      const checkout: SerializedCheckout = {
        id: 'co-1',
        item_id: 'item-1',
        serial_ids: ['sn-1', 'sn-2'],
        assignee_name: 'John',
        checked_out_at: new Date().toISOString(),
        returned_at: null,
      }

      const result = returnCheckoutSerials(
        'co-1',
        [
          { serialId: 'sn-1', condition: 'good' },
          { serialId: 'sn-2', condition: 'damaged' },
        ],
        serials,
        checkout
      )

      expect(result.success).toBe(true)
      expect(result.results[0].condition).toBe('good')
      expect(result.results[1].condition).toBe('damaged')
    })

    it('updates serial status to available for good condition', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-1' }],
      ])

      const checkout: SerializedCheckout = {
        id: 'co-1',
        item_id: 'item-1',
        serial_ids: ['sn-1'],
        assignee_name: 'John',
        checked_out_at: new Date().toISOString(),
        returned_at: null,
      }

      returnCheckoutSerials(
        'co-1',
        [{ serialId: 'sn-1', condition: 'good' }],
        serials,
        checkout
      )

      expect(serials.get('sn-1')!.status).toBe('available')
    })

    it('updates serial status to damaged for damaged condition', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-1' }],
      ])

      const checkout: SerializedCheckout = {
        id: 'co-1',
        item_id: 'item-1',
        serial_ids: ['sn-1'],
        assignee_name: 'John',
        checked_out_at: new Date().toISOString(),
        returned_at: null,
      }

      returnCheckoutSerials(
        'co-1',
        [{ serialId: 'sn-1', condition: 'damaged' }],
        serials,
        checkout
      )

      expect(serials.get('sn-1')!.status).toBe('damaged')
    })

    it('updates serial status to retired for lost condition', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-1' }],
      ])

      const checkout: SerializedCheckout = {
        id: 'co-1',
        item_id: 'item-1',
        serial_ids: ['sn-1'],
        assignee_name: 'John',
        checked_out_at: new Date().toISOString(),
        returned_at: null,
      }

      returnCheckoutSerials(
        'co-1',
        [{ serialId: 'sn-1', condition: 'lost' }],
        serials,
        checkout
      )

      expect(serials.get('sn-1')!.status).toBe('retired')
    })

    it('clears checkout ID on serial after return', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-1' }],
      ])

      const checkout: SerializedCheckout = {
        id: 'co-1',
        item_id: 'item-1',
        serial_ids: ['sn-1'],
        assignee_name: 'John',
        checked_out_at: new Date().toISOString(),
        returned_at: null,
      }

      returnCheckoutSerials(
        'co-1',
        [{ serialId: 'sn-1', condition: 'good' }],
        serials,
        checkout
      )

      expect(serials.get('sn-1')!.checkout_id).toBeNull()
    })

    it('allows partial return', () => {
      const checkout: SerializedCheckout = {
        id: 'co-1',
        item_id: 'item-1',
        serial_ids: ['sn-1', 'sn-2', 'sn-3'],
        assignee_name: 'John',
        checked_out_at: new Date().toISOString(),
        returned_at: null,
      }

      expect(allowsPartialReturn(checkout, 2)).toBe(true)
    })

    it('rejects serial not part of checkout', () => {
      const serials = new Map<string, SerialNumber>([
        ['sn-1', { id: 'sn-1', item_id: 'item-1', serial_number: 'ABC123', status: 'checked_out', checkout_id: 'co-other' }],
      ])

      const checkout: SerializedCheckout = {
        id: 'co-1',
        item_id: 'item-1',
        serial_ids: [],
        assignee_name: 'John',
        checked_out_at: new Date().toISOString(),
        returned_at: null,
      }

      const result = returnCheckoutSerials(
        'co-1',
        [{ serialId: 'sn-1', condition: 'good' }],
        serials,
        checkout
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('not part of this checkout')
    })
  })
})

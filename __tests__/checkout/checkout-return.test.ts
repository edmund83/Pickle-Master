import { describe, it, expect } from 'vitest'
import { testItems, TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'
import type { InventoryItem } from '@/types/database.types'

/**
 * Checkout & Return Tests
 *
 * Tests for checkout and return operations:
 * - Standard checkout with quantity decrement
 * - Return with quantity increment
 * - Checkout validation (insufficient stock)
 * - Return conditions (good, damaged, lost)
 */

interface CheckoutRecord {
  id: string
  item_id: string
  quantity: number
  status: 'checked_out' | 'returned' | 'overdue'
  assignee_name: string
  assignee_type: 'person' | 'department' | 'location'
  due_date: string | null
  notes: string | null
  checked_out_at: string
  returned_at: string | null
  return_condition: 'good' | 'damaged' | 'needs_repair' | 'lost' | null
  return_notes: string | null
}

// Simulate checkout function
function checkoutItem(
  item: InventoryItem,
  params: {
    quantity: number
    assigneeName: string
    assigneeType: 'person' | 'department' | 'location'
    dueDate?: string
    notes?: string
  }
): { success: boolean; item?: InventoryItem; checkout?: CheckoutRecord; error?: string } {
  // Validation
  if (params.quantity <= 0) {
    return { success: false, error: 'Quantity must be greater than zero' }
  }

  if (params.quantity > item.quantity) {
    return { success: false, error: 'Insufficient stock' }
  }

  // Update item quantity
  const updatedItem: InventoryItem = {
    ...item,
    quantity: item.quantity - params.quantity,
    status: calculateStatus(item.quantity - params.quantity, item.min_quantity ?? 0),
    updated_at: new Date().toISOString(),
  }

  // Create checkout record
  const checkout: CheckoutRecord = {
    id: `checkout-${Date.now()}`,
    item_id: item.id,
    quantity: params.quantity,
    status: 'checked_out',
    assignee_name: params.assigneeName,
    assignee_type: params.assigneeType,
    due_date: params.dueDate ?? null,
    notes: params.notes ?? null,
    checked_out_at: new Date().toISOString(),
    returned_at: null,
    return_condition: null,
    return_notes: null,
  }

  return { success: true, item: updatedItem, checkout }
}

// Simulate return function
function returnItem(
  checkout: CheckoutRecord,
  item: InventoryItem,
  params: {
    condition: 'good' | 'damaged' | 'needs_repair' | 'lost'
    notes?: string
  }
): { success: boolean; item?: InventoryItem; checkout?: CheckoutRecord; error?: string } {
  // Validation
  if (checkout.status === 'returned') {
    return { success: false, error: 'Item already returned' }
  }

  const timestamp = new Date().toISOString()

  // Update checkout record
  const updatedCheckout: CheckoutRecord = {
    ...checkout,
    status: 'returned',
    returned_at: timestamp,
    return_condition: params.condition,
    return_notes: params.notes ?? null,
  }

  // Only increment quantity if not lost
  const quantityIncrement = params.condition === 'lost' ? 0 : checkout.quantity

  // Update item quantity
  const updatedItem: InventoryItem = {
    ...item,
    quantity: item.quantity + quantityIncrement,
    status: calculateStatus(item.quantity + quantityIncrement, item.min_quantity ?? 0),
    updated_at: timestamp,
  }

  return { success: true, item: updatedItem, checkout: updatedCheckout }
}

function calculateStatus(quantity: number, minQuantity: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity === 0) return 'out_of_stock'
  if (quantity <= minQuantity) return 'low_stock'
  return 'in_stock'
}

describe('Checkout & Returns', () => {
  const testItem = testItems[0] // Laptop: qty 50, min_qty 10

  describe('Standard Checkout', () => {
    it('decrements quantity on checkout', () => {
      const result = checkoutItem(testItem, {
        quantity: 5,
        assigneeName: 'John Doe',
        assigneeType: 'person',
      })

      expect(result.success).toBe(true)
      expect(result.item?.quantity).toBe(45) // 50 - 5
    })

    it('creates checkout record with status checked_out', () => {
      const result = checkoutItem(testItem, {
        quantity: 5,
        assigneeName: 'John Doe',
        assigneeType: 'person',
      })

      expect(result.checkout?.status).toBe('checked_out')
    })

    it('stores assignee information', () => {
      const result = checkoutItem(testItem, {
        quantity: 5,
        assigneeName: 'Engineering Dept',
        assigneeType: 'department',
      })

      expect(result.checkout?.assignee_name).toBe('Engineering Dept')
      expect(result.checkout?.assignee_type).toBe('department')
    })

    it('stores due date when provided', () => {
      const dueDate = '2024-12-31T00:00:00Z'
      const result = checkoutItem(testItem, {
        quantity: 5,
        assigneeName: 'John Doe',
        assigneeType: 'person',
        dueDate,
      })

      expect(result.checkout?.due_date).toBe(dueDate)
    })

    it('stores notes when provided', () => {
      const result = checkoutItem(testItem, {
        quantity: 5,
        assigneeName: 'John Doe',
        assigneeType: 'person',
        notes: 'For project X',
      })

      expect(result.checkout?.notes).toBe('For project X')
    })

    it('rejects insufficient stock checkout', () => {
      const result = checkoutItem(testItem, {
        quantity: 100, // More than available (50)
        assigneeName: 'John Doe',
        assigneeType: 'person',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient stock')
    })

    it('rejects zero quantity checkout', () => {
      const result = checkoutItem(testItem, {
        quantity: 0,
        assigneeName: 'John Doe',
        assigneeType: 'person',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Quantity must be greater than zero')
    })

    it('updates item status based on remaining quantity', () => {
      // Checkout enough to trigger low_stock
      const result = checkoutItem(testItem, {
        quantity: 45, // Leaves 5, which is <= min_quantity (10)
        assigneeName: 'John Doe',
        assigneeType: 'person',
      })

      expect(result.item?.status).toBe('low_stock')
    })

    it('updates item status to out_of_stock when quantity becomes zero', () => {
      const result = checkoutItem(testItem, {
        quantity: 50, // Checkout all
        assigneeName: 'John Doe',
        assigneeType: 'person',
      })

      expect(result.item?.quantity).toBe(0)
      expect(result.item?.status).toBe('out_of_stock')
    })
  })

  describe('Return Item', () => {
    // Create a checkout record for testing returns
    const checkout: CheckoutRecord = {
      id: 'checkout-1',
      item_id: testItem.id,
      quantity: 5,
      status: 'checked_out',
      assignee_name: 'John Doe',
      assignee_type: 'person',
      due_date: '2024-12-31T00:00:00Z',
      notes: null,
      checked_out_at: '2024-01-01T00:00:00Z',
      returned_at: null,
      return_condition: null,
      return_notes: null,
    }

    // Simulated item after checkout
    const checkedOutItem: InventoryItem = {
      ...testItem,
      quantity: 45, // 50 - 5
    }

    it('increments quantity on good condition return', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'good',
      })

      expect(result.success).toBe(true)
      expect(result.item?.quantity).toBe(50) // 45 + 5
    })

    it('increments quantity on damaged condition return', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'damaged',
      })

      expect(result.success).toBe(true)
      expect(result.item?.quantity).toBe(50)
    })

    it('increments quantity on needs_repair condition return', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'needs_repair',
      })

      expect(result.success).toBe(true)
      expect(result.item?.quantity).toBe(50)
    })

    it('does NOT increment quantity on lost condition return', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'lost',
      })

      expect(result.success).toBe(true)
      expect(result.item?.quantity).toBe(45) // No increment
    })

    it('records return condition', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'damaged',
      })

      expect(result.checkout?.return_condition).toBe('damaged')
    })

    it('stores return notes', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'good',
        notes: 'Item returned in perfect condition',
      })

      expect(result.checkout?.return_notes).toBe('Item returned in perfect condition')
    })

    it('sets returned_at timestamp', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'good',
      })

      expect(result.checkout?.returned_at).toBeDefined()
      expect(new Date(result.checkout!.returned_at!).getTime()).toBeGreaterThan(0)
    })

    it('updates checkout status to returned', () => {
      const result = returnItem(checkout, checkedOutItem, {
        condition: 'good',
      })

      expect(result.checkout?.status).toBe('returned')
    })

    it('rejects already returned checkout', () => {
      const returnedCheckout: CheckoutRecord = {
        ...checkout,
        status: 'returned',
        returned_at: '2024-01-05T00:00:00Z',
      }

      const result = returnItem(returnedCheckout, checkedOutItem, {
        condition: 'good',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Item already returned')
    })

    it('updates item status on return', () => {
      // Item was out_of_stock after checkout
      const outOfStockItem: InventoryItem = {
        ...testItem,
        quantity: 0,
        status: 'out_of_stock',
      }

      const fullCheckout: CheckoutRecord = {
        ...checkout,
        quantity: 50,
      }

      const result = returnItem(fullCheckout, outOfStockItem, {
        condition: 'good',
      })

      expect(result.item?.quantity).toBe(50)
      expect(result.item?.status).toBe('in_stock')
    })
  })

  describe('Checkout Validation', () => {
    it('validates quantity is positive', () => {
      const result = checkoutItem(testItem, {
        quantity: -5,
        assigneeName: 'John',
        assigneeType: 'person',
      })

      expect(result.success).toBe(false)
    })

    it('validates against exact stock available', () => {
      // Checkout exactly available quantity should succeed
      const result = checkoutItem(testItem, {
        quantity: 50,
        assigneeName: 'John',
        assigneeType: 'person',
      })

      expect(result.success).toBe(true)
      expect(result.item?.quantity).toBe(0)
    })

    it('validates against one more than stock', () => {
      // Checkout one more than available should fail
      const result = checkoutItem(testItem, {
        quantity: 51,
        assigneeName: 'John',
        assigneeType: 'person',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient stock')
    })
  })

  describe('Assignee Types', () => {
    it('supports person assignee type', () => {
      const result = checkoutItem(testItem, {
        quantity: 1,
        assigneeName: 'John Doe',
        assigneeType: 'person',
      })

      expect(result.checkout?.assignee_type).toBe('person')
    })

    it('supports department assignee type', () => {
      const result = checkoutItem(testItem, {
        quantity: 1,
        assigneeName: 'Engineering',
        assigneeType: 'department',
      })

      expect(result.checkout?.assignee_type).toBe('department')
    })

    it('supports location assignee type', () => {
      const result = checkoutItem(testItem, {
        quantity: 1,
        assigneeName: 'Warehouse A',
        assigneeType: 'location',
      })

      expect(result.checkout?.assignee_type).toBe('location')
    })
  })
})

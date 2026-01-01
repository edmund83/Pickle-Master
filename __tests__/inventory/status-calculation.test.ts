import { describe, it, expect } from 'vitest'
import type { InventoryItem } from '@/types/database.types'

/**
 * Inventory Status Calculation Tests
 *
 * Tests for automatic status calculation based on quantity and min_quantity:
 * - in_stock: quantity > min_quantity
 * - low_stock: 0 < quantity <= min_quantity
 * - out_of_stock: quantity === 0
 */

type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

// Simulate status calculation logic
function calculateStatus(quantity: number, minQuantity: number): InventoryStatus {
  if (quantity === 0) {
    return 'out_of_stock'
  }
  if (quantity <= minQuantity) {
    return 'low_stock'
  }
  return 'in_stock'
}

// Simulate quantity update and status recalculation
function updateQuantityAndStatus(
  item: { quantity: number; min_quantity: number; status: InventoryStatus },
  newQuantity: number
): { quantity: number; status: InventoryStatus } {
  const status = calculateStatus(newQuantity, item.min_quantity)
  return { quantity: newQuantity, status }
}

// Simulate min_quantity update and status recalculation
function updateMinQuantityAndStatus(
  item: { quantity: number; min_quantity: number; status: InventoryStatus },
  newMinQuantity: number
): { min_quantity: number; status: InventoryStatus } {
  const status = calculateStatus(item.quantity, newMinQuantity)
  return { min_quantity: newMinQuantity, status }
}

describe('Inventory Status Calculation', () => {
  describe('calculateStatus', () => {
    it('returns out_of_stock when quantity is zero', () => {
      expect(calculateStatus(0, 10)).toBe('out_of_stock')
      expect(calculateStatus(0, 0)).toBe('out_of_stock')
      expect(calculateStatus(0, 100)).toBe('out_of_stock')
    })

    it('returns low_stock when quantity equals min_quantity', () => {
      expect(calculateStatus(10, 10)).toBe('low_stock')
      expect(calculateStatus(5, 5)).toBe('low_stock')
      expect(calculateStatus(1, 1)).toBe('low_stock')
    })

    it('returns low_stock when quantity is below min_quantity', () => {
      expect(calculateStatus(5, 10)).toBe('low_stock')
      expect(calculateStatus(1, 5)).toBe('low_stock')
      expect(calculateStatus(99, 100)).toBe('low_stock')
    })

    it('returns in_stock when quantity is above min_quantity', () => {
      expect(calculateStatus(11, 10)).toBe('in_stock')
      expect(calculateStatus(100, 10)).toBe('in_stock')
      expect(calculateStatus(1, 0)).toBe('in_stock')
    })

    it('handles edge case of min_quantity = 0', () => {
      // If min_quantity is 0, any quantity > 0 is in_stock
      expect(calculateStatus(1, 0)).toBe('in_stock')
      expect(calculateStatus(100, 0)).toBe('in_stock')
      // quantity = 0 is always out_of_stock
      expect(calculateStatus(0, 0)).toBe('out_of_stock')
    })
  })

  describe('Update Quantity - Status Changes', () => {
    const baseItem = { quantity: 50, min_quantity: 10, status: 'in_stock' as InventoryStatus }

    it('increases quantity - stays in_stock', () => {
      const result = updateQuantityAndStatus(baseItem, 100)

      expect(result.quantity).toBe(100)
      expect(result.status).toBe('in_stock')
    })

    it('decreases quantity - stays in_stock', () => {
      const result = updateQuantityAndStatus(baseItem, 20)

      expect(result.quantity).toBe(20)
      expect(result.status).toBe('in_stock')
    })

    it('sets to zero - status changes to out_of_stock', () => {
      const result = updateQuantityAndStatus(baseItem, 0)

      expect(result.quantity).toBe(0)
      expect(result.status).toBe('out_of_stock')
    })

    it('decreases below min_quantity - status changes to low_stock', () => {
      const result = updateQuantityAndStatus(baseItem, 5)

      expect(result.quantity).toBe(5)
      expect(result.status).toBe('low_stock')
    })

    it('decreases to min_quantity - status changes to low_stock', () => {
      const result = updateQuantityAndStatus(baseItem, 10)

      expect(result.quantity).toBe(10)
      expect(result.status).toBe('low_stock')
    })

    it('increases above min_quantity - status changes to in_stock', () => {
      const lowStockItem = { quantity: 5, min_quantity: 10, status: 'low_stock' as InventoryStatus }
      const result = updateQuantityAndStatus(lowStockItem, 50)

      expect(result.quantity).toBe(50)
      expect(result.status).toBe('in_stock')
    })

    it('increases from zero - status changes from out_of_stock', () => {
      const outOfStockItem = { quantity: 0, min_quantity: 10, status: 'out_of_stock' as InventoryStatus }
      const result = updateQuantityAndStatus(outOfStockItem, 50)

      expect(result.quantity).toBe(50)
      expect(result.status).toBe('in_stock')
    })

    it('increases from zero but below min - status is low_stock', () => {
      const outOfStockItem = { quantity: 0, min_quantity: 10, status: 'out_of_stock' as InventoryStatus }
      const result = updateQuantityAndStatus(outOfStockItem, 5)

      expect(result.quantity).toBe(5)
      expect(result.status).toBe('low_stock')
    })
  })

  describe('Update min_quantity - Status Recalculation', () => {
    it('recalculates status when min_quantity changes', () => {
      const item = { quantity: 10, min_quantity: 5, status: 'in_stock' as InventoryStatus }

      // Increase min_quantity above current quantity
      const result = updateMinQuantityAndStatus(item, 15)

      expect(result.min_quantity).toBe(15)
      expect(result.status).toBe('low_stock')
    })

    it('status becomes in_stock when min_quantity lowered', () => {
      const item = { quantity: 10, min_quantity: 15, status: 'low_stock' as InventoryStatus }

      // Decrease min_quantity below current quantity
      const result = updateMinQuantityAndStatus(item, 5)

      expect(result.min_quantity).toBe(5)
      expect(result.status).toBe('in_stock')
    })

    it('status stays out_of_stock regardless of min_quantity', () => {
      const item = { quantity: 0, min_quantity: 10, status: 'out_of_stock' as InventoryStatus }

      // Changing min_quantity doesn't affect out_of_stock
      const result = updateMinQuantityAndStatus(item, 5)

      expect(result.status).toBe('out_of_stock')
    })
  })

  describe('Quantity Edge Cases', () => {
    it('handles zero quantity correctly', () => {
      const result = updateQuantityAndStatus(
        { quantity: 10, min_quantity: 5, status: 'in_stock' },
        0
      )

      expect(result.quantity).toBe(0)
      expect(result.status).toBe('out_of_stock')
    })

    it('handles very large quantities', () => {
      const largeQty = 2147483647 // 2^31 - 1 (max 32-bit signed integer)
      const result = updateQuantityAndStatus(
        { quantity: 0, min_quantity: 10, status: 'out_of_stock' },
        largeQty
      )

      expect(result.quantity).toBe(largeQty)
      expect(result.status).toBe('in_stock')
    })

    it('handles decimal quantities', () => {
      const decimalQty = 10.5
      const result = updateQuantityAndStatus(
        { quantity: 0, min_quantity: 10, status: 'out_of_stock' },
        decimalQty
      )

      expect(result.quantity).toBe(10.5)
      // 10.5 > 10, so in_stock
      expect(result.status).toBe('in_stock')
    })

    it('handles decimal below min_quantity', () => {
      const decimalQty = 9.9
      const result = updateQuantityAndStatus(
        { quantity: 20, min_quantity: 10, status: 'in_stock' },
        decimalQty
      )

      expect(result.quantity).toBe(9.9)
      // 9.9 < 10, so low_stock
      expect(result.status).toBe('low_stock')
    })
  })

  describe('Validation', () => {
    // Simulate validation function
    function validateQuantity(quantity: number): { valid: boolean; error?: string } {
      if (quantity < 0) {
        return { valid: false, error: 'Quantity cannot be negative' }
      }
      if (!Number.isFinite(quantity)) {
        return { valid: false, error: 'Quantity must be a valid number' }
      }
      return { valid: true }
    }

    it('rejects negative quantity', () => {
      const result = validateQuantity(-5)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Quantity cannot be negative')
    })

    it('rejects negative quantity with different values', () => {
      expect(validateQuantity(-1).valid).toBe(false)
      expect(validateQuantity(-0.5).valid).toBe(false)
      expect(validateQuantity(-1000).valid).toBe(false)
    })

    it('accepts zero quantity', () => {
      const result = validateQuantity(0)

      expect(result.valid).toBe(true)
    })

    it('accepts positive quantity', () => {
      expect(validateQuantity(1).valid).toBe(true)
      expect(validateQuantity(100).valid).toBe(true)
      expect(validateQuantity(0.5).valid).toBe(true)
    })

    it('rejects NaN', () => {
      const result = validateQuantity(NaN)

      expect(result.valid).toBe(false)
    })

    it('rejects Infinity', () => {
      expect(validateQuantity(Infinity).valid).toBe(false)
      expect(validateQuantity(-Infinity).valid).toBe(false)
    })
  })
})

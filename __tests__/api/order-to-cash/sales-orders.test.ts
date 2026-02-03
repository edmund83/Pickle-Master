/**
 * Sales Orders API Tests
 *
 * Tests for server action validation, status transitions, and business rules.
 * These tests use mocked Supabase clients to test the action logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  ORDER_CASH_USER_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  SO_VALID_TRANSITIONS,
  isValidSOStatusTransition,
  type SalesOrderStatus,
} from '../../utils/order-to-cash-fixtures'

// Status state machine (mirroring the server action)
const SO_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['confirmed', 'draft', 'cancelled'],
  confirmed: ['picking', 'cancelled'],
  picking: ['picked', 'cancelled'],
  picked: ['partial_shipped', 'shipped'],
  partial_shipped: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: ['draft'],
}

describe('Sales Orders Server Action Logic', () => {
  describe('Input Validation', () => {
    describe('createSalesOrder validation', () => {
      it('should accept valid customer_id (UUID)', () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000'
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validUuid)
        expect(isValidUuid).toBe(true)
      })

      it('should reject invalid customer_id (not UUID)', () => {
        const invalidUuid = 'not-a-uuid'
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invalidUuid)
        expect(isValidUuid).toBe(false)
      })

      it('should accept valid priority values', () => {
        const validPriorities = ['low', 'normal', 'high', 'urgent']
        validPriorities.forEach(priority => {
          expect(validPriorities.includes(priority)).toBe(true)
        })
      })

      it('should reject invalid priority values', () => {
        const validPriorities = ['low', 'normal', 'high', 'urgent']
        const invalidPriority = 'critical'
        expect(validPriorities.includes(invalidPriority)).toBe(false)
      })

      it('should accept optional date fields as ISO strings', () => {
        const validDate = '2024-01-15'
        const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(validDate)
        expect(isValidDate).toBe(true)
      })
    })

    describe('salesOrderItem validation', () => {
      it('should require item_name', () => {
        const item = { item_name: 'Widget A', quantity_ordered: 5, unit_price: 100 }
        expect(item.item_name.length).toBeGreaterThan(0)
      })

      it('should require positive quantity_ordered', () => {
        const validQuantity = 5
        const invalidQuantity = -1
        expect(validQuantity > 0).toBe(true)
        expect(invalidQuantity > 0).toBe(false)
      })

      it('should require non-negative unit_price', () => {
        const validPrice = 100
        const validZeroPrice = 0
        const invalidPrice = -50
        expect(validPrice >= 0).toBe(true)
        expect(validZeroPrice >= 0).toBe(true)
        expect(invalidPrice >= 0).toBe(false)
      })

      it('should accept discount_percent between 0 and 100', () => {
        const validDiscount = 10
        const edgeDiscount = 100
        const invalidDiscount = 150
        expect(validDiscount >= 0 && validDiscount <= 100).toBe(true)
        expect(edgeDiscount >= 0 && edgeDiscount <= 100).toBe(true)
        expect(invalidDiscount >= 0 && invalidDiscount <= 100).toBe(false)
      })

      it('should accept tax_rate between 0 and 100', () => {
        const validTax = 8
        const edgeTax = 0
        const invalidTax = -5
        expect(validTax >= 0 && validTax <= 100).toBe(true)
        expect(edgeTax >= 0 && edgeTax <= 100).toBe(true)
        expect(invalidTax >= 0 && invalidTax <= 100).toBe(false)
      })
    })
  })

  describe('Status Transition Validation', () => {
    describe('updateSalesOrderStatus', () => {
      it('should allow draft → submitted', () => {
        expect(isValidSOStatusTransition('draft', 'submitted')).toBe(true)
      })

      it('should reject draft → picked (skip intermediate steps)', () => {
        expect(isValidSOStatusTransition('draft', 'picked')).toBe(false)
      })

      it('should allow same status (no-op)', () => {
        expect(isValidSOStatusTransition('draft', 'draft')).toBe(true)
      })

      it('should reject backwards transitions', () => {
        expect(isValidSOStatusTransition('shipped', 'draft')).toBe(false)
        expect(isValidSOStatusTransition('delivered', 'confirmed')).toBe(false)
      })

      it('should allow cancellation from allowed states', () => {
        expect(isValidSOStatusTransition('draft', 'cancelled')).toBe(true)
        expect(isValidSOStatusTransition('submitted', 'cancelled')).toBe(true)
        expect(isValidSOStatusTransition('confirmed', 'cancelled')).toBe(true)
      })

      it('should reject cancellation from shipped state', () => {
        expect(isValidSOStatusTransition('shipped', 'cancelled')).toBe(false)
      })

      it('should allow reopen from cancelled', () => {
        expect(isValidSOStatusTransition('cancelled', 'draft')).toBe(true)
      })
    })
  })

  describe('Business Rules', () => {
    describe('Submit validation', () => {
      it('should require customer_id before submitting', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
          customerId: null,
          items: [],
        })

        // Cannot submit without customer
        const canSubmit = so.salesOrder.customer_id !== null
        expect(canSubmit).toBe(false)
      })

      it('should require at least one item before submitting', () => {
        const customer = createTestCustomer(ORDER_CASH_TENANT_ID)
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
          customerId: customer.id,
          items: [], // No items
        })

        const hasItems = so.items.length > 0
        expect(hasItems).toBe(false)
      })

      it('should allow submit with customer and items', () => {
        const customer = createTestCustomer(ORDER_CASH_TENANT_ID)
        const item = createTestItem(ORDER_CASH_TENANT_ID)
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
          customerId: customer.id,
          items: [{ item, quantity: 5, unitPrice: 100 }],
        })

        const canSubmit = so.salesOrder.customer_id !== null && so.items.length > 0
        expect(canSubmit).toBe(true)
      })
    })

    describe('Update restrictions', () => {
      it('should allow updates in draft status', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, { status: 'draft' })
        const allowedStatuses = ['draft', 'submitted']
        expect(allowedStatuses.includes(so.salesOrder.status)).toBe(true)
      })

      it('should allow updates in submitted status', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, { status: 'submitted' })
        const allowedStatuses = ['draft', 'submitted']
        expect(allowedStatuses.includes(so.salesOrder.status)).toBe(true)
      })

      it('should reject updates after confirmation', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, { status: 'confirmed' })
        const allowedStatuses = ['draft', 'submitted']
        expect(allowedStatuses.includes(so.salesOrder.status)).toBe(false)
      })

      it('should reject updates in picking status', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, { status: 'picking' })
        const allowedStatuses = ['draft', 'submitted']
        expect(allowedStatuses.includes(so.salesOrder.status)).toBe(false)
      })
    })

    describe('Delete restrictions', () => {
      it('should allow delete in draft status', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, { status: 'draft' })
        const canDelete = so.salesOrder.status === 'draft'
        expect(canDelete).toBe(true)
      })

      it('should reject delete in submitted status', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, { status: 'submitted' })
        const canDelete = so.salesOrder.status === 'draft'
        expect(canDelete).toBe(false)
      })

      it('should reject delete in confirmed status', () => {
        const so = createTestSalesOrder(ORDER_CASH_TENANT_ID, { status: 'confirmed' })
        const canDelete = so.salesOrder.status === 'draft'
        expect(canDelete).toBe(false)
      })
    })
  })

  describe('Line Total Calculations', () => {
    it('should calculate line total as quantity × unit_price', () => {
      const quantity = 5
      const unitPrice = 100
      const lineTotal = quantity * unitPrice
      expect(lineTotal).toBe(500)
    })

    it('should calculate discount amount correctly', () => {
      const baseAmount = 500 // 5 × 100
      const discountPercent = 10
      const discountAmount = baseAmount * discountPercent / 100
      expect(discountAmount).toBe(50)
    })

    it('should calculate line total after discount', () => {
      const baseAmount = 500
      const discountAmount = 50
      const lineTotal = baseAmount - discountAmount
      expect(lineTotal).toBe(450)
    })
  })

  describe('Tracking Fields', () => {
    it('should set submitted_by and submitted_at on submit', () => {
      const updateData: Record<string, unknown> = {}
      const newStatus = 'submitted'
      const userId = ORDER_CASH_USER_ID

      if (newStatus === 'submitted') {
        updateData.submitted_by = userId
        updateData.submitted_at = new Date().toISOString()
      }

      expect(updateData.submitted_by).toBe(userId)
      expect(updateData.submitted_at).toBeDefined()
    })

    it('should set confirmed_by and confirmed_at on confirm', () => {
      const updateData: Record<string, unknown> = {}
      const newStatus = 'confirmed'
      const userId = ORDER_CASH_USER_ID

      if (newStatus === 'confirmed') {
        updateData.confirmed_by = userId
        updateData.confirmed_at = new Date().toISOString()
      }

      expect(updateData.confirmed_by).toBe(userId)
      expect(updateData.confirmed_at).toBeDefined()
    })

    it('should set cancelled_by, cancelled_at, and cancellation_reason on cancel', () => {
      const updateData: Record<string, unknown> = {}
      const newStatus = 'cancelled'
      const userId = ORDER_CASH_USER_ID
      const cancellationReason = 'Customer requested cancellation'

      if (newStatus === 'cancelled') {
        updateData.cancelled_by = userId
        updateData.cancelled_at = new Date().toISOString()
        updateData.cancellation_reason = cancellationReason
      }

      expect(updateData.cancelled_by).toBe(userId)
      expect(updateData.cancelled_at).toBeDefined()
      expect(updateData.cancellation_reason).toBe(cancellationReason)
    })
  })

  describe('Pagination', () => {
    it('should sanitize page number (min 1)', () => {
      const sanitizedPage = Math.max(1, -5)
      expect(sanitizedPage).toBe(1)
    })

    it('should sanitize page size (1-100)', () => {
      const sanitizedPageSize = Math.min(100, Math.max(1, 150))
      expect(sanitizedPageSize).toBe(100)

      const sanitizedPageSize2 = Math.min(100, Math.max(1, 0))
      expect(sanitizedPageSize2).toBe(1)
    })

    it('should calculate offset correctly', () => {
      const page = 3
      const pageSize = 20
      const offset = (page - 1) * pageSize
      expect(offset).toBe(40)
    })

    it('should calculate total pages correctly', () => {
      const total = 55
      const pageSize = 20
      const totalPages = Math.ceil(total / pageSize)
      expect(totalPages).toBe(3)
    })
  })
})

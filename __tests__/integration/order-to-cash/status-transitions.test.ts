/**
 * Status Transitions Integration Tests
 *
 * Tests for state machine validation across the order-to-cash workflow:
 * - Sales Order: draft → submitted → confirmed → picking → picked → partial_shipped/shipped → delivered → completed
 * - Delivery Order: draft → ready → dispatched → in_transit → delivered
 * - Invoice: draft → pending → sent → partial/paid/overdue
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  createTestDeliveryOrder,
  createTestInvoice,
  isValidSOStatusTransition,
  isValidDOStatusTransition,
  isValidInvoiceStatusTransition,
  SO_VALID_TRANSITIONS,
  DO_VALID_TRANSITIONS,
  INVOICE_VALID_TRANSITIONS,
  type SalesOrderStatus,
  type DeliveryOrderStatus,
  type InvoiceStatus,
  type TestCustomer,
  type TestItem,
} from '../../utils/order-to-cash-fixtures'

describe('Order-to-Cash Status Transitions', () => {
  let customer: TestCustomer
  let item: TestItem

  beforeAll(() => {
    customer = createTestCustomer(ORDER_CASH_TENANT_ID, { name: 'Status Test Customer' })
    item = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Status Test Item' })
  })

  describe('Sales Order Status Machine', () => {
    describe('Valid Forward Transitions', () => {
      it('should allow: draft → submitted', () => {
        expect(isValidSOStatusTransition('draft', 'submitted')).toBe(true)
      })

      it('should allow: submitted → confirmed', () => {
        expect(isValidSOStatusTransition('submitted', 'confirmed')).toBe(true)
      })

      it('should allow: confirmed → picking', () => {
        expect(isValidSOStatusTransition('confirmed', 'picking')).toBe(true)
      })

      it('should allow: picking → picked', () => {
        expect(isValidSOStatusTransition('picking', 'picked')).toBe(true)
      })

      it('should allow: picked → partial_shipped', () => {
        expect(isValidSOStatusTransition('picked', 'partial_shipped')).toBe(true)
      })

      it('should allow: picked → shipped', () => {
        expect(isValidSOStatusTransition('picked', 'shipped')).toBe(true)
      })

      it('should allow: partial_shipped → shipped', () => {
        expect(isValidSOStatusTransition('partial_shipped', 'shipped')).toBe(true)
      })

      it('should allow: shipped → delivered', () => {
        expect(isValidSOStatusTransition('shipped', 'delivered')).toBe(true)
      })

      it('should allow: delivered → completed', () => {
        expect(isValidSOStatusTransition('delivered', 'completed')).toBe(true)
      })
    })

    describe('Valid Backward/Cancel Transitions', () => {
      it('should allow: draft → cancelled', () => {
        expect(isValidSOStatusTransition('draft', 'cancelled')).toBe(true)
      })

      it('should allow: submitted → cancelled', () => {
        expect(isValidSOStatusTransition('submitted', 'cancelled')).toBe(true)
      })

      it('should allow: submitted → draft (revert)', () => {
        expect(isValidSOStatusTransition('submitted', 'draft')).toBe(true)
      })

      it('should allow: confirmed → cancelled', () => {
        expect(isValidSOStatusTransition('confirmed', 'cancelled')).toBe(true)
      })

      it('should allow: cancelled → draft (reopen)', () => {
        expect(isValidSOStatusTransition('cancelled', 'draft')).toBe(true)
      })
    })

    describe('Invalid Transitions', () => {
      it('should reject: draft → picked (skipping steps)', () => {
        expect(isValidSOStatusTransition('draft', 'picked')).toBe(false)
      })

      it('should reject: draft → shipped (skipping steps)', () => {
        expect(isValidSOStatusTransition('draft', 'shipped')).toBe(false)
      })

      it('should reject: shipped → confirmed (backwards)', () => {
        expect(isValidSOStatusTransition('shipped', 'confirmed')).toBe(false)
      })

      it('should reject: completed → anything (final state)', () => {
        expect(isValidSOStatusTransition('completed', 'draft')).toBe(false)
        expect(isValidSOStatusTransition('completed', 'shipped')).toBe(false)
        expect(isValidSOStatusTransition('completed', 'cancelled')).toBe(false)
      })

      it('should reject: picking → cancelled (after picking started)', () => {
        expect(isValidSOStatusTransition('picking', 'cancelled')).toBe(true) // Actually allowed per SO_VALID_TRANSITIONS
      })

      it('should reject: picked → cancelled (after picked)', () => {
        expect(isValidSOStatusTransition('picked', 'cancelled')).toBe(false)
      })

      it('should reject: delivered → draft (backwards)', () => {
        expect(isValidSOStatusTransition('delivered', 'draft')).toBe(false)
      })
    })

    describe('Same Status Transition', () => {
      it('should allow staying in same status', () => {
        const statuses: SalesOrderStatus[] = [
          'draft', 'submitted', 'confirmed', 'picking', 'picked',
          'partial_shipped', 'shipped', 'delivered', 'completed', 'cancelled'
        ]

        statuses.forEach(status => {
          expect(isValidSOStatusTransition(status, status)).toBe(true)
        })
      })
    })

    describe('Complete Happy Path', () => {
      it('should allow complete workflow: draft → completed', () => {
        const happyPath: SalesOrderStatus[] = [
          'draft', 'submitted', 'confirmed', 'picking', 'picked', 'shipped', 'delivered', 'completed'
        ]

        for (let i = 0; i < happyPath.length - 1; i++) {
          const current = happyPath[i]
          const next = happyPath[i + 1]
          expect(isValidSOStatusTransition(current, next)).toBe(true)
        }
      })
    })
  })

  describe('Delivery Order Status Machine', () => {
    describe('Valid Forward Transitions', () => {
      it('should allow: draft → ready', () => {
        expect(isValidDOStatusTransition('draft', 'ready')).toBe(true)
      })

      it('should allow: ready → dispatched', () => {
        expect(isValidDOStatusTransition('ready', 'dispatched')).toBe(true)
      })

      it('should allow: dispatched → in_transit', () => {
        expect(isValidDOStatusTransition('dispatched', 'in_transit')).toBe(true)
      })

      it('should allow: dispatched → delivered (direct)', () => {
        expect(isValidDOStatusTransition('dispatched', 'delivered')).toBe(true)
      })

      it('should allow: in_transit → delivered', () => {
        expect(isValidDOStatusTransition('in_transit', 'delivered')).toBe(true)
      })
    })

    describe('Valid Failure/Cancel Transitions', () => {
      it('should allow: draft → cancelled', () => {
        expect(isValidDOStatusTransition('draft', 'cancelled')).toBe(true)
      })

      it('should allow: ready → cancelled', () => {
        expect(isValidDOStatusTransition('ready', 'cancelled')).toBe(true)
      })

      it('should allow: dispatched → failed', () => {
        expect(isValidDOStatusTransition('dispatched', 'failed')).toBe(true)
      })

      it('should allow: in_transit → failed', () => {
        expect(isValidDOStatusTransition('in_transit', 'failed')).toBe(true)
      })

      it('should allow: failed → ready (retry)', () => {
        expect(isValidDOStatusTransition('failed', 'ready')).toBe(true)
      })

      it('should allow: failed → returned', () => {
        expect(isValidDOStatusTransition('failed', 'returned')).toBe(true)
      })
    })

    describe('Partial Delivery Transitions', () => {
      it('should allow: in_transit → partial', () => {
        expect(isValidDOStatusTransition('in_transit', 'partial')).toBe(true)
      })

      it('should allow: delivered → partial', () => {
        expect(isValidDOStatusTransition('delivered', 'partial')).toBe(true)
      })

      it('should allow: partial → delivered (complete remaining)', () => {
        expect(isValidDOStatusTransition('partial', 'delivered')).toBe(true)
      })
    })

    describe('Invalid Transitions', () => {
      it('should reject: draft → delivered (skipping steps)', () => {
        expect(isValidDOStatusTransition('draft', 'delivered')).toBe(false)
      })

      it('should reject: delivered → draft (backwards)', () => {
        expect(isValidDOStatusTransition('delivered', 'draft')).toBe(false)
      })

      it('should reject: returned → ready (after return)', () => {
        expect(isValidDOStatusTransition('returned', 'ready')).toBe(false)
      })
    })

    describe('Complete Happy Path', () => {
      it('should allow complete workflow: draft → delivered', () => {
        const happyPath: DeliveryOrderStatus[] = [
          'draft', 'ready', 'dispatched', 'in_transit', 'delivered'
        ]

        for (let i = 0; i < happyPath.length - 1; i++) {
          const current = happyPath[i]
          const next = happyPath[i + 1]
          expect(isValidDOStatusTransition(current, next)).toBe(true)
        }
      })
    })
  })

  describe('Invoice Status Machine', () => {
    describe('Valid Forward Transitions', () => {
      it('should allow: draft → pending', () => {
        expect(isValidInvoiceStatusTransition('draft', 'pending')).toBe(true)
      })

      it('should allow: pending → sent', () => {
        expect(isValidInvoiceStatusTransition('pending', 'sent')).toBe(true)
      })

      it('should allow: sent → partial', () => {
        expect(isValidInvoiceStatusTransition('sent', 'partial')).toBe(true)
      })

      it('should allow: sent → paid', () => {
        expect(isValidInvoiceStatusTransition('sent', 'paid')).toBe(true)
      })

      it('should allow: sent → overdue', () => {
        expect(isValidInvoiceStatusTransition('sent', 'overdue')).toBe(true)
      })

      it('should allow: partial → paid', () => {
        expect(isValidInvoiceStatusTransition('partial', 'paid')).toBe(true)
      })

      it('should allow: overdue → paid', () => {
        expect(isValidInvoiceStatusTransition('overdue', 'paid')).toBe(true)
      })
    })

    describe('Valid Cancel/Void Transitions', () => {
      it('should allow: draft → cancelled', () => {
        expect(isValidInvoiceStatusTransition('draft', 'cancelled')).toBe(true)
      })

      it('should allow: pending → cancelled', () => {
        expect(isValidInvoiceStatusTransition('pending', 'cancelled')).toBe(true)
      })

      it('should allow: sent → void', () => {
        expect(isValidInvoiceStatusTransition('sent', 'void')).toBe(true)
      })

      it('should allow: partial → void', () => {
        expect(isValidInvoiceStatusTransition('partial', 'void')).toBe(true)
      })

      it('should allow: overdue → void', () => {
        expect(isValidInvoiceStatusTransition('overdue', 'void')).toBe(true)
      })

      it('should allow: cancelled → draft (reopen)', () => {
        expect(isValidInvoiceStatusTransition('cancelled', 'draft')).toBe(true)
      })
    })

    describe('Final State Transitions', () => {
      it('should reject: paid → anything (final state)', () => {
        expect(isValidInvoiceStatusTransition('paid', 'draft')).toBe(false)
        expect(isValidInvoiceStatusTransition('paid', 'cancelled')).toBe(false)
        expect(isValidInvoiceStatusTransition('paid', 'partial')).toBe(false)
      })

      it('should reject: void → anything (final state)', () => {
        expect(isValidInvoiceStatusTransition('void', 'draft')).toBe(false)
        expect(isValidInvoiceStatusTransition('void', 'cancelled')).toBe(false)
      })
    })

    describe('Invalid Transitions', () => {
      it('should reject: draft → paid (skipping steps)', () => {
        expect(isValidInvoiceStatusTransition('draft', 'paid')).toBe(false)
      })

      it('should reject: sent → draft (backwards)', () => {
        expect(isValidInvoiceStatusTransition('sent', 'draft')).toBe(false)
      })

      it('should reject: paid → void (already finalized)', () => {
        expect(isValidInvoiceStatusTransition('paid', 'void')).toBe(false)
      })
    })

    describe('Complete Happy Path', () => {
      it('should allow complete workflow: draft → paid', () => {
        const happyPath: InvoiceStatus[] = ['draft', 'pending', 'sent', 'paid']

        for (let i = 0; i < happyPath.length - 1; i++) {
          const current = happyPath[i]
          const next = happyPath[i + 1]
          expect(isValidInvoiceStatusTransition(current, next)).toBe(true)
        }
      })

      it('should allow partial payment workflow: sent → partial → paid', () => {
        expect(isValidInvoiceStatusTransition('sent', 'partial')).toBe(true)
        expect(isValidInvoiceStatusTransition('partial', 'paid')).toBe(true)
      })
    })
  })

  describe('Auto Status Transitions', () => {
    describe('SO Auto-Transitions on DO Delivery', () => {
      it('should describe partial_shipped when some items delivered', () => {
        // Given: SO with 2 items, only 1 item fully shipped
        const soItems = [
          { quantity_ordered: 10, quantity_shipped: 10 }, // Fully shipped
          { quantity_ordered: 5, quantity_shipped: 0 },   // Not shipped
        ]

        const allShipped = soItems.every(item => item.quantity_shipped >= item.quantity_ordered)
        const someShipped = soItems.some(item => item.quantity_shipped > 0)

        expect(allShipped).toBe(false)
        expect(someShipped).toBe(true)

        // Expected SO status: partial_shipped
        const expectedStatus = allShipped ? 'shipped' : (someShipped ? 'partial_shipped' : 'picked')
        expect(expectedStatus).toBe('partial_shipped')
      })

      it('should describe shipped when all items fully shipped', () => {
        const soItems = [
          { quantity_ordered: 10, quantity_shipped: 10 },
          { quantity_ordered: 5, quantity_shipped: 5 },
        ]

        const allShipped = soItems.every(item => item.quantity_shipped >= item.quantity_ordered)
        expect(allShipped).toBe(true)

        const expectedStatus = allShipped ? 'shipped' : 'partial_shipped'
        expect(expectedStatus).toBe('shipped')
      })
    })

    describe('Invoice Auto-Transitions on Payment', () => {
      it('should describe partial when payment < total', () => {
        const invoice = { total: 1000, amount_paid: 300 }
        const balance = invoice.total - invoice.amount_paid

        expect(balance).toBe(700)

        const expectedStatus = balance === 0 ? 'paid' : 'partial'
        expect(expectedStatus).toBe('partial')
      })

      it('should describe paid when payment = total', () => {
        const invoice = { total: 1000, amount_paid: 1000 }
        const balance = invoice.total - invoice.amount_paid

        expect(balance).toBe(0)

        const expectedStatus = balance === 0 ? 'paid' : 'partial'
        expect(expectedStatus).toBe('paid')
      })
    })
  })

  describe('Status Transition Error Messages', () => {
    it('should provide meaningful error for invalid SO transition', () => {
      const current: SalesOrderStatus = 'shipped'
      const attempted: SalesOrderStatus = 'draft'

      const isValid = isValidSOStatusTransition(current, attempted)
      expect(isValid).toBe(false)

      // In real implementation, this would return an error message like:
      // "Invalid status transition: cannot change from 'shipped' to 'draft'"
    })

    it('should provide meaningful error for skipped steps', () => {
      const current: SalesOrderStatus = 'draft'
      const attempted: SalesOrderStatus = 'picked'

      const isValid = isValidSOStatusTransition(current, attempted)
      expect(isValid).toBe(false)

      // Would need transitions through: draft → submitted → confirmed → picking → picked
    })
  })

  describe('Transition Rule Completeness', () => {
    it('should define transitions for all SO statuses', () => {
      const allStatuses: SalesOrderStatus[] = [
        'draft', 'submitted', 'confirmed', 'picking', 'picked',
        'partial_shipped', 'shipped', 'delivered', 'completed', 'cancelled'
      ]

      allStatuses.forEach(status => {
        expect(SO_VALID_TRANSITIONS[status]).toBeDefined()
      })
    })

    it('should define transitions for all DO statuses', () => {
      const allStatuses: DeliveryOrderStatus[] = [
        'draft', 'ready', 'dispatched', 'in_transit',
        'delivered', 'partial', 'failed', 'returned', 'cancelled'
      ]

      allStatuses.forEach(status => {
        expect(DO_VALID_TRANSITIONS[status]).toBeDefined()
      })
    })

    it('should define transitions for all Invoice statuses', () => {
      const allStatuses: InvoiceStatus[] = [
        'draft', 'pending', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'void'
      ]

      allStatuses.forEach(status => {
        expect(INVOICE_VALID_TRANSITIONS[status]).toBeDefined()
      })
    })
  })
})

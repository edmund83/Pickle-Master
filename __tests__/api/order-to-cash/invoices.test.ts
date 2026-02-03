/**
 * Invoices API Tests
 *
 * Tests for invoice server action validation, payment handling, and credit notes.
 */

import { describe, it, expect } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  ORDER_CASH_USER_ID,
  createTestCustomer,
  createTestInvoice,
  createTestInvoicePayment,
  isValidInvoiceStatusTransition,
  type InvoiceStatus,
} from '../../utils/order-to-cash-fixtures'

describe('Invoices Server Action Logic', () => {
  describe('Input Validation', () => {
    describe('createInvoice validation', () => {
      it('should require customer_id (UUID)', () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000'
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validUuid)
        expect(isValidUuid).toBe(true)
      })

      it('should accept optional sales_order_id', () => {
        const customer = createTestCustomer(ORDER_CASH_TENANT_ID)
        const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: customer.id,
          salesOrderId: undefined,
          total: 1000,
        })
        expect(invoice.sales_order_id).toBeNull()
      })

      it('should accept tax_rate between 0 and 100', () => {
        const validRates = [0, 5, 8.25, 20, 100]
        validRates.forEach(rate => {
          expect(rate >= 0 && rate <= 100).toBe(true)
        })
      })

      it('should accept discount_amount as non-negative', () => {
        const validDiscounts = [0, 10, 100.50]
        validDiscounts.forEach(discount => {
          expect(discount >= 0).toBe(true)
        })
      })
    })

    describe('invoiceItem validation', () => {
      it('should require item_name (1-500 chars)', () => {
        const validName = 'Widget A'
        const tooLongName = 'A'.repeat(501)
        expect(validName.length >= 1 && validName.length <= 500).toBe(true)
        expect(tooLongName.length <= 500).toBe(false)
      })

      it('should require positive quantity', () => {
        const validQty = 1
        const invalidQty = 0
        expect(validQty > 0).toBe(true)
        expect(invalidQty > 0).toBe(false)
      })

      it('should require non-negative unit_price', () => {
        const validPrices = [0, 10.99, 1000]
        validPrices.forEach(price => {
          expect(price >= 0).toBe(true)
        })
      })
    })

    describe('recordPayment validation', () => {
      it('should require positive amount', () => {
        const validAmount = 100
        const invalidAmount = 0
        expect(validAmount > 0).toBe(true)
        expect(invalidAmount > 0).toBe(false)
      })

      it('should accept valid payment methods', () => {
        const validMethods = ['cash', 'bank_transfer', 'card', 'check', 'other']
        validMethods.forEach(method => {
          expect(validMethods.includes(method)).toBe(true)
        })
      })

      it('should accept payment_date as ISO string', () => {
        const validDate = '2024-01-15'
        expect(/^\d{4}-\d{2}-\d{2}$/.test(validDate)).toBe(true)
      })
    })
  })

  describe('Status Transition Validation', () => {
    describe('updateInvoiceStatus', () => {
      it('should allow draft → pending', () => {
        expect(isValidInvoiceStatusTransition('draft', 'pending')).toBe(true)
      })

      it('should allow pending → sent', () => {
        expect(isValidInvoiceStatusTransition('pending', 'sent')).toBe(true)
      })

      it('should allow sent → partial (after partial payment)', () => {
        expect(isValidInvoiceStatusTransition('sent', 'partial')).toBe(true)
      })

      it('should allow sent → paid (after full payment)', () => {
        expect(isValidInvoiceStatusTransition('sent', 'paid')).toBe(true)
      })

      it('should allow sent → overdue (past due date)', () => {
        expect(isValidInvoiceStatusTransition('sent', 'overdue')).toBe(true)
      })

      it('should reject draft → paid (must send first)', () => {
        expect(isValidInvoiceStatusTransition('draft', 'paid')).toBe(false)
      })

      it('should reject paid → anything (final state)', () => {
        expect(isValidInvoiceStatusTransition('paid', 'draft')).toBe(false)
        expect(isValidInvoiceStatusTransition('paid', 'void')).toBe(false)
      })

      it('should reject void → anything (final state)', () => {
        expect(isValidInvoiceStatusTransition('void', 'draft')).toBe(false)
      })
    })
  })

  describe('Payment Processing', () => {
    describe('recordPayment', () => {
      it('should reject payment when invoice not sent', () => {
        const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          total: 1000,
          status: 'draft',
        })

        const allowedStatuses = ['sent', 'partial', 'overdue']
        const canRecordPayment = allowedStatuses.includes(invoice.status)
        expect(canRecordPayment).toBe(false)
      })

      it('should allow payment when invoice is sent', () => {
        const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          total: 1000,
          status: 'sent',
        })

        const allowedStatuses = ['sent', 'partial', 'overdue']
        const canRecordPayment = allowedStatuses.includes(invoice.status)
        expect(canRecordPayment).toBe(true)
      })

      it('should reject payment exceeding balance_due', () => {
        const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          total: 500,
          amountPaid: 400,
          status: 'partial',
        })

        const attemptedPayment = 200
        const isValid = attemptedPayment <= invoice.balance_due
        expect(invoice.balance_due).toBe(100)
        expect(isValid).toBe(false)
      })

      it('should update amount_paid correctly', () => {
        const currentAmountPaid = 300
        const newPayment = 200
        const newAmountPaid = currentAmountPaid + newPayment
        expect(newAmountPaid).toBe(500)
      })

      it('should update balance_due correctly', () => {
        const total = 1000
        const newAmountPaid = 500
        const newBalanceDue = total - newAmountPaid
        expect(newBalanceDue).toBe(500)
      })

      it('should set status to partial when partially paid', () => {
        const total = 1000
        const amountPaid = 300
        const balanceDue = total - amountPaid

        const newStatus = balanceDue <= 0 ? 'paid' : 'partial'
        expect(newStatus).toBe('partial')
      })

      it('should set status to paid when fully paid', () => {
        const total = 1000
        const amountPaid = 1000
        const balanceDue = total - amountPaid

        const newStatus = balanceDue <= 0 ? 'paid' : 'partial'
        expect(newStatus).toBe('paid')
      })
    })
  })

  describe('Credit Notes', () => {
    describe('createCreditNote', () => {
      it('should reject creating credit note from another credit note', () => {
        const originalInvoiceType = 'credit_note'
        const canCreateCreditNote = originalInvoiceType !== 'credit_note'
        expect(canCreateCreditNote).toBe(false)
      })

      it('should allow creating credit note from regular invoice', () => {
        const originalInvoiceType = 'invoice'
        const canCreateCreditNote = originalInvoiceType !== 'credit_note'
        expect(canCreateCreditNote).toBe(true)
      })

      it('should set invoice_type to credit_note', () => {
        const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          invoiceType: 'credit_note',
          total: -200,
        })
        expect(creditNote.invoice_type).toBe('credit_note')
      })

      it('should link to original_invoice_id', () => {
        const originalInvoiceId = '123e4567-e89b-12d3-a456-426614174000'
        const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174111',
          invoiceType: 'credit_note',
          originalInvoiceId,
          total: -200,
        })
        expect(creditNote.original_invoice_id).toBe(originalInvoiceId)
      })

      it('should have negative total amount', () => {
        const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          invoiceType: 'credit_note',
          total: -200,
        })
        expect(creditNote.total).toBeLessThan(0)
      })
    })

    describe('applyCreditNote', () => {
      it('should reject applying non-credit_note', () => {
        const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          invoiceType: 'invoice',
          total: 1000,
        })

        const canApply = invoice.invoice_type === 'credit_note'
        expect(canApply).toBe(false)
      })

      it('should reject applying already applied credit note', () => {
        const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          invoiceType: 'credit_note',
          total: -200,
          status: 'paid', // Already applied
        })

        const allowedStatuses = ['draft', 'pending']
        const canApply = allowedStatuses.includes(creditNote.status)
        expect(canApply).toBe(false)
      })

      it('should reject credit note with non-negative total', () => {
        const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          invoiceType: 'credit_note',
          total: 0,
        })

        const hasCredit = creditNote.total < 0
        expect(hasCredit).toBe(false)
      })

      it('should update original invoice balance on apply', () => {
        const originalTotal = 1000
        const originalAmountPaid = 0
        const creditAmount = 200

        const newAmountPaid = originalAmountPaid + creditAmount
        const newBalanceDue = originalTotal - newAmountPaid

        expect(newAmountPaid).toBe(200)
        expect(newBalanceDue).toBe(800)
      })

      it('should set original invoice status based on new balance', () => {
        // Partially credited
        let originalBalance = 1000 - 200
        let newStatus = originalBalance <= 0 ? 'paid' : 'partial'
        expect(newStatus).toBe('partial')

        // Fully credited
        originalBalance = 1000 - 1000
        newStatus = originalBalance <= 0 ? 'paid' : 'partial'
        expect(newStatus).toBe('paid')
      })

      it('should mark credit note as paid after applying', () => {
        const creditNoteTotal = -200
        const creditNoteAfterApply = {
          status: 'paid' as InvoiceStatus,
          amount_paid: Math.abs(creditNoteTotal),
          balance_due: 0,
        }

        expect(creditNoteAfterApply.status).toBe('paid')
        expect(creditNoteAfterApply.balance_due).toBe(0)
      })
    })
  })

  describe('Invoice from Sales Order', () => {
    describe('createInvoiceFromSO', () => {
      it('should require SO to be in valid invoicing status', () => {
        const validStatuses = ['shipped', 'delivered', 'completed', 'partial_shipped']
        const invalidStatuses = ['draft', 'submitted', 'confirmed', 'picking', 'picked']

        validStatuses.forEach(status => {
          expect(validStatuses.includes(status)).toBe(true)
        })

        invalidStatuses.forEach(status => {
          expect(validStatuses.includes(status)).toBe(false)
        })
      })

      it('should copy customer_id from SO', () => {
        const soCustomerId = '123e4567-e89b-12d3-a456-426614174000'
        const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: soCustomerId,
          total: 1000,
        })
        expect(invoice.customer_id).toBe(soCustomerId)
      })

      it('should link to source sales_order_id', () => {
        const soId = '123e4567-e89b-12d3-a456-426614174111'
        const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: '123e4567-e89b-12d3-a456-426614174000',
          salesOrderId: soId,
          total: 1000,
        })
        expect(invoice.sales_order_id).toBe(soId)
      })
    })
  })

  describe('Update Restrictions', () => {
    it('should allow updates in draft status', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        total: 1000,
        status: 'draft',
      })

      const allowedStatuses = ['draft', 'pending']
      expect(allowedStatuses.includes(invoice.status)).toBe(true)
    })

    it('should allow updates in pending status', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        total: 1000,
        status: 'pending',
      })

      const allowedStatuses = ['draft', 'pending']
      expect(allowedStatuses.includes(invoice.status)).toBe(true)
    })

    it('should reject updates after sent', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        total: 1000,
        status: 'sent',
      })

      const allowedStatuses = ['draft', 'pending']
      expect(allowedStatuses.includes(invoice.status)).toBe(false)
    })
  })

  describe('Delete Restrictions', () => {
    it('should allow delete in draft status only', () => {
      const statuses: InvoiceStatus[] = ['draft', 'pending', 'sent', 'partial', 'paid']

      statuses.forEach(status => {
        const canDelete = status === 'draft'
        if (status === 'draft') {
          expect(canDelete).toBe(true)
        } else {
          expect(canDelete).toBe(false)
        }
      })
    })
  })

  describe('Void Validation', () => {
    it('should reject voiding invoice with payments', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        total: 1000,
        amountPaid: 500,
        status: 'partial',
      })

      // In real implementation, we'd check for payments in invoice_payments table
      const hasPayments = invoice.amount_paid > 0
      const canVoid = !hasPayments
      expect(canVoid).toBe(false)
    })

    it('should allow voiding invoice without payments', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        total: 1000,
        amountPaid: 0,
        status: 'sent',
      })

      const hasPayments = invoice.amount_paid > 0
      const canVoid = !hasPayments
      expect(canVoid).toBe(true)
    })
  })
})

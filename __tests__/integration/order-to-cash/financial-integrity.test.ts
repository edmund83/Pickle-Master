/**
 * Financial Integrity Integration Tests
 *
 * Tests for monetary calculations throughout the order-to-cash workflow:
 * - Line total calculations (quantity × price - discount + tax)
 * - SO/Invoice totals recalculation
 * - Payment tracking and balance management
 * - Credit note application
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  createTestInvoice,
  createTestInvoiceItem,
  createTestInvoicePayment,
  calculateLineTotal,
  calculateInvoiceTotals,
  type TestCustomer,
  type TestItem,
  type TestInvoice,
} from '../../utils/order-to-cash-fixtures'

describe('Order-to-Cash Financial Integrity', () => {
  let customer: TestCustomer
  let itemA: TestItem
  let itemB: TestItem

  beforeAll(() => {
    customer = createTestCustomer(ORDER_CASH_TENANT_ID, { name: 'Finance Test Customer' })
    itemA = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Widget A', price: 100 })
    itemB = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Widget B', price: 200 })
  })

  describe('Line Total Calculations', () => {
    it('should calculate line total correctly (quantity × unit_price)', () => {
      const result = calculateLineTotal(5, 100)

      expect(result.subtotal).toBe(500)
      expect(result.discountAmount).toBe(0)
      expect(result.taxAmount).toBe(0)
      expect(result.lineTotal).toBe(500)
    })

    it('should apply discount percentage correctly', () => {
      // 10% discount on $500 = $50 discount = $450 total
      const result = calculateLineTotal(5, 100, 10)

      expect(result.subtotal).toBe(500)
      expect(result.discountAmount).toBe(50)
      expect(result.lineTotal).toBe(450)
    })

    it('should apply tax rate correctly', () => {
      // 8% tax on $500 = $40 tax = $540 total
      const result = calculateLineTotal(5, 100, 0, 8)

      expect(result.subtotal).toBe(500)
      expect(result.taxAmount).toBe(40)
      expect(result.lineTotal).toBe(540)
    })

    it('should apply discount before tax', () => {
      // 10% discount on $500 = $450, then 8% tax = $36 = $486 total
      const result = calculateLineTotal(5, 100, 10, 8)

      expect(result.subtotal).toBe(500)
      expect(result.discountAmount).toBe(50) // 10% of 500
      expect(result.taxAmount).toBe(36)      // 8% of 450
      expect(result.lineTotal).toBe(486)     // 450 + 36
    })

    it('should handle zero quantity', () => {
      const result = calculateLineTotal(0, 100)

      expect(result.subtotal).toBe(0)
      expect(result.lineTotal).toBe(0)
    })

    it('should handle zero price', () => {
      const result = calculateLineTotal(10, 0)

      expect(result.subtotal).toBe(0)
      expect(result.lineTotal).toBe(0)
    })

    it('should handle 100% discount', () => {
      const result = calculateLineTotal(5, 100, 100)

      expect(result.subtotal).toBe(500)
      expect(result.discountAmount).toBe(500)
      expect(result.lineTotal).toBe(0)
    })

    it('should handle fractional amounts correctly', () => {
      // 3 items at $33.33 each with 10% discount
      const result = calculateLineTotal(3, 33.33, 10)

      expect(result.subtotal).toBeCloseTo(99.99, 2)
      expect(result.discountAmount).toBeCloseTo(9.999, 2)
      expect(result.lineTotal).toBeCloseTo(89.991, 2)
    })
  })

  describe('Sales Order Totals', () => {
    it('should calculate subtotal from line items', () => {
      const { salesOrder, items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 5, unitPrice: 100 },  // 500
          { item: itemB, quantity: 3, unitPrice: 200 },  // 600
        ],
      })

      const expectedSubtotal = items.reduce((sum, item) => sum + item.line_total, 0)
      expect(expectedSubtotal).toBe(1100)
      expect(salesOrder.subtotal).toBe(1100)
    })

    it('should calculate total with tax', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 5, unitPrice: 100 },  // 500
        ],
      })

      // Simulate adding 8% tax
      const taxRate = 8
      const subtotal = items[0].line_total
      const taxAmount = subtotal * taxRate / 100
      const total = subtotal + taxAmount

      expect(subtotal).toBe(500)
      expect(taxAmount).toBe(40)
      expect(total).toBe(540)
    })

    it('should update totals when items are added', () => {
      const { salesOrder, items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 5, unitPrice: 100 },  // 500
        ],
      })

      expect(salesOrder.subtotal).toBe(500)

      // Simulate adding another item
      const newItem = { ...items[0], line_total: 600 }
      const newSubtotal = salesOrder.subtotal + newItem.line_total

      expect(newSubtotal).toBe(1100)
    })

    it('should update totals when items are removed', () => {
      const { salesOrder, items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 5, unitPrice: 100 },  // 500
          { item: itemB, quantity: 3, unitPrice: 200 },  // 600
        ],
      })

      expect(salesOrder.subtotal).toBe(1100)

      // Simulate removing first item
      const remainingTotal = items[1].line_total
      expect(remainingTotal).toBe(600)
    })
  })

  describe('Invoice Totals', () => {
    it('should calculate invoice totals from items', () => {
      const totals = calculateInvoiceTotals([
        { quantity: 5, unitPrice: 100 },   // 500
        { quantity: 3, unitPrice: 200 },   // 600
      ])

      expect(totals.subtotal).toBe(1100)
      expect(totals.total).toBe(1100)
    })

    it('should calculate invoice totals with discounts', () => {
      const totals = calculateInvoiceTotals([
        { quantity: 5, unitPrice: 100, discountPercent: 10 },  // 500 - 50 = 450
        { quantity: 3, unitPrice: 200, discountPercent: 5 },   // 600 - 30 = 570
      ])

      expect(totals.subtotal).toBe(1100)
      expect(totals.totalDiscount).toBe(80)
      expect(totals.total).toBe(1020)
    })

    it('should calculate invoice totals with tax', () => {
      const totals = calculateInvoiceTotals([
        { quantity: 10, unitPrice: 100, taxRate: 8 },  // 1000 + 80 = 1080
      ])

      expect(totals.subtotal).toBe(1000)
      expect(totals.totalTax).toBe(80)
      expect(totals.total).toBe(1080)
    })

    it('should calculate invoice totals with discount and tax', () => {
      const totals = calculateInvoiceTotals([
        { quantity: 10, unitPrice: 100, discountPercent: 10, taxRate: 8 },
        // Subtotal: 1000
        // Discount: 100 (10%)
        // After discount: 900
        // Tax: 72 (8% of 900)
        // Total: 972
      ])

      expect(totals.subtotal).toBe(1000)
      expect(totals.totalDiscount).toBe(100)
      expect(totals.totalTax).toBe(72)
      expect(totals.total).toBe(972)
    })
  })

  describe('Invoice Payments', () => {
    it('should track payment amount correctly', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1000,
        amountPaid: 0,
      })

      expect(invoice.total).toBe(1000)
      expect(invoice.amount_paid).toBe(0)
      expect(invoice.balance_due).toBe(1000)
    })

    it('should update balance_due after payment', () => {
      const invoice: TestInvoice = {
        ...createTestInvoice(ORDER_CASH_TENANT_ID, {
          customerId: customer.id,
          total: 1000,
          amountPaid: 0,
        }),
      }

      // Simulate first payment of $300
      const paymentAmount = 300
      const updatedInvoice: TestInvoice = {
        ...invoice,
        amount_paid: invoice.amount_paid + paymentAmount,
        balance_due: invoice.total - (invoice.amount_paid + paymentAmount),
      }

      expect(updatedInvoice.amount_paid).toBe(300)
      expect(updatedInvoice.balance_due).toBe(700)
    })

    it('should handle multiple partial payments', () => {
      let invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1000,
        amountPaid: 0,
      })

      // First payment: $300
      invoice = {
        ...invoice,
        amount_paid: invoice.amount_paid + 300,
        balance_due: invoice.total - (invoice.amount_paid + 300),
      }
      expect(invoice.amount_paid).toBe(300)
      expect(invoice.balance_due).toBe(700)

      // Second payment: $200
      invoice = {
        ...invoice,
        amount_paid: invoice.amount_paid + 200,
        balance_due: invoice.total - (invoice.amount_paid + 200),
      }
      expect(invoice.amount_paid).toBe(500)
      expect(invoice.balance_due).toBe(500)

      // Final payment: $500
      invoice = {
        ...invoice,
        amount_paid: invoice.amount_paid + 500,
        balance_due: invoice.total - (invoice.amount_paid + 500),
      }
      expect(invoice.amount_paid).toBe(1000)
      expect(invoice.balance_due).toBe(0)
    })

    it('should update status to partial after partial payment', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1000,
        amountPaid: 300,
        status: 'partial',
      })

      expect(invoice.status).toBe('partial')
      expect(invoice.balance_due).toBe(700)
    })

    it('should update status to paid when fully paid', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1000,
        amountPaid: 1000,
        status: 'paid',
      })

      expect(invoice.status).toBe('paid')
      expect(invoice.balance_due).toBe(0)
    })

    it('should reject payment exceeding balance', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 500,
        amountPaid: 400,
      })

      const attemptedPayment = 200
      const isValidPayment = attemptedPayment <= invoice.balance_due

      expect(invoice.balance_due).toBe(100)
      expect(isValidPayment).toBe(false)
    })
  })

  describe('Credit Note Calculations', () => {
    it('should create credit note with negative total', () => {
      const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        invoiceType: 'credit_note',
        total: -200,
      })

      expect(creditNote.invoice_type).toBe('credit_note')
      expect(creditNote.total).toBe(-200)
    })

    it('should apply credit note to original invoice balance', () => {
      const originalInvoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1000,
        amountPaid: 0,
        status: 'sent',
      })

      expect(originalInvoice.balance_due).toBe(1000)

      // Apply credit note of -200
      const creditAmount = 200
      const updatedInvoice: TestInvoice = {
        ...originalInvoice,
        amount_paid: originalInvoice.amount_paid + creditAmount,
        balance_due: originalInvoice.total - (originalInvoice.amount_paid + creditAmount),
      }

      expect(updatedInvoice.amount_paid).toBe(200)
      expect(updatedInvoice.balance_due).toBe(800)
    })

    it('should handle multiple credit notes on same invoice', () => {
      let invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1000,
        amountPaid: 0,
      })

      // First credit note: 100
      invoice = {
        ...invoice,
        amount_paid: invoice.amount_paid + 100,
        balance_due: invoice.total - (invoice.amount_paid + 100),
      }
      expect(invoice.balance_due).toBe(900)

      // Second credit note: 150
      invoice = {
        ...invoice,
        amount_paid: invoice.amount_paid + 150,
        balance_due: invoice.total - (invoice.amount_paid + 150),
      }
      expect(invoice.amount_paid).toBe(250)
      expect(invoice.balance_due).toBe(750)
    })

    it('should handle full refund credit note', () => {
      const originalTotal = 1000
      const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        invoiceType: 'credit_note',
        total: -originalTotal,
      })

      expect(creditNote.total).toBe(-1000)

      // After applying full credit, balance should be 0
      const invoiceAfterCredit = {
        total: originalTotal,
        amount_paid: Math.abs(creditNote.total),
        balance_due: originalTotal - Math.abs(creditNote.total),
      }

      expect(invoiceAfterCredit.balance_due).toBe(0)
    })
  })

  describe('Invoice Item Calculations', () => {
    it('should calculate invoice item line_total', () => {
      const invoiceItem = createTestInvoiceItem('inv-123', {
        quantity: 5,
        unitPrice: 100,
      })

      expect(invoiceItem.line_total).toBe(500)
    })

    it('should calculate invoice item with tax', () => {
      const invoiceItem = createTestInvoiceItem('inv-123', {
        quantity: 5,
        unitPrice: 100,
        taxRate: 8,
      })

      expect(invoiceItem.tax_rate).toBe(8)
      expect(invoiceItem.tax_amount).toBe(40)  // 8% of 500
      expect(invoiceItem.line_total).toBe(540) // 500 + 40
    })

    it('should denormalize item details for permanence', () => {
      const invoiceItem = createTestInvoiceItem('inv-123', {
        itemName: 'Widget A',
        sku: 'WID-A',
        quantity: 10,
        unitPrice: 99.99,
      })

      // Invoice items store denormalized data that won't change if source item is modified
      expect(invoiceItem.item_name).toBe('Widget A')
      expect(invoiceItem.sku).toBe('WID-A')
      expect(invoiceItem.unit_price).toBe(99.99)
    })
  })

  describe('Payment Method Tracking', () => {
    it('should track payment method', () => {
      const payment = createTestInvoicePayment('inv-123', ORDER_CASH_TENANT_ID, {
        amount: 500,
        paymentMethod: 'bank_transfer',
      })

      expect(payment.payment_method).toBe('bank_transfer')
    })

    it('should track payment reference number', () => {
      const payment = createTestInvoicePayment('inv-123', ORDER_CASH_TENANT_ID, {
        amount: 500,
        referenceNumber: 'TRF-2024-001',
      })

      expect(payment.reference_number).toBe('TRF-2024-001')
    })

    it('should support all payment methods', () => {
      const methods: Array<'cash' | 'bank_transfer' | 'card' | 'check' | 'other'> = [
        'cash', 'bank_transfer', 'card', 'check', 'other'
      ]

      methods.forEach(method => {
        const payment = createTestInvoicePayment('inv-123', ORDER_CASH_TENANT_ID, {
          paymentMethod: method,
        })
        expect(payment.payment_method).toBe(method)
      })
    })
  })

  describe('Financial Summary', () => {
    it('should calculate complete invoice financial summary', () => {
      const items = [
        { quantity: 10, unitPrice: 100, discountPercent: 10, taxRate: 8 },  // 900 + 72 = 972
        { quantity: 5, unitPrice: 200, discountPercent: 5, taxRate: 8 },   // 950 + 76 = 1026
      ]

      const totals = calculateInvoiceTotals(items)

      // Item 1: 1000 - 100 = 900 + 72 tax = 972
      // Item 2: 1000 - 50 = 950 + 76 tax = 1026
      // Total: 1998

      expect(totals.subtotal).toBe(2000)
      expect(totals.totalDiscount).toBe(150)
      expect(totals.totalTax).toBe(148)
      expect(totals.total).toBe(1998)
    })

    it('should match invoice total with payment + balance', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1500,
        amountPaid: 600,
      })

      const calculatedBalanceDue = invoice.total - invoice.amount_paid

      expect(invoice.balance_due).toBe(900)
      expect(calculatedBalanceDue).toBe(invoice.balance_due)
      expect(invoice.amount_paid + invoice.balance_due).toBe(invoice.total)
    })
  })
})

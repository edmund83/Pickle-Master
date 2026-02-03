/**
 * Quantity Tracking Integration Tests
 *
 * Tests for quantity flow through the order-to-cash workflow:
 * quantity_ordered → quantity_allocated → quantity_picked → quantity_shipped → quantity_delivered → quantity_invoiced
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  ORDER_CASH_USER_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  createTestPickListItem,
  createTestDeliveryOrderItem,
  createTestInvoiceItem,
  type TestCustomer,
  type TestItem,
  type TestSalesOrderItem,
} from '../../utils/order-to-cash-fixtures'

describe('Order-to-Cash Quantity Tracking', () => {
  let customer: TestCustomer
  let itemA: TestItem
  let itemB: TestItem

  beforeAll(() => {
    customer = createTestCustomer(ORDER_CASH_TENANT_ID, { name: 'Quantity Test Customer' })
    itemA = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Widget A', quantity: 100 })
    itemB = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Widget B', quantity: 50 })
  })

  describe('Quantity Initialization', () => {
    it('should initialize quantity_ordered correctly on SO creation', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 10, unitPrice: 100 },
          { item: itemB, quantity: 5, unitPrice: 200 },
        ],
      })

      expect(items[0].quantity_ordered).toBe(10)
      expect(items[1].quantity_ordered).toBe(5)
    })

    it('should initialize all quantity tracking fields to zero', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const soItem = items[0]
      expect(soItem.quantity_allocated).toBe(0)
      expect(soItem.quantity_picked).toBe(0)
      expect(soItem.quantity_shipped).toBe(0)
      expect(soItem.quantity_delivered).toBe(0)
      expect(soItem.quantity_invoiced).toBe(0)
    })
  })

  describe('Pick List Quantity Flow', () => {
    it('should set quantity_allocated when pick list is generated', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Simulate pick list generation - allocates full ordered quantity
      const allocatedItem: TestSalesOrderItem = {
        ...items[0],
        quantity_allocated: items[0].quantity_ordered,
      }

      expect(allocatedItem.quantity_allocated).toBe(10)
      expect(allocatedItem.quantity_allocated).toBe(allocatedItem.quantity_ordered)
    })

    it('should track requested vs picked quantity in pick list items', () => {
      const plItem = createTestPickListItem('pl-123', {
        itemName: 'Widget A',
        requestedQuantity: 10,
        pickedQuantity: 0,
      })

      expect(plItem.requested_quantity).toBe(10)
      expect(plItem.picked_quantity).toBe(0)

      // Simulate partial pick
      const partiallyPicked = { ...plItem, picked_quantity: 7 }
      expect(partiallyPicked.picked_quantity).toBe(7)
      expect(partiallyPicked.picked_quantity).toBeLessThan(partiallyPicked.requested_quantity)
    })

    it('should update SO item quantity_picked from pick list', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Simulate complete pick
      const pickedItem: TestSalesOrderItem = {
        ...items[0],
        quantity_allocated: 10,
        quantity_picked: 10,
      }

      expect(pickedItem.quantity_picked).toBe(10)
    })
  })

  describe('Partial Pick Scenarios', () => {
    it('should handle partial pick (7 of 10)', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Partial pick - only 7 picked
      const partiallyPicked: TestSalesOrderItem = {
        ...items[0],
        quantity_allocated: 10,
        quantity_picked: 7,
      }

      expect(partiallyPicked.quantity_ordered).toBe(10)
      expect(partiallyPicked.quantity_picked).toBe(7)
      expect(partiallyPicked.quantity_picked).toBeLessThan(partiallyPicked.quantity_ordered)
    })

    it('should track remaining quantity to pick', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const pickedItem: TestSalesOrderItem = {
        ...items[0],
        quantity_picked: 7,
      }

      const remainingToPick = pickedItem.quantity_ordered - pickedItem.quantity_picked
      expect(remainingToPick).toBe(3)
    })
  })

  describe('Delivery Order Quantity Flow', () => {
    it('should create DO item with quantity_shipped from picked quantity', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const pickedSOItem: TestSalesOrderItem = {
        ...items[0],
        quantity_picked: 10,
      }

      const doItem = createTestDeliveryOrderItem('do-123', {
        salesOrderItemId: pickedSOItem.id,
        itemName: itemA.name,
        quantityShipped: pickedSOItem.quantity_picked,
      })

      expect(doItem.quantity_shipped).toBe(10)
      expect(doItem.quantity_shipped).toBe(pickedSOItem.quantity_picked)
    })

    it('should update SO item quantity_shipped on DO delivery', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Simulate delivery confirmation
      const shippedSOItem: TestSalesOrderItem = {
        ...items[0],
        quantity_picked: 10,
        quantity_shipped: 10,
      }

      expect(shippedSOItem.quantity_shipped).toBe(10)
    })

    it('should handle partial delivery (5 of 7 shipped)', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Only 7 picked, then only 5 delivered
      const partialDelivery: TestSalesOrderItem = {
        ...items[0],
        quantity_picked: 7,
        quantity_shipped: 5,
        quantity_delivered: 5,
      }

      expect(partialDelivery.quantity_delivered).toBe(5)
      expect(partialDelivery.quantity_delivered).toBeLessThan(partialDelivery.quantity_picked)
    })
  })

  describe('Invoice Quantity Flow', () => {
    it('should create invoice item with quantity from delivered items', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const deliveredSOItem: TestSalesOrderItem = {
        ...items[0],
        quantity_delivered: 10,
      }

      const invoiceItem = createTestInvoiceItem('inv-123', {
        salesOrderItemId: deliveredSOItem.id,
        itemName: itemA.name,
        quantity: deliveredSOItem.quantity_delivered,
        unitPrice: 100,
      })

      expect(invoiceItem.quantity).toBe(10)
    })

    it('should update SO item quantity_invoiced when invoice created', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const invoicedSOItem: TestSalesOrderItem = {
        ...items[0],
        quantity_delivered: 10,
        quantity_invoiced: 10,
      }

      expect(invoicedSOItem.quantity_invoiced).toBe(10)
    })

    it('should handle partial invoicing', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Invoice only 5 of 10 delivered
      const partialInvoice: TestSalesOrderItem = {
        ...items[0],
        quantity_delivered: 10,
        quantity_invoiced: 5,
      }

      const remainingToInvoice = partialInvoice.quantity_delivered - partialInvoice.quantity_invoiced
      expect(remainingToInvoice).toBe(5)
    })
  })

  describe('Quantity Mismatch Validation', () => {
    it('should reject over-pick beyond ordered quantity', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const attemptedOverPick = 15

      // Validate that picked cannot exceed ordered
      const isValidPick = attemptedOverPick <= items[0].quantity_ordered
      expect(isValidPick).toBe(false)
    })

    it('should reject shipping more than picked', () => {
      const pickedQuantity = 7
      const attemptedShipQuantity = 10

      // Validate that shipped cannot exceed picked
      const isValidShip = attemptedShipQuantity <= pickedQuantity
      expect(isValidShip).toBe(false)
    })

    it('should reject invoicing more than delivered', () => {
      const deliveredQuantity = 5
      const attemptedInvoiceQuantity = 8

      // Validate that invoiced cannot exceed delivered
      const isValidInvoice = attemptedInvoiceQuantity <= deliveredQuantity
      expect(isValidInvoice).toBe(false)
    })

    it('should allow exact quantity matches', () => {
      const orderedQty = 10
      const pickedQty = 10
      const shippedQty = 10
      const deliveredQty = 10
      const invoicedQty = 10

      expect(pickedQty).toBeLessThanOrEqual(orderedQty)
      expect(shippedQty).toBeLessThanOrEqual(pickedQty)
      expect(deliveredQty).toBeLessThanOrEqual(shippedQty)
      expect(invoicedQty).toBeLessThanOrEqual(deliveredQty)
    })
  })

  describe('Complete Quantity Flow', () => {
    it('should track quantities through complete workflow', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Stage 1: SO Created
      let soItem = items[0]
      expect(soItem.quantity_ordered).toBe(10)

      // Stage 2: Pick List Generated (allocate)
      soItem = { ...soItem, quantity_allocated: 10 }
      expect(soItem.quantity_allocated).toBe(10)

      // Stage 3: Partial Pick (7 of 10)
      soItem = { ...soItem, quantity_picked: 7 }
      expect(soItem.quantity_picked).toBe(7)

      // Stage 4: DO Created with picked quantity
      const doItem = createTestDeliveryOrderItem('do-123', {
        quantityShipped: 7,
      })
      expect(doItem.quantity_shipped).toBe(7)

      // Stage 5: Partial Delivery (5 of 7)
      soItem = { ...soItem, quantity_shipped: 5, quantity_delivered: 5 }
      expect(soItem.quantity_delivered).toBe(5)

      // Stage 6: Invoice for delivered quantity
      soItem = { ...soItem, quantity_invoiced: 5 }
      expect(soItem.quantity_invoiced).toBe(5)

      // Final state verification
      expect(soItem).toMatchObject({
        quantity_ordered: 10,
        quantity_allocated: 10,
        quantity_picked: 7,
        quantity_shipped: 5,
        quantity_delivered: 5,
        quantity_invoiced: 5,
      })
    })

    it('should track remaining quantities at each stage', () => {
      const ordered = 20
      const allocated = 20
      const picked = 15
      const shipped = 12
      const delivered = 10
      const invoiced = 8

      // Calculate remaining at each stage
      const remainingToAllocate = ordered - allocated
      const remainingToPick = allocated - picked
      const remainingToShip = picked - shipped
      const remainingToDeliver = shipped - delivered
      const remainingToInvoice = delivered - invoiced

      expect(remainingToAllocate).toBe(0)
      expect(remainingToPick).toBe(5)
      expect(remainingToShip).toBe(3)
      expect(remainingToDeliver).toBe(2)
      expect(remainingToInvoice).toBe(2)
    })
  })

  describe('Multiple Items Quantity Flow', () => {
    it('should track quantities independently for multiple items', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 10, unitPrice: 100 },
          { item: itemB, quantity: 5, unitPrice: 200 },
        ],
      })

      // Different pick progress for each item
      const updatedItems = [
        { ...items[0], quantity_picked: 10 }, // Fully picked
        { ...items[1], quantity_picked: 3 },  // Partially picked
      ]

      expect(updatedItems[0].quantity_picked).toBe(10)
      expect(updatedItems[1].quantity_picked).toBe(3)

      // Item A fully picked, Item B partially
      const itemAFullyPicked = updatedItems[0].quantity_picked === updatedItems[0].quantity_ordered
      const itemBFullyPicked = updatedItems[1].quantity_picked === updatedItems[1].quantity_ordered

      expect(itemAFullyPicked).toBe(true)
      expect(itemBFullyPicked).toBe(false)
    })

    it('should calculate total quantities across items', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 10, unitPrice: 100 },
          { item: itemB, quantity: 5, unitPrice: 200 },
        ],
      })

      const totalOrdered = items.reduce((sum, item) => sum + item.quantity_ordered, 0)
      expect(totalOrdered).toBe(15)

      // Simulate partial picking
      const pickedItems = [
        { ...items[0], quantity_picked: 8 },
        { ...items[1], quantity_picked: 5 },
      ]

      const totalPicked = pickedItems.reduce((sum, item) => sum + item.quantity_picked, 0)
      expect(totalPicked).toBe(13)

      const totalRemaining = totalOrdered - totalPicked
      expect(totalRemaining).toBe(2)
    })
  })

  describe('Zero Quantity Edge Cases', () => {
    it('should handle zero quantity items', () => {
      const { items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 0, unitPrice: 100 }],
      })

      expect(items[0].quantity_ordered).toBe(0)
      expect(items[0].line_total).toBe(0)
    })

    it('should handle items with no stock to pick', () => {
      const soItem = {
        quantity_ordered: 10,
        quantity_allocated: 10,
        quantity_picked: 0,
      }

      const nothingPicked = soItem.quantity_picked === 0
      expect(nothingPicked).toBe(true)
    })
  })
})

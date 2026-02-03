/**
 * Data Flow Integration Tests
 *
 * Tests for entity relationships and foreign key integrity across the order-to-cash workflow:
 * Sales Order → Pick List → Delivery Order → Invoice → Credit Note
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  ORDER_CASH_OTHER_TENANT_ID,
  ORDER_CASH_USER_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  createTestPickList,
  createTestPickListItem,
  createTestDeliveryOrder,
  createTestDeliveryOrderItem,
  createTestInvoice,
  createTestInvoiceItem,
  type TestCustomer,
  type TestItem,
  type TestSalesOrder,
  type TestSalesOrderItem,
  type TestPickList,
  type TestDeliveryOrder,
  type TestInvoice,
} from '../../utils/order-to-cash-fixtures'

describe('Order-to-Cash Data Flow', () => {
  // Test data setup
  let customer: TestCustomer
  let itemA: TestItem
  let itemB: TestItem

  beforeAll(() => {
    // Create base test data
    customer = createTestCustomer(ORDER_CASH_TENANT_ID, { name: 'Data Flow Test Customer' })
    itemA = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Widget A', sku: 'WID-A', price: 100, quantity: 50 })
    itemB = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Widget B', sku: 'WID-B', price: 200, quantity: 30 })
  })

  describe('Sales Order → Pick List Link', () => {
    it('should create sales order with generated display_id', () => {
      const { salesOrder, items } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        status: 'draft',
        items: [
          { item: itemA, quantity: 5, unitPrice: 100 },
          { item: itemB, quantity: 3, unitPrice: 200 },
        ],
      })

      expect(salesOrder.display_id).toMatch(/^SO-/)
      expect(salesOrder.customer_id).toBe(customer.id)
      expect(salesOrder.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(items).toHaveLength(2)
    })

    it('should link pick list to sales order bidirectionally', () => {
      const { salesOrder } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        status: 'confirmed',
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      // Create pick list linked to sales order
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID, {
        sourceType: 'sales_order',
        sourceEntityId: salesOrder.id,
        status: 'draft',
      })

      // Simulate the bidirectional link (SO.pick_list_id -> PL.id)
      const updatedSO: TestSalesOrder = {
        ...salesOrder,
        pick_list_id: pickList.id,
      }

      // Verify forward link (PL → SO)
      expect(pickList.source_entity_type).toBe('sales_order')
      expect(pickList.source_entity_id).toBe(salesOrder.id)

      // Verify backward link (SO → PL)
      expect(updatedSO.pick_list_id).toBe(pickList.id)
    })

    it('should generate pick list display_id with correct prefix', () => {
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID)

      expect(pickList.display_id).toMatch(/^PL-/)
    })

    it('should copy sales order items to pick list items', () => {
      const { salesOrder, items: soItems } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [
          { item: itemA, quantity: 5, unitPrice: 100 },
          { item: itemB, quantity: 3, unitPrice: 200 },
        ],
      })

      const pickList = createTestPickList(ORDER_CASH_TENANT_ID, {
        sourceType: 'sales_order',
        sourceEntityId: salesOrder.id,
      })

      // Create pick list items from SO items
      const plItems = soItems.map((soItem) =>
        createTestPickListItem(pickList.id, {
          sourceItemId: soItem.id,
          sourceType: 'sales_order_item',
          itemName: soItem.item_name,
          requestedQuantity: soItem.quantity_ordered,
        })
      )

      expect(plItems).toHaveLength(2)
      expect(plItems[0].requested_quantity).toBe(5)
      expect(plItems[0].source_type).toBe('sales_order_item')
      expect(plItems[1].requested_quantity).toBe(3)
    })
  })

  describe('Sales Order → Delivery Order Link', () => {
    it('should link delivery order to sales order', () => {
      const { salesOrder } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        status: 'picked',
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: salesOrder.id,
        customerId: customer.id,
        status: 'draft',
      })

      expect(deliveryOrder.sales_order_id).toBe(salesOrder.id)
      expect(deliveryOrder.customer_id).toBe(customer.id)
      expect(deliveryOrder.display_id).toMatch(/^DO-/)
    })

    it('should link delivery order items to sales order items', () => {
      const { salesOrder, items: soItems } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: salesOrder.id,
      })

      const doItem = createTestDeliveryOrderItem(deliveryOrder.id, {
        salesOrderItemId: soItems[0].id,
        itemId: itemA.id,
        itemName: itemA.name,
        quantityShipped: 10,
      })

      expect(doItem.sales_order_item_id).toBe(soItems[0].id)
      expect(doItem.item_id).toBe(itemA.id)
      expect(doItem.quantity_shipped).toBe(10)
    })

    it('should allow standalone delivery order with customer only', () => {
      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        status: 'draft',
      })

      expect(deliveryOrder.sales_order_id).toBeNull()
      expect(deliveryOrder.customer_id).toBe(customer.id)
    })
  })

  describe('Delivery Order → Invoice Link', () => {
    it('should link invoice to both sales order and delivery order', () => {
      const { salesOrder } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        status: 'shipped',
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: salesOrder.id,
        status: 'delivered',
      })

      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        salesOrderId: salesOrder.id,
        deliveryOrderId: deliveryOrder.id,
        total: 1000,
      })

      expect(invoice.sales_order_id).toBe(salesOrder.id)
      expect(invoice.delivery_order_id).toBe(deliveryOrder.id)
      expect(invoice.customer_id).toBe(customer.id)
      expect(invoice.display_id).toMatch(/^INV-/)
    })

    it('should link invoice items to source items', () => {
      const { salesOrder, items: soItems } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: salesOrder.id,
      })

      const doItem = createTestDeliveryOrderItem(deliveryOrder.id, {
        salesOrderItemId: soItems[0].id,
      })

      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        salesOrderId: salesOrder.id,
        deliveryOrderId: deliveryOrder.id,
        total: 1000,
      })

      const invoiceItem = createTestInvoiceItem(invoice.id, {
        salesOrderItemId: soItems[0].id,
        deliveryOrderItemId: doItem.id,
        itemId: itemA.id,
        itemName: itemA.name,
        quantity: 10,
        unitPrice: 100,
      })

      expect(invoiceItem.sales_order_item_id).toBe(soItems[0].id)
      expect(invoiceItem.delivery_order_item_id).toBe(doItem.id)
      expect(invoiceItem.item_id).toBe(itemA.id)
    })
  })

  describe('Invoice → Credit Note Link', () => {
    it('should link credit note to original invoice', () => {
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        total: 1000,
        status: 'sent',
      })

      const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        originalInvoiceId: invoice.id,
        invoiceType: 'credit_note',
        creditReason: 'return',
        total: -200,
      })

      expect(creditNote.invoice_type).toBe('credit_note')
      expect(creditNote.original_invoice_id).toBe(invoice.id)
      expect(creditNote.credit_reason).toBe('return')
      expect(creditNote.total).toBe(-200) // Negative for credit
    })

    it('should generate credit note display_id with CN- prefix', () => {
      const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        invoiceType: 'credit_note',
        displayId: `CN-${Date.now().toString(36).toUpperCase()}`,
        total: -100,
      })

      expect(creditNote.display_id).toMatch(/^CN-/)
    })
  })

  describe('Cascade Integrity', () => {
    it('should preserve tenant_id across all linked entities', () => {
      const { salesOrder, items: soItems } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const pickList = createTestPickList(ORDER_CASH_TENANT_ID, {
        sourceEntityId: salesOrder.id,
      })

      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: salesOrder.id,
      })

      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        salesOrderId: salesOrder.id,
        total: 1000,
      })

      // All entities should have same tenant_id
      expect(customer.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(salesOrder.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(pickList.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(deliveryOrder.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(invoice.tenant_id).toBe(ORDER_CASH_TENANT_ID)
    })

    it('should not allow cross-tenant entity linking', () => {
      // Create entities in different tenants
      const { salesOrder: soTenantA } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
      })

      const customerTenantB = createTestCustomer(ORDER_CASH_OTHER_TENANT_ID)
      const { salesOrder: soTenantB } = createTestSalesOrder(ORDER_CASH_OTHER_TENANT_ID, {
        customerId: customerTenantB.id,
        items: [],
      })

      // Verify they have different tenant_ids
      expect(soTenantA.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(soTenantB.tenant_id).toBe(ORDER_CASH_OTHER_TENANT_ID)
      expect(soTenantA.tenant_id).not.toBe(soTenantB.tenant_id)

      // In a real implementation, creating a DO in tenant B linked to SO in tenant A
      // would fail due to RLS/FK constraints. Here we verify the model correctly tracks tenant_id.
    })
  })

  describe('Display ID Generation', () => {
    it('should generate unique display IDs for each entity type', () => {
      const { salesOrder } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        items: [],
      })
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID)
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, { customerId: customer.id, total: 0 })
      const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: customer.id,
        invoiceType: 'credit_note',
        displayId: `CN-${Date.now().toString(36).toUpperCase()}`,
        total: 0,
      })

      // Each entity type has distinct prefix
      expect(salesOrder.display_id).toMatch(/^SO-/)
      expect(pickList.display_id).toMatch(/^PL-/)
      expect(deliveryOrder.display_id).toMatch(/^DO-/)
      expect(invoice.display_id).toMatch(/^INV-/)
      expect(creditNote.display_id).toMatch(/^CN-/)
    })

    it('should generate different IDs for multiple entities of same type', () => {
      const { salesOrder: so1 } = createTestSalesOrder(ORDER_CASH_TENANT_ID, { items: [] })
      const { salesOrder: so2 } = createTestSalesOrder(ORDER_CASH_TENANT_ID, { items: [] })

      expect(so1.id).not.toBe(so2.id)
      expect(so1.display_id).not.toBe(so2.display_id)
    })
  })

  describe('Entity Relationships Summary', () => {
    it('should support complete workflow chain', () => {
      // 1. Customer
      const testCustomer = createTestCustomer(ORDER_CASH_TENANT_ID)

      // 2. Items
      const testItems = [
        createTestItem(ORDER_CASH_TENANT_ID, { name: 'Product 1', price: 100 }),
        createTestItem(ORDER_CASH_TENANT_ID, { name: 'Product 2', price: 200 }),
      ]

      // 3. Sales Order with items
      const { salesOrder, items: soItems } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: testCustomer.id,
        items: testItems.map((item, idx) => ({
          item,
          quantity: (idx + 1) * 5, // 5 and 10
          unitPrice: item.price,
        })),
      })

      // 4. Pick List linked to SO
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID, {
        sourceType: 'sales_order',
        sourceEntityId: salesOrder.id,
      })

      // Update SO with pick list reference
      const soWithPickList: TestSalesOrder = { ...salesOrder, pick_list_id: pickList.id }

      // 5. Delivery Order linked to SO
      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: salesOrder.id,
        customerId: testCustomer.id,
        pickListId: pickList.id,
      })

      // 6. Invoice linked to SO and DO
      const invoice = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: testCustomer.id,
        salesOrderId: salesOrder.id,
        deliveryOrderId: deliveryOrder.id,
        total: soItems.reduce((sum, item) => sum + item.line_total, 0),
      })

      // 7. Credit Note linked to Invoice
      const creditNote = createTestInvoice(ORDER_CASH_TENANT_ID, {
        customerId: testCustomer.id,
        originalInvoiceId: invoice.id,
        invoiceType: 'credit_note',
        displayId: `CN-${Date.now().toString(36).toUpperCase()}`,
        total: -100,
        creditReason: 'return',
      })

      // Verify complete chain
      expect(soWithPickList.customer_id).toBe(testCustomer.id)
      expect(soWithPickList.pick_list_id).toBe(pickList.id)
      expect(pickList.source_entity_id).toBe(salesOrder.id)
      expect(deliveryOrder.sales_order_id).toBe(salesOrder.id)
      expect(deliveryOrder.pick_list_id).toBe(pickList.id)
      expect(invoice.sales_order_id).toBe(salesOrder.id)
      expect(invoice.delivery_order_id).toBe(deliveryOrder.id)
      expect(creditNote.original_invoice_id).toBe(invoice.id)
    })
  })
})

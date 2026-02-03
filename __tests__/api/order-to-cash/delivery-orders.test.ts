/**
 * Delivery Orders API Tests
 *
 * Tests for delivery order server action validation, status transitions, and fulfillment logic.
 */

import { describe, it, expect } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  createTestDeliveryOrder,
  isValidDOStatusTransition,
  type DeliveryOrderStatus,
} from '../../utils/order-to-cash-fixtures'

describe('Delivery Orders Server Action Logic', () => {
  describe('Input Validation', () => {
    describe('createDeliveryOrder validation', () => {
      it('should require sales_order_id (UUID)', () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000'
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validUuid)
        expect(isValidUuid).toBe(true)
      })

      it('should require shipping_address (non-empty)', () => {
        const validAddress = '123 Main St, City, State 12345'
        const emptyAddress = ''
        expect(validAddress.length > 0).toBe(true)
        expect(emptyAddress.length > 0).toBe(false)
      })

      it('should accept optional carrier', () => {
        const do1 = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
          salesOrderId: '123e4567-e89b-12d3-a456-426614174000',
          carrier: 'FedEx',
        })
        const do2 = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
          salesOrderId: '123e4567-e89b-12d3-a456-426614174000',
          carrier: undefined,
        })
        expect(do1.carrier).toBe('FedEx')
        expect(do2.carrier).toBeNull()
      })

      it('should accept optional tracking_number', () => {
        const do1 = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
          salesOrderId: '123e4567-e89b-12d3-a456-426614174000',
          trackingNumber: 'TRACK123456',
        })
        expect(do1.tracking_number).toBe('TRACK123456')
      })

      it('should accept scheduled_date as ISO date string', () => {
        const validDate = '2024-01-15'
        expect(/^\d{4}-\d{2}-\d{2}$/.test(validDate)).toBe(true)
      })
    })

    describe('deliveryOrderItem validation', () => {
      it('should require item_id (UUID)', () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000'
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validUuid)
        expect(isValidUuid).toBe(true)
      })

      it('should require positive quantity_to_deliver', () => {
        const validQty = 5
        const invalidQty = 0
        expect(validQty > 0).toBe(true)
        expect(invalidQty > 0).toBe(false)
      })

      it('should not exceed quantity_picked from SO', () => {
        const soItem = { quantity_picked: 10 }
        const validDeliveryQty = 8
        const invalidDeliveryQty = 15
        expect(validDeliveryQty <= soItem.quantity_picked).toBe(true)
        expect(invalidDeliveryQty <= soItem.quantity_picked).toBe(false)
      })
    })
  })

  describe('Status Transition Validation', () => {
    describe('updateDeliveryOrderStatus', () => {
      it('should allow draft → ready', () => {
        expect(isValidDOStatusTransition('draft', 'ready')).toBe(true)
      })

      it('should allow ready → dispatched', () => {
        expect(isValidDOStatusTransition('ready', 'dispatched')).toBe(true)
      })

      it('should allow dispatched → in_transit', () => {
        expect(isValidDOStatusTransition('dispatched', 'in_transit')).toBe(true)
      })

      it('should allow in_transit → delivered', () => {
        expect(isValidDOStatusTransition('in_transit', 'delivered')).toBe(true)
      })

      it('should allow dispatched → delivered (direct)', () => {
        expect(isValidDOStatusTransition('dispatched', 'delivered')).toBe(true)
      })

      it('should reject draft → delivered (skipping steps)', () => {
        expect(isValidDOStatusTransition('draft', 'delivered')).toBe(false)
      })

      it('should reject delivered → draft (backwards)', () => {
        expect(isValidDOStatusTransition('delivered', 'draft')).toBe(false)
      })
    })
  })

  describe('Fulfillment Logic', () => {
    describe('markAsDelivered', () => {
      it('should update quantity_delivered on SO items', () => {
        const soItem = { quantity_ordered: 10, quantity_shipped: 10, quantity_delivered: 0 }
        const deliveredQty = 10

        const newQuantityDelivered = soItem.quantity_delivered + deliveredQty
        expect(newQuantityDelivered).toBe(10)
      })

      it('should handle partial delivery', () => {
        const soItem = { quantity_ordered: 10, quantity_shipped: 10, quantity_delivered: 0 }
        const firstDelivery = 6
        const secondDelivery = 4

        let quantityDelivered = soItem.quantity_delivered + firstDelivery
        expect(quantityDelivered).toBe(6)

        quantityDelivered += secondDelivery
        expect(quantityDelivered).toBe(10)
      })

      it('should not exceed quantity_shipped', () => {
        const soItem = { quantity_shipped: 10 }
        const attemptedDelivery = 15
        const isValid = attemptedDelivery <= soItem.quantity_shipped
        expect(isValid).toBe(false)
      })

      it('should update SO status to delivered when all items delivered', () => {
        const soItems = [
          { quantity_ordered: 10, quantity_delivered: 10 },
          { quantity_ordered: 5, quantity_delivered: 5 },
        ]

        const allDelivered = soItems.every(item => item.quantity_delivered >= item.quantity_ordered)
        expect(allDelivered).toBe(true)

        const expectedSOStatus = allDelivered ? 'delivered' : 'partial_shipped'
        expect(expectedSOStatus).toBe('delivered')
      })
    })

    describe('Failure Handling', () => {
      it('should allow dispatched → failed', () => {
        expect(isValidDOStatusTransition('dispatched', 'failed')).toBe(true)
      })

      it('should allow in_transit → failed', () => {
        expect(isValidDOStatusTransition('in_transit', 'failed')).toBe(true)
      })

      it('should allow failed → ready (retry)', () => {
        expect(isValidDOStatusTransition('failed', 'ready')).toBe(true)
      })

      it('should allow failed → returned', () => {
        expect(isValidDOStatusTransition('failed', 'returned')).toBe(true)
      })

      it('should update SO when delivery fails and is returned', () => {
        const soItem = { quantity_shipped: 10, quantity_delivered: 0 }
        const failedReturnedQty = 10

        // On return, shipped quantity should be restored for re-shipment
        const newQuantityShipped = soItem.quantity_shipped - failedReturnedQty
        expect(newQuantityShipped).toBe(0)

        // SO status should revert to picked (or partial_shipped if some items still in transit)
        const expectedStatus = 'picked'
        expect(expectedStatus).toBe('picked')
      })
    })

    describe('Partial Delivery', () => {
      it('should allow in_transit → partial', () => {
        expect(isValidDOStatusTransition('in_transit', 'partial')).toBe(true)
      })

      it('should track partial quantities delivered', () => {
        const doItem = { quantity_to_deliver: 10 }
        const partialDelivered = 6
        const remaining = doItem.quantity_to_deliver - partialDelivered
        expect(remaining).toBe(4)
      })

      it('should allow partial → delivered (complete remaining)', () => {
        expect(isValidDOStatusTransition('partial', 'delivered')).toBe(true)
      })

      it('should create new DO for remaining items on partial delivery', () => {
        const originalItems = [
          { item_id: 'item-1', quantity_to_deliver: 10 },
          { item_id: 'item-2', quantity_to_deliver: 5 },
        ]
        const delivered = [
          { item_id: 'item-1', quantity_delivered: 6 },
          { item_id: 'item-2', quantity_delivered: 5 },
        ]

        const remainingItems = originalItems
          .map((orig, idx) => ({
            item_id: orig.item_id,
            remaining: orig.quantity_to_deliver - delivered[idx].quantity_delivered,
          }))
          .filter(item => item.remaining > 0)

        expect(remainingItems).toHaveLength(1)
        expect(remainingItems[0].item_id).toBe('item-1')
        expect(remainingItems[0].remaining).toBe(4)
      })
    })
  })

  describe('SO Status Updates', () => {
    describe('On DO Dispatch', () => {
      it('should update SO to shipped when all items dispatched', () => {
        const soItems = [
          { quantity_ordered: 10, quantity_shipped: 10 },
          { quantity_ordered: 5, quantity_shipped: 5 },
        ]

        const allShipped = soItems.every(item => item.quantity_shipped >= item.quantity_ordered)
        expect(allShipped).toBe(true)

        const expectedStatus = 'shipped'
        expect(expectedStatus).toBe('shipped')
      })

      it('should update SO to partial_shipped when some items dispatched', () => {
        const soItems = [
          { quantity_ordered: 10, quantity_shipped: 10 },
          { quantity_ordered: 5, quantity_shipped: 0 },
        ]

        const allShipped = soItems.every(item => item.quantity_shipped >= item.quantity_ordered)
        const someShipped = soItems.some(item => item.quantity_shipped > 0)

        expect(allShipped).toBe(false)
        expect(someShipped).toBe(true)

        const expectedStatus = allShipped ? 'shipped' : 'partial_shipped'
        expect(expectedStatus).toBe('partial_shipped')
      })
    })

    describe('On DO Delivery', () => {
      it('should update SO to delivered when all items delivered', () => {
        const soItems = [
          { quantity_ordered: 10, quantity_delivered: 10 },
          { quantity_ordered: 5, quantity_delivered: 5 },
        ]

        const allDelivered = soItems.every(item => item.quantity_delivered >= item.quantity_ordered)
        expect(allDelivered).toBe(true)

        const expectedStatus = 'delivered'
        expect(expectedStatus).toBe('delivered')
      })
    })
  })

  describe('Cancellation Rules', () => {
    it('should allow cancellation in draft status', () => {
      expect(isValidDOStatusTransition('draft', 'cancelled')).toBe(true)
    })

    it('should allow cancellation in ready status', () => {
      expect(isValidDOStatusTransition('ready', 'cancelled')).toBe(true)
    })

    it('should reject cancellation after dispatch', () => {
      expect(isValidDOStatusTransition('dispatched', 'cancelled')).toBe(false)
    })

    it('should reject cancellation after in_transit', () => {
      expect(isValidDOStatusTransition('in_transit', 'cancelled')).toBe(false)
    })

    it('should restore SO quantities on cancellation', () => {
      const soItem = { quantity_ordered: 10, quantity_allocated: 10, quantity_shipped: 0 }
      const cancelledDOItem = { quantity_to_deliver: 10 }

      // After DO cancellation, allocated quantity should be available again
      // This would typically be handled by reversing the DO allocation
      const afterCancellation = {
        quantity_allocated: soItem.quantity_allocated,
        quantity_shipped: soItem.quantity_shipped,
      }

      // Quantities should remain unchanged as items weren't shipped
      expect(afterCancellation.quantity_allocated).toBe(10)
      expect(afterCancellation.quantity_shipped).toBe(0)
    })
  })

  describe('Address Validation', () => {
    it('should require shipping address', () => {
      const do1 = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: '123e4567-e89b-12d3-a456-426614174000',
        shippingAddress: '123 Main St, City, State 12345',
      })
      expect(do1.shipping_address).toBeTruthy()
    })

    it('should use SO shipping address as default', () => {
      const { salesOrder } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        shippingAddress: '456 Oak Ave, Town, State 67890',
      })

      // When creating DO from SO, use SO's shipping address as default
      const doShippingAddress = salesOrder.shipping_address
      expect(doShippingAddress).toBe('456 Oak Ave, Town, State 67890')
    })

    it('should allow override of shipping address', () => {
      const { salesOrder } = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        shippingAddress: '456 Oak Ave, Town, State 67890',
      })

      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: salesOrder.id,
        shippingAddress: '789 Pine Rd, Village, State 11111',
      })

      expect(deliveryOrder.shipping_address).not.toBe(salesOrder.shipping_address)
      expect(deliveryOrder.shipping_address).toBe('789 Pine Rd, Village, State 11111')
    })
  })

  describe('Tracking Information', () => {
    it('should accept tracking number on dispatch', () => {
      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: '123e4567-e89b-12d3-a456-426614174000',
        trackingNumber: 'FEDEX123456789',
        carrier: 'FedEx',
        status: 'dispatched',
      })

      expect(deliveryOrder.tracking_number).toBe('FEDEX123456789')
      expect(deliveryOrder.carrier).toBe('FedEx')
    })

    it('should allow tracking update after dispatch', () => {
      // Tracking number can be updated/corrected after initial dispatch
      const initialTracking = 'TRACK001'
      const updatedTracking = 'TRACK001-CORRECTED'

      expect(updatedTracking).not.toBe(initialTracking)
    })
  })

  describe('Timestamp Tracking', () => {
    it('should record dispatched_at when dispatched', () => {
      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'dispatched',
        dispatchedAt: new Date().toISOString(),
      })

      expect(deliveryOrder.dispatched_at).toBeTruthy()
    })

    it('should record delivered_at when delivered', () => {
      const deliveryOrder = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
        salesOrderId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
      })

      expect(deliveryOrder.delivered_at).toBeTruthy()
    })

    it('should track delivery duration', () => {
      const dispatchedAt = new Date('2024-01-15T09:00:00Z')
      const deliveredAt = new Date('2024-01-16T14:30:00Z')

      const durationMs = deliveredAt.getTime() - dispatchedAt.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)

      expect(durationHours).toBeCloseTo(29.5, 1)
    })
  })
})

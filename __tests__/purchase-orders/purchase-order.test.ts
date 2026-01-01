import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Purchase Order Tests
 *
 * Tests for purchase order functionality:
 * - Create vendor
 * - Create purchase order
 * - Add/remove line items
 * - Update PO status
 */

interface Vendor {
  id: string
  tenant_id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
}

interface PurchaseOrder {
  id: string
  tenant_id: string
  display_id: string
  vendor_id: string | null
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  ship_to_name: string | null
  ship_to_address: string | null
  bill_to_name: string | null
  bill_to_address: string | null
  expected_date: string | null
  notes: string | null
  created_at: string
}

interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  item_id: string
  item_name: string
  quantity: number
  unit_price: number
  received_quantity: number
}

// Generate display ID
function generateDisplayId(prefix: string, tenantCode: string, sequence: number): string {
  return `${prefix}-${tenantCode}-${String(sequence).padStart(5, '0')}`
}

// Create vendor
function createVendor(params: {
  tenantId: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}): Vendor {
  return {
    id: `vendor-${Date.now()}`,
    tenant_id: params.tenantId,
    name: params.name,
    contact_name: params.contactName ?? null,
    email: params.email ?? null,
    phone: params.phone ?? null,
    address: params.address ?? null,
    notes: params.notes ?? null,
    created_at: new Date().toISOString(),
  }
}

// Create purchase order
function createPurchaseOrder(params: {
  tenantId: string
  vendorId?: string
  shipToName?: string
  shipToAddress?: string
  billToName?: string
  billToAddress?: string
  expectedDate?: string
  notes?: string
  sequence: number
}): PurchaseOrder {
  return {
    id: `po-${Date.now()}`,
    tenant_id: params.tenantId,
    display_id: generateDisplayId('PO', 'XXX', params.sequence),
    vendor_id: params.vendorId ?? null,
    status: 'draft',
    ship_to_name: params.shipToName ?? null,
    ship_to_address: params.shipToAddress ?? null,
    bill_to_name: params.billToName ?? null,
    bill_to_address: params.billToAddress ?? null,
    expected_date: params.expectedDate ?? null,
    notes: params.notes ?? null,
    created_at: new Date().toISOString(),
  }
}

// Add PO item
function addPurchaseOrderItem(
  poId: string,
  itemId: string,
  itemName: string,
  quantity: number,
  unitPrice: number
): PurchaseOrderItem {
  return {
    id: `poi-${Date.now()}`,
    purchase_order_id: poId,
    item_id: itemId,
    item_name: itemName,
    quantity,
    unit_price: unitPrice,
    received_quantity: 0,
  }
}

// Remove PO item
function removePurchaseOrderItem(
  items: PurchaseOrderItem[],
  itemId: string
): PurchaseOrderItem[] {
  return items.filter(i => i.id !== itemId)
}

// Update PO status
function updatePurchaseOrderStatus(
  po: PurchaseOrder,
  newStatus: PurchaseOrder['status']
): { success: boolean; purchaseOrder?: PurchaseOrder; error?: string } {
  const validTransitions: Record<string, string[]> = {
    draft: ['sent', 'cancelled'],
    sent: ['confirmed', 'cancelled'],
    confirmed: ['received', 'cancelled'],
    received: [],
    cancelled: [],
  }

  if (!validTransitions[po.status].includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${po.status} to ${newStatus}`
    }
  }

  return {
    success: true,
    purchaseOrder: { ...po, status: newStatus },
  }
}

// Cancel PO
function cancelPurchaseOrder(po: PurchaseOrder): PurchaseOrder {
  return { ...po, status: 'cancelled' }
}

describe('Purchase Orders', () => {
  describe('Vendors', () => {
    it('creates vendor with UUID', () => {
      const vendor = createVendor({
        tenantId: TEST_TENANT_ID,
        name: 'Acme Supplies',
      })

      expect(vendor.id).toBeDefined()
      expect(vendor.id).toMatch(/^vendor-/)
    })

    it('saves all vendor fields', () => {
      const vendor = createVendor({
        tenantId: TEST_TENANT_ID,
        name: 'Acme Supplies',
        contactName: 'John Smith',
        email: 'john@acme.com',
        phone: '123-456-7890',
        address: '123 Main St',
        notes: 'Preferred vendor',
      })

      expect(vendor.name).toBe('Acme Supplies')
      expect(vendor.contact_name).toBe('John Smith')
      expect(vendor.email).toBe('john@acme.com')
      expect(vendor.phone).toBe('123-456-7890')
      expect(vendor.address).toBe('123 Main St')
      expect(vendor.notes).toBe('Preferred vendor')
    })

    it('sets tenant_id correctly', () => {
      const vendor = createVendor({
        tenantId: TEST_TENANT_ID,
        name: 'Test Vendor',
      })

      expect(vendor.tenant_id).toBe(TEST_TENANT_ID)
    })

    it('handles optional fields as null', () => {
      const vendor = createVendor({
        tenantId: TEST_TENANT_ID,
        name: 'Minimal Vendor',
      })

      expect(vendor.contact_name).toBeNull()
      expect(vendor.email).toBeNull()
      expect(vendor.phone).toBeNull()
    })
  })

  describe('Create Purchase Order', () => {
    it('creates PO with display ID', () => {
      const po = createPurchaseOrder({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      expect(po.display_id).toBe('PO-XXX-00001')
    })

    it('creates with draft status', () => {
      const po = createPurchaseOrder({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      expect(po.status).toBe('draft')
    })

    it('associates with vendor', () => {
      const po = createPurchaseOrder({
        tenantId: TEST_TENANT_ID,
        vendorId: 'vendor-1',
        sequence: 1,
      })

      expect(po.vendor_id).toBe('vendor-1')
    })

    it('saves shipping address', () => {
      const po = createPurchaseOrder({
        tenantId: TEST_TENANT_ID,
        shipToName: 'Warehouse A',
        shipToAddress: '456 Warehouse Rd',
        sequence: 1,
      })

      expect(po.ship_to_name).toBe('Warehouse A')
      expect(po.ship_to_address).toBe('456 Warehouse Rd')
    })

    it('saves billing address', () => {
      const po = createPurchaseOrder({
        tenantId: TEST_TENANT_ID,
        billToName: 'Accounts Payable',
        billToAddress: '789 Finance Ave',
        sequence: 1,
      })

      expect(po.bill_to_name).toBe('Accounts Payable')
      expect(po.bill_to_address).toBe('789 Finance Ave')
    })

    it('increments display ID sequence', () => {
      const po1 = createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 })
      const po2 = createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 2 })
      const po3 = createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 100 })

      expect(po1.display_id).toBe('PO-XXX-00001')
      expect(po2.display_id).toBe('PO-XXX-00002')
      expect(po3.display_id).toBe('PO-XXX-00100')
    })
  })

  describe('Line Items', () => {
    it('adds line item to PO', () => {
      const item = addPurchaseOrderItem(
        'po-1',
        'item-1',
        'Laptop',
        10,
        1500
      )

      expect(item.purchase_order_id).toBe('po-1')
      expect(item.item_id).toBe('item-1')
      expect(item.quantity).toBe(10)
      expect(item.unit_price).toBe(1500)
    })

    it('initializes received_quantity to 0', () => {
      const item = addPurchaseOrderItem(
        'po-1',
        'item-1',
        'Laptop',
        10,
        1500
      )

      expect(item.received_quantity).toBe(0)
    })

    it('removes line item from list', () => {
      const item1: PurchaseOrderItem = {
        id: 'poi-1',
        purchase_order_id: 'po-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        quantity: 10,
        unit_price: 1500,
        received_quantity: 0,
      }
      const item2: PurchaseOrderItem = {
        id: 'poi-2',
        purchase_order_id: 'po-1',
        item_id: 'item-2',
        item_name: 'Mouse',
        quantity: 20,
        unit_price: 25,
        received_quantity: 0,
      }
      const items: PurchaseOrderItem[] = [item1, item2]

      const remaining = removePurchaseOrderItem(items, 'poi-1')

      expect(remaining.length).toBe(1)
      expect(remaining.find(i => i.id === 'poi-1')).toBeUndefined()
      expect(remaining[0].id).toBe('poi-2')
    })
  })

  describe('Status Updates', () => {
    it('allows draft to sent', () => {
      const po = createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 })
      const result = updatePurchaseOrderStatus(po, 'sent')

      expect(result.success).toBe(true)
      expect(result.purchaseOrder?.status).toBe('sent')
    })

    it('allows sent to confirmed', () => {
      const po: PurchaseOrder = {
        ...createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 }),
        status: 'sent',
      }
      const result = updatePurchaseOrderStatus(po, 'confirmed')

      expect(result.success).toBe(true)
      expect(result.purchaseOrder?.status).toBe('confirmed')
    })

    it('allows confirmed to received', () => {
      const po: PurchaseOrder = {
        ...createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 }),
        status: 'confirmed',
      }
      const result = updatePurchaseOrderStatus(po, 'received')

      expect(result.success).toBe(true)
      expect(result.purchaseOrder?.status).toBe('received')
    })

    it('allows cancellation from draft', () => {
      const po = createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 })
      const result = updatePurchaseOrderStatus(po, 'cancelled')

      expect(result.success).toBe(true)
      expect(result.purchaseOrder?.status).toBe('cancelled')
    })

    it('rejects invalid transition', () => {
      const po = createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 })
      const result = updatePurchaseOrderStatus(po, 'received')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot transition')
    })

    it('rejects transitions from received', () => {
      const po: PurchaseOrder = {
        ...createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 }),
        status: 'received',
      }
      const result = updatePurchaseOrderStatus(po, 'cancelled')

      expect(result.success).toBe(false)
    })

    it('cancels PO with cancelPurchaseOrder', () => {
      const po = createPurchaseOrder({ tenantId: TEST_TENANT_ID, sequence: 1 })
      const cancelled = cancelPurchaseOrder(po)

      expect(cancelled.status).toBe('cancelled')
    })
  })
})

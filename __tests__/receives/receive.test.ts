import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Receive Tests
 *
 * Tests for receiving inventory from purchase orders:
 * - Create receive
 * - Add receive items
 * - Complete receive
 */

interface Receive {
  id: string
  tenant_id: string
  display_id: string
  purchase_order_id: string | null
  status: 'draft' | 'in_progress' | 'completed'
  carrier: string | null
  tracking_number: string | null
  received_by: string | null
  notes: string | null
  created_at: string
  completed_at: string | null
}

interface ReceiveItem {
  id: string
  receive_id: string
  item_id: string
  item_name: string
  expected_quantity: number
  received_quantity: number
  condition: 'good' | 'damaged' | 'rejected'
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  manufactured_date: string | null
  notes: string | null
  received_at: string | null
  received_by: string | null
}

// Generate display ID
function generateDisplayId(prefix: string, tenantCode: string, sequence: number): string {
  return `${prefix}-${tenantCode}-${String(sequence).padStart(5, '0')}`
}

// Create receive
function createReceive(params: {
  tenantId: string
  purchaseOrderId?: string
  carrier?: string
  trackingNumber?: string
  notes?: string
  sequence: number
}): Receive {
  return {
    id: `rec-${Date.now()}`,
    tenant_id: params.tenantId,
    display_id: generateDisplayId('REC', 'XXX', params.sequence),
    purchase_order_id: params.purchaseOrderId ?? null,
    status: 'draft',
    carrier: params.carrier ?? null,
    tracking_number: params.trackingNumber ?? null,
    received_by: null,
    notes: params.notes ?? null,
    created_at: new Date().toISOString(),
    completed_at: null,
  }
}

// Add receive item
function addReceiveItem(
  receiveId: string,
  itemId: string,
  itemName: string,
  expectedQuantity: number,
  options?: {
    lotNumber?: string
    batchCode?: string
    expiryDate?: string
    manufacturedDate?: string
  }
): ReceiveItem {
  return {
    id: `reci-${Date.now()}`,
    receive_id: receiveId,
    item_id: itemId,
    item_name: itemName,
    expected_quantity: expectedQuantity,
    received_quantity: 0,
    condition: 'good',
    lot_number: options?.lotNumber ?? null,
    batch_code: options?.batchCode ?? null,
    expiry_date: options?.expiryDate ?? null,
    manufactured_date: options?.manufacturedDate ?? null,
    notes: null,
    received_at: null,
    received_by: null,
  }
}

// Update receive item (record receipt)
function recordReceiveItem(
  item: ReceiveItem,
  receivedQuantity: number,
  condition: 'good' | 'damaged' | 'rejected',
  receivedBy: string,
  notes?: string
): ReceiveItem {
  return {
    ...item,
    received_quantity: receivedQuantity,
    condition,
    received_by: receivedBy,
    received_at: new Date().toISOString(),
    notes: notes ?? item.notes,
  }
}

// Complete receive and update inventory
function completeReceive(
  receive: Receive,
  items: ReceiveItem[],
  inventory: Map<string, number>
): {
  receive: Receive
  inventoryUpdated: boolean
  itemsReceived: number
} {
  // Only add good items to inventory
  const goodItems = items.filter(i => i.condition === 'good')
  let itemsReceived = 0

  for (const item of goodItems) {
    const currentQty = inventory.get(item.item_id) ?? 0
    inventory.set(item.item_id, currentQty + item.received_quantity)
    itemsReceived += item.received_quantity
  }

  return {
    receive: {
      ...receive,
      status: 'completed',
      completed_at: new Date().toISOString(),
    },
    inventoryUpdated: itemsReceived > 0,
    itemsReceived,
  }
}

// Check if PO is fully received
function isPOFullyReceived(
  poItems: Array<{ item_id: string; ordered_quantity: number }>,
  receiveItems: ReceiveItem[]
): boolean {
  for (const poItem of poItems) {
    const received = receiveItems
      .filter(ri => ri.item_id === poItem.item_id && ri.condition === 'good')
      .reduce((sum, ri) => sum + ri.received_quantity, 0)

    if (received < poItem.ordered_quantity) {
      return false
    }
  }
  return true
}

describe('Receives', () => {
  describe('Create Receive', () => {
    it('creates receive with display ID', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      expect(receive.display_id).toBe('REC-XXX-00001')
    })

    it('creates with draft status', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      expect(receive.status).toBe('draft')
    })

    it('links to purchase order', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        purchaseOrderId: 'po-123',
        sequence: 1,
      })

      expect(receive.purchase_order_id).toBe('po-123')
    })

    it('saves carrier and tracking', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        carrier: 'FedEx',
        trackingNumber: '1234567890',
        sequence: 1,
      })

      expect(receive.carrier).toBe('FedEx')
      expect(receive.tracking_number).toBe('1234567890')
    })

    it('saves notes', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        notes: 'Fragile items, handle with care',
        sequence: 1,
      })

      expect(receive.notes).toBe('Fragile items, handle with care')
    })
  })

  describe('Receive Items', () => {
    it('adds item with expected quantity', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)

      expect(item.receive_id).toBe('rec-1')
      expect(item.item_id).toBe('item-1')
      expect(item.expected_quantity).toBe(10)
    })

    it('initializes received quantity to 0', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)

      expect(item.received_quantity).toBe(0)
    })

    it('defaults to good condition', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)

      expect(item.condition).toBe('good')
    })

    it('saves lot number', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10, {
        lotNumber: 'LOT-2024-001',
      })

      expect(item.lot_number).toBe('LOT-2024-001')
    })

    it('saves batch code', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10, {
        batchCode: 'BATCH-A',
      })

      expect(item.batch_code).toBe('BATCH-A')
    })

    it('saves expiry date', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Milk', 100, {
        expiryDate: '2025-06-30',
      })

      expect(item.expiry_date).toBe('2025-06-30')
    })

    it('saves manufactured date', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Milk', 100, {
        manufacturedDate: '2024-12-01',
      })

      expect(item.manufactured_date).toBe('2024-12-01')
    })
  })

  describe('Record Receive Item', () => {
    it('records received quantity', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'good', TEST_USER_ID)

      expect(recorded.received_quantity).toBe(10)
    })

    it('records good condition', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'good', TEST_USER_ID)

      expect(recorded.condition).toBe('good')
    })

    it('records damaged condition', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'damaged', TEST_USER_ID)

      expect(recorded.condition).toBe('damaged')
    })

    it('records rejected condition', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'rejected', TEST_USER_ID)

      expect(recorded.condition).toBe('rejected')
    })

    it('records who received', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'good', TEST_USER_ID)

      expect(recorded.received_by).toBe(TEST_USER_ID)
    })

    it('records when received', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'good', TEST_USER_ID)

      expect(recorded.received_at).toBeDefined()
    })

    it('records notes', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 8, 'good', TEST_USER_ID, '2 missing from shipment')

      expect(recorded.notes).toBe('2 missing from shipment')
    })

    it('allows partial receipt', () => {
      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 5, 'good', TEST_USER_ID)

      expect(recorded.received_quantity).toBe(5)
      expect(recorded.expected_quantity).toBe(10)
    })
  })

  describe('Complete Receive', () => {
    it('sets status to completed', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })
      const items: ReceiveItem[] = []
      const inventory = new Map<string, number>()

      const result = completeReceive(receive, items, inventory)

      expect(result.receive.status).toBe('completed')
    })

    it('sets completed_at timestamp', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })
      const items: ReceiveItem[] = []
      const inventory = new Map<string, number>()

      const result = completeReceive(receive, items, inventory)

      expect(result.receive.completed_at).toBeDefined()
    })

    it('updates inventory quantities for good items', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'good', TEST_USER_ID)

      const inventory = new Map<string, number>([['item-1', 50]])

      completeReceive(receive, [recorded], inventory)

      expect(inventory.get('item-1')).toBe(60)
    })

    it('does not update inventory for damaged items', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'damaged', TEST_USER_ID)

      const inventory = new Map<string, number>([['item-1', 50]])

      completeReceive(receive, [recorded], inventory)

      expect(inventory.get('item-1')).toBe(50)
    })

    it('does not update inventory for rejected items', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      const item = addReceiveItem('rec-1', 'item-1', 'Laptop', 10)
      const recorded = recordReceiveItem(item, 10, 'rejected', TEST_USER_ID)

      const inventory = new Map<string, number>([['item-1', 50]])

      completeReceive(receive, [recorded], inventory)

      expect(inventory.get('item-1')).toBe(50)
    })

    it('returns count of items received', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      const item1 = recordReceiveItem(
        addReceiveItem('rec-1', 'item-1', 'Laptop', 10),
        10,
        'good',
        TEST_USER_ID
      )
      const item2 = recordReceiveItem(
        addReceiveItem('rec-1', 'item-2', 'Mouse', 50),
        45,
        'good',
        TEST_USER_ID
      )

      const inventory = new Map<string, number>()

      const result = completeReceive(receive, [item1, item2], inventory)

      expect(result.itemsReceived).toBe(55) // 10 + 45
    })

    it('creates new inventory entry if item not exists', () => {
      const receive = createReceive({
        tenantId: TEST_TENANT_ID,
        sequence: 1,
      })

      const item = recordReceiveItem(
        addReceiveItem('rec-1', 'new-item', 'New Product', 25),
        25,
        'good',
        TEST_USER_ID
      )

      const inventory = new Map<string, number>()

      completeReceive(receive, [item], inventory)

      expect(inventory.get('new-item')).toBe(25)
    })
  })

  describe('PO Fully Received Check', () => {
    it('returns true when all PO items fully received', () => {
      const poItems = [
        { item_id: 'item-1', ordered_quantity: 10 },
        { item_id: 'item-2', ordered_quantity: 20 },
      ]

      const receiveItems: ReceiveItem[] = [
        { ...addReceiveItem('rec-1', 'item-1', 'Laptop', 10), received_quantity: 10, condition: 'good' },
        { ...addReceiveItem('rec-1', 'item-2', 'Mouse', 20), received_quantity: 20, condition: 'good' },
      ]

      expect(isPOFullyReceived(poItems, receiveItems)).toBe(true)
    })

    it('returns false when PO items partially received', () => {
      const poItems = [
        { item_id: 'item-1', ordered_quantity: 10 },
        { item_id: 'item-2', ordered_quantity: 20 },
      ]

      const receiveItems: ReceiveItem[] = [
        { ...addReceiveItem('rec-1', 'item-1', 'Laptop', 10), received_quantity: 10, condition: 'good' },
        { ...addReceiveItem('rec-1', 'item-2', 'Mouse', 20), received_quantity: 15, condition: 'good' },
      ]

      expect(isPOFullyReceived(poItems, receiveItems)).toBe(false)
    })

    it('excludes damaged items from received count', () => {
      const poItems = [
        { item_id: 'item-1', ordered_quantity: 10 },
      ]

      const receiveItems: ReceiveItem[] = [
        { ...addReceiveItem('rec-1', 'item-1', 'Laptop', 10), received_quantity: 7, condition: 'good' },
        { ...addReceiveItem('rec-1', 'item-1', 'Laptop', 10), received_quantity: 3, condition: 'damaged' },
      ]

      expect(isPOFullyReceived(poItems, receiveItems)).toBe(false)
    })

    it('combines multiple receives for same item', () => {
      const poItems = [
        { item_id: 'item-1', ordered_quantity: 100 },
      ]

      const receiveItems: ReceiveItem[] = [
        { ...addReceiveItem('rec-1', 'item-1', 'Laptop', 50), received_quantity: 50, condition: 'good' },
        { ...addReceiveItem('rec-2', 'item-1', 'Laptop', 50), received_quantity: 50, condition: 'good' },
      ]

      expect(isPOFullyReceived(poItems, receiveItems)).toBe(true)
    })
  })
})

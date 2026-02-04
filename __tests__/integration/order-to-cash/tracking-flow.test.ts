/**
 * Serial/Lot Tracking Flow Integration Tests
 *
 * Tests for the tracking allocation flow in the order-to-cash workflow:
 * - Lot allocation to pick list items (allocate_pick_list_item_lots RPC)
 * - Serial allocation to pick list items (allocate_pick_list_item_serials RPC)
 * - Retrieving tracking allocations (get_pick_list_item_tracking RPC)
 * - Auto-allocate FEFO for lots (auto_allocate_lots_fefo RPC)
 * - Auto-allocate FIFO for serials (auto_allocate_serials_fifo RPC)
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  ORDER_CASH_OTHER_TENANT_ID,
  ORDER_CASH_USER_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  createTestPickList,
  createTestPickListItem,
  type TestCustomer,
  type TestItem,
  type TestPickList,
  type TestPickListItem,
} from '../../utils/order-to-cash-fixtures'

// ============================================================================
// Test Fixtures for Lots and Serials
// ============================================================================

// Simple UUID v4 generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface TestLot {
  id: string
  tenant_id: string
  item_id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  manufactured_date: string | null
  received_at: string
  quantity: number
  status: 'active' | 'expired' | 'depleted' | 'blocked'
  created_at: string
}

export interface TestSerial {
  id: string
  tenant_id: string
  item_id: string
  serial_number: string
  status: 'available' | 'checked_out' | 'sold' | 'damaged' | 'returned'
  created_at: string
}

export interface TestPickListItemLot {
  id: string
  pick_list_item_id: string
  lot_id: string
  quantity: number
  tenant_id: string
  created_at: string
}

export interface TestPickListItemSerial {
  id: string
  pick_list_item_id: string
  serial_id: string
  tenant_id: string
  created_at: string
}

function createTestLot(
  itemId: string,
  tenantId: string = ORDER_CASH_TENANT_ID,
  options: {
    lotNumber?: string
    batchCode?: string
    expiryDate?: string | null
    quantity?: number
    status?: TestLot['status']
    receivedAt?: string
    createdAt?: string
  } = {}
): TestLot {
  const now = new Date()
  return {
    id: uuidv4(),
    tenant_id: tenantId,
    item_id: itemId,
    lot_number: options.lotNumber ?? `LOT-${Date.now().toString(36).toUpperCase()}`,
    batch_code: options.batchCode ?? null,
    expiry_date: options.expiryDate ?? null,
    manufactured_date: null,
    received_at: options.receivedAt ?? now.toISOString(),
    quantity: options.quantity ?? 100,
    status: options.status ?? 'active',
    created_at: options.createdAt ?? now.toISOString(),
  }
}

function createTestSerial(
  itemId: string,
  tenantId: string = ORDER_CASH_TENANT_ID,
  options: {
    serialNumber?: string
    status?: TestSerial['status']
    createdAt?: string
  } = {}
): TestSerial {
  const now = new Date()
  return {
    id: uuidv4(),
    tenant_id: tenantId,
    item_id: itemId,
    serial_number: options.serialNumber ?? `SN-${Date.now().toString(36).toUpperCase()}`,
    status: options.status ?? 'available',
    created_at: options.createdAt ?? now.toISOString(),
  }
}

// ============================================================================
// Simulated In-Memory Storage (mimics database)
// ============================================================================

const lotsStorage = new Map<string, TestLot>()
const serialsStorage = new Map<string, TestSerial>()
const pickListItemLotsStorage = new Map<string, TestPickListItemLot>()
const pickListItemSerialsStorage = new Map<string, TestPickListItemSerial>()
const pickListItemsStorage = new Map<string, TestPickListItem & { item_id: string }>()
const pickListsStorage = new Map<string, TestPickList>()
const itemsStorage = new Map<string, TestItem>()

// ============================================================================
// Simulated RPC Functions (mimic database functions)
// ============================================================================

/**
 * Simulates allocate_pick_list_item_lots RPC
 * Allocates lots to a pick list item. Clears existing and inserts new allocations.
 */
function rpcAllocatePickListItemLots(
  pickListItemId: string,
  allocations: Array<{ lot_id: string; quantity: number }>,
  tenantId: string
): { success: boolean; error?: string; total_allocated?: number; requested?: number } {
  // Get pick list item
  const pickListItem = pickListItemsStorage.get(pickListItemId)
  if (!pickListItem) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Verify pick list belongs to tenant
  const pickList = pickListsStorage.get(pickListItem.pick_list_id)
  if (!pickList || pickList.tenant_id !== tenantId) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Clear existing lot allocations for this pick list item
  for (const [key, alloc] of pickListItemLotsStorage) {
    if (alloc.pick_list_item_id === pickListItemId && alloc.tenant_id === tenantId) {
      pickListItemLotsStorage.delete(key)
    }
  }

  let totalAllocated = 0

  // Insert new allocations
  for (const alloc of allocations) {
    // Validate lot belongs to the same item and tenant
    const lot = lotsStorage.get(alloc.lot_id)
    if (!lot || lot.item_id !== pickListItem.item_id || lot.tenant_id !== tenantId) {
      return { success: false, error: `Lot ${alloc.lot_id} does not belong to item or tenant` }
    }

    const allocation: TestPickListItemLot = {
      id: uuidv4(),
      pick_list_item_id: pickListItemId,
      lot_id: alloc.lot_id,
      quantity: alloc.quantity,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
    }

    pickListItemLotsStorage.set(allocation.id, allocation)
    totalAllocated += alloc.quantity
  }

  return {
    success: true,
    total_allocated: totalAllocated,
    requested: pickListItem.requested_quantity,
  }
}

/**
 * Simulates allocate_pick_list_item_serials RPC
 * Allocates serial numbers to a pick list item. Clears existing and inserts new.
 */
function rpcAllocatePickListItemSerials(
  pickListItemId: string,
  serialIds: string[],
  tenantId: string
): { success: boolean; error?: string; total_allocated?: number; requested?: number } {
  // Get pick list item
  const pickListItem = pickListItemsStorage.get(pickListItemId)
  if (!pickListItem) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Verify pick list belongs to tenant
  const pickList = pickListsStorage.get(pickListItem.pick_list_id)
  if (!pickList || pickList.tenant_id !== tenantId) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Clear existing serial allocations for this pick list item
  for (const [key, alloc] of pickListItemSerialsStorage) {
    if (alloc.pick_list_item_id === pickListItemId && alloc.tenant_id === tenantId) {
      pickListItemSerialsStorage.delete(key)
    }
  }

  let totalAllocated = 0

  // Insert new allocations
  for (const serialId of serialIds) {
    // Validate serial belongs to the same item and tenant
    const serial = serialsStorage.get(serialId)
    if (!serial || serial.item_id !== pickListItem.item_id || serial.tenant_id !== tenantId) {
      return { success: false, error: `Serial ${serialId} does not belong to item or tenant` }
    }

    const allocation: TestPickListItemSerial = {
      id: uuidv4(),
      pick_list_item_id: pickListItemId,
      serial_id: serialId,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
    }

    pickListItemSerialsStorage.set(allocation.id, allocation)
    totalAllocated += 1
  }

  return {
    success: true,
    total_allocated: totalAllocated,
    requested: pickListItem.requested_quantity,
  }
}

/**
 * Simulates get_pick_list_item_tracking RPC
 * Returns allocated lots and serials for a pick list item
 */
function rpcGetPickListItemTracking(
  pickListItemId: string,
  tenantId: string
): {
  success: boolean
  error?: string
  lots?: Array<{
    id: string
    lot_id: string
    lot_number: string | null
    batch_code: string | null
    expiry_date: string | null
    quantity: number
    available: number
  }>
  serials?: Array<{
    id: string
    serial_id: string
    serial_number: string
    status: string
  }>
} {
  // Get pick list item
  const pickListItem = pickListItemsStorage.get(pickListItemId)
  if (!pickListItem) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Verify pick list belongs to tenant
  const pickList = pickListsStorage.get(pickListItem.pick_list_id)
  if (!pickList || pickList.tenant_id !== tenantId) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Get allocated lots with details
  const lots: Array<{
    id: string
    lot_id: string
    lot_number: string | null
    batch_code: string | null
    expiry_date: string | null
    quantity: number
    available: number
  }> = []

  for (const alloc of pickListItemLotsStorage.values()) {
    if (alloc.pick_list_item_id === pickListItemId && alloc.tenant_id === tenantId) {
      const lot = lotsStorage.get(alloc.lot_id)
      if (lot) {
        lots.push({
          id: alloc.id,
          lot_id: alloc.lot_id,
          lot_number: lot.lot_number,
          batch_code: lot.batch_code,
          expiry_date: lot.expiry_date,
          quantity: alloc.quantity,
          available: lot.quantity,
        })
      }
    }
  }

  // Sort by expiry date (earliest first)
  lots.sort((a, b) => {
    if (!a.expiry_date && !b.expiry_date) return 0
    if (!a.expiry_date) return 1
    if (!b.expiry_date) return -1
    return a.expiry_date.localeCompare(b.expiry_date)
  })

  // Get allocated serials with details
  const serials: Array<{
    id: string
    serial_id: string
    serial_number: string
    status: string
  }> = []

  for (const alloc of pickListItemSerialsStorage.values()) {
    if (alloc.pick_list_item_id === pickListItemId && alloc.tenant_id === tenantId) {
      const serial = serialsStorage.get(alloc.serial_id)
      if (serial) {
        serials.push({
          id: alloc.id,
          serial_id: alloc.serial_id,
          serial_number: serial.serial_number,
          status: serial.status,
        })
      }
    }
  }

  // Sort by serial number
  serials.sort((a, b) => a.serial_number.localeCompare(b.serial_number))

  return { success: true, lots, serials }
}

/**
 * Simulates auto_allocate_lots_fefo RPC
 * Auto-assigns lots using First-Expired-First-Out (earliest expiry first)
 */
function rpcAutoAllocateLotsFEFO(
  pickListItemId: string,
  tenantId: string
): { success: boolean; error?: string; total_allocated?: number; requested?: number } {
  // Get pick list item
  const pickListItem = pickListItemsStorage.get(pickListItemId)
  if (!pickListItem) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Verify pick list belongs to tenant
  const pickList = pickListsStorage.get(pickListItem.pick_list_id)
  if (!pickList || pickList.tenant_id !== tenantId) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Get available lots for this item in FEFO order
  const availableLots = Array.from(lotsStorage.values())
    .filter(
      (lot) =>
        lot.item_id === pickListItem.item_id &&
        lot.tenant_id === tenantId &&
        lot.status === 'active' &&
        lot.quantity > 0
    )
    .sort((a, b) => {
      // Sort by expiry date (earliest first), then by received_at (oldest first)
      if (!a.expiry_date && !b.expiry_date) {
        return a.received_at.localeCompare(b.received_at)
      }
      if (!a.expiry_date) return 1
      if (!b.expiry_date) return -1
      const expiryCompare = a.expiry_date.localeCompare(b.expiry_date)
      if (expiryCompare !== 0) return expiryCompare
      return a.received_at.localeCompare(b.received_at)
    })

  if (availableLots.length === 0) {
    return { success: false, error: 'No available lots found for this item' }
  }

  // Build allocations based on FEFO
  const allocations: Array<{ lot_id: string; quantity: number }> = []
  let remaining = pickListItem.requested_quantity

  for (const lot of availableLots) {
    if (remaining <= 0) break

    const allocQty = Math.min(lot.quantity, remaining)
    allocations.push({ lot_id: lot.id, quantity: allocQty })
    remaining -= allocQty
  }

  // Call the allocation function
  return rpcAllocatePickListItemLots(pickListItemId, allocations, tenantId)
}

/**
 * Simulates auto_allocate_serials_fifo RPC
 * Auto-assigns serials using First-In-First-Out (oldest created first)
 */
function rpcAutoAllocateSerialsFIFO(
  pickListItemId: string,
  tenantId: string
): { success: boolean; error?: string; total_allocated?: number; requested?: number } {
  // Get pick list item
  const pickListItem = pickListItemsStorage.get(pickListItemId)
  if (!pickListItem) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Verify pick list belongs to tenant
  const pickList = pickListsStorage.get(pickListItem.pick_list_id)
  if (!pickList || pickList.tenant_id !== tenantId) {
    return { success: false, error: 'Pick list item not found or access denied' }
  }

  // Get available serials for this item in FIFO order (oldest created first)
  const availableSerials = Array.from(serialsStorage.values())
    .filter(
      (serial) =>
        serial.item_id === pickListItem.item_id &&
        serial.tenant_id === tenantId &&
        serial.status === 'available'
    )
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, pickListItem.requested_quantity)

  if (availableSerials.length === 0) {
    return { success: false, error: 'No available serials found for this item' }
  }

  // Call the allocation function
  const serialIds = availableSerials.map((s) => s.id)
  return rpcAllocatePickListItemSerials(pickListItemId, serialIds, tenantId)
}

// ============================================================================
// Test Suite
// ============================================================================

describe('Serial/Lot Tracking Flow', () => {
  // Test data setup
  let customer: TestCustomer
  let lotTrackedItem: TestItem
  let serialTrackedItem: TestItem

  beforeAll(() => {
    // Create base test data
    customer = createTestCustomer(ORDER_CASH_TENANT_ID, { name: 'Tracking Test Customer' })
    lotTrackedItem = createTestItem(ORDER_CASH_TENANT_ID, {
      name: 'Lot Tracked Product',
      sku: 'LOT-PROD-001',
      price: 100,
      quantity: 200,
    })
    serialTrackedItem = createTestItem(ORDER_CASH_TENANT_ID, {
      name: 'Serial Tracked Product',
      sku: 'SER-PROD-001',
      price: 500,
      quantity: 10,
    })

    // Store items
    itemsStorage.set(lotTrackedItem.id, lotTrackedItem)
    itemsStorage.set(serialTrackedItem.id, serialTrackedItem)
  })

  beforeEach(() => {
    // Clear allocation storage before each test
    lotsStorage.clear()
    serialsStorage.clear()
    pickListItemLotsStorage.clear()
    pickListItemSerialsStorage.clear()
    pickListItemsStorage.clear()
    pickListsStorage.clear()
  })

  // ============================================================================
  // Lot Tracking Tests
  // ============================================================================

  describe('Lot Tracking', () => {
    describe('allocate_pick_list_item_lots', () => {
      it('should allocate lots to pick list item', () => {
        // Create test lots
        const lot1 = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-001',
          quantity: 50,
          expiryDate: '2025-06-30',
        })
        const lot2 = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-002',
          quantity: 100,
          expiryDate: '2025-12-31',
        })
        lotsStorage.set(lot1.id, lot1)
        lotsStorage.set(lot2.id, lot2)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID, { status: 'draft' })
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, {
          requestedQuantity: 75,
          itemName: lotTrackedItem.name,
        })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        // Allocate lots
        const result = rpcAllocatePickListItemLots(
          pickListItem.id,
          [
            { lot_id: lot1.id, quantity: 50 },
            { lot_id: lot2.id, quantity: 25 },
          ],
          ORDER_CASH_TENANT_ID
        )

        expect(result.success).toBe(true)
        expect(result.total_allocated).toBe(75)
        expect(result.requested).toBe(75)
      })

      it('should clear existing allocations when reallocating', () => {
        // Create test lot
        const lot = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-001',
          quantity: 100,
        })
        lotsStorage.set(lot.id, lot)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 50 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        // First allocation
        rpcAllocatePickListItemLots(
          pickListItem.id,
          [{ lot_id: lot.id, quantity: 30 }],
          ORDER_CASH_TENANT_ID
        )

        // Verify first allocation
        let allocations = Array.from(pickListItemLotsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )
        expect(allocations.length).toBe(1)
        expect(allocations[0].quantity).toBe(30)

        // Second allocation (should replace)
        rpcAllocatePickListItemLots(
          pickListItem.id,
          [{ lot_id: lot.id, quantity: 50 }],
          ORDER_CASH_TENANT_ID
        )

        // Verify second allocation replaced first
        allocations = Array.from(pickListItemLotsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )
        expect(allocations.length).toBe(1)
        expect(allocations[0].quantity).toBe(50)
      })

      it('should reject allocation if lot does not belong to item', () => {
        // Create lot for different item
        const otherItem = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Other Item' })
        itemsStorage.set(otherItem.id, otherItem)

        const lot = createTestLot(otherItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-OTHER',
          quantity: 100,
        })
        lotsStorage.set(lot.id, lot)

        // Create pick list and item for lotTrackedItem
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 50 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        // Try to allocate lot from different item
        const result = rpcAllocatePickListItemLots(
          pickListItem.id,
          [{ lot_id: lot.id, quantity: 50 }],
          ORDER_CASH_TENANT_ID
        )

        expect(result.success).toBe(false)
        expect(result.error).toContain('does not belong to item')
      })

      it('should reject allocation for invalid pick list item', () => {
        const result = rpcAllocatePickListItemLots(
          'non-existent-id',
          [{ lot_id: 'lot-1', quantity: 10 }],
          ORDER_CASH_TENANT_ID
        )

        expect(result.success).toBe(false)
        expect(result.error).toContain('not found')
      })
    })

    describe('auto_allocate_lots_fefo', () => {
      it('should auto-allocate using FEFO (earliest expiry first)', () => {
        // Create lots with different expiry dates
        const lot1 = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-LATER',
          quantity: 100,
          expiryDate: '2025-12-31',
          receivedAt: '2024-01-01T00:00:00Z',
        })
        const lot2 = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-EARLIEST',
          quantity: 30,
          expiryDate: '2025-03-31',
          receivedAt: '2024-01-02T00:00:00Z',
        })
        const lot3 = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-MIDDLE',
          quantity: 50,
          expiryDate: '2025-06-30',
          receivedAt: '2024-01-03T00:00:00Z',
        })

        lotsStorage.set(lot1.id, lot1)
        lotsStorage.set(lot2.id, lot2)
        lotsStorage.set(lot3.id, lot3)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 60 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        // Auto-allocate using FEFO
        const result = rpcAutoAllocateLotsFEFO(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(true)
        expect(result.total_allocated).toBe(60)

        // Verify allocation order (earliest expiry first)
        const allocations = Array.from(pickListItemLotsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )

        expect(allocations.length).toBe(2)

        // Should first allocate from lot2 (earliest expiry: 2025-03-31)
        const lot2Alloc = allocations.find((a) => a.lot_id === lot2.id)
        expect(lot2Alloc).toBeDefined()
        expect(lot2Alloc!.quantity).toBe(30) // Full quantity from earliest expiry

        // Then from lot3 (middle expiry: 2025-06-30)
        const lot3Alloc = allocations.find((a) => a.lot_id === lot3.id)
        expect(lot3Alloc).toBeDefined()
        expect(lot3Alloc!.quantity).toBe(30) // Remaining needed

        // lot1 (latest expiry) should not be used
        const lot1Alloc = allocations.find((a) => a.lot_id === lot1.id)
        expect(lot1Alloc).toBeUndefined()
      })

      it('should handle lots without expiry dates (NULLS LAST)', () => {
        // Create lots - one with expiry, one without
        const lotWithExpiry = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-WITH-EXPIRY',
          quantity: 50,
          expiryDate: '2025-06-30',
          receivedAt: '2024-01-02T00:00:00Z',
        })
        const lotNoExpiry = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-NO-EXPIRY',
          quantity: 100,
          expiryDate: null,
          receivedAt: '2024-01-01T00:00:00Z', // Older but no expiry
        })

        lotsStorage.set(lotWithExpiry.id, lotWithExpiry)
        lotsStorage.set(lotNoExpiry.id, lotNoExpiry)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 30 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        // Auto-allocate using FEFO
        const result = rpcAutoAllocateLotsFEFO(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(true)

        // Should allocate from lot with expiry first
        const allocations = Array.from(pickListItemLotsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )

        expect(allocations.length).toBe(1)
        expect(allocations[0].lot_id).toBe(lotWithExpiry.id)
      })

      it('should fail if no available lots', () => {
        // Create pick list and item but no lots
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 10 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        const result = rpcAutoAllocateLotsFEFO(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(false)
        expect(result.error).toContain('No available lots')
      })

      it('should only allocate from active lots with quantity > 0', () => {
        // Create lots with different statuses
        const activeLot = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-ACTIVE',
          quantity: 50,
          status: 'active',
          expiryDate: '2025-12-31',
        })
        const depletedLot = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-DEPLETED',
          quantity: 0,
          status: 'active', // Active but no quantity
          expiryDate: '2025-03-31', // Earlier expiry
        })
        const blockedLot = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-BLOCKED',
          quantity: 100,
          status: 'blocked',
          expiryDate: '2025-01-31', // Earliest expiry
        })

        lotsStorage.set(activeLot.id, activeLot)
        lotsStorage.set(depletedLot.id, depletedLot)
        lotsStorage.set(blockedLot.id, blockedLot)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 30 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        const result = rpcAutoAllocateLotsFEFO(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(true)

        // Should only allocate from active lot with quantity > 0
        const allocations = Array.from(pickListItemLotsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )

        expect(allocations.length).toBe(1)
        expect(allocations[0].lot_id).toBe(activeLot.id)
      })
    })

    describe('get_pick_list_item_tracking (lots)', () => {
      it('should retrieve lot allocations with details', () => {
        // Create test lots
        const lot1 = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-001',
          batchCode: 'BATCH-A',
          quantity: 50,
          expiryDate: '2025-03-31',
        })
        const lot2 = createTestLot(lotTrackedItem.id, ORDER_CASH_TENANT_ID, {
          lotNumber: 'LOT-002',
          batchCode: 'BATCH-B',
          quantity: 100,
          expiryDate: '2025-06-30',
        })
        lotsStorage.set(lot1.id, lot1)
        lotsStorage.set(lot2.id, lot2)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 75 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: lotTrackedItem.id,
        })

        // Allocate lots
        rpcAllocatePickListItemLots(
          pickListItem.id,
          [
            { lot_id: lot1.id, quantity: 50 },
            { lot_id: lot2.id, quantity: 25 },
          ],
          ORDER_CASH_TENANT_ID
        )

        // Retrieve tracking data
        const result = rpcGetPickListItemTracking(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(true)
        expect(result.lots).toHaveLength(2)
        expect(result.serials).toHaveLength(0)

        // Verify lot details are included
        const lot1Result = result.lots!.find((l) => l.lot_id === lot1.id)
        expect(lot1Result).toBeDefined()
        expect(lot1Result!.lot_number).toBe('LOT-001')
        expect(lot1Result!.batch_code).toBe('BATCH-A')
        expect(lot1Result!.expiry_date).toBe('2025-03-31')
        expect(lot1Result!.quantity).toBe(50)
        expect(lot1Result!.available).toBe(50) // Original lot quantity

        // Verify sorted by expiry date (earliest first)
        expect(result.lots![0].lot_id).toBe(lot1.id) // Earliest expiry
        expect(result.lots![1].lot_id).toBe(lot2.id) // Later expiry
      })
    })
  })

  // ============================================================================
  // Serial Tracking Tests
  // ============================================================================

  describe('Serial Tracking', () => {
    describe('allocate_pick_list_item_serials', () => {
      it('should allocate serials to pick list item', () => {
        // Create test serials
        const serial1 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-001',
        })
        const serial2 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-002',
        })
        const serial3 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-003',
        })
        serialsStorage.set(serial1.id, serial1)
        serialsStorage.set(serial2.id, serial2)
        serialsStorage.set(serial3.id, serial3)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 2 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: serialTrackedItem.id,
        })

        // Allocate serials
        const result = rpcAllocatePickListItemSerials(
          pickListItem.id,
          [serial1.id, serial2.id],
          ORDER_CASH_TENANT_ID
        )

        expect(result.success).toBe(true)
        expect(result.total_allocated).toBe(2)
        expect(result.requested).toBe(2)
      })

      it('should clear existing allocations when reallocating', () => {
        // Create test serials
        const serial1 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-001',
        })
        const serial2 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-002',
        })
        serialsStorage.set(serial1.id, serial1)
        serialsStorage.set(serial2.id, serial2)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 2 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: serialTrackedItem.id,
        })

        // First allocation
        rpcAllocatePickListItemSerials(pickListItem.id, [serial1.id], ORDER_CASH_TENANT_ID)

        // Verify first allocation
        let allocations = Array.from(pickListItemSerialsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )
        expect(allocations.length).toBe(1)
        expect(allocations[0].serial_id).toBe(serial1.id)

        // Second allocation (should replace)
        rpcAllocatePickListItemSerials(pickListItem.id, [serial2.id], ORDER_CASH_TENANT_ID)

        // Verify second allocation replaced first
        allocations = Array.from(pickListItemSerialsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )
        expect(allocations.length).toBe(1)
        expect(allocations[0].serial_id).toBe(serial2.id)
      })

      it('should reject allocation if serial does not belong to item', () => {
        // Create serial for different item
        const otherItem = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Other Item' })
        itemsStorage.set(otherItem.id, otherItem)

        const serial = createTestSerial(otherItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-OTHER',
        })
        serialsStorage.set(serial.id, serial)

        // Create pick list and item for serialTrackedItem
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 1 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: serialTrackedItem.id,
        })

        // Try to allocate serial from different item
        const result = rpcAllocatePickListItemSerials(
          pickListItem.id,
          [serial.id],
          ORDER_CASH_TENANT_ID
        )

        expect(result.success).toBe(false)
        expect(result.error).toContain('does not belong to item')
      })
    })

    describe('auto_allocate_serials_fifo', () => {
      it('should auto-allocate using FIFO (oldest created first)', () => {
        // Create serials with different creation times
        const serial1 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-OLDEST',
          createdAt: '2024-01-01T00:00:00Z',
        })
        const serial2 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-MIDDLE',
          createdAt: '2024-02-01T00:00:00Z',
        })
        const serial3 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-NEWEST',
          createdAt: '2024-03-01T00:00:00Z',
        })

        serialsStorage.set(serial1.id, serial1)
        serialsStorage.set(serial2.id, serial2)
        serialsStorage.set(serial3.id, serial3)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 2 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: serialTrackedItem.id,
        })

        // Auto-allocate using FIFO
        const result = rpcAutoAllocateSerialsFIFO(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(true)
        expect(result.total_allocated).toBe(2)

        // Verify allocation order (oldest first)
        const allocations = Array.from(pickListItemSerialsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )

        expect(allocations.length).toBe(2)

        const allocatedSerialIds = allocations.map((a) => a.serial_id)
        expect(allocatedSerialIds).toContain(serial1.id) // Oldest
        expect(allocatedSerialIds).toContain(serial2.id) // Middle
        expect(allocatedSerialIds).not.toContain(serial3.id) // Newest (not needed)
      })

      it('should only allocate available serials', () => {
        // Create serials with different statuses
        const availableSerial = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-AVAILABLE',
          status: 'available',
          createdAt: '2024-03-01T00:00:00Z',
        })
        const checkedOutSerial = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-CHECKED-OUT',
          status: 'checked_out',
          createdAt: '2024-01-01T00:00:00Z', // Older but not available
        })
        const soldSerial = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-SOLD',
          status: 'sold',
          createdAt: '2024-02-01T00:00:00Z',
        })

        serialsStorage.set(availableSerial.id, availableSerial)
        serialsStorage.set(checkedOutSerial.id, checkedOutSerial)
        serialsStorage.set(soldSerial.id, soldSerial)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 2 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: serialTrackedItem.id,
        })

        // Auto-allocate using FIFO
        const result = rpcAutoAllocateSerialsFIFO(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(true)
        expect(result.total_allocated).toBe(1) // Only 1 available

        const allocations = Array.from(pickListItemSerialsStorage.values()).filter(
          (a) => a.pick_list_item_id === pickListItem.id
        )

        expect(allocations.length).toBe(1)
        expect(allocations[0].serial_id).toBe(availableSerial.id)
      })

      it('should fail if no available serials', () => {
        // Create pick list and item but no serials
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 2 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: serialTrackedItem.id,
        })

        const result = rpcAutoAllocateSerialsFIFO(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(false)
        expect(result.error).toContain('No available serials')
      })
    })

    describe('get_pick_list_item_tracking (serials)', () => {
      it('should retrieve serial allocations with details', () => {
        // Create test serials
        const serial1 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-001',
          status: 'available',
        })
        const serial2 = createTestSerial(serialTrackedItem.id, ORDER_CASH_TENANT_ID, {
          serialNumber: 'SN-002',
          status: 'available',
        })
        serialsStorage.set(serial1.id, serial1)
        serialsStorage.set(serial2.id, serial2)

        // Create pick list and item
        const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
        pickListsStorage.set(pickList.id, pickList)

        const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 2 })
        pickListItemsStorage.set(pickListItem.id, {
          ...pickListItem,
          item_id: serialTrackedItem.id,
        })

        // Allocate serials
        rpcAllocatePickListItemSerials(
          pickListItem.id,
          [serial1.id, serial2.id],
          ORDER_CASH_TENANT_ID
        )

        // Retrieve tracking data
        const result = rpcGetPickListItemTracking(pickListItem.id, ORDER_CASH_TENANT_ID)

        expect(result.success).toBe(true)
        expect(result.lots).toHaveLength(0)
        expect(result.serials).toHaveLength(2)

        // Verify serial details are included
        const serial1Result = result.serials!.find((s) => s.serial_id === serial1.id)
        expect(serial1Result).toBeDefined()
        expect(serial1Result!.serial_number).toBe('SN-001')
        expect(serial1Result!.status).toBe('available')

        // Verify sorted by serial number
        expect(result.serials![0].serial_number).toBe('SN-001')
        expect(result.serials![1].serial_number).toBe('SN-002')
      })
    })
  })

  // ============================================================================
  // Tenant Isolation Tests
  // ============================================================================

  describe('Tenant Isolation', () => {
    it('should not allow allocating lots from another tenant', () => {
      // Create lot in other tenant
      const otherTenantItem = createTestItem(ORDER_CASH_OTHER_TENANT_ID, { name: 'Other Item' })
      itemsStorage.set(otherTenantItem.id, otherTenantItem)

      const otherTenantLot = createTestLot(otherTenantItem.id, ORDER_CASH_OTHER_TENANT_ID, {
        lotNumber: 'LOT-OTHER-TENANT',
        quantity: 100,
      })
      lotsStorage.set(otherTenantLot.id, otherTenantLot)

      // Create pick list and item in main tenant
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
      pickListsStorage.set(pickList.id, pickList)

      const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 50 })
      pickListItemsStorage.set(pickListItem.id, {
        ...pickListItem,
        item_id: lotTrackedItem.id,
      })

      // Try to allocate lot from other tenant
      const result = rpcAllocatePickListItemLots(
        pickListItem.id,
        [{ lot_id: otherTenantLot.id, quantity: 50 }],
        ORDER_CASH_TENANT_ID
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('does not belong to item or tenant')
    })

    it('should not allow allocating serials from another tenant', () => {
      // Create serial in other tenant
      const otherTenantItem = createTestItem(ORDER_CASH_OTHER_TENANT_ID, { name: 'Other Item' })
      itemsStorage.set(otherTenantItem.id, otherTenantItem)

      const otherTenantSerial = createTestSerial(otherTenantItem.id, ORDER_CASH_OTHER_TENANT_ID, {
        serialNumber: 'SN-OTHER-TENANT',
      })
      serialsStorage.set(otherTenantSerial.id, otherTenantSerial)

      // Create pick list and item in main tenant
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
      pickListsStorage.set(pickList.id, pickList)

      const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 1 })
      pickListItemsStorage.set(pickListItem.id, {
        ...pickListItem,
        item_id: serialTrackedItem.id,
      })

      // Try to allocate serial from other tenant
      const result = rpcAllocatePickListItemSerials(
        pickListItem.id,
        [otherTenantSerial.id],
        ORDER_CASH_TENANT_ID
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('does not belong to item or tenant')
    })

    it('should not allow accessing pick list items from another tenant', () => {
      // Create pick list in other tenant
      const otherTenantPickList = createTestPickList(ORDER_CASH_OTHER_TENANT_ID)
      pickListsStorage.set(otherTenantPickList.id, otherTenantPickList)

      const otherTenantPickListItem = createTestPickListItem(otherTenantPickList.id, {
        requestedQuantity: 10,
      })
      pickListItemsStorage.set(otherTenantPickListItem.id, {
        ...otherTenantPickListItem,
        item_id: lotTrackedItem.id,
      })

      // Try to access from main tenant
      const result = rpcGetPickListItemTracking(
        otherTenantPickListItem.id,
        ORDER_CASH_TENANT_ID
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found or access denied')
    })
  })

  // ============================================================================
  // Combined Tracking Tests (Lots + Serials)
  // ============================================================================

  describe('Combined Tracking Retrieval', () => {
    it('should return both lots and serials when both are allocated', () => {
      // Create a mixed tracked item
      const mixedItem = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Mixed Tracking Item' })
      itemsStorage.set(mixedItem.id, mixedItem)

      // Create lots
      const lot = createTestLot(mixedItem.id, ORDER_CASH_TENANT_ID, {
        lotNumber: 'LOT-MIXED',
        quantity: 50,
      })
      lotsStorage.set(lot.id, lot)

      // Create serials
      const serial = createTestSerial(mixedItem.id, ORDER_CASH_TENANT_ID, {
        serialNumber: 'SN-MIXED',
      })
      serialsStorage.set(serial.id, serial)

      // Create pick list and item
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
      pickListsStorage.set(pickList.id, pickList)

      const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 51 })
      pickListItemsStorage.set(pickListItem.id, {
        ...pickListItem,
        item_id: mixedItem.id,
      })

      // Allocate both lots and serials
      rpcAllocatePickListItemLots(
        pickListItem.id,
        [{ lot_id: lot.id, quantity: 50 }],
        ORDER_CASH_TENANT_ID
      )
      rpcAllocatePickListItemSerials(pickListItem.id, [serial.id], ORDER_CASH_TENANT_ID)

      // Retrieve tracking data
      const result = rpcGetPickListItemTracking(pickListItem.id, ORDER_CASH_TENANT_ID)

      expect(result.success).toBe(true)
      expect(result.lots).toHaveLength(1)
      expect(result.serials).toHaveLength(1)
      expect(result.lots![0].lot_number).toBe('LOT-MIXED')
      expect(result.serials![0].serial_number).toBe('SN-MIXED')
    })

    it('should return empty arrays when no tracking is allocated', () => {
      // Create pick list and item with no allocations
      const pickList = createTestPickList(ORDER_CASH_TENANT_ID)
      pickListsStorage.set(pickList.id, pickList)

      const pickListItem = createTestPickListItem(pickList.id, { requestedQuantity: 10 })
      pickListItemsStorage.set(pickListItem.id, {
        ...pickListItem,
        item_id: lotTrackedItem.id,
      })

      // Retrieve tracking data without allocating anything
      const result = rpcGetPickListItemTracking(pickListItem.id, ORDER_CASH_TENANT_ID)

      expect(result.success).toBe(true)
      expect(result.lots).toHaveLength(0)
      expect(result.serials).toHaveLength(0)
    })
  })
})

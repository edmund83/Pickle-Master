import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Pick List Tests
 *
 * Tests for pick list functionality:
 * - Create pick list
 * - Add/remove items
 * - Complete pick list
 */

interface PickList {
  id: string
  tenant_id: string
  display_id: string
  name: string
  status: 'draft' | 'in_progress' | 'completed'
  shipping_name: string | null
  shipping_address: string | null
  assigned_to: string | null
  due_date: string | null
  created_at: string
  completed_at: string | null
}

interface PickListItem {
  id: string
  pick_list_id: string
  item_id: string
  item_name: string
  requested_quantity: number
  picked_quantity: number
  status: 'pending' | 'picked'
}

// Generate display ID
function generateDisplayId(prefix: string, tenantCode: string, sequence: number): string {
  return `${prefix}-${tenantCode}-${String(sequence).padStart(5, '0')}`
}

// Create pick list
function createPickList(params: {
  tenantId: string
  name: string
  shippingName?: string
  shippingAddress?: string
  assignedTo?: string
  dueDate?: string
  sequence: number
}): PickList {
  return {
    id: `pl-${Date.now()}`,
    tenant_id: params.tenantId,
    display_id: generateDisplayId('PL', 'XXX', params.sequence),
    name: params.name,
    status: 'draft',
    shipping_name: params.shippingName ?? null,
    shipping_address: params.shippingAddress ?? null,
    assigned_to: params.assignedTo ?? null,
    due_date: params.dueDate ?? null,
    created_at: new Date().toISOString(),
    completed_at: null,
  }
}

// Create draft pick list with generated name
function createDraftPickList(tenantId: string, sequence: number): PickList {
  return createPickList({
    tenantId,
    name: `Pick List ${sequence}`,
    sequence,
  })
}

// Add pick list item
function addPickListItem(
  pickListId: string,
  itemId: string,
  itemName: string,
  requestedQuantity: number
): PickListItem {
  return {
    id: `pli-${Date.now()}`,
    pick_list_id: pickListId,
    item_id: itemId,
    item_name: itemName,
    requested_quantity: requestedQuantity,
    picked_quantity: 0,
    status: 'pending',
  }
}

// Remove pick list item
function removePickListItem(
  items: PickListItem[],
  itemId: string
): PickListItem[] {
  return items.filter(i => i.id !== itemId)
}

// Update pick list item (record picked quantity)
function pickItem(
  item: PickListItem,
  pickedQuantity: number
): PickListItem {
  return {
    ...item,
    picked_quantity: pickedQuantity,
    status: 'picked',
  }
}

// Update pick list
function updatePickList(
  pickList: PickList,
  updates: Partial<Pick<PickList, 'name' | 'due_date' | 'assigned_to'>>
): PickList {
  return { ...pickList, ...updates }
}

// Complete pick list
function completePickList(
  pickList: PickList
): PickList {
  return {
    ...pickList,
    status: 'completed',
    completed_at: new Date().toISOString(),
  }
}

describe('Pick Lists', () => {
  describe('Create Pick List', () => {
    it('creates pick list with display ID', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order #1234',
        sequence: 1,
      })

      expect(pickList.display_id).toBe('PL-XXX-00001')
    })

    it('creates with draft status', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order #1234',
        sequence: 1,
      })

      expect(pickList.status).toBe('draft')
    })

    it('saves shipping fields', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order #1234',
        shippingName: 'Customer A',
        shippingAddress: '123 Main St',
        sequence: 1,
      })

      expect(pickList.shipping_name).toBe('Customer A')
      expect(pickList.shipping_address).toBe('123 Main St')
    })

    it('creates draft pick list with generated ID', () => {
      const pickList = createDraftPickList(TEST_TENANT_ID, 5)

      expect(pickList.name).toBe('Pick List 5')
      expect(pickList.display_id).toBe('PL-XXX-00005')
    })

    it('saves assigned user', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order #1234',
        assignedTo: TEST_USER_ID,
        sequence: 1,
      })

      expect(pickList.assigned_to).toBe(TEST_USER_ID)
    })

    it('saves due date', () => {
      const dueDate = '2024-12-31T00:00:00Z'
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order #1234',
        dueDate,
        sequence: 1,
      })

      expect(pickList.due_date).toBe(dueDate)
    })
  })

  describe('Line Items', () => {
    it('adds item with requested quantity', () => {
      const item = addPickListItem('pl-1', 'item-1', 'Laptop', 5)

      expect(item.pick_list_id).toBe('pl-1')
      expect(item.item_id).toBe('item-1')
      expect(item.requested_quantity).toBe(5)
    })

    it('initializes picked_quantity to 0', () => {
      const item = addPickListItem('pl-1', 'item-1', 'Laptop', 5)

      expect(item.picked_quantity).toBe(0)
    })

    it('initializes status to pending', () => {
      const item = addPickListItem('pl-1', 'item-1', 'Laptop', 5)

      expect(item.status).toBe('pending')
    })

    it('removes item from list', () => {
      const item1: PickListItem = {
        id: 'pli-1',
        pick_list_id: 'pl-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        requested_quantity: 5,
        picked_quantity: 0,
        status: 'pending',
      }
      const item2: PickListItem = {
        id: 'pli-2',
        pick_list_id: 'pl-1',
        item_id: 'item-2',
        item_name: 'Mouse',
        requested_quantity: 10,
        picked_quantity: 0,
        status: 'pending',
      }
      const items = [item1, item2]

      const remaining = removePickListItem(items, 'pli-1')

      expect(remaining.length).toBe(1)
      expect(remaining[0].id).toBe('pli-2')
    })
  })

  describe('Picking Items', () => {
    it('records picked quantity', () => {
      const item: PickListItem = {
        id: 'pli-1',
        pick_list_id: 'pl-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        requested_quantity: 5,
        picked_quantity: 0,
        status: 'pending',
      }

      const picked = pickItem(item, 5)

      expect(picked.picked_quantity).toBe(5)
    })

    it('updates status to picked', () => {
      const item: PickListItem = {
        id: 'pli-1',
        pick_list_id: 'pl-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        requested_quantity: 5,
        picked_quantity: 0,
        status: 'pending',
      }

      const picked = pickItem(item, 5)

      expect(picked.status).toBe('picked')
    })

    it('allows partial pick', () => {
      const item: PickListItem = {
        id: 'pli-1',
        pick_list_id: 'pl-1',
        item_id: 'item-1',
        item_name: 'Laptop',
        requested_quantity: 5,
        picked_quantity: 0,
        status: 'pending',
      }

      const picked = pickItem(item, 3)

      expect(picked.picked_quantity).toBe(3)
      expect(picked.requested_quantity).toBe(5)
    })
  })

  describe('Update Pick List', () => {
    it('updates name', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Original Name',
        sequence: 1,
      })

      const updated = updatePickList(pickList, { name: 'New Name' })

      expect(updated.name).toBe('New Name')
    })

    it('updates due date', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order',
        sequence: 1,
      })

      const updated = updatePickList(pickList, { due_date: '2024-12-31T00:00:00Z' })

      expect(updated.due_date).toBe('2024-12-31T00:00:00Z')
    })

    it('updates assigned to', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order',
        sequence: 1,
      })

      const updated = updatePickList(pickList, { assigned_to: TEST_USER_ID })

      expect(updated.assigned_to).toBe(TEST_USER_ID)
    })
  })

  describe('Complete Pick List', () => {
    it('sets status to completed', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order',
        sequence: 1,
      })

      const completed = completePickList(pickList)

      expect(completed.status).toBe('completed')
    })

    it('sets completed_at timestamp', () => {
      const pickList = createPickList({
        tenantId: TEST_TENANT_ID,
        name: 'Order',
        sequence: 1,
      })

      const completed = completePickList(pickList)

      expect(completed.completed_at).toBeDefined()
    })
  })
})

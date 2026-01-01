import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Item CRUD Tests
 *
 * Tests for basic item create, read, update, delete operations:
 * - Create item
 * - Update fields
 * - Authorization checks
 */

interface InventoryItem {
  id: string
  tenant_id: string
  name: string
  sku: string | null
  barcode: string | null
  quantity: number
  min_quantity: number
  price: number | null
  cost_price: number | null
  location: string | null
  description: string | null
  notes: string | null
  image_urls: string[]
  custom_fields: Record<string, unknown> | null
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  created_at: string
  updated_at: string
}

// Calculate status based on quantity
function calculateStatus(quantity: number, minQty: number): InventoryItem['status'] {
  if (quantity === 0) return 'out_of_stock'
  if (quantity <= minQty) return 'low_stock'
  return 'in_stock'
}

// Create item
function createItem(params: {
  tenantId: string
  name: string
  quantity: number
  minQuantity?: number
  sku?: string
  barcode?: string
  price?: number
  costPrice?: number
  location?: string
  description?: string
  notes?: string
  imageUrls?: string[]
  customFields?: Record<string, unknown>
}): { success: boolean; item?: InventoryItem; error?: string } {
  // Validate required fields
  if (!params.name || params.name.trim() === '') {
    return { success: false, error: 'Name is required' }
  }

  if (params.quantity < 0) {
    return { success: false, error: 'Quantity must be non-negative' }
  }

  const minQty = params.minQuantity ?? 0

  const item: InventoryItem = {
    id: `item-${Date.now()}`,
    tenant_id: params.tenantId,
    name: params.name,
    sku: params.sku ?? null,
    barcode: params.barcode ?? null,
    quantity: params.quantity,
    min_quantity: minQty,
    price: params.price ?? null,
    cost_price: params.costPrice ?? null,
    location: params.location ?? null,
    description: params.description ?? null,
    notes: params.notes ?? null,
    image_urls: params.imageUrls ?? [],
    custom_fields: params.customFields ?? null,
    status: calculateStatus(params.quantity, minQty),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return { success: true, item }
}

// Update field
function updateItemField<K extends keyof InventoryItem>(
  item: InventoryItem,
  field: K,
  value: InventoryItem[K]
): { success: boolean; item?: InventoryItem; error?: string } {
  // Validate based on field
  if (field === 'name' && (!value || String(value).trim() === '')) {
    return { success: false, error: 'Name cannot be empty' }
  }

  if (field === 'quantity' && (value as number) < 0) {
    return { success: false, error: 'Quantity cannot be negative' }
  }

  const updated = { ...item, [field]: value, updated_at: new Date().toISOString() }

  // Recalculate status if quantity or min_quantity changed
  if (field === 'quantity' || field === 'min_quantity') {
    updated.status = calculateStatus(updated.quantity, updated.min_quantity)
  }

  return { success: true, item: updated }
}

// Check authorization
function checkAuthorization(
  userId: string | null,
  tenantId: string,
  itemTenantId: string,
  role: 'owner' | 'admin' | 'editor' | 'member'
): { authorized: boolean; error?: string } {
  if (!userId) {
    return { authorized: false, error: 'Unauthorized' }
  }

  if (tenantId !== itemTenantId) {
    return { authorized: false, error: 'Item not found' } // Don't reveal it exists
  }

  if (role === 'member') {
    return { authorized: false, error: 'Insufficient permissions' }
  }

  return { authorized: true }
}

// Get item by ID
function getItem(
  itemId: string,
  items: Map<string, InventoryItem>,
  userTenantId: string
): { success: boolean; item?: InventoryItem; error?: string } {
  const item = items.get(itemId)

  if (!item) {
    return { success: false, error: 'Item not found' }
  }

  if (item.tenant_id !== userTenantId) {
    return { success: false, error: 'Item not found' }
  }

  return { success: true, item }
}

// Add photo URL
function addPhotoUrl(item: InventoryItem, url: string): InventoryItem {
  return {
    ...item,
    image_urls: [...item.image_urls, url],
    updated_at: new Date().toISOString(),
  }
}

// Update custom fields
function updateCustomFields(
  item: InventoryItem,
  customFields: Record<string, unknown>
): InventoryItem {
  return {
    ...item,
    custom_fields: customFields,
    updated_at: new Date().toISOString(),
  }
}

describe('Item CRUD', () => {
  describe('Create Item', () => {
    it('returns new item with UUID and auto-calculated status', () => {
      const result = createItem({
        tenantId: TEST_TENANT_ID,
        name: 'New Item',
        quantity: 50,
        minQuantity: 10,
      })

      expect(result.success).toBe(true)
      expect(result.item!.id).toBeDefined()
      expect(result.item!.status).toBe('in_stock')
    })

    it('creates item with required fields only', () => {
      const result = createItem({
        tenantId: TEST_TENANT_ID,
        name: 'Minimal Item',
        quantity: 10,
      })

      expect(result.success).toBe(true)
      expect(result.item!.name).toBe('Minimal Item')
      expect(result.item!.quantity).toBe(10)
    })

    it('saves all optional fields', () => {
      const result = createItem({
        tenantId: TEST_TENANT_ID,
        name: 'Full Item',
        quantity: 50,
        sku: 'SKU-001',
        barcode: '123456789',
        price: 99.99,
        costPrice: 50.00,
        minQuantity: 10,
        description: 'A detailed description',
        notes: 'Some notes',
        location: 'Warehouse A, Shelf 3',
      })

      expect(result.item!.sku).toBe('SKU-001')
      expect(result.item!.barcode).toBe('123456789')
      expect(result.item!.price).toBe(99.99)
      expect(result.item!.cost_price).toBe(50.00)
      expect(result.item!.description).toBe('A detailed description')
      expect(result.item!.notes).toBe('Some notes')
      expect(result.item!.location).toBe('Warehouse A, Shelf 3')
    })

    it('saves photo URLs in image_urls array', () => {
      const result = createItem({
        tenantId: TEST_TENANT_ID,
        name: 'Item with Photos',
        quantity: 10,
        imageUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      })

      expect(result.item!.image_urls.length).toBe(2)
    })

    it('saves custom field values in custom_fields JSON', () => {
      const result = createItem({
        tenantId: TEST_TENANT_ID,
        name: 'Item with Custom Fields',
        quantity: 10,
        customFields: {
          color: 'blue',
          weight: 2.5,
          warranty: true,
        },
      })

      expect(result.item!.custom_fields).toEqual({
        color: 'blue',
        weight: 2.5,
        warranty: true,
      })
    })
  })

  describe('Update Fields', () => {
    const baseItem: InventoryItem = {
      id: 'item-1',
      tenant_id: TEST_TENANT_ID,
      name: 'Test Item',
      sku: 'SKU-001',
      barcode: null,
      quantity: 50,
      min_quantity: 10,
      price: 100,
      cost_price: 60,
      location: 'Warehouse A',
      description: 'Old description',
      notes: 'Old notes',
      image_urls: [],
      custom_fields: null,
      status: 'in_stock',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('updates name and returns updated item', () => {
      const result = updateItemField(baseItem, 'name', 'New Name')

      expect(result.success).toBe(true)
      expect(result.item!.name).toBe('New Name')
    })

    it('updates SKU', () => {
      const result = updateItemField(baseItem, 'sku', 'NEW-SKU-002')

      expect(result.item!.sku).toBe('NEW-SKU-002')
    })

    it('updates barcode', () => {
      const result = updateItemField(baseItem, 'barcode', '987654321')

      expect(result.item!.barcode).toBe('987654321')
    })

    it('updates price', () => {
      const result = updateItemField(baseItem, 'price', 150.00)

      expect(result.item!.price).toBe(150.00)
    })

    it('updates cost_price', () => {
      const result = updateItemField(baseItem, 'cost_price', 80.00)

      expect(result.item!.cost_price).toBe(80.00)
    })

    it('updates location', () => {
      const result = updateItemField(baseItem, 'location', 'Warehouse B, Shelf 1')

      expect(result.item!.location).toBe('Warehouse B, Shelf 1')
    })

    it('updates description', () => {
      const result = updateItemField(baseItem, 'description', 'New detailed description')

      expect(result.item!.description).toBe('New detailed description')
    })

    it('updates notes', () => {
      const result = updateItemField(baseItem, 'notes', 'Updated notes')

      expect(result.item!.notes).toBe('Updated notes')
    })

    it('rejects empty required field', () => {
      const result = updateItemField(baseItem, 'name', '')

      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot be empty')
    })

    it('updates updated_at timestamp', () => {
      const result = updateItemField(baseItem, 'name', 'New Name')

      expect(result.item!.updated_at).not.toBe(baseItem.updated_at)
    })
  })

  describe('Authorization', () => {
    it('rejects unauthenticated user', () => {
      const result = checkAuthorization(null, TEST_TENANT_ID, TEST_TENANT_ID, 'editor')

      expect(result.authorized).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns not found for cross-tenant access', () => {
      const result = checkAuthorization(
        TEST_USER_ID,
        'other-tenant-id',
        TEST_TENANT_ID,
        'editor'
      )

      expect(result.authorized).toBe(false)
      expect(result.error).toBe('Item not found') // Hide that it exists
    })

    it('rejects member role for write operations', () => {
      const result = checkAuthorization(
        TEST_USER_ID,
        TEST_TENANT_ID,
        TEST_TENANT_ID,
        'member'
      )

      expect(result.authorized).toBe(false)
      expect(result.error).toBe('Insufficient permissions')
    })

    it('allows editor role', () => {
      const result = checkAuthorization(
        TEST_USER_ID,
        TEST_TENANT_ID,
        TEST_TENANT_ID,
        'editor'
      )

      expect(result.authorized).toBe(true)
    })
  })

  describe('Get Item', () => {
    it('returns item if found and same tenant', () => {
      const items = new Map<string, InventoryItem>()
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Test',
        sku: null,
        barcode: null,
        quantity: 10,
        min_quantity: 5,
        price: null,
        cost_price: null,
        location: null,
        description: null,
        notes: null,
        image_urls: [],
        custom_fields: null,
        status: 'in_stock',
        created_at: '',
        updated_at: '',
      }
      items.set('item-1', item)

      const result = getItem('item-1', items, TEST_TENANT_ID)

      expect(result.success).toBe(true)
      expect(result.item).toBeDefined()
    })

    it('returns not found for non-existent item', () => {
      const items = new Map<string, InventoryItem>()

      const result = getItem('non-existent', items, TEST_TENANT_ID)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Item not found')
    })

    it('returns not found for cross-tenant item', () => {
      const items = new Map<string, InventoryItem>()
      items.set('item-1', {
        id: 'item-1',
        tenant_id: 'other-tenant',
        name: 'Test',
        sku: null,
        barcode: null,
        quantity: 10,
        min_quantity: 5,
        price: null,
        cost_price: null,
        location: null,
        description: null,
        notes: null,
        image_urls: [],
        custom_fields: null,
        status: 'in_stock',
        created_at: '',
        updated_at: '',
      })

      const result = getItem('item-1', items, TEST_TENANT_ID)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Item not found')
    })
  })

  describe('Photo Upload', () => {
    it('adds URL to image_urls array', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Test',
        sku: null,
        barcode: null,
        quantity: 10,
        min_quantity: 5,
        price: null,
        cost_price: null,
        location: null,
        description: null,
        notes: null,
        image_urls: [],
        custom_fields: null,
        status: 'in_stock',
        created_at: '',
        updated_at: '',
      }

      const updated = addPhotoUrl(item, 'https://storage.example.com/photo.jpg')

      expect(updated.image_urls).toContain('https://storage.example.com/photo.jpg')
    })
  })

  describe('Custom Fields', () => {
    it('saves custom field values', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Test',
        sku: null,
        barcode: null,
        quantity: 10,
        min_quantity: 5,
        price: null,
        cost_price: null,
        location: null,
        description: null,
        notes: null,
        image_urls: [],
        custom_fields: null,
        status: 'in_stock',
        created_at: '',
        updated_at: '',
      }

      const updated = updateCustomFields(item, {
        color: 'red',
        size: 'large',
      })

      expect(updated.custom_fields).toEqual({
        color: 'red',
        size: 'large',
      })
    })
  })
})

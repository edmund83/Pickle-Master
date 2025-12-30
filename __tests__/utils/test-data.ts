import type { InventoryItem, Folder, ActivityLog } from '@/types/database.types'

// Test tenant ID
export const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001'
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000002'

// Test Folders
export const testFolders: Folder[] = [
  {
    id: 'folder-1',
    tenant_id: TEST_TENANT_ID,
    name: 'Electronics',
    color: '#3B82F6',
    icon: null,
    parent_id: null,
    path: ['folder-1'],
    depth: 0,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'folder-2',
    tenant_id: TEST_TENANT_ID,
    name: 'Office Supplies',
    color: '#10B981',
    icon: null,
    parent_id: null,
    path: ['folder-2'],
    depth: 0,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Test Inventory Items
export const testItems: InventoryItem[] = [
  {
    id: 'item-1',
    tenant_id: TEST_TENANT_ID,
    folder_id: 'folder-1',
    name: 'Laptop',
    sku: 'LAP-001',
    barcode: null,
    quantity: 50,
    min_quantity: 10,
    price: 1500,
    cost_price: 1200,
    currency: 'MYR',
    unit: 'unit',
    status: 'in_stock',
    location: null,
    notes: null,
    image_urls: [],
    tags: [],
    custom_fields: null,
    serial_number: null,
    deleted_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: TEST_USER_ID,
    last_modified_by: TEST_USER_ID,
  },
  {
    id: 'item-2',
    tenant_id: TEST_TENANT_ID,
    folder_id: 'folder-1',
    name: 'Mouse',
    sku: 'MOU-001',
    barcode: null,
    quantity: 5,
    min_quantity: 10,
    price: 50,
    cost_price: 30,
    currency: 'MYR',
    unit: 'unit',
    status: 'low_stock',
    location: null,
    notes: null,
    image_urls: [],
    tags: [],
    custom_fields: null,
    serial_number: null,
    deleted_at: null,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    created_by: TEST_USER_ID,
    last_modified_by: TEST_USER_ID,
  },
  {
    id: 'item-3',
    tenant_id: TEST_TENANT_ID,
    folder_id: 'folder-2',
    name: 'Printer Paper',
    sku: 'PAP-001',
    barcode: null,
    quantity: 0,
    min_quantity: 5,
    price: 25,
    cost_price: 15,
    currency: 'MYR',
    unit: 'ream',
    status: 'out_of_stock',
    location: null,
    notes: null,
    image_urls: [],
    tags: [],
    custom_fields: null,
    serial_number: null,
    deleted_at: null,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    created_by: TEST_USER_ID,
    last_modified_by: TEST_USER_ID,
  },
  {
    id: 'item-4',
    tenant_id: TEST_TENANT_ID,
    folder_id: null, // Uncategorized
    name: 'Stapler',
    sku: 'STA-001',
    barcode: null,
    quantity: 20,
    min_quantity: 5,
    price: 15,
    cost_price: null, // No cost price
    currency: 'MYR',
    unit: 'unit',
    status: 'in_stock',
    location: null,
    notes: null,
    image_urls: [],
    tags: [],
    custom_fields: null,
    serial_number: null,
    deleted_at: null,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
    created_by: TEST_USER_ID,
    last_modified_by: TEST_USER_ID,
  },
  {
    id: 'item-5',
    tenant_id: TEST_TENANT_ID,
    folder_id: 'folder-2',
    name: 'Deleted Item',
    sku: 'DEL-001',
    barcode: null,
    quantity: 10,
    min_quantity: 5,
    price: 100,
    cost_price: 80,
    currency: 'MYR',
    unit: 'unit',
    status: 'in_stock',
    location: null,
    notes: null,
    image_urls: [],
    tags: [],
    custom_fields: null,
    serial_number: null,
    deleted_at: '2024-01-10T00:00:00Z', // Deleted
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    created_by: TEST_USER_ID,
    last_modified_by: TEST_USER_ID,
  },
]

// Test Activity Logs
const now = new Date()
const daysAgo = (days: number) => {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export const testActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    tenant_id: TEST_TENANT_ID,
    user_id: TEST_USER_ID,
    user_name: 'Test User',
    entity_type: 'item',
    entity_id: 'item-1',
    entity_name: 'Laptop',
    action_type: 'create',
    quantity_delta: 50,
    quantity_before: null,
    quantity_after: 50,
    from_folder_id: null,
    to_folder_id: null,
    from_folder_name: null,
    to_folder_name: null,
    changes: null,
    ip_address: null,
    user_agent: null,
    created_at: daysAgo(1),
  },
  {
    id: 'log-2',
    tenant_id: TEST_TENANT_ID,
    user_id: TEST_USER_ID,
    user_name: 'Test User',
    entity_type: 'item',
    entity_id: 'item-2',
    entity_name: 'Mouse',
    action_type: 'adjust_quantity',
    quantity_delta: -5,
    quantity_before: 10,
    quantity_after: 5,
    from_folder_id: null,
    to_folder_id: null,
    from_folder_name: null,
    to_folder_name: null,
    changes: null,
    ip_address: null,
    user_agent: null,
    created_at: daysAgo(2),
  },
  {
    id: 'log-3',
    tenant_id: TEST_TENANT_ID,
    user_id: TEST_USER_ID,
    user_name: 'Test User',
    entity_type: 'item',
    entity_id: 'item-1',
    entity_name: 'Laptop',
    action_type: 'move',
    quantity_delta: null,
    quantity_before: null,
    quantity_after: null,
    from_folder_id: null,
    to_folder_id: 'folder-1',
    from_folder_name: 'Uncategorized',
    to_folder_name: 'Electronics',
    changes: null,
    ip_address: null,
    user_agent: null,
    created_at: daysAgo(3),
  },
  {
    id: 'log-4',
    tenant_id: TEST_TENANT_ID,
    user_id: TEST_USER_ID,
    user_name: 'Test User',
    entity_type: 'item',
    entity_id: 'item-3',
    entity_name: 'Printer Paper',
    action_type: 'update',
    quantity_delta: null,
    quantity_before: null,
    quantity_after: null,
    from_folder_id: null,
    to_folder_id: null,
    from_folder_name: null,
    to_folder_name: null,
    changes: { price: { old: 20, new: 25 } },
    ip_address: null,
    user_agent: null,
    created_at: daysAgo(5),
  },
  {
    id: 'log-5',
    tenant_id: TEST_TENANT_ID,
    user_id: TEST_USER_ID,
    user_name: 'Test User',
    entity_type: 'item',
    entity_id: 'item-2',
    entity_name: 'Mouse',
    action_type: 'adjust_quantity',
    quantity_delta: 10,
    quantity_before: 5,
    quantity_after: 15,
    from_folder_id: null,
    to_folder_id: null,
    from_folder_name: null,
    to_folder_name: null,
    changes: null,
    ip_address: null,
    user_agent: null,
    created_at: daysAgo(8),
  },
  {
    id: 'log-6',
    tenant_id: TEST_TENANT_ID,
    user_id: TEST_USER_ID,
    user_name: 'Test User',
    entity_type: 'folder',
    entity_id: 'folder-1',
    entity_name: 'Electronics',
    action_type: 'create',
    quantity_delta: null,
    quantity_before: null,
    quantity_after: null,
    from_folder_id: null,
    to_folder_id: null,
    from_folder_name: null,
    to_folder_name: null,
    changes: null,
    ip_address: null,
    user_agent: null,
    created_at: daysAgo(10),
  },
]

// Test Expiring Lots
export interface ExpiringLot {
  lot_id: string
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  lot_number: string | null
  batch_code: string | null
  expiry_date: string
  quantity: number
  status: string
  location_id: string | null
  location_name: string | null
  days_until_expiry: number
  urgency: 'expired' | 'critical' | 'warning' | 'upcoming'
}

const futureDays = (days: number) => {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export const testExpiringLots: ExpiringLot[] = [
  {
    lot_id: 'lot-1',
    item_id: 'item-food-1',
    item_name: 'Milk',
    item_sku: 'MLK-001',
    item_image: null,
    lot_number: 'LOT-2024-001',
    batch_code: 'BATCH-A',
    expiry_date: futureDays(-5), // Expired 5 days ago
    quantity: 10,
    status: 'expired',
    location_id: null,
    location_name: null,
    days_until_expiry: -5,
    urgency: 'expired',
  },
  {
    lot_id: 'lot-2',
    item_id: 'item-food-2',
    item_name: 'Bread',
    item_sku: 'BRD-001',
    item_image: null,
    lot_number: 'LOT-2024-002',
    batch_code: 'BATCH-B',
    expiry_date: futureDays(3), // Expires in 3 days
    quantity: 50,
    status: 'active',
    location_id: null,
    location_name: null,
    days_until_expiry: 3,
    urgency: 'critical',
  },
  {
    lot_id: 'lot-3',
    item_id: 'item-food-3',
    item_name: 'Cheese',
    item_sku: 'CHS-001',
    item_image: null,
    lot_number: 'LOT-2024-003',
    batch_code: 'BATCH-C',
    expiry_date: futureDays(10), // Expires in 10 days
    quantity: 25,
    status: 'active',
    location_id: null,
    location_name: null,
    days_until_expiry: 10,
    urgency: 'warning',
  },
  {
    lot_id: 'lot-4',
    item_id: 'item-food-4',
    item_name: 'Butter',
    item_sku: 'BTR-001',
    item_image: null,
    lot_number: 'LOT-2024-004',
    batch_code: 'BATCH-D',
    expiry_date: futureDays(20), // Expires in 20 days
    quantity: 100,
    status: 'active',
    location_id: null,
    location_name: null,
    days_until_expiry: 20,
    urgency: 'upcoming',
  },
]

export const testExpirySummary = {
  expired_count: 1,
  expiring_7_days: 1,
  expiring_30_days: 2,
  total_value_at_risk: 1500,
}

// Helper functions for calculations
export const getActiveItems = () => testItems.filter(i => i.deleted_at === null)
export const getLowStockItems = () => getActiveItems().filter(i => i.status === 'low_stock' || i.status === 'out_of_stock')
export const getItemsWithCostPrice = () => getActiveItems().filter(i => i.cost_price && i.cost_price > 0)

export const calculateTotalValue = (items: InventoryItem[]) =>
  items.reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0)

export const calculateTotalProfit = (items: InventoryItem[]) =>
  items
    .filter(i => i.cost_price && i.cost_price > 0)
    .reduce((sum, item) => sum + item.quantity * ((item.price ?? 0) - (item.cost_price ?? 0)), 0)

export const calculateMarginPercent = (price: number, costPrice: number) =>
  costPrice > 0 ? ((price - costPrice) / costPrice) * 100 : 0

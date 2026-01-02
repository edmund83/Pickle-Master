/**
 * Offline storage types for Nook inventory management
 */

// Cached inventory item for offline barcode/SKU lookup
export interface OfflineItem {
  id: string
  barcode: string | null
  sku: string | null
  name: string
  quantity: number
  min_quantity: number | null
  price: number | null
  image_url: string | null
  folder_id: string | null
  folder_name: string | null
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  updated_at: string
  synced_at: Date
}

// Pending change to sync when back online
export interface PendingChange {
  id: string
  type: 'quantity_adjust' | 'checkout' | 'checkin' | 'create' | 'update' | 'stock_count_record'
  entity_type: 'inventory_item' | 'checkout' | 'stock_count_item'
  entity_id: string
  payload: Record<string, unknown>
  created_at: Date
  retry_count: number
  last_error?: string
  status: 'pending' | 'syncing' | 'failed' | 'completed'
}

// Batch scan session persistence
export interface BatchScanItem {
  id: string
  barcode: string
  name: string
  expected_quantity: number
  scanned_quantity: number
  status: 'pending' | 'counted' | 'discrepancy'
  scanned_at: Date
}

export interface ScanSession {
  id: string
  name: string
  mode: 'single' | 'quick' | 'batch'
  items: BatchScanItem[]
  created_at: Date
  updated_at: Date
  completed_at?: Date
}

// Sync metadata
export interface SyncMetadata {
  key: string
  value: string
  updated_at: Date
}

// Type for quantity adjustment payload
export interface QuantityAdjustPayload {
  item_id: string
  previous_quantity: number
  new_quantity: number
  adjustment: number
  reason?: string
  [key: string]: unknown // Allow indexing for Record<string, unknown> compatibility
}

// Type for checkout payload
export interface CheckoutPayload {
  item_id: string
  assigned_to_type: 'person' | 'job' | 'location'
  assigned_to_id: string
  assigned_to_name: string
  due_date?: string
  notes?: string
  [key: string]: unknown // Allow indexing for Record<string, unknown> compatibility
}

// Type for checkin payload
export interface CheckinPayload {
  checkout_id: string
  item_id: string
  condition: 'good' | 'damaged' | 'needs_repair' | 'lost'
  notes?: string
  [key: string]: unknown // Allow indexing for Record<string, unknown> compatibility
}

// Type for stock count record payload
export interface StockCountRecordPayload {
  stock_count_id: string
  stock_count_item_id: string
  item_id: string
  item_name: string
  counted_quantity: number
  expected_quantity: number
  variance: number
  counted_at: string
  [key: string]: unknown // Allow indexing for Record<string, unknown> compatibility
}

// Offline stock count item for local state
export interface OfflineStockCountItem {
  id: string
  stock_count_id: string
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  expected_quantity: number
  counted_quantity: number | null
  variance: number | null
  status: 'pending' | 'counted' | 'verified' | 'adjusted'
  synced: boolean
  updated_at: Date
}

// Offline stock count session
export interface OfflineStockCountSession {
  id: string
  stock_count_id: string
  display_id: string | null
  name: string | null
  items: OfflineStockCountItem[]
  created_at: Date
  updated_at: Date
}

/**
 * Import field definitions for bulk import feature
 * Defines all importable fields with their types, validation rules, and auto-mapping aliases
 */

export type FieldType = 'string' | 'number' | 'tags' | 'folder'

export interface ImportField {
  key: string
  label: string
  required: boolean
  type: FieldType
  aliases: string[] // Alternative header names for auto-mapping
  description?: string
}

/**
 * All fields that can be imported from CSV/Excel files
 * Order matters for UI display
 */
export const IMPORT_FIELDS: ImportField[] = [
  {
    key: 'name',
    label: 'Name',
    required: true,
    type: 'string',
    aliases: ['item_name', 'product_name', 'title', 'item', 'product'],
    description: 'Item name (required)',
  },
  {
    key: 'quantity',
    label: 'Quantity',
    required: true,
    type: 'number',
    aliases: ['qty', 'stock', 'count', 'amount', 'on_hand', 'stock_qty'],
    description: 'Current quantity in stock (required)',
  },
  {
    key: 'sku',
    label: 'SKU',
    required: false,
    type: 'string',
    aliases: ['product_sku', 'item_sku', 'code', 'item_code', 'product_code', 'sku_code'],
    description: 'Stock Keeping Unit identifier',
  },
  {
    key: 'barcode',
    label: 'Barcode',
    required: false,
    type: 'string',
    aliases: ['upc', 'ean', 'bar_code', 'gtin', 'isbn', 'upc_code', 'ean_code'],
    description: 'Barcode (UPC, EAN, etc.)',
  },
  {
    key: 'description',
    label: 'Description',
    required: false,
    type: 'string',
    aliases: ['desc', 'details', 'item_description', 'product_description', 'about'],
    description: 'Item description',
  },
  {
    key: 'unit',
    label: 'Unit',
    required: false,
    type: 'string',
    aliases: ['unit_of_measure', 'uom', 'measure', 'units'],
    description: 'Unit of measurement (e.g., pcs, kg, boxes)',
  },
  {
    key: 'min_quantity',
    label: 'Min Quantity',
    required: false,
    type: 'number',
    aliases: ['min_qty', 'reorder_point', 'minimum', 'min_stock', 'reorder_level', 'low_stock_threshold'],
    description: 'Minimum quantity threshold for low stock alerts',
  },
  {
    key: 'price',
    label: 'Price',
    required: false,
    type: 'number',
    aliases: ['sell_price', 'unit_price', 'retail_price', 'selling_price', 'sale_price'],
    description: 'Selling price',
  },
  {
    key: 'cost_price',
    label: 'Cost Price',
    required: false,
    type: 'number',
    aliases: ['cost', 'purchase_price', 'wholesale', 'buying_price', 'unit_cost'],
    description: 'Cost/purchase price',
  },
  {
    key: 'location',
    label: 'Location',
    required: false,
    type: 'string',
    aliases: ['bin', 'shelf', 'warehouse', 'storage', 'bin_location', 'shelf_location'],
    description: 'Storage location',
  },
  {
    key: 'notes',
    label: 'Notes',
    required: false,
    type: 'string',
    aliases: ['comments', 'remarks', 'memo', 'note'],
    description: 'Additional notes',
  },
  {
    key: 'tags',
    label: 'Tags',
    required: false,
    type: 'tags',
    aliases: ['labels', 'categories', 'category', 'tag'],
    description: 'Tags (comma-separated)',
  },
  {
    key: 'folder',
    label: 'Folder',
    required: false,
    type: 'folder',
    aliases: ['category', 'group', 'collection', 'folder_name', 'parent'],
    description: 'Folder/category name',
  },
]

/**
 * Get required fields only
 */
export function getRequiredFields(): ImportField[] {
  return IMPORT_FIELDS.filter((f) => f.required)
}

/**
 * Get optional fields only
 */
export function getOptionalFields(): ImportField[] {
  return IMPORT_FIELDS.filter((f) => !f.required)
}

/**
 * Get field by key
 */
export function getFieldByKey(key: string): ImportField | undefined {
  return IMPORT_FIELDS.find((f) => f.key === key)
}

/**
 * Get all field keys
 */
export function getAllFieldKeys(): string[] {
  return IMPORT_FIELDS.map((f) => f.key)
}

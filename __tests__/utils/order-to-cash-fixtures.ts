/**
 * Order-to-Cash Test Fixtures
 *
 * Factory functions and helpers for testing the complete order-to-cash workflow:
 * Sales Order → Pick List → Delivery Order → Invoice → Credit Note
 */

// Simple UUID v4 generator (good enough for tests)
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Counter for unique display IDs (since Date.now() can be same in fast succession)
let displayIdCounter = 0

function generateDisplayId(prefix: string): string {
  displayIdCounter++
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${displayIdCounter.toString(36).toUpperCase()}`
}

// Test tenant IDs for isolation testing
export const ORDER_CASH_TENANT_ID = '00000000-0000-0000-0000-000000000010'
export const ORDER_CASH_OTHER_TENANT_ID = '00000000-0000-0000-0000-000000000011'
export const ORDER_CASH_USER_ID = '00000000-0000-0000-0000-000000000012'
export const ORDER_CASH_OTHER_USER_ID = '00000000-0000-0000-0000-000000000013'

// Status types
export type SalesOrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'picking'
  | 'picked'
  | 'partial_shipped'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type DeliveryOrderStatus =
  | 'draft'
  | 'ready'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'partial'
  | 'failed'
  | 'returned'
  | 'cancelled'

export type InvoiceStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'void'

export type PickListStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled'

// Entity interfaces
export interface TestCustomer {
  id: string
  tenant_id: string
  name: string
  customer_code: string | null
  email: string | null
  phone: string | null
  billing_address1: string | null
  billing_city: string | null
  shipping_address1: string | null
  shipping_city: string | null
  created_at: string
}

export interface TestItem {
  id: string
  tenant_id: string
  name: string
  sku: string | null
  quantity: number
  price: number
  cost_price: number | null
  unit: string
  status: string
  min_quantity: number
  created_at: string
}

export interface TestSalesOrder {
  id: string
  tenant_id: string
  display_id: string
  customer_id: string | null
  status: SalesOrderStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  order_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total: number
  pick_list_id: string | null
  shipping_address: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface TestSalesOrderItem {
  id: string
  sales_order_id: string
  item_id: string | null
  item_name: string
  sku: string | null
  quantity_ordered: number
  quantity_allocated: number
  quantity_picked: number
  quantity_shipped: number
  quantity_delivered: number
  quantity_invoiced: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  line_total: number
}

export interface TestPickList {
  id: string
  tenant_id: string
  display_id: string
  status: PickListStatus
  source_entity_type: string | null
  source_entity_id: string | null
  created_by: string
  created_at: string
}

export interface TestPickListItem {
  id: string
  pick_list_id: string
  source_item_id: string | null
  source_type: string | null
  item_name: string
  requested_quantity: number
  picked_quantity: number
  picked_at: string | null
  picked_by: string | null
}

export interface TestDeliveryOrder {
  id: string
  tenant_id: string
  display_id: string
  sales_order_id: string | null
  customer_id: string | null
  pick_list_id: string | null
  status: DeliveryOrderStatus
  carrier: string | null
  tracking_number: string | null
  shipping_address: string | null
  dispatched_at: string | null
  delivered_at: string | null
  created_by: string
  created_at: string
}

export interface TestDeliveryOrderItem {
  id: string
  delivery_order_id: string
  sales_order_item_id: string | null
  item_id: string | null
  item_name: string
  quantity_shipped: number
  quantity_delivered: number
}

export interface TestInvoice {
  id: string
  tenant_id: string
  display_id: string
  invoice_type: 'invoice' | 'credit_note'
  customer_id: string
  sales_order_id: string | null
  delivery_order_id: string | null
  original_invoice_id: string | null
  status: InvoiceStatus
  invoice_date: string
  due_date: string | null
  subtotal: number
  tax_amount: number
  discount_amount: number
  total: number
  amount_paid: number
  balance_due: number
  credit_reason: string | null
  created_by: string
  created_at: string
}

export interface TestInvoiceItem {
  id: string
  invoice_id: string
  sales_order_item_id: string | null
  delivery_order_item_id: string | null
  item_id: string | null
  item_name: string
  sku: string | null
  quantity: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  line_total: number
}

export interface TestInvoicePayment {
  id: string
  invoice_id: string
  tenant_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'check' | 'other'
  reference_number: string | null
  recorded_by: string
  created_at: string
}

// Factory functions
export function createTestCustomer(
  tenantId: string = ORDER_CASH_TENANT_ID,
  overrides: Partial<TestCustomer> = {}
): TestCustomer {
  return {
    id: uuidv4(),
    tenant_id: tenantId,
    name: `Test Customer ${Date.now()}`,
    customer_code: `CUST-${Date.now().toString(36).toUpperCase()}`,
    email: `customer-${Date.now()}@test.com`,
    phone: '+1-555-0100',
    billing_address1: '123 Billing St',
    billing_city: 'Billing City',
    shipping_address1: '456 Shipping Ave',
    shipping_city: 'Shipping City',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createTestItem(
  tenantId: string = ORDER_CASH_TENANT_ID,
  overrides: Partial<TestItem> = {}
): TestItem {
  return {
    id: uuidv4(),
    tenant_id: tenantId,
    name: `Test Item ${Date.now()}`,
    sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
    quantity: 100,
    price: 50,
    cost_price: 30,
    unit: 'unit',
    status: 'in_stock',
    min_quantity: 10,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createTestSalesOrder(
  tenantId: string = ORDER_CASH_TENANT_ID,
  options: {
    customerId?: string | null
    status?: SalesOrderStatus
    displayId?: string
    shippingAddress?: string
    items?: Array<{ item: TestItem; quantity: number; unitPrice: number }>
  } = {}
): { salesOrder: TestSalesOrder; items: TestSalesOrderItem[] } {
  const salesOrderId = uuidv4()
  const displayId = options.displayId || generateDisplayId('SO')

  const items: TestSalesOrderItem[] = (options.items || []).map((itemInput) => {
    const lineTotal = itemInput.quantity * itemInput.unitPrice
    return {
      id: uuidv4(),
      sales_order_id: salesOrderId,
      item_id: itemInput.item.id,
      item_name: itemInput.item.name,
      sku: itemInput.item.sku,
      quantity_ordered: itemInput.quantity,
      quantity_allocated: 0,
      quantity_picked: 0,
      quantity_shipped: 0,
      quantity_delivered: 0,
      quantity_invoiced: 0,
      unit_price: itemInput.unitPrice,
      discount_percent: 0,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      line_total: lineTotal,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)

  const salesOrder: TestSalesOrder = {
    id: salesOrderId,
    tenant_id: tenantId,
    display_id: displayId,
    customer_id: options.customerId ?? null,
    status: options.status || 'draft',
    priority: 'normal',
    order_date: new Date().toISOString().split('T')[0],
    subtotal,
    tax_amount: 0,
    discount_amount: 0,
    total: subtotal,
    pick_list_id: null,
    shipping_address: options.shippingAddress || null,
    created_by: ORDER_CASH_USER_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return { salesOrder, items }
}

export function createTestPickList(
  tenantId: string = ORDER_CASH_TENANT_ID,
  options: {
    sourceType?: string
    sourceEntityId?: string
    status?: PickListStatus
    displayId?: string
  } = {}
): TestPickList {
  return {
    id: uuidv4(),
    tenant_id: tenantId,
    display_id: options.displayId || generateDisplayId('PL'),
    status: options.status || 'draft',
    source_entity_type: options.sourceType || null,
    source_entity_id: options.sourceEntityId || null,
    created_by: ORDER_CASH_USER_ID,
    created_at: new Date().toISOString(),
  }
}

export function createTestPickListItem(
  pickListId: string,
  options: {
    sourceItemId?: string
    sourceType?: string
    itemName?: string
    requestedQuantity?: number
    pickedQuantity?: number
  } = {}
): TestPickListItem {
  return {
    id: uuidv4(),
    pick_list_id: pickListId,
    source_item_id: options.sourceItemId || null,
    source_type: options.sourceType || null,
    item_name: options.itemName || 'Test Item',
    requested_quantity: options.requestedQuantity ?? 10,
    picked_quantity: options.pickedQuantity ?? 0,
    picked_at: null,
    picked_by: null,
  }
}

export function createTestDeliveryOrder(
  tenantId: string = ORDER_CASH_TENANT_ID,
  options: {
    salesOrderId?: string
    customerId?: string
    pickListId?: string
    status?: DeliveryOrderStatus
    displayId?: string
    carrier?: string
    trackingNumber?: string
    shippingAddress?: string
    dispatchedAt?: string
    deliveredAt?: string
  } = {}
): TestDeliveryOrder {
  return {
    id: uuidv4(),
    tenant_id: tenantId,
    display_id: options.displayId || generateDisplayId('DO'),
    sales_order_id: options.salesOrderId || null,
    customer_id: options.customerId || null,
    pick_list_id: options.pickListId || null,
    status: options.status || 'draft',
    carrier: options.carrier || null,
    tracking_number: options.trackingNumber || null,
    shipping_address: options.shippingAddress || null,
    dispatched_at: options.dispatchedAt || null,
    delivered_at: options.deliveredAt || null,
    created_by: ORDER_CASH_USER_ID,
    created_at: new Date().toISOString(),
  }
}

export function createTestDeliveryOrderItem(
  deliveryOrderId: string,
  options: {
    salesOrderItemId?: string
    itemId?: string
    itemName?: string
    quantityShipped?: number
    quantityDelivered?: number
  } = {}
): TestDeliveryOrderItem {
  return {
    id: uuidv4(),
    delivery_order_id: deliveryOrderId,
    sales_order_item_id: options.salesOrderItemId || null,
    item_id: options.itemId || null,
    item_name: options.itemName || 'Test Item',
    quantity_shipped: options.quantityShipped ?? 10,
    quantity_delivered: options.quantityDelivered ?? 0,
  }
}

export function createTestInvoice(
  tenantId: string = ORDER_CASH_TENANT_ID,
  options: {
    customerId: string
    salesOrderId?: string
    deliveryOrderId?: string
    originalInvoiceId?: string
    invoiceType?: 'invoice' | 'credit_note'
    status?: InvoiceStatus
    total?: number
    amountPaid?: number
    creditReason?: string
    displayId?: string
  }
): TestInvoice {
  const total = options.total ?? 0
  const amountPaid = options.amountPaid ?? 0

  return {
    id: uuidv4(),
    tenant_id: tenantId,
    display_id: options.displayId || generateDisplayId('INV'),
    invoice_type: options.invoiceType || 'invoice',
    customer_id: options.customerId,
    sales_order_id: options.salesOrderId || null,
    delivery_order_id: options.deliveryOrderId || null,
    original_invoice_id: options.originalInvoiceId || null,
    status: options.status || 'draft',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: null,
    subtotal: total,
    tax_amount: 0,
    discount_amount: 0,
    total,
    amount_paid: amountPaid,
    balance_due: total - amountPaid,
    credit_reason: options.creditReason || null,
    created_by: ORDER_CASH_USER_ID,
    created_at: new Date().toISOString(),
  }
}

export function createTestInvoiceItem(
  invoiceId: string,
  options: {
    salesOrderItemId?: string
    deliveryOrderItemId?: string
    itemId?: string
    itemName?: string
    sku?: string
    quantity?: number
    unitPrice?: number
    taxRate?: number
  } = {}
): TestInvoiceItem {
  const quantity = options.quantity ?? 1
  const unitPrice = options.unitPrice ?? 100
  const taxRate = options.taxRate ?? 0
  const baseAmount = quantity * unitPrice
  const taxAmount = baseAmount * taxRate / 100
  const lineTotal = baseAmount + taxAmount

  return {
    id: uuidv4(),
    invoice_id: invoiceId,
    sales_order_item_id: options.salesOrderItemId || null,
    delivery_order_item_id: options.deliveryOrderItemId || null,
    item_id: options.itemId || null,
    item_name: options.itemName || 'Test Item',
    sku: options.sku || null,
    quantity,
    unit_price: unitPrice,
    discount_percent: 0,
    discount_amount: 0,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    line_total: lineTotal,
  }
}

export function createTestInvoicePayment(
  invoiceId: string,
  tenantId: string = ORDER_CASH_TENANT_ID,
  options: {
    amount?: number
    paymentMethod?: 'cash' | 'bank_transfer' | 'card' | 'check' | 'other'
    referenceNumber?: string
  } = {}
): TestInvoicePayment {
  return {
    id: uuidv4(),
    invoice_id: invoiceId,
    tenant_id: tenantId,
    amount: options.amount ?? 100,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: options.paymentMethod || 'bank_transfer',
    reference_number: options.referenceNumber || null,
    recorded_by: ORDER_CASH_USER_ID,
    created_at: new Date().toISOString(),
  }
}

// Status transition validators
export const SO_VALID_TRANSITIONS: Record<SalesOrderStatus, SalesOrderStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['confirmed', 'draft', 'cancelled'],
  confirmed: ['picking', 'cancelled'],
  picking: ['picked', 'cancelled'],
  picked: ['partial_shipped', 'shipped'],
  partial_shipped: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: ['draft'],
}

export const DO_VALID_TRANSITIONS: Record<DeliveryOrderStatus, DeliveryOrderStatus[]> = {
  draft: ['ready', 'cancelled'],
  ready: ['dispatched', 'draft', 'cancelled'],
  dispatched: ['in_transit', 'delivered', 'failed'],
  in_transit: ['delivered', 'failed', 'partial'],
  delivered: ['partial'],
  partial: ['delivered'],
  failed: ['ready', 'returned', 'cancelled'],
  returned: ['cancelled'],
  cancelled: ['draft'],
}

export const INVOICE_VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['sent', 'draft', 'cancelled'],
  sent: ['partial', 'paid', 'overdue', 'void'],
  partial: ['paid', 'overdue', 'void'],
  paid: [],
  overdue: ['partial', 'paid', 'void'],
  cancelled: ['draft'],
  void: [],
}

export function isValidSOStatusTransition(
  current: SalesOrderStatus,
  next: SalesOrderStatus
): boolean {
  if (current === next) return true
  return SO_VALID_TRANSITIONS[current]?.includes(next) || false
}

export function isValidDOStatusTransition(
  current: DeliveryOrderStatus,
  next: DeliveryOrderStatus
): boolean {
  if (current === next) return true
  return DO_VALID_TRANSITIONS[current]?.includes(next) || false
}

export function isValidInvoiceStatusTransition(
  current: InvoiceStatus,
  next: InvoiceStatus
): boolean {
  if (current === next) return true
  return INVOICE_VALID_TRANSITIONS[current]?.includes(next) || false
}

// Financial calculation helpers
export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  taxRate: number = 0
): { subtotal: number; discountAmount: number; taxAmount: number; lineTotal: number } {
  const subtotal = quantity * unitPrice
  const discountAmount = subtotal * discountPercent / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * taxRate / 100
  const lineTotal = afterDiscount + taxAmount

  return { subtotal, discountAmount, taxAmount, lineTotal }
}

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unitPrice: number; discountPercent?: number; taxRate?: number }>
): { subtotal: number; totalDiscount: number; totalTax: number; total: number } {
  let subtotal = 0
  let totalDiscount = 0
  let totalTax = 0

  for (const item of items) {
    const calc = calculateLineTotal(
      item.quantity,
      item.unitPrice,
      item.discountPercent || 0,
      item.taxRate || 0
    )
    subtotal += calc.subtotal
    totalDiscount += calc.discountAmount
    totalTax += calc.taxAmount
  }

  return {
    subtotal,
    totalDiscount,
    totalTax,
    total: subtotal - totalDiscount + totalTax,
  }
}

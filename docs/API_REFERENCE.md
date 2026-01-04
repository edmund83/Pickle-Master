# StockZip - API Reference

## Overview

StockZip uses Next.js API routes for backend logic and Supabase for direct database access with RLS.

---

## Authentication

All API routes require authentication via Supabase Auth. Session tokens are managed via cookies.

### Auth Endpoints (Supabase-managed)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Email/password login |
| `/auth/signup` | POST | New user registration |
| `/auth/logout` | POST | Sign out user |
| `/auth/callback` | GET | OAuth callback handler |
| `/auth/reset-password` | POST | Password reset request |

---

## API Routes

### AI Assistant

#### `POST /api/ai/insights`
Get AI-powered inventory insights.

**Request:**
```json
{
  // No body required - fetches tenant inventory automatically
}
```

**Response:**
```json
{
  "insights": [
    {
      "type": "low_stock",
      "title": "Low Stock Alert",
      "description": "5 items are running low",
      "severity": "warning",
      "items": ["item-uuid-1", "item-uuid-2"],
      "recommendation": "Consider reordering these items"
    }
  ]
}
```

#### `POST /api/ai/chat`
Chat with AI about inventory.

**Request:**
```json
{
  "query": "What items are running low?",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "model", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "response": "Based on your inventory, the following items are running low..."
}
```

---

## Supabase Client Queries

### Items

#### List Items
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select(`
    *,
    folder:folders(id, name, color),
    tags:item_tags(tag:tags(id, name, color))
  `)
  .is('deleted_at', null)
  .order('updated_at', { ascending: false })
  .range(0, 49)
```

#### Create Item
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .insert({
    name: 'Widget A',
    sku: 'WGT-001',
    quantity: 100,
    min_quantity: 10,
    price: 9.99,
    folder_id: 'folder-uuid',
    created_by: user.id
  })
  .select()
  .single()
```

#### Update Item
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .update({
    quantity: 95,
    last_modified_by: user.id
  })
  .eq('id', itemId)
  .select()
  .single()
```

#### Soft Delete Item
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', itemId)
```

#### Adjust Quantity (with logging)
```typescript
const { data, error } = await supabase
  .rpc('adjust_quantity', {
    p_item_id: itemId,
    p_delta: -5,
    p_reason: 'Sold'
  })
```

#### Search Items
```typescript
// Full-text search
const { data, error } = await supabase
  .rpc('search_items_fulltext', {
    search_query: 'widget',
    p_limit: 50
  })

// Filter by status
const { data, error } = await supabase
  .from('inventory_items')
  .select('*')
  .eq('status', 'low_stock')
  .is('deleted_at', null)
```

---

### Folders

#### List Folders (Tree)
```typescript
const { data, error } = await supabase
  .from('folders')
  .select('*')
  .order('sort_order')
  .order('name')
```

#### Create Folder
```typescript
const { data, error } = await supabase
  .from('folders')
  .insert({
    name: 'Warehouse A',
    parent_id: null, // or parent folder UUID
    color: '#4f46e5',
    created_by: user.id
  })
  .select()
  .single()
```

#### Move Folder
```typescript
const { data, error } = await supabase
  .from('folders')
  .update({ parent_id: newParentId })
  .eq('id', folderId)
```

---

### Tags

#### List Tags with Stats
```typescript
const { data, error } = await supabase
  .rpc('get_tag_stats')
```

#### Create Tag
```typescript
const { data, error } = await supabase
  .from('tags')
  .insert({
    name: 'Fragile',
    color: '#ef4444'
  })
  .select()
  .single()
```

#### Assign Tags to Item
```typescript
const { data, error } = await supabase
  .rpc('set_item_tags', {
    p_item_id: itemId,
    p_tag_ids: ['tag-uuid-1', 'tag-uuid-2']
  })
```

---

### Activity Log

#### Get Recent Activity
```typescript
const { data, error } = await supabase
  .from('activity_logs')
  .select(`
    *,
    user:profiles(id, full_name, avatar_url)
  `)
  .order('created_at', { ascending: false })
  .limit(50)
```

#### Log Custom Activity
```typescript
const { data, error } = await supabase
  .from('activity_logs')
  .insert({
    entity_type: 'item',
    entity_id: itemId,
    entity_name: item.name,
    action_type: 'export',
    user_id: user.id,
    user_name: user.full_name
  })
```

---

### Pick Lists

#### List Pick Lists
```typescript
const { data, error } = await supabase
  .from('pick_lists')
  .select(`
    *,
    assigned_to:profiles(id, full_name),
    items:pick_list_items(
      *,
      item:inventory_items(id, name, sku, quantity)
    )
  `)
  .order('created_at', { ascending: false })
```

#### Create Pick List
```typescript
// Create pick list
const { data: pickList, error } = await supabase
  .from('pick_lists')
  .insert({
    name: 'Order #1234',
    assigned_to: userId,
    due_date: '2024-01-15',
    created_by: user.id
  })
  .select()
  .single()

// Add items
const { error: itemsError } = await supabase
  .from('pick_list_items')
  .insert([
    { pick_list_id: pickList.id, item_id: 'uuid-1', requested_quantity: 5 },
    { pick_list_id: pickList.id, item_id: 'uuid-2', requested_quantity: 3 }
  ])
```

#### Mark Item as Picked
```typescript
const { data, error } = await supabase
  .from('pick_list_items')
  .update({
    picked_quantity: 5,
    picked_at: new Date().toISOString(),
    picked_by: user.id
  })
  .eq('id', pickListItemId)
```

---

### Purchase Orders

#### List Purchase Orders
```typescript
const { data, error } = await supabase
  .from('purchase_orders')
  .select(`
    *,
    vendor:vendors(id, name),
    items:purchase_order_items(
      *,
      item:inventory_items(id, name, sku)
    )
  `)
  .order('created_at', { ascending: false })
```

#### Create Purchase Order
```typescript
const { data: po, error } = await supabase
  .from('purchase_orders')
  .insert({
    order_number: 'PO-2024-001',
    vendor_id: vendorId,
    expected_date: '2024-01-20',
    created_by: user.id
  })
  .select()
  .single()
```

#### Receive Items
```typescript
// Update PO item
const { error } = await supabase
  .from('purchase_order_items')
  .update({ received_quantity: 100 })
  .eq('id', poItemId)

// Adjust inventory
await supabase.rpc('adjust_quantity', {
  p_item_id: itemId,
  p_delta: 100,
  p_reason: `Received from PO ${orderNumber}`
})

// Update PO status
await supabase
  .from('purchase_orders')
  .update({
    status: 'received',
    received_date: new Date().toISOString()
  })
  .eq('id', poId)
```

---

### Notifications

#### Get Unread Notifications
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('is_read', false)
  .order('created_at', { ascending: false })
```

#### Mark as Read
```typescript
const { error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId)
```

---

### Dashboard Stats

#### Get Tenant Statistics
```typescript
const { data, error } = await supabase
  .from('tenant_stats')
  .select('*')
  .single()
```

**Returns:**
```typescript
{
  total_items: number
  low_stock_items: number
  out_of_stock_items: number
  total_folders: number
  total_value: number
  items_added_today: number
  items_updated_today: number
}
```

---

## File Storage

### Upload Item Image
```typescript
const { data, error } = await supabase.storage
  .from('item-images')
  .upload(`${tenantId}/${itemId}/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  })

const publicUrl = supabase.storage
  .from('item-images')
  .getPublicUrl(data.path).data.publicUrl
```

### Delete Item Image
```typescript
const { error } = await supabase.storage
  .from('item-images')
  .remove([`${tenantId}/${itemId}/${filename}`])
```

---

## Real-time Subscriptions

### Subscribe to Item Changes
```typescript
const channel = supabase
  .channel('items-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'inventory_items',
      filter: `tenant_id=eq.${tenantId}`
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to Notifications
```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      showNotification(payload.new)
    }
  )
  .subscribe()
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limits

| Tier | Requests/min | AI Queries/day |
|------|--------------|----------------|
| Free | 60 | 10 |
| Starter | 300 | 100 |
| Professional | 1000 | 500 |
| Enterprise | Unlimited | Unlimited |

# Pickle - Database Schema Documentation

## Overview

Pickle uses PostgreSQL via Supabase with a multi-tenant architecture. All data is isolated by `tenant_id` and protected by Row Level Security (RLS) policies.

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   tenants   │────<│  profiles   │     │     folders     │
│             │     │ (auth.users)│     │   (hierarchy)   │
└─────────────┘     └─────────────┘     └─────────────────┘
       │                   │                     │
       │                   │                     │
       ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│                    inventory_items                       │
│  (name, sku, quantity, price, status, barcode, etc.)    │
└─────────────────────────────────────────────────────────┘
       │                   │                     │
       ├───────────────────┼─────────────────────┤
       ▼                   ▼                     ▼
┌───────────┐      ┌─────────────┐      ┌──────────────┐
│ item_tags │      │activity_logs│      │    alerts    │
│(junction) │      │ (audit)     │      │(notifications│
└───────────┘      └─────────────┘      └──────────────┘
       │
       ▼
┌───────────┐
│   tags    │
└───────────┘
```

---

## Core Tables

### `tenants`
Multi-tenant root table. Each organization is a tenant.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Organization name |
| `slug` | VARCHAR(100) | Unique URL slug |
| `logo_url` | TEXT | Logo image URL |
| `primary_color` | VARCHAR(7) | Brand color (hex) |
| `settings` | JSONB | Custom settings |
| `subscription_tier` | VARCHAR(50) | free, starter, professional, enterprise |
| `subscription_status` | VARCHAR(50) | active, trial, past_due, cancelled |
| `max_users` | INTEGER | User limit by plan |
| `max_items` | INTEGER | Item limit by plan |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### `profiles`
User profiles linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | FK to auth.users |
| `tenant_id` | UUID | FK to tenants |
| `email` | VARCHAR(255) | User email |
| `full_name` | VARCHAR(255) | Display name |
| `avatar_url` | TEXT | Profile picture |
| `role` | VARCHAR(50) | owner, admin, editor, viewer, member |
| `preferences` | JSONB | User settings (timezone, date format, etc.) |
| `last_active_at` | TIMESTAMPTZ | Last activity |
| `onboarding_completed` | BOOLEAN | Onboarding status |

### `folders`
Hierarchical folder structure for organizing inventory.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `name` | VARCHAR(255) | Folder name |
| `parent_id` | UUID | FK to folders (self-ref) |
| `color` | VARCHAR(7) | Folder color (hex) |
| `icon` | VARCHAR(50) | Icon name |
| `sort_order` | INTEGER | Display order |
| `path` | TEXT[] | Materialized path for ancestry |
| `depth` | INTEGER | Nesting level (0 = root) |
| `created_by` | UUID | FK to profiles |

**Constraint:** `unique_folder_name_per_parent` - No duplicate names in same parent.

### `inventory_items`
Core inventory items table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `folder_id` | UUID | FK to folders |
| `name` | VARCHAR(500) | Item name |
| `sku` | VARCHAR(100) | Stock keeping unit |
| `serial_number` | VARCHAR(100) | Unique serial |
| `description` | TEXT | Item description |
| `quantity` | INTEGER | Current stock |
| `min_quantity` | INTEGER | Low stock threshold |
| `unit` | VARCHAR(50) | Unit of measure |
| `price` | DECIMAL(12,2) | Unit price |
| `currency` | VARCHAR(3) | Currency code (MYR) |
| `image_urls` | TEXT[] | Array of image URLs |
| `barcode` | VARCHAR(100) | Barcode value |
| `qr_code` | VARCHAR(100) | QR code value |
| `status` | VARCHAR(50) | in_stock, low_stock, out_of_stock |
| `location` | VARCHAR(255) | Physical location |
| `tags` | TEXT[] | Legacy tag array |
| `notes` | TEXT | Additional notes |
| `custom_fields` | JSONB | Custom attributes |
| `created_by` | UUID | FK to profiles |
| `last_modified_by` | UUID | FK to profiles |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |
| `embedding` | vector(1536) | AI semantic search |
| `search_vector` | tsvector | Full-text search (generated) |

**Indexes:**
- `idx_items_tenant` - Tenant isolation
- `idx_items_folder` - Folder lookup
- `idx_items_status` - Status filtering
- `idx_items_sku` - SKU search
- `idx_items_barcode` - Barcode scan
- `idx_items_tags` - GIN for tag array
- `idx_items_name_search` - Trigram for fuzzy search
- `idx_items_embedding` - IVFFlat for semantic search
- `idx_items_search_vector` - GIN for full-text search

---

## Relationship Tables

### `tags`
Normalized tag definitions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `name` | VARCHAR(100) | Tag name |
| `color` | VARCHAR(7) | Tag color (hex) |

### `item_tags`
Junction table for item-tag relationships.

| Column | Type | Description |
|--------|------|-------------|
| `item_id` | UUID | FK to inventory_items |
| `tag_id` | UUID | FK to tags |
| `created_at` | TIMESTAMPTZ | Assignment time |
| `created_by` | UUID | FK to profiles |

**Primary Key:** `(item_id, tag_id)`

---

## Workflow Tables

### `pick_lists`
Pick/pack lists for order fulfillment.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `name` | VARCHAR(255) | List name |
| `status` | VARCHAR(50) | draft, in_progress, completed, cancelled |
| `notes` | TEXT | Instructions |
| `assigned_to` | UUID | FK to profiles |
| `due_date` | DATE | Due date |
| `completed_at` | TIMESTAMPTZ | Completion time |
| `created_by` | UUID | FK to profiles |

### `pick_list_items`
Items in a pick list.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pick_list_id` | UUID | FK to pick_lists |
| `item_id` | UUID | FK to inventory_items |
| `requested_quantity` | INTEGER | Quantity to pick |
| `picked_quantity` | INTEGER | Actually picked |
| `picked_at` | TIMESTAMPTZ | Pick timestamp |
| `picked_by` | UUID | FK to profiles |

### `purchase_orders`
Purchase orders for restocking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `order_number` | VARCHAR(50) | PO number |
| `vendor_id` | UUID | FK to vendors |
| `status` | VARCHAR(50) | draft, submitted, confirmed, partial, received, cancelled |
| `expected_date` | DATE | Expected delivery |
| `received_date` | DATE | Actual delivery |
| `subtotal` | DECIMAL(12,2) | Order subtotal |
| `tax` | DECIMAL(12,2) | Tax amount |
| `shipping` | DECIMAL(12,2) | Shipping cost |
| `total` | DECIMAL(12,2) | Grand total |

### `purchase_order_items`
Line items in a purchase order.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `purchase_order_id` | UUID | FK to purchase_orders |
| `item_id` | UUID | FK to inventory_items |
| `item_name` | VARCHAR(500) | Item name snapshot |
| `sku` | VARCHAR(100) | SKU snapshot |
| `ordered_quantity` | INTEGER | Quantity ordered |
| `received_quantity` | INTEGER | Quantity received |
| `unit_price` | DECIMAL(12,2) | Unit price |

---

## Vendor & Address Tables

### `vendors`
Supplier/vendor information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `name` | VARCHAR(255) | Vendor name |
| `contact_name` | VARCHAR(255) | Contact person |
| `email` | VARCHAR(255) | Email address |
| `phone` | VARCHAR(50) | Phone number |
| `address_line1` | VARCHAR(500) | Street address |
| `city` | VARCHAR(255) | City |
| `state` | VARCHAR(255) | State/province |
| `postal_code` | VARCHAR(50) | ZIP/postal code |
| `country` | VARCHAR(100) | Country |
| `notes` | TEXT | Notes |

### `addresses`
Business addresses for shipping/billing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `name` | VARCHAR(255) | Address label |
| `address_line1` | VARCHAR(500) | Street address |
| `city` | VARCHAR(255) | City |
| `country` | VARCHAR(100) | Country |
| `is_default_primary` | BOOLEAN | Default address |
| `is_default_shipping` | BOOLEAN | Default shipping |
| `is_default_billing` | BOOLEAN | Default billing |

---

## Audit & Notification Tables

### `activity_logs`
Audit trail for all changes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `user_id` | UUID | FK to profiles |
| `user_name` | VARCHAR(255) | User name snapshot |
| `entity_type` | VARCHAR(50) | item, folder, tag, etc. |
| `entity_id` | UUID | Target entity ID |
| `entity_name` | VARCHAR(500) | Entity name snapshot |
| `action_type` | VARCHAR(50) | create, update, delete, adjust_quantity, move |
| `changes` | JSONB | Before/after diff |
| `quantity_delta` | INTEGER | Quantity change |
| `quantity_before` | INTEGER | Previous quantity |
| `quantity_after` | INTEGER | New quantity |
| `from_folder_id` | UUID | Source folder (for moves) |
| `to_folder_id` | UUID | Target folder (for moves) |
| `ip_address` | INET | Client IP |
| `user_agent` | TEXT | Browser info |
| `created_at` | TIMESTAMPTZ | Action timestamp |

### `notifications`
User notifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `user_id` | UUID | FK to profiles |
| `title` | VARCHAR(255) | Notification title |
| `message` | TEXT | Notification body |
| `notification_type` | VARCHAR(50) | low_stock, out_of_stock, order_update, etc. |
| `entity_type` | VARCHAR(50) | Related entity type |
| `entity_id` | UUID | Related entity ID |
| `is_read` | BOOLEAN | Read status |
| `read_at` | TIMESTAMPTZ | Read timestamp |

### `alerts`
Stock alerts and thresholds.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `target_type` | VARCHAR(50) | item, folder |
| `target_id` | UUID | Target entity |
| `alert_type` | VARCHAR(50) | low_stock, out_of_stock, expiring_soon |
| `threshold` | INTEGER | Alert threshold |
| `threshold_date` | DATE | Date threshold |
| `notify_email` | BOOLEAN | Email notification |
| `notify_push` | BOOLEAN | Push notification |
| `is_active` | BOOLEAN | Alert enabled |
| `last_triggered_at` | TIMESTAMPTZ | Last trigger |

---

## Custom Fields

### `custom_field_definitions`
User-defined field schemas.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK to tenants |
| `name` | VARCHAR(255) | Field name |
| `field_type` | VARCHAR(50) | text, number, date, select, etc. |
| `options` | JSONB | Options for select fields |
| `required` | BOOLEAN | Required field |
| `sort_order` | INTEGER | Display order |

---

## Enum Types

```sql
-- Item status
item_status_enum: 'in_stock', 'low_stock', 'out_of_stock'

-- User roles
user_role_enum: 'owner', 'admin', 'editor', 'viewer', 'member'

-- Subscription tiers
subscription_tier_enum: 'free', 'starter', 'professional', 'enterprise'

-- Subscription status
subscription_status_enum: 'active', 'trial', 'past_due', 'cancelled', 'suspended'

-- Pick list status
pick_list_status_enum: 'draft', 'in_progress', 'completed', 'cancelled'

-- Purchase order status
po_status_enum: 'draft', 'submitted', 'confirmed', 'partial', 'received', 'cancelled'

-- Notification types
notification_type_enum: 'low_stock', 'out_of_stock', 'order_update',
                        'pick_list_assigned', 'system', 'team', 'alert', 'welcome'

-- Activity actions
activity_action_enum: 'create', 'update', 'delete', 'restore', 'adjust_quantity',
                      'move', 'archive', 'login', 'logout', 'export', 'import',
                      'bulk_update', 'assign', 'complete'

-- Entity types
entity_type_enum: 'item', 'folder', 'tag', 'pick_list', 'purchase_order',
                  'vendor', 'address', 'profile', 'tenant', 'alert', 'notification'

-- Alert types
alert_type_enum: 'low_stock', 'out_of_stock', 'expiring_soon', 'reorder_point', 'custom'

-- Custom field types
field_type_enum: 'text', 'number', 'date', 'datetime', 'boolean', 'select',
                 'multi_select', 'url', 'email', 'phone', 'currency', 'percentage'
```

---

## Database Functions

### Authentication & Authorization
| Function | Description |
|----------|-------------|
| `get_user_tenant_id()` | Get current user's tenant ID |
| `can_edit()` | Check if user has edit permission |
| `can_admin()` | Check if user has admin permission |

### Item Management
| Function | Description |
|----------|-------------|
| `update_item_status()` | Auto-update status based on quantity (trigger) |
| `adjust_quantity()` | Adjust item quantity with logging |
| `move_item()` | Move item to different folder |
| `bulk_move_items()` | Move multiple items at once |

### Tag Management
| Function | Description |
|----------|-------------|
| `get_items_by_tag(tag_id)` | Get all items with a tag |
| `get_item_tags(item_id)` | Get all tags for an item |
| `add_tags_to_item(item_id, tag_ids[])` | Add tags to item |
| `remove_tags_from_item(item_id, tag_ids[])` | Remove tags from item |
| `set_item_tags(item_id, tag_ids[])` | Replace all tags |
| `get_tag_stats()` | Get tag usage statistics |

### Search Functions
| Function | Description |
|----------|-------------|
| `search_items_fulltext(query, limit)` | Full-text search with ranking |
| `search_items_semantic(embedding, limit)` | Semantic/vector search |
| `search_items_hybrid(query, embedding)` | Combined search |
| `find_similar_items(item_id, limit)` | Find similar items by embedding |

### Analytics
| Function | Description |
|----------|-------------|
| `get_tenant_stats()` | Dashboard statistics view |
| `get_low_stock_items(limit)` | Items below minimum quantity |
| `get_recent_activity(days)` | Recent activity log |

---

## Row Level Security (RLS)

All tables have RLS enabled with policies based on `get_user_tenant_id()`:

```sql
-- Example: Users can only see their tenant's data
CREATE POLICY "tenant_isolation" ON inventory_items
    FOR SELECT USING (tenant_id = get_user_tenant_id());

-- Example: Only editors can modify
CREATE POLICY "editors_can_update" ON inventory_items
    FOR UPDATE USING (tenant_id = get_user_tenant_id() AND can_edit());
```

---

## Migrations

Located in `supabase/migrations/`:

| Migration | Purpose |
|-----------|---------|
| `00001_initial_schema.sql` | Core tables & triggers |
| `00002_rls_policies.sql` | RLS policies |
| `00003_storage_setup.sql` | Storage buckets |
| `00004_auth_trigger.sql` | Profile creation trigger |
| `00005_performance_indexes.sql` | Additional indexes |
| `00006_rls_optimization.sql` | Optimized RLS with functions |
| `00007_enum_types.sql` | Enum types & validation |
| `00008_normalize_tags.sql` | Tag junction table |
| `00009_activity_log_partitioning.sql` | Log partitioning |
| `00010_tenant_stats_view.sql` | Statistics views |
| `00011_ai_embeddings.sql` | Vector search support |
| `00012_api_functions.sql` | API helper functions |

---

## Performance Optimizations

1. **Composite indexes** on frequently filtered columns
2. **GIN indexes** for array and JSONB columns
3. **Trigram indexes** for fuzzy text search
4. **IVFFlat indexes** for vector similarity search
5. **Materialized path** for folder hierarchy queries
6. **Activity log partitioning** by month for large datasets
7. **RLS optimization** using `SECURITY DEFINER` functions
8. **Generated columns** for full-text search vectors

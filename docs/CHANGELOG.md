# Changelog

All notable changes to Pickle are documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added

#### Sortly-Compatible Label System
- **5 QR Label Sizes** matching Sortly's label options:
  - Extra Large (5½" × 8½") - Half sheet, 2/sheet - Avery 8126
  - Large (3⅓" × 4") - 6/sheet - Avery 5164/8164
  - Medium (2" × 4") - 10/sheet - Avery 5163/8163
  - Small (1⅓" × 4") - 14/sheet - Avery 5162/8162
  - Extra Small (1" × 2⅝") - 30/sheet - Avery 5160/8160
- **Thermal Printer Support** for DYMO LabelWriter (¾" × 2" labels)
- **Dynamic Label Features** based on size:
  - Extra Large/Large: Photo, logo, up to 3 details, note
  - Medium: 1 detail field only
  - Small/Extra Small/Thermal: Name and code only
- **Live Preview Components** for all 6 label sizes
- **Smart UI** that hides unavailable options for smaller label sizes
- Updated Avery product compatibility references

---

## [0.1.0] - 2024-12-20

### Added

#### Core Platform
- Multi-tenant SaaS architecture with pool model (shared tables, RLS isolation)
- Row Level Security (RLS) policies on all 19+ tables
- User authentication via Supabase Auth
- Role-based access control (owner, admin, editor, viewer, member)
- Tenant settings with subscription tiers (free, starter, professional, enterprise)

#### Inventory Management
- Items with full attributes (name, SKU, quantity, price, cost_price, status, barcode, QR code)
- Hierarchical folder structure with materialized path
- Normalized tags with junction table (item_tags)
- Custom field definitions
- Photo uploads to Supabase Storage
- Full-text search with tsvector
- AI semantic search with vector embeddings (pgvector)

#### Check-In/Check-Out System
- Jobs/projects for asset assignments
- Checkout tracking (person, job, or location assignments)
- Due date management with overdue status
- Return condition tracking (good, damaged, needs_repair, lost)

#### Multi-Location Inventory
- Location types: warehouse, van, store, job_site
- Per-location stock tracking (location_stock table)
- Stock transfers between locations with status workflow
- AI-suggested transfers with reasoning

#### Lot/Expiry Tracking
- Multiple lots per item with different expiry dates
- FEFO (First Expired First Out) consumption logic
- Lot status management (active, expired, depleted, blocked)
- Automatic quantity sync from lots

#### Quota Enforcement
- Database-level triggers to enforce max_items and max_users limits
- Application-level validation before item/user creation
- Warning banner at 80% usage on all dashboard pages
- Grandfather strategy for existing over-limit tenants

#### Workflow Features
- Pick lists for order fulfillment
- Purchase orders with vendor management
- Activity logging with full audit trail
- Notifications system (in-app, email for low stock)

#### UI/UX
- Mobile-first responsive design
- Touch 'n Go style expandable action button
- CSV import/export
- QR/barcode scanning
- Offline-first with sync queue

### Database Migrations

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
| `00013_check_in_out.sql` | Check-in/check-out system |
| `00014_multi_location_inventory.sql` | Multi-location inventory |
| `00015_lot_expiry_tracking.sql` | Lot/expiry tracking |
| `00016_extended_inventory_fields.sql` | Shipping dimensions, tracking mode |
| `00017_allow_admin_update_tenant.sql` | Admin RLS for tenant settings |
| `00018_quota_enforcement.sql` | Quota enforcement triggers |

### Technical Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, RLS)
- FlyonUI components

---

## Version History Format

Each release should document:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed in future
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
- **Database**: Migration changes

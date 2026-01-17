/**
 * Help Knowledge Base for Zoe AI Assistant
 * Condensed from docs/Learn.md to provide feature knowledge
 */

export interface HelpTopic {
  id: string
  title: string
  description: string
  helpUrl: string
  keywords: string[]
  quickTips: string[]
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Create your account, complete onboarding, and understand StockZip navigation.',
    helpUrl: '/help/getting-started',
    keywords: ['start', 'begin', 'new', 'setup', 'onboarding', 'first time', 'account', 'sign up', 'register'],
    quickTips: [
      'Sign up with email/password or Google',
      'Complete onboarding by creating your first item',
      'Main sections: Dashboard, Inventory, Tasks, Reports, Partners, Settings'
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'View real-time inventory metrics, status indicators, and recent activity at a glance.',
    helpUrl: '/help/dashboard',
    keywords: ['dashboard', 'home', 'overview', 'metrics', 'stats', 'activity', 'feed'],
    quickTips: [
      'Widgets show: Total Items, Total Value, Low Stock, Out of Stock, Recent Activity',
      'Color codes: Green (in stock), Yellow (low stock), Red (out of stock)',
      'Click any metric card to view related items'
    ]
  },
  {
    id: 'items',
    title: 'Managing Inventory Items',
    description: 'Add, edit, and manage inventory items with photos, prices, SKUs, and custom fields.',
    helpUrl: '/help/items',
    keywords: ['item', 'product', 'add', 'create', 'edit', 'delete', 'inventory', 'sku', 'barcode', 'photo', 'custom field'],
    quickTips: [
      'Quick Add: Name + Quantity only, expand for full details',
      'Inline editing: Click quantity to edit directly, use +1/-1 buttons',
      'Fields: SKU, barcode, photo, description, notes, min stock, prices, tags, custom fields',
      'Deleted items can be recovered by admin (soft delete)'
    ]
  },
  {
    id: 'folders',
    title: 'Organizing with Folders',
    description: 'Create hierarchical folder structure for warehouses, shelves, and categories.',
    helpUrl: '/help/folders',
    keywords: ['folder', 'location', 'organize', 'hierarchy', 'warehouse', 'shelf', 'category', 'move', 'drag'],
    quickTips: [
      'Create nested folders: Warehouse > Aisle > Shelf',
      'Move items: Drag-drop, edit item folder, or bulk move',
      'Each folder shows total items and value'
    ]
  },
  {
    id: 'scanning',
    title: 'Barcode & QR Code Scanning',
    description: 'Use camera or hardware scanner to look up items and adjust quantities quickly.',
    helpUrl: '/help/scanning',
    keywords: ['scan', 'barcode', 'qr', 'camera', 'scanner', 'upc', 'ean', 'code 128'],
    quickTips: [
      'Modes: Single Scan (lookup), Quick Adjust (immediate +/-), Batch Counting',
      'Supported formats: Code 128, Code 39, UPC-A, EAN-13, EAN-8, ITF-14, QR',
      'Hardware scanners work via USB or Bluetooth',
      'Unknown barcodes prompt to create new item'
    ]
  },
  {
    id: 'labels',
    title: 'Printing Labels',
    description: 'Generate QR/barcode labels in various sizes for Avery sheets or thermal printers.',
    helpUrl: '/help/labels',
    keywords: ['label', 'print', 'qr', 'barcode', 'avery', 'thermal', 'sticker'],
    quickTips: [
      'Avery sizes: 5.5x8.5 (2/sheet), 3.33x4 (6), 2x4 (10), 1.33x4 (14), 1x2.625 (30)',
      'Thermal printer: 19 standard sizes from 1x3 to 4x6 inches',
      'Content options: Name, QR/barcode, photo, logo, SKU, price, notes'
    ]
  },
  {
    id: 'search',
    title: 'Search & Filtering',
    description: 'Find items instantly with global search and advanced filters.',
    helpUrl: '/help/search',
    keywords: ['search', 'filter', 'find', 'query', 'saved search'],
    quickTips: [
      'Global search: Cmd/Ctrl+K from anywhere',
      'Searchable: Name, SKU, barcode, description, notes, tags',
      'Filters: Status, folder, tags, date range, quantity range',
      'Save frequent searches for one-click access'
    ]
  },
  {
    id: 'purchase-orders',
    title: 'Purchase Orders & Receiving',
    description: 'Create purchase orders, track vendor confirmations, and receive goods into inventory.',
    helpUrl: '/help/purchase-orders',
    keywords: ['purchase order', 'po', 'order', 'buy', 'receive', 'receiving', 'goods receipt', 'vendor order'],
    quickTips: [
      'PO Status: Draft > Submitted > Confirmed > Partial > Received > Cancelled',
      'Add items with quantities, prices, vendor part numbers',
      'Receive: Enter qty received, location, condition, lot/serial info',
      'Supports partial shipments with multiple receives'
    ]
  },
  {
    id: 'pick-lists',
    title: 'Pick Lists & Fulfillment',
    description: 'Create pick lists to gather items for orders with decrement, checkout, or transfer options.',
    helpUrl: '/help/pick-lists',
    keywords: ['pick list', 'pick', 'fulfill', 'order', 'ship', 'decrement', 'transfer'],
    quickTips: [
      'Outcomes: Decrement (subtract qty), Checkout (assign to customer), Transfer (move location)',
      'Assign to team member with due date',
      'Supports partial picking if full qty unavailable',
      'Status: Draft > Assigned > In Progress > Completed'
    ]
  },
  {
    id: 'stock-counts',
    title: 'Stock Counts (Cycle Counting)',
    description: 'Verify inventory accuracy through physical counts and variance tracking.',
    helpUrl: '/help/stock-counts',
    keywords: ['stock count', 'cycle count', 'physical count', 'inventory count', 'variance', 'audit', 'reconcile'],
    quickTips: [
      'Scope: Entire inventory, specific folder, or location',
      'Enter actual qty, system calculates variance (expected vs actual)',
      'Apply adjustments to update inventory quantities',
      'Status: Draft > In Progress > Review > Completed'
    ]
  },
  {
    id: 'checkouts',
    title: 'Check-In / Check-Out (Asset Tracking)',
    description: 'Track items assigned to people, jobs, or locations with due dates and return conditions.',
    helpUrl: '/help/checkouts',
    keywords: ['checkout', 'check out', 'check in', 'assign', 'asset', 'loan', 'borrow', 'return', 'due date', 'overdue'],
    quickTips: [
      'Assign to: Person, Job/Project, or Location',
      'Set due date for return reminders',
      'Return conditions: Good, Damaged, Needs Repair, Lost',
      'Overdue items flagged on dashboard'
    ]
  },
  {
    id: 'lots',
    title: 'Lot & Batch Tracking',
    description: 'Track inventory by lot/batch for expiry management with FEFO (First Expired First Out).',
    helpUrl: '/help/lots',
    keywords: ['lot', 'batch', 'expiry', 'expire', 'fefo', 'manufactured', 'perishable'],
    quickTips: [
      'Enable per item: Set tracking mode to Lot/Batch',
      'Track: Lot number, batch code, expiry date, manufactured date, quantity',
      'Status: Active, Expired, Depleted, Blocked',
      'FEFO auto-prioritizes earliest-expiring lots'
    ]
  },
  {
    id: 'serials',
    title: 'Serial Number Tracking',
    description: 'Track individual units by unique serial numbers with condition and history.',
    helpUrl: '/help/serials',
    keywords: ['serial', 'serial number', 'individual', 'unit', 'unique'],
    quickTips: [
      'Enable per item: Set tracking mode to Serial Number',
      'Entry methods: Scan (continuous), Manual, Bulk Paste',
      'Per-serial: Condition, location, checkout history',
      'Duplicate detection warns if serial exists'
    ]
  },
  {
    id: 'reminders',
    title: 'Reminders & Alerts',
    description: 'Set up notifications for low stock, expiry dates, and scheduled restocking.',
    helpUrl: '/help/reminders',
    keywords: ['reminder', 'alert', 'notification', 'low stock', 'expiry', 'restock', 'notify'],
    quickTips: [
      'Types: Low Stock (qty threshold), Expiry (days before), Restock (scheduled)',
      'Recurrence: Once, Daily, Weekly, Monthly',
      'Delivery: In-app bell, Email, Push notification'
    ]
  },
  {
    id: 'reorder',
    title: 'Auto-Reorder Suggestions',
    description: 'Automatic identification of items needing reorder, grouped by vendor for easy PO creation.',
    helpUrl: '/help/reorder',
    keywords: ['reorder', 'auto reorder', 'suggestion', 'replenish', 'restock'],
    quickTips: [
      'Triggers: Below reorder point, below min qty, out of stock',
      'Urgency: Critical (red), Urgent (orange), Reorder (yellow)',
      'Grouped by vendor with estimated totals',
      'One-click to create PO from suggestions'
    ]
  },
  {
    id: 'vendors',
    title: 'Vendors & Partners',
    description: 'Manage suppliers with contact info and link items to vendors with SKUs and pricing.',
    helpUrl: '/help/vendors',
    keywords: ['vendor', 'supplier', 'partner', 'customer', 'contact'],
    quickTips: [
      'Store: Name, contact, email, phone, address, notes',
      'Link items: Vendor SKU, unit cost, lead time, preferred vendor',
      'Benefits: Auto-fills POs, powers reorder suggestions'
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Generate inventory reports for value, movements, low stock, expiring items, and trends.',
    helpUrl: '/help/reports',
    keywords: ['report', 'analytics', 'export', 'csv', 'value', 'movement', 'trend', 'profit'],
    quickTips: [
      'Reports: Summary, Value, Low Stock, Movements, Activity Log, Expiring, Profit Margin, Trends',
      'Filters: Date range, categories, locations',
      'Export to CSV for external analysis'
    ]
  },
  {
    id: 'team',
    title: 'Team Management',
    description: 'Manage team members with role-based access and activity attribution.',
    helpUrl: '/help/team',
    keywords: ['team', 'user', 'member', 'role', 'permission', 'invite', 'admin', 'editor', 'viewer'],
    quickTips: [
      'Roles: Owner (full + billing), Admin (manage all), Editor (create/edit), Viewer (read-only)',
      'All changes logged with who/when',
      'View in activity feed, item history, activity log report'
    ]
  },
  {
    id: 'settings',
    title: 'Settings & Configuration',
    description: 'Customize company info, profile, preferences, labels, taxes, and feature toggles.',
    helpUrl: '/help/settings',
    keywords: ['setting', 'config', 'preference', 'company', 'profile', 'theme', 'currency', 'tax'],
    quickTips: [
      'Company: Name, logo, primary color, tax ID',
      'Profile: Display name, email, avatar, timezone, date format',
      'Preferences: Theme (light/dark), currency, notifications',
      'Labels: Default size, barcode format, logo'
    ]
  },
  {
    id: 'import-export',
    title: 'Bulk Import & Export',
    description: 'Import items from CSV/Excel (up to 50,000 rows) and export inventory data.',
    helpUrl: '/help/import-export',
    keywords: ['import', 'export', 'csv', 'excel', 'bulk', 'upload', 'download', 'template'],
    quickTips: [
      'Import: Upload CSV/Excel, map columns, preview, import',
      'Required fields: Name, Quantity (minimum)',
      'SKU matching updates existing items instead of duplicating',
      'Folder paths auto-create hierarchy (e.g., "Warehouse/Shelf A")'
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile & Offline Usage',
    description: 'Mobile-first design with offline support, PWA installation, and automatic sync.',
    helpUrl: '/help/mobile',
    keywords: ['mobile', 'offline', 'app', 'pwa', 'sync', 'phone', 'tablet'],
    quickTips: [
      'Offline works: Browse, search, filter, view, adjust qty, scan, create items',
      'Changes queue automatically, sync when connected (<30 sec)',
      'Install as PWA: iOS Safari share > Add to Home, Android Chrome menu > Add to Home'
    ]
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Speed up workflow with keyboard shortcuts for search, navigation, and actions.',
    helpUrl: '/help/shortcuts',
    keywords: ['shortcut', 'keyboard', 'hotkey', 'key', 'cmd', 'ctrl'],
    quickTips: [
      'Global: Cmd/Ctrl+K (search), Cmd/Ctrl+N (new item), Cmd/Ctrl+S (save), ? (help)',
      'Navigation: G+D (Dashboard), G+I (Inventory), G+S (Scan)',
      'Item: E (edit), P (print label), C (checkout), Delete (delete)'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting & FAQ',
    description: 'Solutions for common issues with syncing, scanning, imports, and alerts.',
    helpUrl: '/help/troubleshooting',
    keywords: ['troubleshoot', 'problem', 'issue', 'error', 'help', 'faq', 'not working', 'fix'],
    quickTips: [
      'Sync issues: Check offline banner, pull to refresh, re-login if stuck',
      'Scanner: Check camera permission, lighting, distance, clean lens',
      'Import: Use template CSV, check required fields, max 50,000 rows',
      'Alerts: Verify min_quantity set, reminder created, notifications enabled'
    ]
  }
]

/**
 * Condensed feature summary for system prompts (~3KB)
 */
export const FEATURE_SUMMARY = `StockZip Features Overview:

DASHBOARD: View metrics (total items, value, low/out of stock), activity feed. Color codes: green=in stock, yellow=low, red=out. Click metrics to see items.

ITEMS: Add items with name, SKU, barcode, photos, min stock level, unit cost, selling price, tags, custom fields. Use +1/-1 for quick adjustments. Inline edit quantities. Soft delete (recoverable).

FOLDERS: Create hierarchical structure (warehouse > aisle > shelf). Move items via drag-drop, edit, or bulk move. Each folder shows item count and value.

SCANNING: Camera-based barcode/QR scanning. Modes: Single scan (lookup), Quick adjust (immediate +/-), Batch counting. Supports Code 128, Code 39, UPC-A, EAN-13, EAN-8, ITF-14, QR. Hardware scanners via USB/Bluetooth.

LABELS: Print QR/barcode labels. Avery sheets: 2/sheet to 30/sheet. Thermal: 1"x3" to 4"x6". Include name, code, photo, logo, SKU, price, notes.

SEARCH: Global search Cmd/Ctrl+K. Searches name, SKU, barcode, description, notes, tags. Filters: status, folder, tags, date, quantity. Save frequent searches.

PURCHASE ORDERS: Create POs with vendor, items, quantities, prices. Status: Draft > Submitted > Confirmed > Partial > Received > Cancelled. Receive with qty, location, condition, lot/serial info.

PICK LISTS: Create for order fulfillment. Outcomes: Decrement qty, Checkout to customer, Transfer location. Assign to team member with due date. Supports partial picking.

STOCK COUNTS: Physical inventory counts by scope (all, folder, location). Enter actual qty, see variance vs expected. Apply adjustments to update. Status: Draft > In Progress > Review > Completed.

CHECK-IN/OUT: Track items assigned to people/jobs/locations. Set due dates, record return condition (good/damaged/needs repair/lost). Overdue alerts on dashboard.

LOT TRACKING: Track batches with lot number, expiry, manufactured date. FEFO auto-prioritizes earliest-expiring. Status: Active, Expired, Depleted, Blocked.

SERIAL NUMBERS: Track individual units. Entry: Scan continuous, manual, bulk paste. Per-serial condition, location, history. Duplicate detection.

REMINDERS: Low stock (qty threshold), Expiry (days before), Restock (scheduled). Delivery: In-app, email, push. Recurrence: once, daily, weekly, monthly.

AUTO-REORDER: Identifies items below reorder point, min qty, or out of stock. Urgency levels (critical/urgent/reorder). Grouped by vendor. One-click PO creation.

VENDORS: Store supplier info (name, contact, email, phone, address). Link items with vendor SKU, cost, lead time. Powers auto-reorder and PO creation.

REPORTS: Inventory summary, value by location/category, low stock, stock movements, activity log, expiring items, profit margin, trends. Export to CSV.

TEAM: Roles - Owner (full + billing), Admin (manage all), Editor (create/edit), Viewer (read-only). All changes logged with user and timestamp.

SETTINGS: Company (name, logo, color), Profile (name, email, timezone), Preferences (theme, currency, notifications), Labels (defaults), Taxes.

IMPORT/EXPORT: CSV/Excel import up to 50K rows. Column mapping, validation, error reporting. SKU matching updates existing. Export filtered data.

MOBILE/OFFLINE: PWA installable. Offline: browse, search, filter, view, adjust, scan, create. Auto-sync when connected. Pull to refresh.

SHORTCUTS: Cmd/Ctrl+K (search), Cmd/Ctrl+N (new item), G+D (dashboard), G+I (inventory), E (edit), P (print), C (checkout).`

/**
 * Get help topic list for inventory-focused prompts
 */
export function getHelpTopicList(): string {
  return HELP_TOPICS.map(t => `- ${t.title} (${t.helpUrl})`).join('\n')
}

/**
 * Find topics relevant to a query
 */
export function findRelevantTopics(query: string, maxTopics: number = 3): HelpTopic[] {
  const queryLower = query.toLowerCase()

  return HELP_TOPICS
    .map(topic => ({
      topic,
      score: topic.keywords.filter(kw => queryLower.includes(kw.toLowerCase())).length
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTopics)
    .map(({ topic }) => topic)
}

/**
 * Format relevant topics for inclusion in prompts
 */
export function formatRelevantTopics(topics: HelpTopic[]): string {
  if (topics.length === 0) return ''

  return topics.map(t =>
    `- **${t.title}** (${t.helpUrl}): ${t.description}\n  Tips: ${t.quickTips.join(' | ')}`
  ).join('\n\n')
}

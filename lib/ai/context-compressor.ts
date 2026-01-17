/**
 * Context Compression Utilities for Zoe AI
 *
 * Reduces token usage by 50-70% through:
 * - Compact pipe-delimited format instead of verbose JSON
 * - Status abbreviations (in_stock -> I)
 * - Minimal field representation
 */

// Status abbreviation map
const STATUS_MAP: Record<string, string> = {
  in_stock: 'I',
  low_stock: 'L',
  out_of_stock: 'O',
  pending: 'P',
  completed: 'C',
  draft: 'D',
  in_progress: 'IP',
  submitted: 'S',
  approved: 'A',
  cancelled: 'X',
  checked_out: 'CO',
  received: 'R',
}

const REVERSE_STATUS_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, k])
)

/**
 * Abbreviate a status string
 */
export function abbreviateStatus(status: string): string {
  return STATUS_MAP[status] || status.charAt(0).toUpperCase()
}

/**
 * Expand an abbreviated status
 */
export function expandStatus(abbrev: string): string {
  return REVERSE_STATUS_MAP[abbrev] || abbrev
}

/**
 * Format inventory items in compact pipe-delimited format
 * Reduces ~50 tokens per item to ~20 tokens
 *
 * Format: name|sku|qty/min|price|status|folder
 */
export function formatCompactItems(
  items: Array<{
    name: string
    sku?: string | null
    quantity: number
    min_quantity?: number | null
    price?: number | null
    status: string
    folder_name?: string | null
  }>
): string {
  if (!items || items.length === 0) return 'No items'

  const header = 'Format: name|sku|qty/min|$price|status|folder'
  const rows = items.map((i) => {
    const qty = i.min_quantity ? `${i.quantity}/${i.min_quantity}` : `${i.quantity}`
    const price = i.price ? `$${i.price}` : '-'
    return `${i.name}|${i.sku || '-'}|${qty}|${price}|${abbreviateStatus(i.status)}|${i.folder_name || '-'}`
  })

  return `${header}\n${rows.join('\n')}`
}

/**
 * Format movements/activity in compact format
 * Format: user|action|entity|qty|time
 */
export function formatCompactMovements(
  movements: Array<{
    user_name: string
    action_type: string
    entity_name?: string | null
    quantity_delta?: number | null
    created_at: string
  }>
): string {
  if (!movements || movements.length === 0) return 'No recent activity'

  const header = 'Format: user|action|item|qty|time'
  const rows = movements.map((m) => {
    const time = formatRelativeTime(m.created_at)
    const qty = m.quantity_delta ? (m.quantity_delta > 0 ? `+${m.quantity_delta}` : `${m.quantity_delta}`) : '-'
    return `${m.user_name}|${m.action_type}|${m.entity_name || '-'}|${qty}|${time}`
  })

  return `${header}\n${rows.join('\n')}`
}

/**
 * Format purchase orders in compact format
 * Format: #id|vendor|status|items|$total|expected
 */
export function formatCompactPOs(
  pos: Array<{
    display_id?: string | null
    order_number?: string | null
    vendor_name?: string | null
    status: string
    item_count: number
    total_amount?: number | null
    expected_date?: string | null
  }>
): string {
  if (!pos || pos.length === 0) return 'No purchase orders'

  const header = 'Format: #id|vendor|status|items|$total|expected'
  const rows = pos.map((po) => {
    const id = po.display_id || po.order_number || '-'
    const total = po.total_amount ? `$${po.total_amount}` : '-'
    const expected = po.expected_date ? formatShortDate(po.expected_date) : '-'
    return `${id}|${po.vendor_name || '-'}|${abbreviateStatus(po.status)}|${po.item_count}|${total}|${expected}`
  })

  return `${header}\n${rows.join('\n')}`
}

/**
 * Format pick lists in compact format
 * Format: name|status|assigned|items|due
 */
export function formatCompactPickLists(
  pickLists: Array<{
    name: string
    display_id?: string | null
    status: string
    assigned_to_name?: string | null
    item_count: number
    due_date?: string | null
  }>
): string {
  if (!pickLists || pickLists.length === 0) return 'No pick lists'

  const header = 'Format: name|status|assigned|items|due'
  const rows = pickLists.map((pl) => {
    const due = pl.due_date ? formatShortDate(pl.due_date) : '-'
    return `${pl.name}|${abbreviateStatus(pl.status)}|${pl.assigned_to_name || '-'}|${pl.item_count}|${due}`
  })

  return `${header}\n${rows.join('\n')}`
}

/**
 * Format checkouts in compact format
 * Format: item|qty|assignee|status|due
 */
export function formatCompactCheckouts(
  checkouts: Array<{
    item_name: string
    quantity: number
    assignee_name: string
    status: string
    due_date?: string | null
  }>
): string {
  if (!checkouts || checkouts.length === 0) return 'No active checkouts'

  const header = 'Format: item|qty|assignee|status|due'
  const rows = checkouts.map((c) => {
    const due = c.due_date ? formatShortDate(c.due_date) : '-'
    return `${c.item_name}|${c.quantity}|${c.assignee_name}|${abbreviateStatus(c.status)}|${due}`
  })

  return `${header}\n${rows.join('\n')}`
}

/**
 * Format tasks in compact format
 * Format: name|status|due|creator
 */
export function formatCompactTasks(
  tasks: Array<{
    name: string
    status: string
    end_date?: string | null
    created_by_name?: string | null
  }>
): string {
  if (!tasks || tasks.length === 0) return 'No tasks'

  const header = 'Format: name|status|due|creator'
  const rows = tasks.map((t) => {
    const due = t.end_date ? formatShortDate(t.end_date) : '-'
    return `${t.name}|${abbreviateStatus(t.status)}|${due}|${t.created_by_name || '-'}`
  })

  return `${header}\n${rows.join('\n')}`
}

/**
 * Format team activity in compact format
 * Format: user|actions|types
 */
export function formatCompactTeamActivity(
  activity: Array<{
    user_name: string
    action_count: number
    recent_actions?: string[]
  }>
): string {
  if (!activity || activity.length === 0) return 'No team activity'

  const header = 'Format: user|action_count|action_types'
  const rows = activity.map((a) => {
    const types = a.recent_actions?.slice(0, 3).join(',') || '-'
    return `${a.user_name}|${a.action_count}|${types}`
  })

  return `${header}\n${rows.join('\n')}`
}

/**
 * Format relative time (e.g., "2h ago", "3d ago")
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 30) return `${diffDays}d`
  return formatShortDate(dateStr)
}

/**
 * Format short date (e.g., "Jan 15" or "1/15")
 */
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

/**
 * Estimate token count for a string (rough: ~4 chars per token)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Format aggregates in minimal format
 */
export function formatCompactAggregates(aggregates: {
  totalItems: number
  totalQuantity: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  inStockCount: number
}): string {
  return `Items:${aggregates.totalItems} Qty:${aggregates.totalQuantity} Val:$${aggregates.totalValue} Status:${aggregates.inStockCount}I/${aggregates.lowStockCount}L/${aggregates.outOfStockCount}O`
}

/**
 * Format folder counts in minimal format
 */
export function formatCompactFolderCounts(
  folders: Array<{ folder_name: string; item_count: number }>
): string {
  if (!folders || folders.length === 0) return 'No folders'
  return folders.map((f) => `${f.folder_name}:${f.item_count}`).join(', ')
}

// Type definitions for RPC response
export interface ZoeContextRPCResponse {
  aggregates: {
    totalItems: number
    totalQuantity: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    inStockCount: number
  }
  folderCounts: Array<{ folder_name: string; item_count: number }>
  poStats: {
    totalPOs: number
    pendingPOs: number
    pendingPOValue: number
  }
  pickListStats: {
    totalPickLists: number
    pendingPickLists: number
  }
  checkoutStats: {
    activeCheckouts: number
    overdueCheckouts: number
  }
  taskStats: {
    totalTasks: number
    pendingTasks: number
    overdueTasks: number
  }
  teamStats: {
    activeUsersLast30Days: number
  }
  recentItems: Array<{
    id: string
    name: string
    sku?: string
    quantity: number
    min_quantity?: number
    price?: number
    status: string
    folder_name?: string
  }>
  searchResults?: Array<{
    id: string
    name: string
    sku?: string
    quantity: number
    status: string
    folder_name?: string
  }>
  movements?: Array<{
    user_name: string
    action_type: string
    entity_type: string
    entity_name?: string
    quantity_delta?: number
    from_folder_name?: string
    to_folder_name?: string
    created_at: string
  }>
  purchaseOrders?: Array<{
    order_number?: string
    display_id?: string
    vendor_name?: string
    status: string
    expected_date?: string
    total_amount?: number
    item_count: number
    created_at: string
  }>
  pickLists?: Array<{
    name: string
    display_id?: string
    status: string
    assigned_to_name?: string
    due_date?: string
    item_count: number
    created_at: string
  }>
  checkouts?: Array<{
    item_name: string
    quantity: number
    assignee_name: string
    status: string
    due_date?: string
    checked_out_at: string
  }>
  tasks?: Array<{
    name: string
    description?: string
    status: string
    start_date?: string
    end_date?: string
    location?: string
    created_by_name?: string
  }>
  teamActivity?: Array<{
    user_name: string
    action_count: number
    recent_actions?: string[]
  }>
}

/**
 * Format complete Zoe context in compact format
 * This is the main function that formats the RPC response for AI consumption
 */
export function formatCompactContext(context: ZoeContextRPCResponse): string {
  const sections: string[] = []
  const agg = context.aggregates

  // Aggregates section - COMPLETE COUNTS (always included, ~100 tokens)
  sections.push(`## Inventory Overview (COMPLETE)
${formatCompactAggregates(agg)}

Top Folders: ${formatCompactFolderCounts(context.folderCounts)}`)

  // PO overview (if any)
  const po = context.poStats
  if (po.totalPOs > 0) {
    sections.push(`## POs: ${po.totalPOs} total, ${po.pendingPOs} pending ($${po.pendingPOValue})`)
  }

  // Pick list overview (if any)
  const pl = context.pickListStats
  if (pl.totalPickLists > 0) {
    sections.push(`## Pick Lists: ${pl.totalPickLists} total, ${pl.pendingPickLists} pending`)
  }

  // Checkout overview (if any)
  const co = context.checkoutStats
  if (co.activeCheckouts > 0) {
    sections.push(`## Checkouts: ${co.activeCheckouts} active, ${co.overdueCheckouts} overdue`)
  }

  // Task overview (if any)
  const ts = context.taskStats
  if (ts.totalTasks > 0) {
    sections.push(`## Tasks: ${ts.totalTasks} total, ${ts.pendingTasks} pending, ${ts.overdueTasks} overdue`)
  }

  // Team overview
  if (context.teamStats.activeUsersLast30Days > 0) {
    sections.push(`## Team: ${context.teamStats.activeUsersLast30Days} active users (30d)`)
  }

  // Search results (if any)
  if (context.searchResults && context.searchResults.length > 0) {
    sections.push(`## Search Results (${context.searchResults.length})
${formatCompactItems(context.searchResults)}`)
  }

  // Recent items sample
  if (context.recentItems && context.recentItems.length > 0) {
    sections.push(`## Recent Items (${context.recentItems.length})
${formatCompactItems(context.recentItems)}`)
  }

  // Extended context sections (conditional)
  if (context.movements && context.movements.length > 0) {
    sections.push(`## Recent Activity (${context.movements.length})
${formatCompactMovements(context.movements)}`)
  }

  if (context.purchaseOrders && context.purchaseOrders.length > 0) {
    sections.push(`## PO Details (${context.purchaseOrders.length})
${formatCompactPOs(context.purchaseOrders)}`)
  }

  if (context.pickLists && context.pickLists.length > 0) {
    sections.push(`## Pick List Details (${context.pickLists.length})
${formatCompactPickLists(context.pickLists)}`)
  }

  if (context.checkouts && context.checkouts.length > 0) {
    sections.push(`## Checkout Details (${context.checkouts.length})
${formatCompactCheckouts(context.checkouts)}`)
  }

  if (context.tasks && context.tasks.length > 0) {
    sections.push(`## Task Details (${context.tasks.length})
${formatCompactTasks(context.tasks)}`)
  }

  if (context.teamActivity && context.teamActivity.length > 0) {
    sections.push(`## Team Activity Details (${context.teamActivity.length})
${formatCompactTeamActivity(context.teamActivity)}`)
  }

  return sections.join('\n\n')
}

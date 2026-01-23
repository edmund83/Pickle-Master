import { SupabaseClient } from '@supabase/supabase-js'
import {
  formatCompactContext,
  ZoeContextRPCResponse,
} from './context-compressor'
import { escapeSqlLike } from '@/lib/utils'

 
type AnySupabaseClient = SupabaseClient<any, any, any>

/**
 * Context types that can be fetched for AI chat
 */
export type ContextType =
  | 'inventory'
  | 'movements'
  | 'tasks'
  | 'purchase_orders'
  | 'team_activity'
  | 'pick_lists'
  | 'checkouts'

/**
 * Patterns to detect what context is needed from the query
 */
const CONTEXT_PATTERNS: Record<ContextType, RegExp[]> = {
  inventory: [
    /stock|inventory|item|product|quantity|sku|low.?stock|out.?of.?stock/i,
    /how many|count|total|value|worth/i,
    /where is|location|folder|find/i,
  ],
  movements: [
    /move|moved|transfer|history|changes|adjust|who|when|audit/i,
    /what happened|activity|log|track/i,
    /yesterday|today|last week|recently|history/i,
  ],
  tasks: [
    /task|job|work|assignment|due|overdue|pending/i,
    /what('s| is) (my|our|the) (task|job|work)/i,
    /need to do|to.?do|upcoming/i,
  ],
  purchase_orders: [
    /purchase|order|po|vendor|supplier|arrive|expected|incoming/i,
    /ordered|buying|procurement|restock/i,
    /when will|eta|delivery/i,
  ],
  team_activity: [
    /team|member|user|who|staff|employee/i,
    /did (john|sarah|mike|\w+) do/i,
    /most active|performance|contribution/i,
  ],
  pick_lists: [
    /pick|picking|fulfill|fulfillment|ship|shipping/i,
    /order.?to.?ship|ready.?to.?ship/i,
  ],
  checkouts: [
    /check.?out|checked.?out|borrow|loan|return|due back/i,
    /who has|assigned to|equipment/i,
  ],
}

// In-memory cache for context with TTL
const contextCache = new Map<string, { data: ZoeContextRPCResponse; timestamp: number }>()
const CACHE_TTL_MS = 60000 // 1 minute

/**
 * Determine which context types are needed based on the query
 */
export function detectRequiredContext(query: string): ContextType[] {
  const required: ContextType[] = []

  for (const [contextType, patterns] of Object.entries(CONTEXT_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(query))) {
      required.push(contextType as ContextType)
    }
  }

  // Always include inventory as baseline (but with reduced items if other context needed)
  if (!required.includes('inventory')) {
    required.unshift('inventory')
  }

  return required
}

/**
 * Inventory item shape for AI context
 */
export interface InventoryContext {
  id: string
  name: string
  sku?: string
  quantity: number
  min_quantity?: number
  price?: number
  status: string
  folder_name?: string
  updated_at?: string
}

/**
 * Activity log shape for AI context
 */
export interface ActivityContext {
  user_name: string
  action_type: string
  entity_type: string
  entity_name: string
  quantity_delta?: number
  from_folder_name?: string
  to_folder_name?: string
  created_at: string
}

/**
 * Purchase order shape for AI context
 */
export interface PurchaseOrderContext {
  order_number: string
  display_id?: string
  vendor_name?: string
  status: string
  expected_date?: string
  total_amount?: number
  item_count: number
  created_at: string
}

/**
 * Pick list shape for AI context
 */
export interface PickListContext {
  name: string
  display_id?: string
  status: string
  assigned_to_name?: string
  due_date?: string
  item_count: number
  created_at: string
}

/**
 * Checkout shape for AI context
 */
export interface CheckoutContext {
  item_name: string
  quantity: number
  assignee_name: string
  status: string
  due_date?: string
  checked_out_at: string
}

/**
 * Job/task shape for AI context
 */
export interface TaskContext {
  name: string
  description?: string
  status: string
  start_date?: string
  end_date?: string
  location?: string
  created_by_name?: string
}

/**
 * Team activity summary
 */
export interface TeamActivityContext {
  user_name: string
  action_count: number
  recent_actions: string[]
}

/**
 * Aggregate statistics for the entire tenant (not limited by item fetch)
 */
export interface TenantAggregates {
  // Inventory aggregates
  totalItems: number
  totalQuantity: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  inStockCount: number

  // Folder/location breakdown
  folderCounts: { folder_name: string; item_count: number }[]

  // Purchase order aggregates
  totalPOs: number
  pendingPOs: number
  pendingPOValue: number

  // Pick list aggregates
  totalPickLists: number
  pendingPickLists: number

  // Checkout aggregates
  activeCheckouts: number
  overdueCheckouts: number

  // Task aggregates
  totalTasks: number
  pendingTasks: number
  overdueTasks: number

  // Team aggregates
  totalTeamMembers: number
  activeUsersLast30Days: number
}

/**
 * Combined context object
 */
export interface ZoeContext {
  // Aggregate stats from entire database
  aggregates: TenantAggregates

  // Relevant sample items (based on query + recent)
  inventory: InventoryContext[]
  movements?: ActivityContext[]
  purchaseOrders?: PurchaseOrderContext[]
  pickLists?: PickListContext[]
  checkouts?: CheckoutContext[]
  tasks?: TaskContext[]
  teamActivity?: TeamActivityContext[]

  // Query-matched items (searched by keywords)
  searchResults?: InventoryContext[]
}

/**
 * Extract potential search keywords from a query
 */
function extractSearchKeywords(query: string): string[] {
  // Remove common words and extract potential item/product names
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'how', 'many', 'much', 'where', 'when', 'why', 'show', 'me', 'my', 'our',
    'find', 'get', 'tell', 'about', 'for', 'with', 'from', 'to', 'in', 'on',
    'items', 'item', 'products', 'product', 'inventory', 'stock', 'all',
    'i', 'you', 'we', 'they', 'it', 'and', 'or', 'but', 'if', 'then',
  ])

  const words = query.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  return words.slice(0, 5) // Limit to 5 keywords
}

/**
 * Fetch all relevant context for the AI based on query analysis
 * Uses HYBRID approach: aggregates + search + recent items
 */
export async function fetchZoeContext(
  supabase: SupabaseClient,
  tenantId: string,
  query: string,
  daysBack: number = 30
): Promise<ZoeContext> {
  const requiredContext = detectRequiredContext(query)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)
  const cutoffISO = cutoffDate.toISOString()

  // Extract search keywords from query
  const searchKeywords = extractSearchKeywords(query)

  // Determine item limit based on how many context types we need
  const itemLimit = requiredContext.length > 2 ? 15 : requiredContext.length > 1 ? 20 : 25

  // ALWAYS fetch aggregates (cheap, gives full picture)
  const aggregatesPromise = fetchTenantAggregates(supabase, tenantId, cutoffISO)

  // Fetch recent inventory items
  const inventoryPromise = fetchInventory(supabase, tenantId, itemLimit)

  // Fetch search results if we have keywords
  const searchPromise = searchKeywords.length > 0
    ? searchInventoryItems(supabase, tenantId, searchKeywords, 15)
    : Promise.resolve([])

  // Conditionally fetch other context
  const promises: Promise<unknown>[] = [aggregatesPromise, inventoryPromise, searchPromise]
  const contextKeys: (keyof ZoeContext | 'aggregates' | 'inventory' | 'searchResults')[] = ['aggregates', 'inventory', 'searchResults']

  if (requiredContext.includes('movements')) {
    promises.push(fetchMovements(supabase, tenantId, cutoffISO, 20))
    contextKeys.push('movements')
  }

  if (requiredContext.includes('purchase_orders')) {
    promises.push(fetchPurchaseOrders(supabase, tenantId, cutoffISO, 10))
    contextKeys.push('purchaseOrders')
  }

  if (requiredContext.includes('pick_lists')) {
    promises.push(fetchPickLists(supabase, tenantId, cutoffISO, 10))
    contextKeys.push('pickLists')
  }

  if (requiredContext.includes('checkouts')) {
    promises.push(fetchCheckouts(supabase, tenantId, 15))
    contextKeys.push('checkouts')
  }

  if (requiredContext.includes('tasks')) {
    promises.push(fetchTasks(supabase, tenantId, 10))
    contextKeys.push('tasks')
  }

  if (requiredContext.includes('team_activity')) {
    promises.push(fetchTeamActivity(supabase, tenantId, cutoffISO, 10))
    contextKeys.push('teamActivity')
  }

  // Execute all fetches in parallel
  const results = await Promise.all(promises)

  // Build context object
  const context: ZoeContext = {
    aggregates: results[0] as TenantAggregates,
    inventory: results[1] as InventoryContext[],
    searchResults: (results[2] as InventoryContext[]).length > 0
      ? results[2] as InventoryContext[]
      : undefined,
  }

  // Map additional results to context
  for (let i = 3; i < results.length; i++) {
    const contextKey = contextKeys[i]
     
    ;(context as any)[contextKey] = results[i]
  }

  return context
}

/**
 * Fetch aggregate statistics for the entire tenant
 * This gives Zoe accurate counts without fetching all items
 */
async function fetchTenantAggregates(
  supabase: SupabaseClient,
  tenantId: string,
  cutoffDate: string
): Promise<TenantAggregates> {
  // Run all aggregate queries in parallel
  const [
    inventoryStats,
    folderCounts,
    poStats,
    pickListStats,
    checkoutStats,
    taskStats,
    teamStats,
  ] = await Promise.all([
    // Inventory aggregates
    supabase
      .from('inventory_items')
      .select('status, quantity, price')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null),

    // Folder breakdown
    supabase
      .from('inventory_items')
      .select('folders(name)')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null),

    // Purchase order stats
    supabase
      .from('purchase_orders')
      .select('status, total_amount')
      .eq('tenant_id', tenantId),

    // Pick list stats
    supabase
      .from('pick_lists')
      .select('status')
      .eq('tenant_id', tenantId),

    // Checkout stats
    supabase
      .from('checkouts')
      .select('status, due_date')
      .eq('tenant_id', tenantId)
      .eq('status', 'checked_out'),

    // Task stats
    supabase
      .from('jobs')
      .select('status, end_date')
      .eq('tenant_id', tenantId),

    // Team stats - active users
    supabase
      .from('activity_logs')
      .select('user_id')
      .eq('tenant_id', tenantId)
      .gte('created_at', cutoffDate),
  ])

  const items = inventoryStats.data || []
  const today = new Date().toISOString().split('T')[0]

  // Calculate inventory aggregates
  let totalQuantity = 0
  let totalValue = 0
  let lowStockCount = 0
  let outOfStockCount = 0
  let inStockCount = 0

   
  for (const item of items as any[]) {
    totalQuantity += item.quantity || 0
    totalValue += (item.quantity || 0) * (item.price || 0)
    if (item.status === 'low_stock') lowStockCount++
    else if (item.status === 'out_of_stock') outOfStockCount++
    else if (item.status === 'in_stock') inStockCount++
  }

  // Calculate folder breakdown
  const folderMap = new Map<string, number>()
   
  for (const item of (folderCounts.data || []) as any[]) {
    const folderName = item.folders?.name || 'Uncategorized'
    folderMap.set(folderName, (folderMap.get(folderName) || 0) + 1)
  }
  const folderCountsArr = Array.from(folderMap.entries())
    .map(([folder_name, item_count]) => ({ folder_name, item_count }))
    .sort((a, b) => b.item_count - a.item_count)
    .slice(0, 10) // Top 10 folders

  // Calculate PO aggregates
  const pos = poStats.data || []
  const pendingPOs = pos.filter(
     
    (po: any) => ['draft', 'submitted', 'approved'].includes(po.status)
  )
  const pendingPOValue = pendingPOs.reduce(
     
    (sum: number, po: any) => sum + (po.total_amount || 0),
    0
  )

  // Calculate pick list aggregates
  const pickLists = pickListStats.data || []
   
  const pendingPickLists = pickLists.filter((pl: any) => pl.status === 'pending').length

  // Calculate checkout aggregates
  const checkouts = checkoutStats.data || []
  const overdueCheckouts = checkouts.filter(
     
    (c: any) => c.due_date && c.due_date < today
  ).length

  // Calculate task aggregates
  const tasks = taskStats.data || []
   
  const pendingTasks = tasks.filter((t: any) =>
    ['pending', 'in_progress'].includes(t.status)
  ).length
   
  const overdueTasks = tasks.filter((t: any) =>
    ['pending', 'in_progress'].includes(t.status) && t.end_date && t.end_date < today
  ).length

  // Calculate team aggregates
  const activityLogs = teamStats.data || []
   
  const uniqueUsers = new Set(activityLogs.map((l: any) => l.user_id))

  return {
    totalItems: items.length,
    totalQuantity,
    totalValue: Math.round(totalValue * 100) / 100,
    lowStockCount,
    outOfStockCount,
    inStockCount,
    folderCounts: folderCountsArr,
    totalPOs: pos.length,
    pendingPOs: pendingPOs.length,
    pendingPOValue: Math.round(pendingPOValue * 100) / 100,
    totalPickLists: pickLists.length,
    pendingPickLists,
    activeCheckouts: checkouts.length,
    overdueCheckouts,
    totalTasks: tasks.length,
    pendingTasks,
    overdueTasks,
    totalTeamMembers: 0, // Would need profiles query
    activeUsersLast30Days: uniqueUsers.size,
  }
}

/**
 * Search inventory items by keywords
 */
async function searchInventoryItems(
  supabase: SupabaseClient,
  tenantId: string,
  keywords: string[],
  limit: number
): Promise<InventoryContext[]> {
  if (keywords.length === 0) return []

  // Build search pattern - matches any keyword in name or sku
  const searchPattern = keywords.join('|')

  const { data } = await supabase
    .from('inventory_items')
    .select(`
      id,
      name,
      sku,
      quantity,
      min_quantity,
      price,
      status,
      updated_at,
      folders(name)
    `)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .or(`name.ilike.%${escapeSqlLike(keywords[0])}%,sku.ilike.%${escapeSqlLike(keywords[0])}%`)
    .limit(limit)

   
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    min_quantity: item.min_quantity,
    price: item.price,
    status: item.status,
    folder_name: item.folders?.name,
    updated_at: item.updated_at,
  }))
}

async function fetchInventory(
  supabase: SupabaseClient,
  tenantId: string,
  limit: number
): Promise<InventoryContext[]> {
  const { data } = await supabase
    .from('inventory_items')
    .select(`
      id,
      name,
      sku,
      quantity,
      min_quantity,
      price,
      status,
      updated_at,
      folders(name)
    `)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(limit)

   
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    min_quantity: item.min_quantity,
    price: item.price,
    status: item.status,
    folder_name: item.folders?.name,
    updated_at: item.updated_at,
  }))
}

async function fetchMovements(
  supabase: SupabaseClient,
  tenantId: string,
  cutoffDate: string,
  limit: number
): Promise<ActivityContext[]> {
  const { data } = await supabase
    .from('activity_logs')
    .select(`
      user_name,
      action_type,
      entity_type,
      entity_name,
      quantity_delta,
      from_folder_name,
      to_folder_name,
      created_at
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', cutoffDate)
    .order('created_at', { ascending: false })
    .limit(limit)

   
  return (data || []).map((log: any) => ({
    user_name: log.user_name || 'Unknown',
    action_type: log.action_type,
    entity_type: log.entity_type,
    entity_name: log.entity_name || 'Unknown',
    quantity_delta: log.quantity_delta,
    from_folder_name: log.from_folder_name,
    to_folder_name: log.to_folder_name,
    created_at: log.created_at,
  }))
}

async function fetchPurchaseOrders(
  supabase: SupabaseClient,
  tenantId: string,
  cutoffDate: string,
  limit: number
): Promise<PurchaseOrderContext[]> {
  const { data } = await supabase
    .from('purchase_orders')
    .select(`
      order_number,
      display_id,
      status,
      expected_date,
      total_amount,
      created_at,
      vendors(name),
      purchase_order_items(id)
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', cutoffDate)
    .order('created_at', { ascending: false })
    .limit(limit)

   
  return (data || []).map((po: any) => ({
    order_number: po.order_number,
    display_id: po.display_id,
    vendor_name: po.vendors?.name,
    status: po.status,
    expected_date: po.expected_date,
    total_amount: po.total_amount,
    item_count: po.purchase_order_items?.length || 0,
    created_at: po.created_at,
  }))
}

async function fetchPickLists(
  supabase: SupabaseClient,
  tenantId: string,
  cutoffDate: string,
  limit: number
): Promise<PickListContext[]> {
  const { data } = await supabase
    .from('pick_lists')
    .select(`
      name,
      display_id,
      status,
      due_date,
      created_at,
      assigned_to_profile:profiles!pick_lists_assigned_to_fkey(full_name),
      pick_list_items(id)
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', cutoffDate)
    .order('created_at', { ascending: false })
    .limit(limit)

   
  return (data || []).map((pl: any) => ({
    name: pl.name,
    display_id: pl.display_id,
    status: pl.status,
    assigned_to_name: pl.assigned_to_profile?.full_name,
    due_date: pl.due_date,
    item_count: pl.pick_list_items?.length || 0,
    created_at: pl.created_at,
  }))
}

async function fetchCheckouts(
  supabase: SupabaseClient,
  tenantId: string,
  limit: number
): Promise<CheckoutContext[]> {
  const { data } = await supabase
    .from('checkouts')
    .select(`
      quantity,
      assignee_name,
      status,
      due_date,
      checked_out_at,
      inventory_items(name)
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'checked_out')
    .order('checked_out_at', { ascending: false })
    .limit(limit)

   
  return (data || []).map((c: any) => ({
    item_name: c.inventory_items?.name || 'Unknown',
    quantity: c.quantity,
    assignee_name: c.assignee_name || 'Unknown',
    status: c.status,
    due_date: c.due_date,
    checked_out_at: c.checked_out_at,
  }))
}

async function fetchTasks(
  supabase: SupabaseClient,
  tenantId: string,
  limit: number
): Promise<TaskContext[]> {
  const { data } = await supabase
    .from('jobs')
    .select(`
      name,
      description,
      status,
      start_date,
      end_date,
      location,
      created_by_profile:profiles!jobs_created_by_fkey(full_name)
    `)
    .eq('tenant_id', tenantId)
    .in('status', ['pending', 'in_progress', 'completed'])
    .order('created_at', { ascending: false })
    .limit(limit)

   
  return (data || []).map((job: any) => ({
    name: job.name,
    description: job.description,
    status: job.status,
    start_date: job.start_date,
    end_date: job.end_date,
    location: job.location,
    created_by_name: job.created_by_profile?.full_name,
  }))
}

async function fetchTeamActivity(
  supabase: SupabaseClient,
  tenantId: string,
  cutoffDate: string,
  limit: number
): Promise<TeamActivityContext[]> {
  // Get activity counts per user
  const { data } = await supabase
    .from('activity_logs')
    .select('user_name, action_type')
    .eq('tenant_id', tenantId)
    .gte('created_at', cutoffDate)
    .not('user_name', 'is', null)

  if (!data || data.length === 0) {
    return []
  }

  // Aggregate by user
  const userStats: Record<string, { count: number; actions: Set<string> }> = {}

  for (const log of data) {
    const name = log.user_name || 'Unknown'
    if (!userStats[name]) {
      userStats[name] = { count: 0, actions: new Set() }
    }
    userStats[name].count++
    userStats[name].actions.add(log.action_type)
  }

  // Convert to array and sort by activity
  return Object.entries(userStats)
    .map(([user_name, stats]) => ({
      user_name,
      action_count: stats.count,
      recent_actions: Array.from(stats.actions).slice(0, 5),
    }))
    .sort((a, b) => b.action_count - a.action_count)
    .slice(0, limit)
}

/**
 * Format context for AI prompt (compact representation)
 * Now includes COMPLETE aggregates + relevant samples
 */
export function formatContextForPrompt(context: ZoeContext): string {
  const sections: string[] = []
  const agg = context.aggregates

  // Aggregates section - COMPLETE COUNTS from entire database
  sections.push(`## Inventory Overview (COMPLETE - All Items)
- **Total Items**: ${agg.totalItems.toLocaleString()}
- **Total Quantity**: ${agg.totalQuantity.toLocaleString()} units
- **Total Value**: $${agg.totalValue.toLocaleString()}
- **In Stock**: ${agg.inStockCount.toLocaleString()} items
- **Low Stock**: ${agg.lowStockCount.toLocaleString()} items
- **Out of Stock**: ${agg.outOfStockCount.toLocaleString()} items

### Items by Location (Top 10)
${agg.folderCounts.map(f => `- ${f.folder_name}: ${f.item_count} items`).join('\n')}`)

  // Purchase Orders overview
  if (agg.totalPOs > 0) {
    sections.push(`## Purchase Orders Overview (COMPLETE)
- **Total POs**: ${agg.totalPOs}
- **Pending POs**: ${agg.pendingPOs}
- **Pending Value**: $${agg.pendingPOValue.toLocaleString()}`)
  }

  // Pick Lists overview
  if (agg.totalPickLists > 0) {
    sections.push(`## Pick Lists Overview (COMPLETE)
- **Total Pick Lists**: ${agg.totalPickLists}
- **Pending**: ${agg.pendingPickLists}`)
  }

  // Checkouts overview
  if (agg.activeCheckouts > 0) {
    sections.push(`## Checkouts Overview (COMPLETE)
- **Active Checkouts**: ${agg.activeCheckouts}
- **Overdue**: ${agg.overdueCheckouts}`)
  }

  // Tasks overview
  if (agg.totalTasks > 0) {
    sections.push(`## Tasks Overview (COMPLETE)
- **Total Tasks**: ${agg.totalTasks}
- **Pending/In Progress**: ${agg.pendingTasks}
- **Overdue**: ${agg.overdueTasks}`)
  }

  // Team overview
  if (agg.activeUsersLast30Days > 0) {
    sections.push(`## Team Activity (Last 30 Days)
- **Active Users**: ${agg.activeUsersLast30Days}`)
  }

  // Search results - items matching query keywords
  if (context.searchResults && context.searchResults.length > 0) {
    sections.push(`## Items Matching Your Query (${context.searchResults.length} found)
${JSON.stringify(context.searchResults, null, 2)}`)
  }

  // Recent inventory samples
  if (context.inventory.length > 0) {
    sections.push(`## Recent Inventory Samples (${context.inventory.length} most recent)
${JSON.stringify(context.inventory, null, 2)}`)
  }

  // Movements section
  if (context.movements && context.movements.length > 0) {
    sections.push(`## Recent Activity Log (${context.movements.length} entries)
${JSON.stringify(context.movements, null, 2)}`)
  }

  // Purchase orders details
  if (context.purchaseOrders && context.purchaseOrders.length > 0) {
    sections.push(`## Recent Purchase Orders (${context.purchaseOrders.length} shown)
${JSON.stringify(context.purchaseOrders, null, 2)}`)
  }

  // Pick lists details
  if (context.pickLists && context.pickLists.length > 0) {
    sections.push(`## Recent Pick Lists (${context.pickLists.length} shown)
${JSON.stringify(context.pickLists, null, 2)}`)
  }

  // Checkouts details
  if (context.checkouts && context.checkouts.length > 0) {
    sections.push(`## Active Checkout Details (${context.checkouts.length} shown)
${JSON.stringify(context.checkouts, null, 2)}`)
  }

  // Tasks details
  if (context.tasks && context.tasks.length > 0) {
    sections.push(`## Recent Tasks (${context.tasks.length} shown)
${JSON.stringify(context.tasks, null, 2)}`)
  }

  // Team activity details
  if (context.teamActivity && context.teamActivity.length > 0) {
    sections.push(`## Team Member Activity (${context.teamActivity.length} members)
${JSON.stringify(context.teamActivity, null, 2)}`)
  }

  return sections.join('\n\n')
}

// ============================================
// OPTIMIZED FUNCTIONS (using RPC)
// ============================================

/**
 * Generate cache key based on tenant and required context types
 */
function getCacheKey(tenantId: string, requiredContext: ContextType[]): string {
  return `${tenantId}:${requiredContext.sort().join(',')}`
}

/**
 * Fetch context using optimized RPC (single database call)
 * This replaces 7+ individual queries with 1 RPC call
 *
 * @param supabase - Supabase client
 * @param query - User's query (used to extract keywords and detect context needs)
 * @param daysBack - How many days of historical data to include
 * @returns Formatted context string ready for AI prompt
 */
export async function fetchZoeContextOptimized(
  supabase: AnySupabaseClient,
  query: string,
  daysBack: number = 30
): Promise<{ context: ZoeContextRPCResponse; formatted: string }> {
  const requiredContext = detectRequiredContext(query)
  const searchKeywords = extractSearchKeywords(query)

  // Determine item limit based on context complexity
  const itemLimit = requiredContext.length > 2 ? 15 : requiredContext.length > 1 ? 20 : 25

  // Call the optimized RPC function
  const { data, error } = await supabase.rpc('get_zoe_context', {
    p_query_keywords: searchKeywords,
    p_include_movements: requiredContext.includes('movements'),
    p_include_po: requiredContext.includes('purchase_orders'),
    p_include_pick_lists: requiredContext.includes('pick_lists'),
    p_include_checkouts: requiredContext.includes('checkouts'),
    p_include_tasks: requiredContext.includes('tasks'),
    p_include_team: requiredContext.includes('team_activity'),
    p_days_back: daysBack,
    p_item_limit: itemLimit,
  })

  if (error) {
    console.error('Error fetching Zoe context via RPC:', error)
    throw new Error(`Failed to fetch context: ${error.message}`)
  }

  if (!data) {
    throw new Error('No context data returned (unauthorized?)')
  }

  const context = data as ZoeContextRPCResponse

  // Format using compact compression (50-60% token reduction)
  const formatted = formatCompactContext(context)

  return { context, formatted }
}

/**
 * Fetch context with caching (1-minute TTL)
 * Uses RPC under the hood for efficiency
 */
export async function fetchZoeContextCached(
  supabase: AnySupabaseClient,
  tenantId: string,
  query: string,
  daysBack: number = 30
): Promise<{ context: ZoeContextRPCResponse; formatted: string; cached: boolean }> {
  const requiredContext = detectRequiredContext(query)
  const cacheKey = getCacheKey(tenantId, requiredContext)

  // Check cache
  const cached = contextCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    // Cache hit - but still need to format (search results may differ)
    const formatted = formatCompactContext(cached.data)
    return { context: cached.data, formatted, cached: true }
  }

  // Cache miss - fetch fresh
  const result = await fetchZoeContextOptimized(supabase, query, daysBack)

  // Update cache
  contextCache.set(cacheKey, { data: result.context, timestamp: Date.now() })

  return { ...result, cached: false }
}

/**
 * Clear the context cache (call after inventory mutations)
 */
export function clearContextCache(tenantId?: string): void {
  if (tenantId) {
    // Clear only for specific tenant
    for (const key of contextCache.keys()) {
      if (key.startsWith(tenantId)) {
        contextCache.delete(key)
      }
    }
  } else {
    // Clear all
    contextCache.clear()
  }
}

/**
 * Validate AI request using optimized RPC (single call for auth + rate limit + tenant)
 * Returns tenant_id and rate limit info if allowed
 */
export async function validateAiRequest(
  supabase: AnySupabaseClient,
  operation: string = 'ai_chat'
): Promise<{
  allowed: boolean
  tenantId?: string
  remaining?: number
  error?: string
  status: number
}> {
  const { data, error } = await supabase.rpc('validate_ai_request', {
    p_operation: operation,
  })

  if (error) {
    console.error('Error validating AI request:', error)
    return { allowed: false, error: error.message, status: 500 }
  }

  if (!data) {
    return { allowed: false, error: 'No validation response', status: 500 }
  }

  const result = data as {
    allowed: boolean
    tenant_id?: string
    remaining?: number
    error?: string
    status: number
  }

  return {
    allowed: result.allowed,
    tenantId: result.tenant_id,
    remaining: result.remaining,
    error: result.error,
    status: result.status,
  }
}

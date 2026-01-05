import { vi } from 'vitest'
import type { InventoryItem, Folder, ActivityLog } from '@/types/database.types'

// RPC Response types for trends aggregation functions
export interface ActivityByDayResult {
  activity_date: string
  activity_count: number
}

export interface ActionBreakdownResult {
  action_type: string
  action_count: number
  percentage: number
}

export interface MostActiveItemResult {
  entity_id: string
  entity_name: string
  activity_count: number
}

export interface WeeklyComparisonResult {
  this_week_count: number
  last_week_count: number
  change_percent: number
}

// Types for RPC function parameters
export interface TrendsRpcData {
  get_activity_by_day?: ActivityByDayResult[]
  get_action_breakdown?: ActionBreakdownResult[]
  get_most_active_items?: MostActiveItemResult[]
  get_weekly_comparison?: WeeklyComparisonResult[]
}

interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  is: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  then: ReturnType<typeof vi.fn>
}

interface MockSupabaseClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>
  }
  from: ReturnType<typeof vi.fn>
  rpc: ReturnType<typeof vi.fn>
}

// Create a chainable mock query builder
export function createMockQueryBuilder(data: unknown, error: Error | null = null): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn((resolve) => resolve({ data, error })),
  }

  // Make all chainable methods return the builder
  Object.keys(builder).forEach(key => {
    if (key !== 'single' && key !== 'then') {
      (builder as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(builder)
    }
  })

  return builder
}

// Create mock Supabase client
export function createMockSupabaseClient(options: {
  user?: { id: string } | null
  profile?: { tenant_id: string } | null
  items?: InventoryItem[]
  folders?: Folder[]
  activityLogs?: ActivityLog[]
  rpcData?: Record<string, unknown>
}): MockSupabaseClient {
  const {
    user = { id: 'test-user-id' },
    profile = { tenant_id: 'test-tenant-id' },
    items = [],
    folders = [],
    activityLogs = [],
    rpcData = {},
  } = options

  const client: MockSupabaseClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      switch (table) {
        case 'profiles':
          return createMockQueryBuilder(profile)
        case 'inventory_items':
          return createMockQueryBuilder(items)
        case 'folders':
          return createMockQueryBuilder(folders)
        case 'activity_logs':
          return createMockQueryBuilder(activityLogs)
        default:
          return createMockQueryBuilder([])
      }
    }),
    rpc: vi.fn((functionName: string) => {
      return Promise.resolve({
        data: rpcData[functionName] ?? null,
        error: null,
      })
    }),
  }

  return client
}

// Mock the createClient function from @/lib/supabase/server
export function mockSupabaseServer(client: MockSupabaseClient) {
  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(client)),
  }))
}

// Mock the createClient function from @/lib/supabase/client
export function mockSupabaseClient(client: MockSupabaseClient) {
  vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => client),
  }))
}

// Filter helpers to simulate Supabase query behavior
export function filterItems(
  items: InventoryItem[],
  options: {
    tenantId?: string
    deletedAt?: null | string
    status?: string[]
    folderId?: string | null
  }
): InventoryItem[] {
  let filtered = [...items]

  if (options.tenantId) {
    filtered = filtered.filter(i => i.tenant_id === options.tenantId)
  }

  if (options.deletedAt === null) {
    filtered = filtered.filter(i => i.deleted_at === null)
  }

  if (options.status && options.status.length > 0) {
    filtered = filtered.filter(i => options.status!.includes(i.status))
  }

  if (options.folderId !== undefined) {
    filtered = filtered.filter(i => i.folder_id === options.folderId)
  }

  return filtered
}

export function filterActivityLogs(
  logs: ActivityLog[],
  options: {
    tenantId?: string
    actionType?: string
    entityType?: string
    startDate?: Date
    endDate?: Date
    actionTypes?: string[]
  }
): ActivityLog[] {
  let filtered = [...logs]

  if (options.tenantId) {
    filtered = filtered.filter(l => l.tenant_id === options.tenantId)
  }

  if (options.actionType) {
    filtered = filtered.filter(l => l.action_type === options.actionType)
  }

  if (options.entityType) {
    filtered = filtered.filter(l => l.entity_type === options.entityType)
  }

  if (options.startDate) {
    filtered = filtered.filter(l => l.created_at && new Date(l.created_at) >= options.startDate!)
  }

  if (options.endDate) {
    filtered = filtered.filter(l => l.created_at && new Date(l.created_at) <= options.endDate!)
  }

  if (options.actionTypes && options.actionTypes.length > 0) {
    filtered = filtered.filter(l => options.actionTypes!.includes(l.action_type))
  }

  return filtered
}

// ============================================
// RPC Mock Data Generators for Trends Page
// ============================================

/**
 * Generate mock activity by day data for the last N days
 */
export function generateActivityByDayData(days: number = 7): ActivityByDayResult[] {
  const result: ActivityByDayResult[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    result.push({
      activity_date: date.toISOString().split('T')[0],
      activity_count: Math.floor(Math.random() * 50) + 5,
    })
  }

  return result
}

/**
 * Generate mock action breakdown data
 */
export function generateActionBreakdownData(): ActionBreakdownResult[] {
  const actions = [
    { action_type: 'stock_adjusted', count: 45 },
    { action_type: 'item_created', count: 25 },
    { action_type: 'item_updated', count: 20 },
    { action_type: 'item_moved', count: 10 },
  ]

  const total = actions.reduce((sum, a) => sum + a.count, 0)

  return actions.map(a => ({
    action_type: a.action_type,
    action_count: a.count,
    percentage: Math.round((a.count / total) * 1000) / 10,
  }))
}

/**
 * Generate mock most active items data
 */
export function generateMostActiveItemsData(limit: number = 5): MostActiveItemResult[] {
  const items = [
    { name: 'Widget A', count: 42 },
    { name: 'Gadget Pro', count: 35 },
    { name: 'Component X', count: 28 },
    { name: 'Part Z-100', count: 22 },
    { name: 'Assembly Kit', count: 18 },
  ]

  return items.slice(0, limit).map((item, index) => ({
    entity_id: `item-${index + 1}`,
    entity_name: item.name,
    activity_count: item.count,
  }))
}

/**
 * Generate mock weekly comparison data
 */
export function generateWeeklyComparisonData(): WeeklyComparisonResult[] {
  const thisWeek = Math.floor(Math.random() * 100) + 50
  const lastWeek = Math.floor(Math.random() * 100) + 50
  const changePercent = lastWeek > 0
    ? Math.round(((thisWeek - lastWeek) / lastWeek) * 1000) / 10
    : 0

  return [{
    this_week_count: thisWeek,
    last_week_count: lastWeek,
    change_percent: changePercent,
  }]
}

/**
 * Generate a complete set of mock RPC data for trends page
 */
export function generateTrendsRpcData(): TrendsRpcData {
  return {
    get_activity_by_day: generateActivityByDayData(7),
    get_action_breakdown: generateActionBreakdownData(),
    get_most_active_items: generateMostActiveItemsData(5),
    get_weekly_comparison: generateWeeklyComparisonData(),
  }
}

/**
 * Create empty trends RPC data (for testing empty states)
 */
export function generateEmptyTrendsRpcData(): TrendsRpcData {
  return {
    get_activity_by_day: [],
    get_action_breakdown: [],
    get_most_active_items: [],
    get_weekly_comparison: [{
      this_week_count: 0,
      last_week_count: 0,
      change_percent: 0,
    }],
  }
}

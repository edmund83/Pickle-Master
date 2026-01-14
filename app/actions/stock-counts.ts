'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthContext, requireWritePermission } from '@/lib/auth/server-auth'
import { z } from 'zod'

export interface StockCount {
  id: string
  tenant_id: string
  display_id: string | null
  name: string | null
  description: string | null
  status: 'draft' | 'in_progress' | 'review' | 'pending_approval' | 'completed' | 'cancelled'
  scope_type: 'full' | 'folder' | 'custom'
  scope_folder_id: string | null
  assigned_to: string | null
  assigned_at: string | null
  due_date: string | null
  started_at: string | null
  completed_at: string | null
  total_items: number
  counted_items: number
  variance_items: number
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  notes: string | null
  // Approval workflow fields
  submitted_by: string | null
  submitted_at: string | null
  approved_by: string | null
  approved_at: string | null
}

export interface StockCountWithRelations extends StockCount {
  assigned_to_profile?: { id: string; full_name: string | null } | null
  created_by_profile?: { id: string; full_name: string | null } | null
  scope_folder?: { id: string; name: string } | null
}

export interface StockCountItem {
  id: string
  stock_count_id: string
  item_id: string
  expected_quantity: number
  counted_quantity: number | null
  counted_at: string | null
  counted_by: string | null
  variance: number | null
  variance_resolved: boolean
  variance_notes: string | null
  status: 'pending' | 'counted' | 'verified' | 'adjusted'
  created_at: string | null
  updated_at: string | null
}

export interface StockCountItemWithDetails extends StockCountItem {
  item_name: string
  item_sku: string | null
  item_image: string | null
  counted_by_name: string | null
}

export async function getStockCounts(): Promise<StockCountWithRelations[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('stock_counts')
    .select(`
      *,
      assigned_to_profile:profiles!stock_counts_assigned_to_fkey(id, full_name),
      created_by_profile:profiles!stock_counts_created_by_fkey(id, full_name),
      scope_folder:folders!stock_counts_scope_folder_id_fkey(id, name)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stock counts:', error)
    return []
  }

  return data || []
}

export async function getStockCount(id: string): Promise<{
  stock_count: StockCountWithRelations | null
  items: StockCountItemWithDetails[]
} | null> {
  // Auth check - ensure user is authenticated
  const authResult = await getAuthContext()
  if (!authResult.success) {
    console.error('Auth error:', authResult.error)
    return null
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_stock_count_with_items', {
    p_stock_count_id: id,
  })

  if (error) {
    console.error('Error fetching stock count:', error)
    return null
  }

  return data as {
    stock_count: StockCountWithRelations | null
    items: StockCountItemWithDetails[]
  }
}

export async function createStockCount(input: {
  name?: string
  description?: string
  scope_type?: 'full' | 'folder' | 'custom'
  scope_folder_id?: string
  assigned_to?: string
  due_date?: string
  notes?: string
}): Promise<{ success: boolean; id?: string; display_id?: string; error?: string }> {
  // Auth check with write permission
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  const permCheck = requireWritePermission(context)
  if (!permCheck.success) {
    return permCheck
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('create_stock_count', {
    p_name: input.name || null,
    p_description: input.description || null,
    p_scope_type: input.scope_type || 'full',
    p_scope_folder_id: input.scope_folder_id || null,
    p_assigned_to: input.assigned_to || null,
    p_due_date: input.due_date || null,
    p_notes: input.notes || null,
  })

  if (error) {
    console.error('Error creating stock count:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/tasks/stock-count')
  return data as { success: boolean; id?: string; display_id?: string; error?: string }
}

export async function startStockCount(id: string): Promise<{ success: boolean; error?: string }> {
  // Auth check with write permission
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  const permCheck = requireWritePermission(context)
  if (!permCheck.success) {
    return permCheck
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('start_stock_count', {
    p_stock_count_id: id,
  })

  if (error) {
    console.error('Error starting stock count:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/tasks/stock-count/${id}`)
  revalidatePath('/tasks/stock-count')
  return data as { success: boolean; error?: string }
}

export async function recordCount(
  stockCountItemId: string,
  countedQuantity: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  // Auth check with write permission
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  const permCheck = requireWritePermission(context)
  if (!permCheck.success) {
    return permCheck
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('record_stock_count', {
    p_stock_count_item_id: stockCountItemId,
    p_counted_quantity: countedQuantity,
    p_notes: notes || null,
  })

  if (error) {
    console.error('Error recording count:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/tasks/stock-count')
  return data as { success: boolean; error?: string }
}

export async function submitForReview(id: string): Promise<{ success: boolean; error?: string }> {
  // Auth check with write permission
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  const permCheck = requireWritePermission(context)
  if (!permCheck.success) {
    return permCheck
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('submit_stock_count_for_review', {
    p_stock_count_id: id,
  })

  if (error) {
    console.error('Error submitting for review:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/tasks/stock-count/${id}`)
  revalidatePath('/tasks/stock-count')
  return data as { success: boolean; error?: string }
}

export async function completeStockCount(
  id: string,
  applyAdjustments: boolean = false
): Promise<{ success: boolean; adjustments_applied?: boolean; adjusted_count?: number; error?: string }> {
  // Auth check with write permission
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  const permCheck = requireWritePermission(context)
  if (!permCheck.success) {
    return permCheck
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('complete_stock_count', {
    p_stock_count_id: id,
    p_apply_adjustments: applyAdjustments,
  })

  if (error) {
    console.error('Error completing stock count:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/tasks/stock-count/${id}`)
  revalidatePath('/tasks/stock-count')
  revalidatePath('/inventory')
  return data as { success: boolean; adjustments_applied?: boolean; adjusted_count?: number; error?: string }
}

export async function cancelStockCount(id: string): Promise<{ success: boolean; error?: string }> {
  // Auth check with write permission
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  const permCheck = requireWritePermission(context)
  if (!permCheck.success) {
    return permCheck
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('cancel_stock_count', {
    p_stock_count_id: id,
  })

  if (error) {
    console.error('Error cancelling stock count:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/tasks/stock-count/${id}`)
  revalidatePath('/tasks/stock-count')
  return data as { success: boolean; error?: string }
}

/**
 * Approve stock count - transition from review to completed (or allow adjustments)
 * Only admins/owners can approve
 */
export async function approveStockCount(
  id: string,
  applyAdjustments: boolean = false
): Promise<{ success: boolean; adjustments_applied?: boolean; adjusted_count?: number; error?: string }> {
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  // Check admin permission
  if (!['owner', 'admin'].includes(context.role)) {
    return { success: false, error: 'Only admins can approve stock counts' }
  }

  const supabase = await createClient()

  // Get the stock count to check status and get display_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stockCount, error: fetchError } = await (supabase as any)
    .from('stock_counts')
    .select('id, display_id, status, submitted_by, tenant_id')
    .eq('id', id)
    .eq('tenant_id', context.tenantId)
    .single()

  if (fetchError || !stockCount) {
    return { success: false, error: 'Stock count not found' }
  }

  if (stockCount.status !== 'review' && stockCount.status !== 'pending_approval') {
    return { success: false, error: 'Stock count must be in review status to approve' }
  }

  // Complete the stock count with optional adjustments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('complete_stock_count', {
    p_stock_count_id: id,
    p_apply_adjustments: applyAdjustments,
  })

  if (error) {
    console.error('Error approving stock count:', error)
    return { success: false, error: error.message }
  }

  // Update approved_by and approved_at
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('stock_counts')
    .update({
      approved_by: context.userId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', context.tenantId)

  // Notify submitter of approval
  if (stockCount.submitted_by && stockCount.submitted_by !== context.userId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc('notify_approval', {
        p_tenant_id: context.tenantId,
        p_user_id: stockCount.submitted_by,
        p_entity_type: 'stock_count',
        p_entity_id: id,
        p_entity_display_id: stockCount.display_id,
        p_approver_name: context.fullName,
        p_approved: true,
        p_triggered_by: context.userId
      })
    } catch (notifyError) {
      console.error('Notification error:', notifyError)
    }
  }

  // Log activity
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('activity_logs').insert({
      tenant_id: context.tenantId,
      user_id: context.userId,
      user_name: context.fullName,
      action_type: 'approve',
      entity_type: 'stock_count',
      entity_id: id,
      entity_name: stockCount.display_id,
      changes: { adjustments_applied: applyAdjustments }
    })
  } catch (logError) {
    console.error('Activity log error:', logError)
  }

  revalidatePath(`/tasks/stock-count/${id}`)
  revalidatePath('/tasks/stock-count')
  revalidatePath('/inventory')
  return data as { success: boolean; adjustments_applied?: boolean; adjusted_count?: number; error?: string }
}

/**
 * Reject stock count - send back to in_progress status for corrections
 * Only admins/owners can reject
 */
export async function rejectStockCount(
  id: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  // Check admin permission
  if (!['owner', 'admin'].includes(context.role)) {
    return { success: false, error: 'Only admins can reject stock counts' }
  }

  const supabase = await createClient()

  // Get the stock count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stockCount, error: fetchError } = await (supabase as any)
    .from('stock_counts')
    .select('id, display_id, status, submitted_by, tenant_id')
    .eq('id', id)
    .eq('tenant_id', context.tenantId)
    .single()

  if (fetchError || !stockCount) {
    return { success: false, error: 'Stock count not found' }
  }

  if (stockCount.status !== 'review' && stockCount.status !== 'pending_approval') {
    return { success: false, error: 'Stock count must be in review status to reject' }
  }

  // Update status back to in_progress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('stock_counts')
    .update({
      status: 'in_progress',
      notes: reason ? `Rejected: ${reason}` : stockCount.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', context.tenantId)

  if (error) {
    console.error('Error rejecting stock count:', error)
    return { success: false, error: error.message }
  }

  // Notify submitter of rejection
  if (stockCount.submitted_by && stockCount.submitted_by !== context.userId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc('notify_approval', {
        p_tenant_id: context.tenantId,
        p_user_id: stockCount.submitted_by,
        p_entity_type: 'stock_count',
        p_entity_id: id,
        p_entity_display_id: stockCount.display_id,
        p_approver_name: context.fullName,
        p_approved: false,
        p_triggered_by: context.userId
      })
    } catch (notifyError) {
      console.error('Notification error:', notifyError)
    }
  }

  // Log activity
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('activity_logs').insert({
      tenant_id: context.tenantId,
      user_id: context.userId,
      user_name: context.fullName,
      action_type: 'reject',
      entity_type: 'stock_count',
      entity_id: id,
      entity_name: stockCount.display_id,
      changes: { reason }
    })
  } catch (logError) {
    console.error('Activity log error:', logError)
  }

  revalidatePath(`/tasks/stock-count/${id}`)
  revalidatePath('/tasks/stock-count')
  return { success: true }
}

/**
 * Batch record multiple counts at once (for offline sync)
 */
export async function batchRecordCounts(
  counts: Array<{
    stockCountItemId: string
    countedQuantity: number
    notes?: string
  }>
): Promise<{
  success: boolean
  results?: Array<{ itemId: string; success: boolean; error?: string }>
  error?: string
}> {
  // Auth check with write permission
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }
  const { context } = authResult

  const permCheck = requireWritePermission(context)
  if (!permCheck.success) {
    return permCheck
  }

  const supabase = await createClient()
  const results: Array<{ itemId: string; success: boolean; error?: string }> = []

  // Process each count sequentially to avoid race conditions
  for (const count of counts) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('record_stock_count', {
        p_stock_count_item_id: count.stockCountItemId,
        p_counted_quantity: count.countedQuantity,
        p_notes: count.notes || null,
      })

      if (error) {
        results.push({ itemId: count.stockCountItemId, success: false, error: error.message })
      } else if (data && !data.success) {
        results.push({ itemId: count.stockCountItemId, success: false, error: data.error })
      } else {
        results.push({ itemId: count.stockCountItemId, success: true })
      }
    } catch (err) {
      results.push({
        itemId: count.stockCountItemId,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  const allSuccessful = results.every((r) => r.success)

  // Revalidate paths
  revalidatePath('/tasks/stock-count')

  return {
    success: allSuccessful,
    results,
    error: allSuccessful ? undefined : 'Some counts failed to sync'
  }
}

// ============================================
// Server-side Pagination for Stock Counts List
// ============================================

export interface PaginatedStockCountsResult {
    data: StockCountListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface StockCountListItem {
    id: string
    display_id: string | null
    name: string | null
    status: 'draft' | 'in_progress' | 'review' | 'pending_approval' | 'completed' | 'cancelled'
    scope_type: 'full' | 'folder' | 'custom'
    due_date: string | null
    started_at: string | null
    completed_at: string | null
    total_items: number
    counted_items: number
    variance_items: number
    created_at: string | null
    assigned_to_name: string | null
    created_by_name: string | null
    scope_folder_name: string | null
}

export interface StockCountsQueryParams {
    page?: number
    pageSize?: number
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    status?: 'draft' | 'in_progress' | 'review' | 'pending_approval' | 'completed' | 'cancelled'
    assignedTo?: string
    search?: string
}

export async function getPaginatedStockCounts(
    params: StockCountsQueryParams = {}
): Promise<PaginatedStockCountsResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) {
        return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    }
    const { context } = authResult

    const {
        page = 1,
        pageSize = 20,
        sortColumn = 'created_at',
        sortDirection = 'desc',
        status,
        assignedTo,
        search
    } = params

    // Validate and sanitize parameters
    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    // Map sort columns to database columns
    const columnMap: Record<string, string> = {
        display_id: 'display_id',
        name: 'name',
        status: 'status',
        due_date: 'due_date',
        started_at: 'started_at',
        completed_at: 'completed_at',
        created_at: 'created_at',
        total_items: 'total_items',
        counted_items: 'counted_items',
    }

    const dbSortColumn = columnMap[sortColumn] || 'created_at'
    const ascending = sortDirection === 'asc'

    const supabase = await createClient()

    // Build query for count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let countQuery = (supabase as any)
        .from('stock_counts')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)

    // Build query for data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dataQuery = (supabase as any)
        .from('stock_counts')
        .select(`
            id,
            display_id,
            name,
            status,
            scope_type,
            due_date,
            started_at,
            completed_at,
            total_items,
            counted_items,
            variance_items,
            created_at,
            assigned_to_profile:profiles!stock_counts_assigned_to_fkey(full_name),
            created_by_profile:profiles!stock_counts_created_by_fkey(full_name),
            scope_folder:folders!stock_counts_scope_folder_id_fkey(name)
        `)
        .eq('tenant_id', context.tenantId)
        .order(dbSortColumn, { ascending })
        .range(offset, offset + sanitizedPageSize - 1)

    // Apply filters
    if (status) {
        const statusValidation = z.enum(['draft', 'in_progress', 'review', 'pending_approval', 'completed', 'cancelled']).safeParse(status)
        if (statusValidation.success) {
            countQuery = countQuery.eq('status', statusValidation.data)
            dataQuery = dataQuery.eq('status', statusValidation.data)
        }
    }

    if (assignedTo) {
        const idValidation = z.string().uuid().safeParse(assignedTo)
        if (idValidation.success) {
            countQuery = countQuery.eq('assigned_to', assignedTo)
            dataQuery = dataQuery.eq('assigned_to', assignedTo)
        }
    }

    if (search) {
        const searchPattern = `%${search}%`
        countQuery = countQuery.or(`display_id.ilike.${searchPattern},name.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`display_id.ilike.${searchPattern},name.ilike.${searchPattern}`)
    }

    // Execute queries
    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    // Transform data
    const data: StockCountListItem[] = (dataResult.data || []).map((sc: {
        id: string
        display_id: string | null
        name: string | null
        status: 'draft' | 'in_progress' | 'review' | 'completed' | 'cancelled'
        scope_type: 'full' | 'folder' | 'custom'
        due_date: string | null
        started_at: string | null
        completed_at: string | null
        total_items: number
        counted_items: number
        variance_items: number
        created_at: string | null
        assigned_to_profile: { full_name: string } | null
        created_by_profile: { full_name: string } | null
        scope_folder: { name: string } | null
    }) => ({
        id: sc.id,
        display_id: sc.display_id,
        name: sc.name,
        status: sc.status,
        scope_type: sc.scope_type,
        due_date: sc.due_date,
        started_at: sc.started_at,
        completed_at: sc.completed_at,
        total_items: sc.total_items,
        counted_items: sc.counted_items,
        variance_items: sc.variance_items,
        created_at: sc.created_at,
        assigned_to_name: sc.assigned_to_profile?.full_name || null,
        created_by_name: sc.created_by_profile?.full_name || null,
        scope_folder_name: sc.scope_folder?.name || null
    }))

    return {
        data,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface StockCount {
  id: string
  tenant_id: string
  display_id: string | null
  name: string | null
  description: string | null
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'cancelled'
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

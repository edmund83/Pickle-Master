'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ImportItemData = {
  name: string
  sku?: string | null
  barcode?: string | null
  description?: string | null
  quantity: number
  min_quantity?: number
  unit?: string
  price?: number
  cost_price?: number | null
  location?: string | null
  notes?: string | null
  tags?: string | null
  folder?: string | null
}

export type ImportOptions = {
  skipDuplicates?: boolean
  createFolders?: boolean
}

export type ImportError = {
  row: number
  name?: string
  message: string
}

export type BulkImportResult = {
  success: boolean
  successCount: number
  failedCount: number
  skippedCount: number
  createdItemIds: string[]
  errors: ImportError[]
  error?: string
}

/**
 * Bulk import inventory items
 * Uses optimized database function for single API call
 */
export async function bulkImportItems(
  items: ImportItemData[],
  options: ImportOptions = {}
): Promise<BulkImportResult> {
  const defaultResult: BulkImportResult = {
    success: false,
    successCount: 0,
    failedCount: 0,
    skippedCount: 0,
    createdItemIds: [],
    errors: [],
  }

  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        ...defaultResult,
        error: 'You must be logged in to import items',
      }
    }

    // Validate items array
    if (!items || items.length === 0) {
      return {
        ...defaultResult,
        error: 'No items to import',
      }
    }

    // Prepare options with defaults
    const importOptions = {
      skip_duplicates: options.skipDuplicates ?? true,
      create_folders: options.createFolders ?? true,
    }

    // Call the bulk import database function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('bulk_import_items', {
      p_items: JSON.stringify(items),
      p_options: JSON.stringify(importOptions),
    })

    if (error) {
      console.error('Bulk import error:', error)
      return {
        ...defaultResult,
        failedCount: items.length,
        error: error.message || 'Failed to import items',
      }
    }

    // Handle the response
    if (!data?.success) {
      return {
        ...defaultResult,
        error: data?.error || 'Import failed',
      }
    }

    // Revalidate inventory page to show new items
    revalidatePath('/inventory')

    return {
      success: true,
      successCount: data.success_count || 0,
      failedCount: data.failed_count || 0,
      skippedCount: data.skipped_count || 0,
      createdItemIds: data.created_item_ids || [],
      errors: data.errors || [],
    }
  } catch (err) {
    console.error('Bulk import exception:', err)
    return {
      ...defaultResult,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Check if user can import the specified number of items (quota check)
 * This is a server-side version for additional security
 */
export async function checkImportQuota(itemCount: number): Promise<{
  allowed: boolean
  remaining: number
  message?: string
}> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_quota_usage')

    if (error) {
      // If we can't check quota, allow the operation
      // The database trigger will catch it as a fallback
      return { allowed: true, remaining: itemCount }
    }

    const items = data?.find((u: { resource_type: string }) => u.resource_type === 'items')

    if (!items) {
      return { allowed: true, remaining: itemCount }
    }

    const remaining = items.max_allowed - items.current_usage

    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        message: `Item limit reached (${items.current_usage}/${items.max_allowed}). Please upgrade your plan.`,
      }
    }

    if (itemCount > remaining) {
      return {
        allowed: false,
        remaining,
        message: `Cannot import ${itemCount} items. Only ${remaining} slots remaining (${items.current_usage}/${items.max_allowed}).`,
      }
    }

    return { allowed: true, remaining }
  } catch {
    // Allow operation if quota check fails
    return { allowed: true, remaining: itemCount }
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { FOLDER_COLORS } from '@/lib/constants/folder-colors'
import { getAuthContext, requireWritePermission } from '@/lib/auth/server-auth'

export type ActionResult<T> = {
  success: boolean
  data?: T
  error?: string
}

export interface CreateFolderInput {
  name: string
  color?: string
  parentId?: string | null
}

export interface UpdateFolderInput {
  name?: string
  color?: string
  parentId?: string | null
  sortOrder?: number
}

/**
 * Create a new folder with optimistic UI support
 */
export async function createFolder(
  input: CreateFolderInput
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  const authResult = await getAuthContext()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { context } = authResult
  const permResult = requireWritePermission(context)
  if (!permResult.success) return { success: false, error: permResult.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Build path array for hierarchy
  let path: string[] = []
  let depth = 0

  if (input.parentId) {
     
    const { data: parent } = await (supabase as any)
      .from('folders')
      .select('path, depth')
      .eq('id', input.parentId)
      .eq('tenant_id', context.tenantId)
      .single()

    if (parent) {
      path = [...(parent.path || []), input.parentId]
      depth = (parent.depth || 0) + 1
    }
  }

  // Get next sort_order for siblings
   
  const { data: siblings } = await (supabase as any)
    .from('folders')
    .select('sort_order')
    .eq('tenant_id', context.tenantId)
    .eq('parent_id', input.parentId || null)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = siblings?.[0]?.sort_order != null
    ? siblings[0].sort_order + 1
    : 0

  // Insert folder
   
  const { data: folder, error: insertError } = await (supabase as any)
    .from('folders')
    .insert({
      tenant_id: context.tenantId,
      name: input.name.trim(),
      color: input.color || FOLDER_COLORS[0],
      parent_id: input.parentId || null,
      path,
      depth,
      sort_order: nextSortOrder,
      created_by: context.userId,
    })
    .select('id, name, color')
    .single()

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  // Log activity (fire-and-forget)
   
  (supabase as any).from('activity_logs').insert({
    tenant_id: context.tenantId,
    user_id: context.userId,
    user_name: user?.email,
    action_type: 'create',
    entity_type: 'folder',
    entity_id: folder.id,
    entity_name: folder.name,
    changes: { color: folder.color, parent_id: input.parentId }
  }).then(({ error }: { error: Error | null }) => {
    if (error) console.error('Activity log error:', error.message)
  })

  revalidatePath('/inventory')

  return {
    success: true,
    data: {
      id: folder.id,
      name: folder.name,
      color: folder.color
    }
  }
}

/**
 * Update an existing folder (inline editing)
 */
export async function updateFolder(
  folderId: string,
  input: UpdateFolderInput
): Promise<ActionResult<void>> {
  const authResult = await getAuthContext()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { context } = authResult
  const permResult = requireWritePermission(context)
  if (!permResult.success) return { success: false, error: permResult.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get current folder for logging
   
  const { data: folder, error: fetchError } = await (supabase as any)
    .from('folders')
    .select('*')
    .eq('id', folderId)
    .eq('tenant_id', context.tenantId)
    .single()

  if (fetchError || !folder) {
    return { success: false, error: 'Folder not found' }
  }

  // Build update object
   
  const updates: Record<string, any> = {}

  if (input.name !== undefined) {
    updates.name = input.name.trim()
  }

  if (input.color !== undefined) {
    updates.color = input.color
  }

  if (input.sortOrder !== undefined) {
    updates.sort_order = input.sortOrder
  }

  // Handle parent change (requires path recalculation)
  if (input.parentId !== undefined && input.parentId !== folder.parent_id) {
    const { error: moveError } = await (supabase as any).rpc('move_folder_with_descendants', {
      p_folder_id: folderId,
      p_new_parent_id: input.parentId ?? null,
    })
    if (moveError) {
      return { success: false, error: moveError.message }
    }
  }

  // Update folder
   
  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString()
    const { error: updateError } = await (supabase as any)
      .from('folders')
      .update(updates)
      .eq('id', folderId)
      .eq('tenant_id', context.tenantId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }
  }

  // Log activity (fire-and-forget)
   
  (supabase as any).from('activity_logs').insert({
    tenant_id: folder.tenant_id,
    user_id: context.userId,
    user_name: user?.email,
    action_type: 'update',
    entity_type: 'folder',
    entity_id: folderId,
    entity_name: input.name || folder.name,
    changes: {
      ...(input.name !== undefined && { name: { from: folder.name, to: input.name } }),
      ...(input.color !== undefined && { color: { from: folder.color, to: input.color } }),
    }
  }).then(({ error }: { error: Error | null }) => {
    if (error) console.error('Activity log error:', error.message)
  })

  revalidatePath('/inventory')

  return { success: true }
}

/**
 * Delete a folder (with safety checks)
 */
export async function deleteFolder(
  folderId: string
): Promise<ActionResult<void>> {
  const authResult = await getAuthContext()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { context } = authResult
  const permResult = requireWritePermission(context)
  if (!permResult.success) return { success: false, error: permResult.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get folder for logging
   
  const { data: folder, error: fetchError } = await (supabase as any)
    .from('folders')
    .select('*')
    .eq('id', folderId)
    .eq('tenant_id', context.tenantId)
    .single()

  if (fetchError || !folder) {
    return { success: false, error: 'Folder not found' }
  }

  // Check if folder has items
   
  const { count: itemCount } = await (supabase as any)
    .from('inventory_items')
    .select('id', { count: 'exact', head: true })
    .eq('folder_id', folderId)
    .eq('tenant_id', context.tenantId)
    .is('deleted_at', null)

  if (itemCount && itemCount > 0) {
    return {
      success: false,
      error: `Cannot delete folder with ${itemCount} item${itemCount > 1 ? 's' : ''}. Move or delete items first.`
    }
  }

  // Check if folder has subfolders
   
  const { count: subfolderCount } = await (supabase as any)
    .from('folders')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', folderId)
    .eq('tenant_id', context.tenantId)

  if (subfolderCount && subfolderCount > 0) {
    return {
      success: false,
      error: `Cannot delete folder with ${subfolderCount} subfolder${subfolderCount > 1 ? 's' : ''}. Delete subfolders first.`
    }
  }

  // Delete folder
   
  const { error: deleteError } = await (supabase as any)
    .from('folders')
    .delete()
    .eq('id', folderId)
    .eq('tenant_id', context.tenantId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  // Log activity (fire-and-forget)
   
  (supabase as any).from('activity_logs').insert({
    tenant_id: folder.tenant_id,
    user_id: context.userId,
    user_name: user?.email,
    action_type: 'delete',
    entity_type: 'folder',
    entity_id: folderId,
    entity_name: folder.name,
  }).then(({ error }: { error: Error | null }) => {
    if (error) console.error('Activity log error:', error.message)
  })

  revalidatePath('/inventory')

  return { success: true }
}

/**
 * Quick color update for inline color picker
 */
export async function updateFolderColor(
  folderId: string,
  color: string
): Promise<ActionResult<void>> {
  return updateFolder(folderId, { color })
}

/**
 * Quick rename for inline editing
 */
export async function renameFolder(
  folderId: string,
  name: string
): Promise<ActionResult<void>> {
  if (!name.trim()) {
    return { success: false, error: 'Folder name cannot be empty' }
  }
  return updateFolder(folderId, { name: name.trim() })
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '@/components/settings'
import {
  Plus,
  Tag,
  Check,
  AlertCircle,
  Trash2,
  Loader2,
} from 'lucide-react'
import {
  LabelsDataTable,
  LabelFormSheet,
  DeleteLabelDialog,
  SuggestedLabels,
  type LabelWithUsage,
  type LabelFormData,
  type SuggestedLabel,
} from '@/components/settings/labels'

export default function LabelsSettingsPage() {
  const [labels, setLabels] = useState<LabelWithUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)

  // Form sheet state
  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingLabel, setEditingLabel] = useState<LabelWithUsage | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingLabel, setDeletingLabel] = useState<LabelWithUsage | null>(null)

  // Bulk operations
  const [selectedLabels, setSelectedLabels] = useState<LabelWithUsage[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadLabels = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return
      setTenantId(profile.tenant_id)

      // Fetch labels with usage count
       
      const { data: tagsData } = await (supabase as any)
        .from('tags')
        .select('id, name, color, created_at')
        .eq('tenant_id', profile.tenant_id)
        .order('name', { ascending: true })

      if (!tagsData) {
        setLabels([])
        return
      }

      // Fetch usage counts for all tags
       
      const { data: usageData } = await (supabase as any)
        .from('item_tags')
        .select('tag_id')

      // Count usage per tag
      const usageMap = new Map<string, number>()
      if (usageData) {
        for (const row of usageData) {
          usageMap.set(row.tag_id, (usageMap.get(row.tag_id) || 0) + 1)
        }
      }

      // Combine data
      const labelsWithUsage: LabelWithUsage[] = tagsData.map((tag: { id: string; name: string; color: string | null; created_at: string }) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        usage_count: usageMap.get(tag.id) || 0,
      }))

      setLabels(labelsWithUsage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLabels()
  }, [loadLabels])

  async function handleCreate(data: LabelFormData) {
    if (!tenantId) throw new Error('Not authenticated')

    const supabase = createClient()

     
    const { error: insertError } = await (supabase as any)
      .from('tags')
      .insert({
        tenant_id: tenantId,
        name: data.name.trim(),
        color: data.color,
      })

    if (insertError) throw insertError

    setMessage({ type: 'success', text: 'Label created successfully' })
    loadLabels()
  }

  async function handleUpdate(data: LabelFormData) {
    if (!editingLabel) throw new Error('No label selected')

    const supabase = createClient()

     
    const { error: updateError } = await (supabase as any)
      .from('tags')
      .update({
        name: data.name.trim(),
        color: data.color,
      })
      .eq('id', editingLabel.id)

    if (updateError) throw updateError

    setMessage({ type: 'success', text: 'Label updated successfully' })
    setEditingLabel(null)
    loadLabels()
  }

  async function handleDelete() {
    if (!deletingLabel) return

    const supabase = createClient()

     
    const { error: deleteError } = await (supabase as any)
      .from('tags')
      .delete()
      .eq('id', deletingLabel.id)

    if (deleteError) throw deleteError

    setMessage({ type: 'success', text: 'Label deleted' })
    setDeletingLabel(null)
    loadLabels()
  }

  async function handleBulkDelete() {
    if (selectedLabels.length === 0) return

    setBulkDeleting(true)
    const supabase = createClient()

    try {
      const ids = selectedLabels.map(l => l.id)

       
      const { error: deleteError } = await (supabase as any)
        .from('tags')
        .delete()
        .in('id', ids)

      if (deleteError) throw deleteError

      setMessage({ type: 'success', text: `Deleted ${selectedLabels.length} label${selectedLabels.length === 1 ? '' : 's'}` })
      setSelectedLabels([])
      loadLabels()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete labels' })
    } finally {
      setBulkDeleting(false)
    }
  }

  async function handleAddSuggestedLabel(suggested: SuggestedLabel) {
    if (!tenantId) return

    const supabase = createClient()

     
    const { error: insertError } = await (supabase as any)
      .from('tags')
      .insert({
        tenant_id: tenantId,
        name: suggested.name,
        color: suggested.color,
      })

    if (insertError) throw insertError

    setMessage({ type: 'success', text: `Added "${suggested.name}" label` })
    loadLabels()
  }

  function openCreateForm() {
    setFormMode('create')
    setEditingLabel(null)
    setFormSheetOpen(true)
  }

  function openEditForm(label: LabelWithUsage) {
    setFormMode('edit')
    setEditingLabel(label)
    setFormSheetOpen(true)
  }

  function openDeleteDialog(label: LabelWithUsage) {
    setDeletingLabel(label)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-4 w-64 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  const existingLabelNames = labels.map((l) => l.name)

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Labels</h1>
        <p className="mt-1 text-neutral-500">
          Manage labels to organize and categorize your inventory items
        </p>
      </div>

      {/* Global Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
          role="alert"
        >
          {message.type === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Suggested Labels - show when few labels exist */}
        {labels.length < 10 && (
          <SuggestedLabels
            existingLabels={existingLabelNames}
            onAddLabel={handleAddSuggestedLabel}
          />
        )}

        <SettingsSection
          title="Your Labels"
          description={`${labels.length} label${labels.length === 1 ? '' : 's'} total`}
          icon={Tag}
          headerAction={
            <div className="flex items-center gap-2">
              {/* Bulk delete button - shown when items selected */}
              {selectedLabels.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                >
                  {bulkDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete {selectedLabels.length}
                </Button>
              )}
              <Button onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Label
              </Button>
            </div>
          }
        >
          {labels.length > 0 ? (
            <LabelsDataTable
              labels={labels}
              onEdit={openEditForm}
              onDelete={openDeleteDialog}
              onSelectionChange={setSelectedLabels}
              enableSelection={true}
            />
          ) : (
            // Empty state
            <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
              <Tag className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 font-medium text-neutral-600">No labels yet</p>
              <p className="mt-1 text-sm text-neutral-400">
                Create labels to categorize and filter your inventory items
              </p>
              <Button className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first label
              </Button>
            </div>
          )}
        </SettingsSection>
      </div>

      {/* Create/Edit Form Sheet */}
      <LabelFormSheet
        isOpen={formSheetOpen}
        onClose={() => {
          setFormSheetOpen(false)
          setEditingLabel(null)
        }}
        onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
        initialData={
          editingLabel
            ? { name: editingLabel.name, color: editingLabel.color || '#3b82f6' }
            : undefined
        }
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteLabelDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeletingLabel(null)
        }}
        onConfirm={handleDelete}
        labelName={deletingLabel?.name || ''}
        labelColor={deletingLabel?.color || '#6b7280'}
        usageCount={deletingLabel?.usage_count || 0}
      />
    </div>
  )
}

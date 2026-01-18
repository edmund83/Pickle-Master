'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '@/components/settings'
import {
  Plus,
  Receipt,
  Check,
  AlertCircle,
  Trash2,
  Loader2,
} from 'lucide-react'
import {
  PaymentTermsDataTable,
  PaymentTermFormSheet,
  DeletePaymentTermDialog,
  type PaymentTermFormData,
  type PaymentTermWithUsage,
} from '@/components/settings/payment-terms'

export default function PaymentTermsSettingsPage() {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermWithUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)

  // Form sheet state
  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingTerm, setEditingTerm] = useState<PaymentTermWithUsage | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTerm, setDeletingTerm] = useState<PaymentTermWithUsage | null>(null)

  // Bulk operations
  const [selectedTerms, setSelectedTerms] = useState<PaymentTermWithUsage[]>([])
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

  const loadPaymentTerms = useCallback(async () => {
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

      // Call the database function to get payment terms with usage count
       
      const { data: termsData, error } = await (supabase as any)
        .rpc('get_payment_terms_with_usage')

      if (error) {
        console.error('Error loading payment terms:', error)
        // Fallback: direct query without usage count
         
        const { data: fallbackData } = await (supabase as any)
          .from('payment_terms')
          .select('id, name, description, days, sort_order, is_default')
          .eq('tenant_id', profile.tenant_id)
          .order('sort_order', { ascending: true })

        if (fallbackData) {
          setPaymentTerms(fallbackData.map((t: PaymentTermWithUsage) => ({
            ...t,
            usage_count: 0,
          })))
        } else {
          setPaymentTerms([])
        }
        return
      }

      setPaymentTerms(termsData || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPaymentTerms()
  }, [loadPaymentTerms])

  async function handleCreate(data: PaymentTermFormData) {
    if (!tenantId) throw new Error('Not authenticated')

    const supabase = createClient()

    // Get current max sort_order
     
    const { data: maxSortData } = await (supabase as any)
      .from('payment_terms')
      .select('sort_order')
      .eq('tenant_id', tenantId)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (maxSortData?.[0]?.sort_order || 0) + 1

     
    const { error: insertError } = await (supabase as any)
      .from('payment_terms')
      .insert({
        tenant_id: tenantId,
        name: data.name.trim(),
        description: data.description.trim() || null,
        days: data.days,
        sort_order: nextSortOrder,
      })

    if (insertError) throw insertError

    setMessage({ type: 'success', text: 'Payment term created successfully' })
    loadPaymentTerms()
  }

  async function handleUpdate(data: PaymentTermFormData) {
    if (!editingTerm || !tenantId) throw new Error('No payment term selected')

    const supabase = createClient()

     
    const { error: updateError } = await (supabase as any)
      .from('payment_terms')
      .update({
        name: data.name.trim(),
        description: data.description.trim() || null,
        days: data.days,
      })
      .eq('id', editingTerm.id)

    if (updateError) throw updateError

    setMessage({ type: 'success', text: 'Payment term updated successfully' })
    setEditingTerm(null)
    loadPaymentTerms()
  }

  async function handleDelete() {
    if (!deletingTerm) return

    const supabase = createClient()

     
    const { error: deleteError } = await (supabase as any)
      .from('payment_terms')
      .delete()
      .eq('id', deletingTerm.id)

    if (deleteError) throw deleteError

    setMessage({ type: 'success', text: 'Payment term deleted' })
    setDeletingTerm(null)
    loadPaymentTerms()
  }

  async function handleBulkDelete() {
    if (selectedTerms.length === 0) return

    setBulkDeleting(true)
    const supabase = createClient()

    try {
      const ids = selectedTerms.map(t => t.id)

       
      const { error: deleteError } = await (supabase as any)
        .from('payment_terms')
        .delete()
        .in('id', ids)

      if (deleteError) throw deleteError

      setMessage({ type: 'success', text: `Deleted ${selectedTerms.length} payment term${selectedTerms.length === 1 ? '' : 's'}` })
      setSelectedTerms([])
      loadPaymentTerms()
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete payment terms' })
    } finally {
      setBulkDeleting(false)
    }
  }

  function openCreateForm() {
    setFormMode('create')
    setEditingTerm(null)
    setFormSheetOpen(true)
  }

  function openEditForm(term: PaymentTermWithUsage) {
    setFormMode('edit')
    setEditingTerm(term)
    setFormSheetOpen(true)
  }

  function openDeleteDialog(term: PaymentTermWithUsage) {
    setDeletingTerm(term)
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

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Payment Terms</h1>
        <p className="mt-1 text-neutral-500">
          Manage payment terms for your vendors
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
        <SettingsSection
          title="Your Payment Terms"
          description={`${paymentTerms.length} payment term${paymentTerms.length === 1 ? '' : 's'} total`}
          icon={Receipt}
          headerAction={
            <div className="flex items-center gap-2">
              {/* Bulk delete button - shown when items selected */}
              {selectedTerms.length > 0 && (
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
                  Delete {selectedTerms.length}
                </Button>
              )}
              <Button onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Payment Term
              </Button>
            </div>
          }
        >
          {paymentTerms.length > 0 ? (
            <PaymentTermsDataTable
              paymentTerms={paymentTerms}
              onEdit={openEditForm}
              onDelete={openDeleteDialog}
              onSelectionChange={setSelectedTerms}
              enableSelection={true}
            />
          ) : (
            // Empty state
            <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 font-medium text-neutral-600">No payment terms yet</p>
              <p className="mt-1 text-sm text-neutral-400">
                Create payment terms to use when managing vendors
              </p>
              <Button className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first payment term
              </Button>
            </div>
          )}
        </SettingsSection>
      </div>

      {/* Create/Edit Form Sheet */}
      <PaymentTermFormSheet
        isOpen={formSheetOpen}
        onClose={() => {
          setFormSheetOpen(false)
          setEditingTerm(null)
        }}
        onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
        initialData={
          editingTerm
            ? {
                name: editingTerm.name,
                description: editingTerm.description || '',
                days: editingTerm.days,
              }
            : undefined
        }
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePaymentTermDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeletingTerm(null)
        }}
        onConfirm={handleDelete}
        termName={deletingTerm?.name || ''}
        usageCount={deletingTerm?.usage_count || 0}
      />
    </div>
  )
}

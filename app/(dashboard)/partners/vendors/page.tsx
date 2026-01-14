'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  VendorsDataTable,
  VendorFormDialog,
  type VendorFormData,
} from '@/components/settings/vendors'
import {
  Plus,
  Check,
  Truck,
  AlertCircle,
} from 'lucide-react'
import type { Vendor } from '@/types/database.types'

interface PaymentTermOption {
  id: string
  name: string
}

export default function PartnersVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermOption[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete confirmation state
  const [deleteConfirmVendor, setDeleteConfirmVendor] = useState<Vendor | null>(null)

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadVendors = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return
      setTenantId(profile.tenant_id)

      // Fetch vendors and payment terms in parallel
      const [vendorsResult, paymentTermsResult] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('vendors')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('name', { ascending: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('payment_terms')
          .select('id, name')
          .eq('tenant_id', profile.tenant_id)
          .order('sort_order', { ascending: true }),
      ])

      setVendors((vendorsResult.data || []) as Vendor[])
      setPaymentTerms((paymentTermsResult.data || []) as PaymentTermOption[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVendors()
  }, [loadVendors])

  // Open dialog for creating new vendor
  function handleAddVendor() {
    setEditingVendor(null)
    setDialogOpen(true)
  }

  // Open dialog for editing existing vendor
  function handleEditVendor(vendor: Vendor) {
    setEditingVendor(vendor)
    setDialogOpen(true)
  }

  // Handle save from dialog (create or update)
  async function handleSaveVendor(formData: VendorFormData) {
    if (!tenantId) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      if (editingVendor) {
        // Update existing vendor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('vendors')
          .update({
            name: formData.name.trim(),
            contact_name: formData.contact_name || null,
            email: formData.email || null,
            phone: formData.phone || null,
            address_line1: formData.address_line1 || null,
            city: formData.city || null,
            country: formData.country || null,
            payment_term_id: formData.payment_term_id || null,
            notes: formData.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingVendor.id)

        if (updateError) throw updateError

        setMessage({ type: 'success', text: 'Vendor updated successfully' })
      } else {
        // Create new vendor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('vendors')
          .insert({
            tenant_id: tenantId,
            name: formData.name.trim(),
            contact_name: formData.contact_name || null,
            email: formData.email || null,
            phone: formData.phone || null,
            address_line1: formData.address_line1 || null,
            city: formData.city || null,
            country: formData.country || null,
            payment_term_id: formData.payment_term_id || null,
            notes: formData.notes || null,
          })

        if (insertError) throw insertError

        setMessage({ type: 'success', text: 'Vendor added successfully' })
      }

      setDialogOpen(false)
      setEditingVendor(null)
      loadVendors()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save vendor',
      })
      throw err // Re-throw so dialog knows there was an error
    } finally {
      setSaving(false)
    }
  }

  // Handle single delete
  function handleDeleteVendor(vendor: Vendor) {
    setDeleteConfirmVendor(vendor)
  }

  async function confirmDelete() {
    if (!deleteConfirmVendor) return

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('vendors')
      .delete()
      .eq('id', deleteConfirmVendor.id)

    if (!deleteError) {
      setDeleteConfirmVendor(null)
      setMessage({ type: 'success', text: 'Vendor deleted' })
      loadVendors()
    } else {
      setMessage({ type: 'error', text: 'Failed to delete vendor' })
    }
  }

  // Handle bulk delete
  async function handleBulkDelete(vendorsToDelete: Vendor[]) {
    const supabase = createClient()
    const ids = vendorsToDelete.map((v) => v.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('vendors')
      .delete()
      .in('id', ids)

    if (!deleteError) {
      setMessage({
        type: 'success',
        text: `${vendorsToDelete.length} vendor${vendorsToDelete.length !== 1 ? 's' : ''} deleted`,
      })
      loadVendors()
    } else {
      setMessage({ type: 'error', text: 'Failed to delete vendors' })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-neutral-50 p-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-4 w-64 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Vendors</h1>
            <p className="mt-1 text-neutral-500">
              Manage your suppliers and vendors
            </p>
          </div>
          <Button onClick={handleAddVendor}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        {/* Global Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {vendors.length > 0 ? (
          <VendorsDataTable
            vendors={vendors}
            onEdit={handleEditVendor}
            onDelete={handleDeleteVendor}
            onBulkDelete={handleBulkDelete}
            enableSelection
          />
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
            <Truck className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-4 font-medium text-neutral-600">No vendors yet</p>
            <p className="mt-1 text-sm text-neutral-400">
              Add vendors to manage your suppliers and create purchase orders
            </p>
            <Button className="mt-4" onClick={handleAddVendor}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first vendor
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <VendorFormDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingVendor(null)
        }}
        onSave={handleSaveVendor}
        vendor={editingVendor}
        saving={saving}
        paymentTerms={paymentTerms}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirmVendor(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-neutral-900">Delete Vendor</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Are you sure you want to delete <strong>{deleteConfirmVendor.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmVendor(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

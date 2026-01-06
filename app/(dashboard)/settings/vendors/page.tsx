'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsSection } from '@/components/settings'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Truck,
  Mail,
  Phone,
  MapPin,
  User,
  AlertCircle,
  Building2,
} from 'lucide-react'
import type { Vendor } from '@/types/database.types'

export default function VendorsSettingsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address_line1: '',
    city: '',
    country: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name', { ascending: true })

      setVendors((data || []) as Vendor[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVendors()
  }, [loadVendors])

  function resetForm() {
    setFormData({
      name: '',
      contact_name: '',
      email: '',
      phone: '',
      address_line1: '',
      city: '',
      country: '',
      notes: '',
    })
  }

  async function handleCreate() {
    if (!formData.name.trim() || !tenantId) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

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
          notes: formData.notes || null,
        })

      if (insertError) throw insertError

      setShowForm(false)
      resetForm()
      setMessage({ type: 'success', text: 'Vendor added successfully' })
      loadVendors()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create vendor' })
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!formData.name.trim()) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

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
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      setEditingId(null)
      resetForm()
      setMessage({ type: 'success', text: 'Vendor updated successfully' })
      loadVendors()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update vendor' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('vendors')
      .delete()
      .eq('id', id)

    if (!deleteError) {
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'Vendor deleted' })
      loadVendors()
    } else {
      setMessage({ type: 'error', text: 'Failed to delete vendor' })
    }
  }

  function startEdit(vendor: Vendor) {
    setEditingId(vendor.id)
    setFormData({
      name: vendor.name,
      contact_name: vendor.contact_name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address_line1: vendor.address_line1 || '',
      city: vendor.city || '',
      country: vendor.country || '',
      notes: vendor.notes || '',
    })
    setShowForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
    setMessage(null)
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
        <h1 className="text-2xl font-semibold text-neutral-900">Vendors</h1>
        <p className="mt-1 text-neutral-500">
          Manage your suppliers and vendors for purchase orders
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
        >
          {message.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-6">
        <SettingsSection
          title="Your Vendors"
          description={`${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} configured`}
          icon={Truck}
          headerAction={
            !showForm && (
              <Button
                size="sm"
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                  resetForm()
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Vendor
              </Button>
            )
          }
        >
          {/* Create Form */}
          {showForm && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-4 text-sm font-medium text-neutral-900">Add New Vendor</h4>
              <VendorForm
                formData={formData}
                setFormData={setFormData}
                saving={saving}
                onSave={handleCreate}
                onCancel={() => {
                  setShowForm(false)
                  resetForm()
                  setMessage(null)
                }}
              />
            </div>
          )}

          {/* Vendors List */}
          {vendors.length > 0 ? (
            <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {vendors.map((vendor) => {
                const isEditing = editingId === vendor.id

                return (
                  <div key={vendor.id} className="p-4">
                    {isEditing ? (
                      <VendorForm
                        formData={formData}
                        setFormData={setFormData}
                        saving={saving}
                        onSave={() => handleUpdate(vendor.id)}
                        onCancel={cancelEdit}
                        isEdit
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-neutral-900">{vendor.name}</h4>
                            <div className="mt-1 flex flex-wrap gap-4 text-sm text-neutral-500">
                              {vendor.contact_name && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5" />
                                  {vendor.contact_name}
                                </span>
                              )}
                              {vendor.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {vendor.email}
                                </span>
                              )}
                              {vendor.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5" />
                                  {vendor.phone}
                                </span>
                              )}
                              {vendor.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {vendor.city}
                                </span>
                              )}
                            </div>
                            {vendor.notes && (
                              <p className="mt-1 text-sm text-neutral-400 truncate max-w-md">
                                {vendor.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {deleteConfirm === vendor.id ? (
                            <>
                              <span className="text-sm text-red-600 mr-2">Delete?</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(vendor.id)}
                              >
                                Yes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                No
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => startEdit(vendor)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(vendor.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
              <Truck className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 font-medium text-neutral-600">No vendors yet</p>
              <p className="mt-1 text-sm text-neutral-400">
                Add vendors to manage your suppliers and create purchase orders
              </p>
              {!showForm && (
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first vendor
                </Button>
              )}
            </div>
          )}
        </SettingsSection>
      </div>
    </div>
  )
}

interface VendorFormProps {
  formData: {
    name: string
    contact_name: string
    email: string
    phone: string
    address_line1: string
    city: string
    country: string
    notes: string
  }
  setFormData: React.Dispatch<React.SetStateAction<VendorFormProps['formData']>>
  saving: boolean
  onSave: () => void
  onCancel: () => void
  isEdit?: boolean
}

function VendorForm({
  formData,
  setFormData,
  saving,
  onSave,
  onCancel,
  isEdit,
}: VendorFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Company Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Acme Supplies Inc."
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Contact Person
          </label>
          <Input
            value={formData.contact_name}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="contact@acme.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Phone
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+60 12-345 6789"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Address
          </label>
          <Input
            value={formData.address_line1}
            onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
            placeholder="123 Main Street"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            City
          </label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Kuala Lumpur"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Notes
          </label>
          <Input
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information about this vendor..."
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving || !formData.name.trim()}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {isEdit ? 'Save Changes' : 'Add Vendor'}
        </Button>
      </div>
    </div>
  )
}

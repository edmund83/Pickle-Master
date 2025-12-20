'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Truck,
  Mail,
  Phone,
  MapPin,
  User,
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
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
    setError(null)

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
      loadVendors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!formData.name.trim()) return

    setSaving(true)
    setError(null)

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
      loadVendors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor')
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
      loadVendors()
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
    setError(null)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Vendors</h1>
          <p className="text-neutral-500">
            Manage your suppliers and vendors for purchase orders
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            resetForm()
          }}
          disabled={showForm}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Vendor
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(showForm || editingId) && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium text-neutral-900">
            {editingId ? 'Edit Vendor' : 'Add New Vendor'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
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
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Contact Person
              </label>
              <Input
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
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
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+60 12-345 6789"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Address
              </label>
              <Input
                value={formData.address_line1}
                onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Kuala Lumpur"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Notes
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information about this vendor..."
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowForm(false)
              cancelEdit()
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
              disabled={saving || !formData.name.trim()}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingId ? 'Save Changes' : 'Add Vendor'}
            </Button>
          </div>
        </div>
      )}

      {/* Vendors List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : vendors.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-200">
            {vendors.map((vendor) => (
              <li key={vendor.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
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
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Truck className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No vendors yet</h3>
          <p className="mt-1 text-neutral-500">
            Add vendors to manage your suppliers and create purchase orders
          </p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first vendor
          </Button>
        </div>
      )}
    </div>
  )
}

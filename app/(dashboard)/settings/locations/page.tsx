'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsSection } from '@/components/settings'
import {
  MapPin,
  Plus,
  Warehouse,
  Truck,
  Store,
  HardHat,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  Settings,
} from 'lucide-react'
import type { Location, LocationType } from '@/types/database.types'

interface FeaturesEnabled {
  multi_location?: boolean
  shipping_dimensions?: boolean
  lot_tracking?: boolean
}

const locationTypeConfig: Record<LocationType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  warehouse: { icon: Warehouse, label: 'Warehouse', color: 'bg-blue-100 text-blue-600' },
  van: { icon: Truck, label: 'Van', color: 'bg-amber-100 text-amber-600' },
  store: { icon: Store, label: 'Store', color: 'bg-green-100 text-green-600' },
  job_site: { icon: HardHat, label: 'Job Site', color: 'bg-purple-100 text-purple-600' },
}

export default function LocationsSettingsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [featureEnabled, setFeatureEnabled] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'warehouse' as LocationType,
    description: '',
  })
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return
      setUserId(user.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return
      setTenantId(profile.tenant_id)

      // Check if multi-location feature is enabled
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tenant } = await (supabase as any)
        .from('tenants')
        .select('settings')
        .eq('id', profile.tenant_id)
        .single()

      const settings = tenant?.settings as Record<string, unknown> | null
      const features = settings?.features_enabled as FeaturesEnabled | undefined
      setFeatureEnabled(features?.multi_location ?? false)

      // Load locations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: locationsData } = await (supabase as any)
        .from('locations')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

      setLocations(locationsData || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCreate() {
    if (!formData.name.trim() || !tenantId) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('locations')
        .insert({
          tenant_id: tenantId,
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim() || null,
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      setLocations(prev => [...prev, data as Location].sort((a, b) => a.name.localeCompare(b.name)))
      setShowForm(false)
      setFormData({ name: '', type: 'warehouse', description: '' })
      setMessage({ type: 'success', text: 'Location created successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create location' })
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
      const { error } = await (supabase as any)
        .from('locations')
        .update({
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setLocations(prev =>
        prev.map(loc =>
          loc.id === id
            ? { ...loc, name: formData.name.trim(), type: formData.type, description: formData.description.trim() || null }
            : loc
        ).sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditingId(null)
      setFormData({ name: '', type: 'warehouse', description: '' })
      setMessage({ type: 'success', text: 'Location updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update location' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(locationId: string) {
    try {
      const supabase = createClient()

      // Check if any items are using this location
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count: stockCount } = await (supabase as any)
        .from('location_stock')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', locationId)

      if (stockCount && stockCount > 0) {
        setMessage({
          type: 'error',
          text: `Cannot delete: ${stockCount} item(s) are assigned to this location. Move or remove items first.`
        })
        setDeleteConfirm(null)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('locations')
        .delete()
        .eq('id', locationId)

      if (error) throw error

      setLocations(prev => prev.filter(loc => loc.id !== locationId))
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'Location deleted' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete' })
    }
  }

  function startEdit(location: Location) {
    setEditingId(location.id)
    setFormData({
      name: location.name,
      type: location.type,
      description: location.description || '',
    })
    setShowForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormData({ name: '', type: 'warehouse', description: '' })
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

  if (!featureEnabled) {
    return (
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Locations</h1>
          <p className="mt-1 text-neutral-500">Manage your inventory locations</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <SettingsSection
            title="Multi-Location Not Enabled"
            description="Enable this feature to manage multiple inventory locations"
            icon={AlertCircle}
          >
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <MapPin className="h-7 w-7 text-amber-600" />
              </div>
              <p className="mt-4 font-medium text-neutral-600">Feature Not Enabled</p>
              <p className="mt-1 max-w-md text-sm text-neutral-400">
                Enable the Multi-Location Inventory feature in Settings → Features to manage multiple warehouses, vans, stores, or job sites.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => window.location.href = '/settings/features'}
              >
                <Settings className="mr-2 h-4 w-4" />
                Go to Features Settings
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Locations</h1>
        <p className="mt-1 text-neutral-500">Manage your inventory locations</p>
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
          title="Your Locations"
          description={`${locations.length} location${locations.length !== 1 ? 's' : ''} configured`}
          icon={MapPin}
          headerAction={
            !showForm && (
              <Button
                size="sm"
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                  setFormData({ name: '', type: 'warehouse', description: '' })
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Location
              </Button>
            )
          }
        >
          {/* Create Form */}
          {showForm && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-4 text-sm font-medium text-neutral-900">Add New Location</h4>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Location Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Main Warehouse, Van #1, Downtown Store"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Location Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(Object.keys(locationTypeConfig) as LocationType[]).map((type) => {
                      const config = locationTypeConfig[type]
                      const Icon = config.icon
                      const isSelected = formData.type === type

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type }))}
                          className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-neutral-500'}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-neutral-700'}`}>
                            {config.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Description (optional)
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Address or additional details"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => {
                    setShowForm(false)
                    setFormData({ name: '', type: 'warehouse', description: '' })
                    setMessage(null)
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={saving || !formData.name.trim()}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Create Location
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Locations List */}
          {locations.length > 0 ? (
            <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {locations.map((location) => {
                const isEditing = editingId === location.id
                const config = locationTypeConfig[location.type]
                const Icon = config.icon

                return (
                  <div key={location.id} className="p-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="flex-1 min-w-[200px]"
                            autoFocus
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {(Object.keys(locationTypeConfig) as LocationType[]).map((type) => {
                            const typeConfig = locationTypeConfig[type]
                            const TypeIcon = typeConfig.icon
                            const isSelected = formData.type === type

                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type }))}
                                className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                                  isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                <TypeIcon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-neutral-500'}`} />
                                <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-neutral-700'}`}>
                                  {typeConfig.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description (optional)"
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleUpdate(location.id)} disabled={saving}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-neutral-900">{location.name}</span>
                              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                                {config.label}
                              </span>
                              {!location.is_active && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {location.description && (
                              <p className="mt-0.5 text-sm text-neutral-500 truncate">{location.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {deleteConfirm === location.id ? (
                            <>
                              <span className="text-sm text-red-600 mr-2">Delete?</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(location.id)}
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
                              <Button variant="ghost" size="sm" onClick={() => startEdit(location)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(location.id)}>
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
              <MapPin className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 font-medium text-neutral-600">No locations yet</p>
              <p className="mt-1 text-sm text-neutral-400">
                Add your first location to start tracking inventory across multiple places
              </p>
              {!showForm && (
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first location
                </Button>
              )}
            </div>
          )}
        </SettingsSection>
      </div>
    </div>
  )
}

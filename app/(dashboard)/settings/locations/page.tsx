'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MapPin,
  Plus,
  Warehouse,
  Truck,
  Store,
  HardHat,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Save,
  AlertCircle,
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

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'warehouse' as LocationType,
    description: '',
  })
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
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
  }

  function openAddModal() {
    setEditingLocation(null)
    setFormData({ name: '', type: 'warehouse', description: '' })
    setShowModal(true)
  }

  function openEditModal(location: Location) {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      type: location.type,
      description: location.description || '',
    })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantId) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      if (editingLocation) {
        // Update existing location
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('locations')
          .update({
            name: formData.name,
            type: formData.type,
            description: formData.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLocation.id)

        if (error) throw error

        setLocations(prev =>
          prev.map(loc =>
            loc.id === editingLocation.id
              ? { ...loc, ...formData, updated_at: new Date().toISOString() }
              : loc
          )
        )
        setMessage({ type: 'success', text: 'Location updated' })
      } else {
        // Create new location
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('locations')
          .insert({
            tenant_id: tenantId,
            name: formData.name,
            type: formData.type,
            description: formData.description || null,
            created_by: userId,
          })
          .select()
          .single()

        if (error) throw error

        setLocations(prev => [...prev, data as Location].sort((a, b) => a.name.localeCompare(b.name)))
        setMessage({ type: 'success', text: 'Location created' })
      }

      setShowModal(false)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' })
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!featureEnabled) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Locations</h1>
          <p className="text-neutral-500">Manage your inventory locations</p>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
              <AlertCircle className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Multi-Location Not Enabled</h3>
            <p className="text-neutral-500 mb-6 max-w-md">
              Enable the Multi-Location Inventory feature in Settings → Features to manage multiple warehouses, vans, stores, or job sites.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/settings/features'}>
              Go to Features Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Locations</h1>
          <p className="text-neutral-500">Manage your inventory locations</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-4xl space-y-4">
        {locations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pickle-100 mb-4">
                <MapPin className="h-8 w-8 text-pickle-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Locations Yet</h3>
              <p className="text-neutral-500 mb-6">
                Add your first location to start tracking inventory across multiple places.
              </p>
              <Button onClick={openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Your Locations
              </CardTitle>
              <CardDescription>
                {locations.length} location{locations.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-100">
                {locations.map((location) => {
                  const config = locationTypeConfig[location.type]
                  const Icon = config.icon

                  return (
                    <div
                      key={location.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-neutral-900">{location.name}</h3>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(location)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(location.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Location Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Warehouse, Van #1, Downtown Store"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Location Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(locationTypeConfig) as LocationType[]).map((type) => {
                    const config = locationTypeConfig[type]
                    const Icon = config.icon
                    const isSelected = formData.type === type

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                          isSelected
                            ? 'border-pickle-500 bg-pickle-50'
                            : 'border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-pickle-600' : 'text-neutral-500'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-pickle-900' : 'text-neutral-700'}`}>
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Address or additional details"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingLocation ? 'Save Changes' : 'Add Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

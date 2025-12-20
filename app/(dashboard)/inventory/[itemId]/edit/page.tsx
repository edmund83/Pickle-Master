'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Package, Loader2, ImageIcon, Truck, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoUpload } from '@/components/inventory/PhotoUpload'
import { CustomFieldsSection } from '@/components/custom-fields'
import { LotTrackingSection } from '@/components/lots/LotTrackingSection'
import { SerialTrackingSection } from '@/components/serials/SerialTrackingSection'
import { createClient } from '@/lib/supabase/client'
import type { InventoryItem, ItemTrackingMode } from '@/types/database.types'

interface FeaturesEnabled {
  multi_location?: boolean
  shipping_dimensions?: boolean
  lot_tracking?: boolean
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.itemId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [features, setFeatures] = useState<FeaturesEnabled>({})
  const [shippingExpanded, setShippingExpanded] = useState(false)
  const [lotExpanded, setLotExpanded] = useState(false)
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({})

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    serial_number: '',
    description: '',
    quantity: 0,
    unit: 'pcs',
    min_quantity: 0,
    price: 0,
    cost_price: 0,
    currency: 'RM',
    location: '',
    notes: '',
    // Shipping dimensions
    weight: 0,
    weight_unit: 'kg',
    length: 0,
    width: 0,
    height: 0,
    dimension_unit: 'cm',
    // Tracking mode
    tracking_mode: 'none' as ItemTrackingMode,
  })

  useEffect(() => {
    async function fetchItem() {
      try {
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single()

        if (!profile?.tenant_id) {
          throw new Error('No tenant found')
        }

        // Load tenant features
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tenant } = await (supabase as any)
          .from('tenants')
          .select('settings')
          .eq('id', profile.tenant_id)
          .single()

        const settings = tenant?.settings as Record<string, unknown> | null
        const enabledFeatures = settings?.features_enabled as FeaturesEnabled | undefined
        setFeatures(enabledFeatures || {})

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: fetchError } = await (supabase as any)
          .from('inventory_items')
          .select('*')
          .eq('id', itemId)
          .eq('tenant_id', profile.tenant_id)
          .is('deleted_at', null)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('Item not found')

        const itemData = data as InventoryItem
        setItem(itemData)
        setImages(itemData.image_urls || [])
        setCustomFields((itemData.custom_fields as Record<string, unknown>) || {})

        // Auto-expand sections if they have data
        const hasShippingData = itemData.weight || itemData.length || itemData.width || itemData.height
        const hasLotData = itemData.tracking_mode && itemData.tracking_mode !== 'none'
        setShippingExpanded(!!hasShippingData)
        setLotExpanded(!!hasLotData)

        setFormData({
          name: itemData.name || '',
          sku: itemData.sku || '',
          barcode: itemData.barcode || '',
          serial_number: itemData.serial_number || '',
          description: itemData.description || '',
          quantity: itemData.quantity || 0,
          unit: itemData.unit || 'pcs',
          min_quantity: itemData.min_quantity || 0,
          price: itemData.price || 0,
          cost_price: itemData.cost_price || 0,
          currency: itemData.currency || 'RM',
          location: itemData.location || '',
          notes: itemData.notes || '',
          // Shipping dimensions
          weight: itemData.weight || 0,
          weight_unit: itemData.weight_unit || 'kg',
          length: itemData.length || 0,
          width: itemData.width || 0,
          height: itemData.height || 0,
          dimension_unit: itemData.dimension_unit || 'cm',
          // Tracking mode
          tracking_mode: (itemData.tracking_mode as ItemTrackingMode) || 'none',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [itemId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Determine status based on quantity and min_quantity
      let status = 'in_stock'
      if (formData.quantity <= 0) {
        status = 'out_of_stock'
      } else if (formData.min_quantity > 0 && formData.quantity <= formData.min_quantity) {
        status = 'low_stock'
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update({
          name: formData.name,
          sku: formData.sku || null,
          barcode: formData.barcode || null,
          serial_number: formData.serial_number || null,
          description: formData.description || null,
          quantity: formData.quantity,
          unit: formData.unit,
          min_quantity: formData.min_quantity,
          price: formData.price,
          cost_price: formData.cost_price || null,
          currency: formData.currency,
          location: formData.location || null,
          notes: formData.notes || null,
          image_urls: images.length > 0 ? images : null,
          status,
          last_modified_by: user.id,
          updated_at: new Date().toISOString(),
          // Shipping dimensions (only if feature enabled)
          ...(features.shipping_dimensions && {
            weight: formData.weight || null,
            weight_unit: formData.weight_unit,
            length: formData.length || null,
            width: formData.width || null,
            height: formData.height || null,
            dimension_unit: formData.dimension_unit,
          }),
          // Tracking mode (only if lot tracking feature enabled)
          ...(features.lot_tracking && {
            tracking_mode: formData.tracking_mode,
          }),
          // Custom fields
          custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
        })
        .eq('id', itemId)

      if (updateError) throw updateError

      router.push(`/inventory/${itemId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pickle-500" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">Item not found</p>
        <Link href="/inventory">
          <Button variant="outline">Back to Inventory</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href={`/inventory/${itemId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Edit Item</h1>
            <p className="text-sm text-neutral-500">{item.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/inventory/${itemId}`}>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" form="item-form" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form id="item-form" onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                disabled={saving}
              />
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Item Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    SKU
                  </label>
                  <Input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g., PRD-001"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Barcode
                  </label>
                  <Input
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="e.g., 1234567890123"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Serial Number
                  </label>
                  <Input
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    placeholder="e.g., SN-12345"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Location
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Warehouse A, Shelf B3"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  placeholder="Describe the item..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                    disabled={formData.tracking_mode === 'lot_expiry'}
                    className={formData.tracking_mode === 'lot_expiry' ? 'bg-neutral-100' : ''}
                  />
                  {formData.tracking_mode === 'lot_expiry' && (
                    <p className="mt-1 text-xs text-neutral-500">Calculated from lots</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="l">Liters (L)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="m">Meters (m)</option>
                    <option value="box">Boxes</option>
                    <option value="pack">Packs</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Min. Quantity
                  </label>
                  <Input
                    type="number"
                    name="min_quantity"
                    value={formData.min_quantity}
                    onChange={handleChange}
                    min="0"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Alert when below this</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Selling Price
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Cost Price
                  </label>
                  <Input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                  <p className="mt-1 text-xs text-neutral-500">For margin calculation</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  >
                    <option value="RM">RM (Malaysian Ringgit)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SGD">SGD (Singapore Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>
              {formData.price > 0 && formData.cost_price > 0 && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Margin</span>
                    <span className="font-medium text-pickle-600">
                      {(((formData.price - formData.cost_price) / formData.cost_price) * 100).toFixed(1)}% / {formData.currency} {(formData.price - formData.cost_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Dimensions - Only show if feature enabled */}
          {features.shipping_dimensions && (
            <Card>
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setShippingExpanded(!shippingExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Dimensions
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!shippingExpanded && (formData.weight > 0 || formData.length > 0) && (
                      <span className="text-xs text-pickle-600 bg-pickle-50 px-2 py-1 rounded-full">
                        Has data
                      </span>
                    )}
                    {shippingExpanded ? (
                      <ChevronUp className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {shippingExpanded && (
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Weight
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          name="weight"
                          value={formData.weight || ''}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          placeholder="0.000"
                          className="flex-1"
                        />
                        <select
                          name="weight_unit"
                          value={formData.weight_unit}
                          onChange={handleChange}
                          className="w-20 rounded-lg border border-neutral-300 px-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="lb">lb</option>
                          <option value="oz">oz</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Dimension Unit
                      </label>
                      <select
                        name="dimension_unit"
                        value={formData.dimension_unit}
                        onChange={handleChange}
                        className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                      >
                        <option value="cm">Centimeters (cm)</option>
                        <option value="in">Inches (in)</option>
                        <option value="mm">Millimeters (mm)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Length
                      </label>
                      <Input
                        type="number"
                        name="length"
                        value={formData.length || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Width
                      </label>
                      <Input
                        type="number"
                        name="width"
                        value={formData.width || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Height
                      </label>
                      <Input
                        type="number"
                        name="height"
                        value={formData.height || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {formData.length > 0 && formData.width > 0 && formData.height > 0 && (
                    <div className="rounded-lg bg-neutral-50 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Volume</span>
                        <span className="font-medium text-pickle-600">
                          {(formData.length * formData.width * formData.height).toFixed(2)} {formData.dimension_unit}³
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Lot/Expiry Tracking - Only show if feature enabled */}
          {features.lot_tracking && (
            <Card>
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setLotExpanded(!lotExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Tracking Mode
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!lotExpanded && formData.tracking_mode !== 'none' && (
                      <span className="text-xs text-pickle-600 bg-pickle-50 px-2 py-1 rounded-full capitalize">
                        {formData.tracking_mode.replace('_', ' ')}
                      </span>
                    )}
                    {lotExpanded ? (
                      <ChevronUp className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {lotExpanded && (
                <CardContent className="space-y-4">
                  <p className="text-sm text-neutral-500">
                    Choose how to track this item. Lot/Expiry tracking allows multiple lots with different expiry dates.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: 'none', label: 'None', desc: 'Simple quantity tracking' },
                      { value: 'serialized', label: 'Serialized', desc: 'Each unit has a serial number' },
                      { value: 'lot_expiry', label: 'Lot/Expiry', desc: 'Track by lot number and expiry date' },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, tracking_mode: mode.value as ItemTrackingMode })}
                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                          formData.tracking_mode === mode.value
                            ? 'border-pickle-500 bg-pickle-50'
                            : 'border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          formData.tracking_mode === mode.value ? 'text-pickle-900' : 'text-neutral-700'
                        }`}>
                          {mode.label}
                        </span>
                        <span className="mt-0.5 text-xs text-neutral-500">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                  {/* Lot Tracking Section */}
                  {formData.tracking_mode === 'lot_expiry' && (
                    <LotTrackingSection
                      itemId={itemId}
                      onTotalChange={(total) => setFormData(prev => ({ ...prev, quantity: total }))}
                    />
                  )}

                  {/* Serial Tracking Section */}
                  {formData.tracking_mode === 'serialized' && (
                    <SerialTrackingSection
                      itemId={itemId}
                      quantity={formData.quantity}
                    />
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                placeholder="Internal notes about this item..."
              />
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <CustomFieldsSection
            values={customFields}
            onChange={setCustomFields}
            disabled={saving}
          />
        </form>
      </div>
    </div>
  )
}

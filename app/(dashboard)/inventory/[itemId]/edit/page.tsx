'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Package, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoUpload } from '@/components/inventory/PhotoUpload'
import { createClient } from '@/lib/supabase/client'
import type { InventoryItem } from '@/types/database.types'

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.itemId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [images, setImages] = useState<string[]>([])

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
                  />
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
        </form>
      </div>
    </div>
  )
}

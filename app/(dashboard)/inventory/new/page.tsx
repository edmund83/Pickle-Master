'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Package, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoUpload } from '@/components/inventory/PhotoUpload'
import { CustomFieldsSection } from '@/components/custom-fields'
import { createClient } from '@/lib/supabase/client'
import { canAddItemClient } from '@/lib/quota-client'
import { useFormatting } from '@/hooks/useFormatting'

export default function NewItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const { currencySymbol, formatCurrency, formatNumber } = useFormatting()

  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    quantity: '' as string | number,
    unit: 'pcs',
    min_quantity: '' as string | number,
    price: '' as string | number,
    cost_price: '' as string | number,
    location: '',
    notes: '',
  })
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({})

  // Pre-fill barcode from URL param (when coming from scan page)
  useEffect(() => {
    const barcodeParam = searchParams.get('barcode')
    if (barcodeParam) {
      setFormData(prev => ({ ...prev, barcode: barcodeParam }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check quota before creating item
      const quotaCheck = await canAddItemClient()
      if (!quotaCheck.allowed) {
        setError(quotaCheck.message || 'Item limit reached. Please upgrade your plan.')
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Get current user and their tenant
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) {
        throw new Error('No tenant found')
      }

      // Convert empty strings to numbers for numeric fields
      const quantity = formData.quantity === '' ? 0 : Number(formData.quantity)
      const minQuantity = formData.min_quantity === '' ? 0 : Number(formData.min_quantity)
      const price = formData.price === '' ? 0 : Number(formData.price)
      const costPrice = formData.cost_price === '' ? 0 : Number(formData.cost_price)

      // Determine status based on quantity and min_quantity
      let status = 'in_stock'
      if (quantity <= 0) {
        status = 'out_of_stock'
      } else if (minQuantity > 0 && quantity <= minQuantity) {
        status = 'low_stock'
      }

      // Create the item

      const { error: insertError } = await (supabase as any)
        .from('inventory_items')
        .insert({
          tenant_id: profile.tenant_id,
          name: formData.name,
          sku: formData.sku || null,
          barcode: formData.barcode || null,
          description: formData.description || null,
          quantity,
          unit: formData.unit,
          min_quantity: minQuantity,
          price,
          cost_price: costPrice || null,
          location: formData.location || null,
          notes: formData.notes || null,
          image_urls: images.length > 0 ? images : null,
          status,
          created_by: user.id,
          last_modified_by: user.id,
          custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
        })

      if (insertError) throw insertError

      router.push('/inventory')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900">Add New Item</h1>
        </div>
        <Button type="submit" form="item-form" loading={loading} className="hidden sm:flex">
          <Save className="mr-2 h-4 w-4" />
          Save Item
        </Button>
      </div>

      {/* Form */}
      <div className="p-6 pb-24 sm:pb-6">
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
                disabled={loading}
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Selling Price ({currencySymbol})
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
                    Cost Price ({currencySymbol})
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
              </div>
              {Number(formData.price) > 0 && Number(formData.cost_price) > 0 && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Margin</span>
                    <span className="font-medium text-primary">
                      {formatNumber(((Number(formData.price) - Number(formData.cost_price)) / Number(formData.cost_price)) * 100)}% / {formatCurrency(Number(formData.price) - Number(formData.cost_price))}
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
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Internal notes about this item..."
              />
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <CustomFieldsSection
            values={customFields}
            onChange={setCustomFields}
            disabled={loading}
          />
        </form>
      </div>

      {/* Mobile Sticky Footer - positioned above bottom nav bar */}
      <div
        className="fixed left-0 right-0 z-40 flex items-center justify-end gap-4 px-6 py-4 border-t border-neutral-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden"
        style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
      >
        <Button type="submit" form="item-form" loading={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Item
        </Button>
      </div>
    </div>
  )
}

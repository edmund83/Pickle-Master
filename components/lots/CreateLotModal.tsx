'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Package, Calendar, Hash, MapPin, Loader2, AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Location {
  id: string
  name: string
  type: string
}

interface CreateLotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  itemId: string
  itemName: string
}

export function CreateLotModal({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
}: CreateLotModalProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [quantity, setQuantity] = useState<string>('')
  const [lotNumber, setLotNumber] = useState<string>('')
  const [batchCode, setBatchCode] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [manufacturedDate, setManufacturedDate] = useState<string>('')
  const [locationId, setLocationId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadLocations()
    }
  }, [isOpen])

  async function loadLocations() {
    setLoadingLocations(true)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .rpc('get_locations', { p_include_inactive: false })

      setLocations((data || []) as Location[])
    } catch (err) {
      console.error('Error loading locations:', err)
    } finally {
      setLoadingLocations(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('create_lot', {
          p_item_id: itemId,
          p_quantity: qty,
          p_lot_number: lotNumber || null,
          p_batch_code: batchCode || null,
          p_expiry_date: expiryDate || null,
          p_manufactured_date: manufacturedDate || null,
          p_location_id: locationId || null,
          p_notes: notes || null,
        })

      if (rpcError) throw rpcError

      if (data?.success) {
        onSuccess?.()
        onClose()
        resetForm()
      } else {
        setError(data?.error || 'Failed to create lot')
      }
    } catch (err) {
      console.error('Error creating lot:', err)
      setError('Failed to create lot')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setQuantity('')
    setLotNumber('')
    setBatchCode('')
    setExpiryDate('')
    setManufacturedDate('')
    setLocationId('')
    setNotes('')
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Add New Lot</h2>
            <p className="text-sm text-neutral-500">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Quantity - Required */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Lot Number */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Lot Number
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="e.g., LOT-2024-001"
                className="pl-10"
              />
            </div>
          </div>

          {/* Batch Code */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Batch Code
            </label>
            <Input
              type="text"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              placeholder="e.g., BATCH-A1"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Expiry Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Manufactured Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Manufactured Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="date"
                value={manufacturedDate}
                onChange={(e) => setManufacturedDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          {locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select location (optional)</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this lot..."
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!quantity || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Lot
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

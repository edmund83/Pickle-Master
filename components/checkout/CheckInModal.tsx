'use client'

import { useState, useEffect } from 'react'
import { returnItem, returnCheckoutSerials, getCheckoutSerials } from '@/app/actions/checkouts'
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench,
  Loader2,
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ItemCondition } from '@/types/database.types'
import { useFormatting } from '@/hooks/useFormatting'

interface CheckoutInfo {
  id: string
  item_id: string
  item_name: string
  quantity: number
  assignee_type: string
  assignee_name: string | null
  checked_out_at: string
  due_date: string | null
  is_overdue?: boolean
  tracking_mode?: 'none' | 'serialized' | 'lot_expiry' | null
}

interface CheckInModalProps {
  checkout: CheckoutInfo
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CheckoutSerial {
  id: string
  serial_id: string
  serial_number: string
  current_status: string
  return_condition: ItemCondition | null
  notes: string | null
}

const conditionOptions: {
  value: ItemCondition
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
}[] = [
    {
      value: 'good',
      label: 'Good',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      value: 'damaged',
      label: 'Damaged',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    },
    {
      value: 'needs_repair',
      label: 'Needs Repair',
      icon: <Wrench className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      value: 'lost',
      label: 'Lost',
      icon: <XCircle className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200 hover:bg-red-100'
    }
  ]

export function CheckInModal({ checkout, isOpen, onClose, onSuccess }: CheckInModalProps) {
  const isSerialized = checkout.tracking_mode === 'serialized'

  // Standard return state
  const [condition, setCondition] = useState<ItemCondition>('good')
  const [notes, setNotes] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { formatShortDate } = useFormatting()

  // Serialized item state
  const [checkoutSerials, setCheckoutSerials] = useState<CheckoutSerial[]>([])
  const [serialConditions, setSerialConditions] = useState<Record<string, ItemCondition>>({})
  const [loadingSerials, setLoadingSerials] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCondition('good')
      setNotes('')
      setError(null)
      setSubmitting(false)
      setCheckoutSerials([])
      setSerialConditions({})

      if (isSerialized) {
        loadCheckoutSerials()
      }
    }
  }, [isOpen, isSerialized])

  async function loadCheckoutSerials() {
    setLoadingSerials(true)
    try {
      const result = await getCheckoutSerials(checkout.id)
      if (result.success && result.serials) {
        setCheckoutSerials(result.serials)
        // Initialize all conditions to 'good'
        const initialConditions: Record<string, ItemCondition> = {}
        result.serials.forEach((s: CheckoutSerial) => {
          initialConditions[s.serial_id] = 'good'
        })
        setSerialConditions(initialConditions)
      }
    } catch (err) {
      console.error('Error loading checkout serials:', err)
    } finally {
      setLoadingSerials(false)
    }
  }

  function setSerialCondition(serialId: string, cond: ItemCondition) {
    setSerialConditions((prev) => ({
      ...prev,
      [serialId]: cond,
    }))
  }

  function setAllSerialsCondition(cond: ItemCondition) {
    const updated: Record<string, ItemCondition> = {}
    checkoutSerials.forEach((s) => {
      updated[s.serial_id] = cond
    })
    setSerialConditions(updated)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      let result

      if (isSerialized && checkoutSerials.length > 0) {
        // Build serial returns array
        const serialReturns = checkoutSerials.map((s) => ({
          serial_id: s.serial_id,
          condition: serialConditions[s.serial_id] || 'good',
        }))

        result = await returnCheckoutSerials(checkout.id, serialReturns, notes)
      } else {
        // Standard return
        result = await returnItem(checkout.id, notes, condition)
      }

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error || 'Failed to check in item')
      }
    } catch (err) {
      console.error('Check-in error:', err)
      setError('An error occurred while checking in the item')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Calculate days checked out
  const checkedOutDate = new Date(checkout.checked_out_at)
  const today = new Date()
  const daysOut = Math.floor((today.getTime() - checkedOutDate.getTime()) / (1000 * 60 * 60 * 24))

  // Check if any serial has a non-good condition (to require notes)
  const hasNonGoodSerial = isSerialized && Object.values(serialConditions).some((c) => c !== 'good')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Check In Item</h2>
            <p className="text-sm text-neutral-500">{checkout.item_name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Checkout Summary */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-neutral-500">Checked out to:</span>
              <p className="font-medium text-neutral-900">{checkout.assignee_name || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-neutral-500">Quantity:</span>
              <p className="font-medium text-neutral-900">{checkout.quantity}</p>
            </div>
            <div>
              <span className="text-neutral-500">Checked out:</span>
              <p className="font-medium text-neutral-900">
                {formatShortDate(checkout.checked_out_at)}
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Days out:</span>
              <p className={`font-medium ${checkout.is_overdue ? 'text-red-600' : 'text-neutral-900'}`}>
                {daysOut} day{daysOut !== 1 ? 's' : ''}
                {checkout.is_overdue && ' (Overdue)'}
              </p>
            </div>
          </div>
        </div>

        {/* Serial-specific condition selection */}
        {isSerialized ? (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">
                Serial Numbers & Condition
              </label>
              {checkoutSerials.length > 1 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAllSerialsCondition('good')}
                    className="text-xs text-green-600 hover:text-green-700"
                  >
                    All Good
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={() => setAllSerialsCondition('damaged')}
                    className="text-xs text-yellow-600 hover:text-yellow-700"
                  >
                    All Damaged
                  </button>
                </div>
              )}
            </div>

            {loadingSerials ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : checkoutSerials.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-300 py-6 text-center text-sm text-neutral-500">
                No serial numbers found for this checkout
              </div>
            ) : (
              <div className="space-y-3">
                {checkoutSerials.map((serial) => (
                  <div
                    key={serial.serial_id}
                    className="rounded-lg border border-neutral-200 p-3"
                  >
                    <div className="mb-2 font-mono text-sm font-medium text-neutral-900">
                      {serial.serial_number}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {conditionOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSerialCondition(serial.serial_id, opt.value)}
                          className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-all ${
                            serialConditions[serial.serial_id] === opt.value
                              ? `${opt.bgColor} border-2 ${opt.color}`
                              : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
                          }`}
                        >
                          <span
                            className={
                              serialConditions[serial.serial_id] === opt.value
                                ? opt.color
                                : 'text-neutral-400'
                            }
                          >
                            {opt.icon}
                          </span>
                          <span className="text-[10px]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Condition Selection */
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-neutral-700">
              Return Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              {conditionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCondition(option.value)}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                    condition === option.value
                      ? `${option.bgColor} border-2 ring-2 ring-offset-1 ${
                          option.value === 'good'
                            ? 'ring-green-300'
                            : option.value === 'damaged'
                            ? 'ring-yellow-300'
                            : option.value === 'needs_repair'
                            ? 'ring-orange-300'
                            : 'ring-red-300'
                        }`
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <span className={condition === option.value ? option.color : 'text-neutral-400'}>
                    {option.icon}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      condition === option.value ? option.color : 'text-neutral-600'
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Notes{' '}
            {((!isSerialized && condition !== 'good') || hasNonGoodSerial) && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              (!isSerialized && condition === 'good') || (isSerialized && !hasNonGoodSerial)
                ? 'Optional notes about the return...'
                : 'Please describe the condition or issue...'
            }
            rows={3}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
          />
          {((!isSerialized && condition === 'lost') ||
            (isSerialized && Object.values(serialConditions).some((c) => c === 'lost'))) && (
            <p className="mt-1 text-xs text-red-600">
              Items marked as lost will remain unavailable in inventory.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              submitting ||
              ((!isSerialized && condition !== 'good' && !notes.trim()) ||
                (hasNonGoodSerial && !notes.trim()))
            }
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Check In {isSerialized && checkoutSerials.length > 0 && `${checkoutSerials.length} Unit${checkoutSerials.length !== 1 ? 's' : ''}`}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

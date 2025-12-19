'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { format } from 'date-fns'

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
}

interface CheckInModalProps {
  checkout: CheckoutInfo
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
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
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    value: 'damaged',
    label: 'Damaged',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
  },
  {
    value: 'needs_repair',
    label: 'Needs Repair',
    icon: <Wrench className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  },
  {
    value: 'lost',
    label: 'Lost',
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200 hover:bg-red-100'
  }
]

export function CheckInModal({ checkout, isOpen, onClose, onSuccess }: CheckInModalProps) {
  const [condition, setCondition] = useState<ItemCondition>('good')
  const [notes, setNotes] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc('perform_checkin', {
        p_checkout_id: checkout.id,
        p_condition: condition,
        p_notes: notes || null
      })

      if (rpcError) throw rpcError

      const result = typeof data === 'string' ? JSON.parse(data) : data

      if (result?.success) {
        onSuccess()
        onClose()
      } else {
        setError(result?.error || 'Failed to check in item')
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
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
                {format(checkedOutDate, 'MMM d, yyyy')}
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

        {/* Condition Selection */}
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
                        option.value === 'good' ? 'ring-green-300' :
                        option.value === 'damaged' ? 'ring-yellow-300' :
                        option.value === 'needs_repair' ? 'ring-orange-300' :
                        'ring-red-300'
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

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Notes {condition !== 'good' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              condition === 'good'
                ? 'Optional notes about the return...'
                : 'Please describe the condition or issue...'
            }
            rows={3}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
          />
          {condition === 'lost' && (
            <p className="mt-1 text-xs text-red-600">
              Marking as lost will keep this item as unavailable in inventory.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || (condition !== 'good' && !notes.trim())}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Check In
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

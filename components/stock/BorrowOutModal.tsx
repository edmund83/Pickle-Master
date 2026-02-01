'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  X,
  Minus,
  Plus,
  Loader2,
  AlertTriangle,
  Package,
  Hash,
  Calendar,
  CheckCircle,
  Zap,
  User,
  Briefcase,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import { checkoutItem, checkoutWithSerials } from '@/app/actions/checkouts'

interface Batch {
  id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  quantity: number
}

interface Serial {
  id: string
  serial_number: string
  status: string
  created_at: string
}

interface AssigneeOption {
  id: string
  name: string
}

interface BorrowOutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  itemId: string
  itemName: string
  trackingMode: 'none' | 'lot_expiry' | 'serialized'
  currentQuantity: number
}

type AssigneeType = 'person' | 'job' | 'location'

export function BorrowOutModal({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  trackingMode,
  currentQuantity,
}: BorrowOutModalProps) {
  const router = useRouter()
  const { formatShortDate } = useFormatting()

  const isTracked = trackingMode === 'lot_expiry' || trackingMode === 'serialized'
  const isBatch = trackingMode === 'lot_expiry'
  const isSerial = trackingMode === 'serialized'

  // Data state
  const [batches, setBatches] = useState<Batch[]>([])
  const [serials, setSerials] = useState<Serial[]>([])
  const [people, setPeople] = useState<AssigneeOption[]>([])
  const [jobs, setJobs] = useState<AssigneeOption[]>([])
  const [locations, setLocations] = useState<AssigneeOption[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [quantity, setQuantity] = useState(1)
  const [selectedMode, setSelectedMode] = useState<'auto' | 'manual'>('auto')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedSerialIds, setSelectedSerialIds] = useState<Set<string>>(new Set())

  // Assignee state
  const [assigneeType, setAssigneeType] = useState<AssigneeType>('person')
  const [assigneeId, setAssigneeId] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, submitting, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId, trackingMode])

  async function loadData() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Load assignee options
      const [profilesRes, jobsRes, foldersRes] = await Promise.all([
        (supabase as any).from('profiles').select('id, full_name, email').order('full_name'),
        (supabase as any).from('jobs').select('id, name').eq('status', 'active').order('name'),
        (supabase as any).from('folders').select('id, name').order('name'),
      ])

      if (profilesRes.data) {
        setPeople(profilesRes.data.map((p: any) => ({ id: p.id, name: p.full_name || p.email })))
      }
      if (jobsRes.data) {
        setJobs(jobsRes.data.map((j: any) => ({ id: j.id, name: j.name })))
      }
      if (foldersRes.data) {
        setLocations(foldersRes.data.map((f: any) => ({ id: f.id, name: f.name })))
      }

      // Load tracking data
      if (isBatch) {
        const { data } = await (supabase as any).rpc('get_item_lots', {
          p_item_id: itemId,
          p_include_depleted: false,
        })
        const sorted = ((data || []) as Batch[]).sort((a, b) => {
          if (a.expiry_date && b.expiry_date) {
            return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
          }
          if (a.expiry_date) return -1
          if (b.expiry_date) return 1
          return 0
        })
        setBatches(sorted)
      } else if (isSerial) {
        const { data } = await (supabase as any).rpc('get_item_serials', {
          p_item_id: itemId,
          p_include_unavailable: false,
        })
        const sorted = ((data || []) as Serial[]).sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })
        setSerials(sorted)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setQuantity(1)
    setSelectedMode('auto')
    setSelectedBatchId(null)
    setSelectedSerialIds(new Set())
    setAssigneeType('person')
    setAssigneeId('')
    setAssigneeName('')
    setDueDate('')
    setNotes('')
    setError(null)
  }

  function handleQuantityChange(delta: number) {
    const maxQty = isBatch
      ? (selectedMode === 'manual' && selectedBatchId
          ? batches.find(b => b.id === selectedBatchId)?.quantity || currentQuantity
          : currentQuantity)
      : isSerial
        ? serials.length
        : currentQuantity
    setQuantity(Math.max(1, Math.min(maxQty, quantity + delta)))
  }

  function toggleSerial(serialId: string) {
    setSelectedSerialIds(prev => {
      const next = new Set(prev)
      if (next.has(serialId)) {
        next.delete(serialId)
      } else {
        next.add(serialId)
      }
      return next
    })
    setSelectedMode('manual')
  }

  function getAssigneeOptions(): AssigneeOption[] {
    switch (assigneeType) {
      case 'person': return people
      case 'job': return jobs
      case 'location': return locations
      default: return []
    }
  }

  function handleAssigneeChange(id: string) {
    setAssigneeId(id)
    const options = getAssigneeOptions()
    const selected = options.find(opt => opt.id === id)
    setAssigneeName(selected?.name || '')
  }

  async function handleSubmit() {
    if (!assigneeName) {
      setError('Please select an assignee')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isSerial) {
        // Serial checkout
        const serialIdsToCheckout = selectedMode === 'auto'
          ? serials.slice(0, quantity).map(s => s.id)
          : Array.from(selectedSerialIds)

        const result = await checkoutWithSerials(
          itemId,
          serialIdsToCheckout,
          assigneeType,
          assigneeId || undefined,
          assigneeName,
          dueDate || undefined,
          notes || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Checkout failed')
        }
      } else if (isBatch) {
        // Batch checkout - use standard checkout with FIFO RPC
        // TODO: Implement batch-aware checkout RPC
        const result = await checkoutItem(
          itemId,
          quantity,
          assigneeName,
          notes || undefined,
          dueDate || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Checkout failed')
        }
      } else {
        // Non-tracked checkout
        const result = await checkoutItem(
          itemId,
          quantity,
          assigneeName,
          notes || undefined,
          dueDate || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Checkout failed')
        }
      }

      onSuccess?.()
      onClose()
      router.refresh()
    } catch (err: any) {
      console.error('Borrow out error:', err)
      setError(err.message || 'Failed to borrow out')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const maxQuantity = isBatch
    ? (selectedMode === 'manual' && selectedBatchId
        ? batches.find(b => b.id === selectedBatchId)?.quantity || 0
        : currentQuantity)
    : isSerial
      ? (selectedMode === 'manual' ? selectedSerialIds.size : serials.length)
      : currentQuantity

  const effectiveQuantity = isSerial && selectedMode === 'manual'
    ? selectedSerialIds.size
    : quantity

  const canSubmit = assigneeName && effectiveQuantity > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="borrow-out-title"
        aria-describedby="borrow-out-description"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 id="borrow-out-title" className="text-lg font-semibold text-neutral-900">Borrow Out</h2>
            <p id="borrow-out-description" className="text-sm text-neutral-500">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : (
            <>
              {/* Quantity Selector */}
              {(!isSerial || selectedMode === 'auto') && (
                <div>
                  <label htmlFor="borrow-out-quantity" className="block text-sm font-medium text-neutral-700 mb-2">
                    How many?
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <div className="w-24 text-center">
                      <Input
                        id="borrow-out-quantity"
                        type="number"
                        min={1}
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                        className="text-center text-2xl font-bold h-14"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {isSerial && selectedMode === 'manual' && (
                <div className="text-center text-sm text-neutral-500">
                  {selectedSerialIds.size} serial{selectedSerialIds.size !== 1 ? 's' : ''} selected
                </div>
              )}

              {/* Batch/Serial Picker (for tracked items) */}
              {isTracked && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {isBatch ? 'From which batch?' : 'Select serials'}
                  </label>

                  <div className="space-y-2">
                    {/* Auto FIFO option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMode('auto')
                        setSelectedBatchId(null)
                        setSelectedSerialIds(new Set())
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                        selectedMode === 'auto'
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        selectedMode === 'auto' ? 'border-primary bg-primary' : 'border-neutral-300'
                      )}>
                        {selectedMode === 'auto' && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <Zap className="h-4 w-4 text-amber-500" />
                      <div className="flex-1">
                        <span className="font-medium">Auto (FIFO)</span>
                        <p className="text-sm text-neutral-500">System picks oldest first</p>
                      </div>
                    </button>

                    {/* Manual options */}
                    {isBatch ? (
                      batches.slice(0, 5).map((batch) => (
                        <button
                          key={batch.id}
                          type="button"
                          onClick={() => {
                            setSelectedMode('manual')
                            setSelectedBatchId(batch.id)
                            setQuantity(Math.min(quantity, batch.quantity))
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                            selectedMode === 'manual' && selectedBatchId === batch.id
                              ? 'border-primary bg-primary/5'
                              : 'border-neutral-200 hover:border-neutral-300'
                          )}
                        >
                          <div className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border-2',
                            selectedMode === 'manual' && selectedBatchId === batch.id
                              ? 'border-primary bg-primary'
                              : 'border-neutral-300'
                          )}>
                            {selectedMode === 'manual' && selectedBatchId === batch.id && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <Package className="h-5 w-5 text-neutral-400" />
                          <div className="flex-1">
                            <span className="font-medium">
                              {batch.lot_number || batch.batch_code || 'Unnamed'}
                            </span>
                            <div className="flex items-center gap-3 text-sm text-neutral-500">
                              {batch.expiry_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Exp: {formatShortDate(batch.expiry_date)}
                                </span>
                              )}
                              <span>Qty: {batch.quantity}</span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-neutral-200 p-2">
                        {serials.map((serial) => (
                          <button
                            key={serial.id}
                            type="button"
                            onClick={() => toggleSerial(serial.id)}
                            className={cn(
                              'w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all',
                              selectedSerialIds.has(serial.id)
                                ? 'bg-primary/10'
                                : 'hover:bg-neutral-50'
                            )}
                          >
                            <div className={cn(
                              'flex h-5 w-5 items-center justify-center rounded border',
                              selectedSerialIds.has(serial.id)
                                ? 'border-primary bg-primary'
                                : 'border-neutral-300 bg-white'
                            )}>
                              {selectedSerialIds.has(serial.id) && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <Hash className="h-4 w-4 text-neutral-400" />
                            <span className="font-mono">{serial.serial_number}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assignee Type Tabs */}
              <div>
                <label htmlFor="borrow-out-assignee" className="block text-sm font-medium text-neutral-700 mb-2">
                  Assign To
                </label>
                <div className="flex gap-2 mb-3">
                  {[
                    { type: 'person' as const, icon: User, label: 'Person' },
                    { type: 'job' as const, icon: Briefcase, label: 'Job' },
                    { type: 'location' as const, icon: MapPin, label: 'Location' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setAssigneeType(type)
                        setAssigneeId('')
                        setAssigneeName('')
                      }}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        assigneeType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <select
                  id="borrow-out-assignee"
                  value={assigneeId}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select {assigneeType}...</option>
                  {getAssigneeOptions().map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="borrow-out-due-date" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Return by (optional)
                </label>
                <Input
                  id="borrow-out-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="borrow-out-notes" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  id="borrow-out-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || loading}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Borrow Out {effectiveQuantity}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

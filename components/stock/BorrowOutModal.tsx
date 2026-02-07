'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  Search,
  UserPlus,
  Building2,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import { checkoutItem, checkoutItemFromLot, checkoutWithSerials } from '@/app/actions/checkouts'
import { createContact } from '@/app/actions/contacts'

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
  type: 'person' | 'job' | 'contact'
  company?: string
  phone?: string
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
  const [assignees, setAssignees] = useState<AssigneeOption[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [quantity, setQuantity] = useState(1)
  const [selectedMode, setSelectedMode] = useState<'auto' | 'manual'>('auto')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedSerialIds, setSelectedSerialIds] = useState<Set<string>>(new Set())

  // Assignee state
  const [assigneeSearch, setAssigneeSearch] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<AssigneeOption | null>(null)
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [minDate, setMinDate] = useState<string | undefined>(undefined)
  useEffect(() => setMinDate(new Date().toISOString().split('T')[0]), [])

  // New contact form state
  const [showNewContactForm, setShowNewContactForm] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactCompany, setNewContactCompany] = useState('')
  const [creatingContact, setCreatingContact] = useState(false)

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref for click-outside detection
  const assigneeDropdownRef = useRef<HTMLDivElement>(null)

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

  // Click outside to close assignee dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) {
        setShowAssigneeDropdown(false)
      }
    }
    if (showAssigneeDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAssigneeDropdown])

  async function loadData() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Load assignee options (people + contacts + jobs unified)
      const [profilesRes, contactsRes, jobsRes] = await Promise.all([
        (supabase as any).from('profiles').select('id, full_name, email').order('full_name'),
        (supabase as any).rpc('get_contacts', { p_search: null, p_include_inactive: false, p_limit: 100 }),
        (supabase as any).from('jobs').select('id, name').eq('status', 'active').order('name'),
      ])

      const unified: AssigneeOption[] = []
      if (profilesRes.data) {
        profilesRes.data.forEach((p: any) => {
          unified.push({ id: p.id, name: p.full_name || p.email, type: 'person' })
        })
      }
      if (contactsRes.data) {
        contactsRes.data.forEach((c: any) => {
          unified.push({ id: c.id, name: c.name, type: 'contact', company: c.company, phone: c.phone })
        })
      }
      if (jobsRes.data) {
        jobsRes.data.forEach((j: any) => {
          unified.push({ id: j.id, name: j.name, type: 'job' })
        })
      }
      setAssignees(unified)

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
    setAssigneeSearch('')
    setSelectedAssignee(null)
    setShowAssigneeDropdown(false)
    setDueDate('')
    setNotes('')
    setError(null)
    // Reset new contact form
    setShowNewContactForm(false)
    setNewContactName('')
    setNewContactPhone('')
    setNewContactCompany('')
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

  // Filter assignees based on search
  const filteredAssignees = assignees.filter(a =>
    a.name.toLowerCase().includes(assigneeSearch.toLowerCase())
  )

  function handleSelectAssignee(assignee: AssigneeOption) {
    setSelectedAssignee(assignee)
    setAssigneeSearch(assignee.name)
    setShowAssigneeDropdown(false)
    setShowNewContactForm(false)
  }

  function handleShowNewContactForm() {
    setShowNewContactForm(true)
    setShowAssigneeDropdown(false)
    setNewContactName(assigneeSearch) // Pre-fill with search text
  }

  async function handleCreateContact() {
    if (!newContactName.trim()) {
      setError('Contact name is required')
      return
    }

    setCreatingContact(true)
    setError(null)

    try {
      const result = await createContact(
        newContactName.trim(),
        null, // email
        newContactPhone.trim() || null,
        null, // idNumber
        newContactCompany.trim() || null,
        null  // notes
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to create contact')
      }

      // Add the new contact to the assignees list and select it
      const newContact: AssigneeOption = {
        id: result.contact!.id,
        name: result.contact!.name,
        type: 'contact',
        company: result.contact!.company,
        phone: result.contact!.phone,
      }

      setAssignees(prev => [...prev, newContact])
      handleSelectAssignee(newContact)

      // Reset form
      setShowNewContactForm(false)
      setNewContactName('')
      setNewContactPhone('')
      setNewContactCompany('')
    } catch (err: any) {
      console.error('Create contact error:', err)
      setError(err.message || 'Failed to create contact')
    } finally {
      setCreatingContact(false)
    }
  }

  async function handleSubmit() {
    if (!selectedAssignee) {
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
          selectedAssignee.type,
          selectedAssignee.id,
          selectedAssignee.name,
          dueDate || undefined,
          notes || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Checkout failed')
        }
      } else if (isBatch) {
        // Batch checkout: from specific lot when manual batch selected, else FIFO via standard checkout
        if (selectedMode === 'manual' && selectedBatchId) {
          const result = await checkoutItemFromLot(
            itemId,
            selectedBatchId,
            quantity,
            selectedAssignee.name,
            notes || undefined,
            dueDate || undefined,
            selectedAssignee.type,
            selectedAssignee.id
          )
          if (!result.success) throw new Error(result.error || 'Checkout failed')
        } else {
          const result = await checkoutItem(
            itemId,
            quantity,
            selectedAssignee.name,
            notes || undefined,
            dueDate || undefined,
            selectedAssignee.type,
            selectedAssignee.id
          )
          if (!result.success) throw new Error(result.error || 'Checkout failed')
        }
      } else {
        // Non-tracked checkout
        const result = await checkoutItem(
          itemId,
          quantity,
          selectedAssignee.name,
          notes || undefined,
          dueDate || undefined,
          selectedAssignee.type,
          selectedAssignee.id
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

  // For portal - need to check if we're in browser
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen) return null
  if (!mounted) return null

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

  const canSubmit = selectedAssignee && effectiveQuantity > 0

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
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
            <h2 id="borrow-out-title" className="text-lg font-semibold text-neutral-900">Lend Item</h2>
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

              {/* Unified Assignee Search */}
              <div>
                <label htmlFor="borrow-out-assignee" className="block text-sm font-medium text-neutral-700 mb-2">
                  Assign To
                </label>
                <div className="relative" ref={assigneeDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      id="borrow-out-assignee"
                      type="text"
                      value={assigneeSearch}
                      onChange={(e) => {
                        setAssigneeSearch(e.target.value)
                        setShowAssigneeDropdown(true)
                        if (selectedAssignee && e.target.value !== selectedAssignee.name) {
                          setSelectedAssignee(null)
                        }
                      }}
                      onFocus={() => setShowAssigneeDropdown(true)}
                      placeholder="Search people or jobs..."
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      autoComplete="off"
                    />
                  </div>

                  {/* Dropdown */}
                  {showAssigneeDropdown && (
                    <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
                      {filteredAssignees.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-neutral-500">No results found</div>
                      ) : (
                        filteredAssignees.map((assignee) => (
                          <button
                            key={`${assignee.type}-${assignee.id}`}
                            type="button"
                            onClick={() => handleSelectAssignee(assignee)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50 transition-colors',
                              selectedAssignee?.id === assignee.id && selectedAssignee?.type === assignee.type && 'bg-primary/5'
                            )}
                          >
                            {assignee.type === 'person' ? (
                              <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            ) : assignee.type === 'contact' ? (
                              <User className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <Briefcase className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="block truncate">{assignee.name}</span>
                              {assignee.type === 'contact' && assignee.company && (
                                <span className="block text-xs text-neutral-500 truncate">{assignee.company}</span>
                              )}
                            </div>
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 rounded flex-shrink-0',
                              assignee.type === 'person' ? 'bg-blue-100 text-blue-700' :
                              assignee.type === 'contact' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-amber-100 text-amber-700'
                            )}>
                              {assignee.type === 'person' ? 'Team' : assignee.type === 'contact' ? 'Contact' : 'Job'}
                            </span>
                          </button>
                        ))
                      )}

                      {/* Add new contact option */}
                      {assigneeSearch.trim().length > 0 && (
                        <button
                          type="button"
                          onClick={handleShowNewContactForm}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-neutral-50 transition-colors border-t border-neutral-100"
                        >
                          <UserPlus className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="flex-1 text-primary font-medium">
                            Add &quot;{assigneeSearch.trim()}&quot; as new contact
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* New contact form */}
                {showNewContactForm && (
                  <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-neutral-900">New Contact</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewContactForm(false)
                          setNewContactName('')
                          setNewContactPhone('')
                          setNewContactCompany('')
                        }}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label htmlFor="new-contact-name" className="block text-xs font-medium text-neutral-600 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            id="new-contact-name"
                            type="text"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            placeholder="Contact name"
                            className="w-full h-9 pl-9 pr-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="new-contact-phone" className="block text-xs font-medium text-neutral-600 mb-1">
                          Phone (optional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            id="new-contact-phone"
                            type="tel"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            placeholder="Phone number"
                            className="w-full h-9 pl-9 pr-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="new-contact-company" className="block text-xs font-medium text-neutral-600 mb-1">
                          Company (optional)
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            id="new-contact-company"
                            type="text"
                            value={newContactCompany}
                            onChange={(e) => setNewContactCompany(e.target.value)}
                            placeholder="Company or organization"
                            className="w-full h-9 pl-9 pr-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleCreateContact}
                        disabled={creatingContact || !newContactName.trim()}
                        className="w-full"
                        size="sm"
                      >
                        {creatingContact ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create Contact
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Selected indicator */}
                {selectedAssignee && !showNewContactForm && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                    {selectedAssignee.type === 'person' ? (
                      <User className="h-4 w-4 text-blue-500" />
                    ) : selectedAssignee.type === 'contact' ? (
                      <User className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Briefcase className="h-4 w-4 text-amber-500" />
                    )}
                    <span>Lending to <strong>{selectedAssignee.name}</strong></span>
                    {selectedAssignee.type === 'contact' && selectedAssignee.company && (
                      <span className="text-neutral-400">({selectedAssignee.company})</span>
                    )}
                  </div>
                )}
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
                  min={minDate}
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
                Lend {effectiveQuantity}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

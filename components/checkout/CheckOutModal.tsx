'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  X,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Loader2,
  Package,
  Plus,
  Check,
  Search,
} from 'lucide-react'
import { checkoutItem, checkoutWithSerials } from '@/app/actions/checkouts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Profile, Job, Folder, InventoryItem } from '@/types/database.types'
import { successFeedback, errorFeedback, selectionFeedback } from '@/lib/utils/feedback'

interface CheckOutModalProps {
  item: InventoryItem
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type AssigneeType = 'person' | 'job' | 'location'

interface AssigneeOption {
  id: string
  name: string
}

interface SerialOption {
  id: string
  serial_number: string
  status: string
  notes: string | null
}

export function CheckOutModal({ item, isOpen, onClose, onSuccess }: CheckOutModalProps) {
  // Check if item is serialized
  const isSerialized = item.tracking_mode === 'serialized'

  // Form state
  const [assigneeType, setAssigneeType] = useState<AssigneeType>('person')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [assigneeName, setAssigneeName] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)

  // Serial selection state (for serialized items)
  const [availableSerials, setAvailableSerials] = useState<SerialOption[]>([])
  const [selectedSerialIds, setSelectedSerialIds] = useState<Set<string>>(new Set())
  const [serialSearch, setSerialSearch] = useState('')
  const [loadingSerials, setLoadingSerials] = useState(false)

  // Data state
  const [people, setPeople] = useState<AssigneeOption[]>([])
  const [jobs, setJobs] = useState<AssigneeOption[]>([])
  const [locations, setLocations] = useState<AssigneeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New job creation
  const [showNewJob, setShowNewJob] = useState(false)
  const [newJobName, setNewJobName] = useState('')

  // Load assignee options when modal opens
  useEffect(() => {
    if (isOpen) {
      loadOptions()
      if (isSerialized) {
        loadSerials()
      }
      // Reset form
      setAssigneeType('person')
      setAssigneeId('')
      setAssigneeName('')
      setDueDate('')
      setNotes('')
      setQuantity(1)
      setSelectedSerialIds(new Set())
      setSerialSearch('')
      setError(null)
    }
  }, [isOpen, isSerialized])

  async function loadSerials() {
    setLoadingSerials(true)
    const supabase = createClient()

    try {
       
      const { data } = await (supabase as any).rpc('get_item_serials', {
        p_item_id: item.id,
        p_include_unavailable: false,
      })

      if (data) {
        setAvailableSerials(data as SerialOption[])
      }
    } catch (err) {
      console.error('Error loading serials:', err)
    } finally {
      setLoadingSerials(false)
    }
  }

  function toggleSerial(serialId: string) {
    selectionFeedback()
    setSelectedSerialIds((prev) => {
      const next = new Set(prev)
      if (next.has(serialId)) {
        next.delete(serialId)
      } else {
        next.add(serialId)
      }
      return next
    })
  }

  function selectAllSerials() {
    selectionFeedback()
    const filtered = filteredSerials
    setSelectedSerialIds(new Set(filtered.map((s) => s.id)))
  }

  function clearSerialSelection() {
    selectionFeedback()
    setSelectedSerialIds(new Set())
  }

  // Filter serials by search
  const filteredSerials = availableSerials.filter((s) =>
    s.serial_number.toLowerCase().includes(serialSearch.toLowerCase())
  )

  async function loadOptions() {
    setLoading(true)
    const supabase = createClient()

    try {
      // Load team members (profiles)
       
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name')

      if (profiles) {
        setPeople(
          profiles.map((p: Profile) => ({
            id: p.id,
            name: p.full_name || p.email
          }))
        )
      }

      // Load jobs
       
      const { data: jobsData } = await (supabase as any)
        .from('jobs')
        .select('id, name')
        .eq('status', 'active')
        .order('name')

      if (jobsData) {
        setJobs(
          (jobsData || []).map((j: Job) => ({
            id: j.id,
            name: j.name
          }))
        )
      }

      // Load locations (folders)
       
      const { data: folders } = await (supabase as any)
        .from('folders')
        .select('id, name')
        .order('name')

      if (folders) {
        setLocations(
          folders.map((f: Folder) => ({
            id: f.id,
            name: f.name
          }))
        )
      }
    } catch (err) {
      console.error('Error loading options:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper to get current assignee options based on type
  function getAssigneeOptions(): AssigneeOption[] {
    switch (assigneeType) {
      case 'person':
        return people
      case 'job':
        return jobs
      case 'location':
        return locations
      default:
        return []
    }
  }

  // Handle assignee selection change
  function handleAssigneeChange(id: string) {
    setAssigneeId(id)
    const options = getAssigneeOptions()
    const selected = options.find(opt => opt.id === id)
    setAssigneeName(selected?.name || '')
  }

  // Create a new job
  async function handleCreateJob() {
    if (!newJobName.trim()) return

    const supabase = createClient()

    try {
       
      const { data, error } = await (supabase as any)
        .from('jobs')
        .insert({ name: newJobName.trim(), status: 'active' })
        .select('id, name')
        .single()

      if (error) throw error

      if (data) {
        const newJob = { id: data.id, name: data.name }
        setJobs(prev => [...prev, newJob])
        setAssigneeId(data.id)
        setAssigneeName(data.name)
        setNewJobName('')
        setShowNewJob(false)
      }
    } catch (err) {
      console.error('Error creating job:', err)
      setError('Failed to create job')
    }
  }

  async function handleSubmit() {
    if (!assigneeName) {
      setError('Please select an assignee')
      return
    }

    // For serialized items, require at least one serial selected
    if (isSerialized && selectedSerialIds.size === 0) {
      setError('Please select at least one serial number')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      let result

      if (isSerialized) {
        // Use serial-aware checkout
        result = await checkoutWithSerials(
          item.id,
          Array.from(selectedSerialIds),
          assigneeType,
          assigneeId || undefined,
          assigneeName,
          dueDate || undefined,
          notes || undefined
        )
      } else {
        // Use standard quantity-based checkout
        result = await checkoutItem(
          item.id,
          quantity,
          assigneeName,
          notes,
          dueDate
        )
      }

      if (result.success) {
        successFeedback()
        onSuccess()
        onClose()
      } else {
        errorFeedback()
        setError(result.error || 'Failed to check out item')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      errorFeedback()
      setError('An error occurred while checking out the item')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const assigneeOptions = getAssigneeOptions()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Check Out Item</h2>
            <p className="text-sm text-neutral-500">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Assignee Type Tabs */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Assign To
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAssigneeType('person')
                setAssigneeId('')
                setAssigneeName('')
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${assigneeType === 'person'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              <User className="h-4 w-4" />
              Person
            </button>
            <button
              onClick={() => {
                setAssigneeType('job')
                setAssigneeId('')
                setAssigneeName('')
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${assigneeType === 'job'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              <Briefcase className="h-4 w-4" />
              Job
            </button>
            <button
              onClick={() => {
                setAssigneeType('location')
                setAssigneeId('')
                setAssigneeName('')
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${assigneeType === 'location'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              <MapPin className="h-4 w-4" />
              Location
            </button>
          </div>
        </div>

        {/* Assignee Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            {assigneeType === 'person' && 'Select Person'}
            {assigneeType === 'job' && 'Select Job'}
            {assigneeType === 'location' && 'Select Location'}
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : (
            <>
              <select
                value={assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">
                  {assigneeType === 'person' && 'Choose a team member...'}
                  {assigneeType === 'job' && 'Choose a job/project...'}
                  {assigneeType === 'location' && 'Choose a location...'}
                </option>
                {assigneeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              {/* Quick create job */}
              {assigneeType === 'job' && (
                <div className="mt-2">
                  {showNewJob ? (
                    <div className="flex gap-2">
                      <Input
                        value={newJobName}
                        onChange={(e) => setNewJobName(e.target.value)}
                        placeholder="New job name..."
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleCreateJob}>
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowNewJob(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewJob(true)}
                      className="flex items-center gap-1 text-sm text-primary hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Create new job
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Serial Selection (for serialized items) */}
        {isSerialized ? (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">
                Select Serial Numbers
              </label>
              <span className="text-xs text-neutral-500">
                {selectedSerialIds.size} of {availableSerials.length} selected
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={serialSearch}
                onChange={(e) => setSerialSearch(e.target.value)}
                placeholder="Search serial numbers..."
                className="pl-9"
              />
            </div>

            {/* Select all / Clear */}
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={selectAllSerials}
                className="text-xs text-primary hover:text-primary"
              >
                Select all
              </button>
              <span className="text-neutral-300">|</span>
              <button
                type="button"
                onClick={clearSerialSelection}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                Clear
              </button>
            </div>

            {/* Serial list */}
            {loadingSerials ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : filteredSerials.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
                {availableSerials.length === 0
                  ? 'No serials available for checkout'
                  : 'No serials match your search'}
              </div>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-2">
                {filteredSerials.map((serial) => (
                  <button
                    key={serial.id}
                    type="button"
                    onClick={() => toggleSerial(serial.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      selectedSerialIds.has(serial.id)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        selectedSerialIds.has(serial.id)
                          ? 'border-primary bg-primary'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {selectedSerialIds.has(serial.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="font-mono text-sm">{serial.serial_number}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Quantity (for non-serialized items) */
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
              >
                -
              </button>
              <Input
                type="number"
                min={1}
                max={item.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <button
                onClick={() => setQuantity(Math.min(item.quantity, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
              >
                +
              </button>
              <span className="text-sm text-neutral-500">
                of {item.quantity} available
              </span>
            </div>
          </div>
        )}

        {/* Due Date */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400" />
              Expected Return Date (Optional)
            </div>
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this checkout..."
            rows={2}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
            disabled={submitting || !assigneeName || (isSerialized && selectedSerialIds.size === 0)}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Out...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                {isSerialized
                  ? `Check Out ${selectedSerialIds.size} Unit${selectedSerialIds.size !== 1 ? 's' : ''}`
                  : 'Check Out'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

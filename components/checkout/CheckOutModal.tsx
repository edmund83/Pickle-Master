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
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Profile, Job, Folder, InventoryItem } from '@/types/database.types'

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

export function CheckOutModal({ item, isOpen, onClose, onSuccess }: CheckOutModalProps) {
  // Form state
  const [assigneeType, setAssigneeType] = useState<AssigneeType>('person')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [assigneeName, setAssigneeName] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)

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
      // Reset form
      setAssigneeType('person')
      setAssigneeId('')
      setAssigneeName('')
      setDueDate('')
      setNotes('')
      setQuantity(1)
      setError(null)
    }
  }, [isOpen])

  async function loadOptions() {
    setLoading(true)
    const supabase = createClient()

    try {
      // Load team members (profiles)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: jobsData } = await (supabase as any).rpc('get_jobs', {
        p_status: 'active'
      })

      if (jobsData) {
        const parsed = typeof jobsData === 'string' ? JSON.parse(jobsData) : jobsData
        setJobs(
          (parsed || []).map((j: Job) => ({
            id: j.id,
            name: j.name
          }))
        )
      }

      // Load locations (folders)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  function handleAssigneeChange(id: string) {
    setAssigneeId(id)
    const options = getAssigneeOptions()
    const selected = options.find((o) => o.id === id)
    setAssigneeName(selected?.name || '')
  }

  async function handleCreateJob() {
    if (!newJobName.trim()) return

    const supabase = createClient()
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('create_job', {
        p_name: newJobName.trim()
      })

      if (data?.job_id) {
        // Add to jobs list and select it
        const newJob = { id: data.job_id, name: newJobName.trim() }
        setJobs((prev) => [...prev, newJob])
        setAssigneeId(data.job_id)
        setAssigneeName(newJobName.trim())
        setNewJobName('')
        setShowNewJob(false)
      }
    } catch (err) {
      console.error('Error creating job:', err)
    }
  }

  async function handleSubmit() {
    if (!assigneeName) {
      setError('Please select an assignee')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc('perform_checkout', {
        p_item_id: item.id,
        p_quantity: quantity,
        p_assignee_type: assigneeType,
        p_assignee_id: assigneeId || null,
        p_assignee_name: assigneeName,
        p_due_date: dueDate || null,
        p_notes: notes || null
      })

      if (rpcError) throw rpcError

      const result = typeof data === 'string' ? JSON.parse(data) : data

      if (result?.success) {
        onSuccess()
        onClose()
      } else {
        setError(result?.error || 'Failed to check out item')
      }
    } catch (err) {
      console.error('Checkout error:', err)
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
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                assigneeType === 'person'
                  ? 'border-pickle-500 bg-pickle-50 text-pickle-700'
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
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                assigneeType === 'job'
                  ? 'border-pickle-500 bg-pickle-50 text-pickle-700'
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
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                assigneeType === 'location'
                  ? 'border-pickle-500 bg-pickle-50 text-pickle-700'
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
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
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
                      className="flex items-center gap-1 text-sm text-pickle-600 hover:text-pickle-700"
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

        {/* Quantity */}
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
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
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
            disabled={submitting || !assigneeName}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Out...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Check Out
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Check,
  Loader2,
  Search,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Plus,
  Minus,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { batchCheckout, BatchCheckoutItem } from '@/app/actions/batch-checkout'
import type { InventoryItem, Profile, Job, Folder } from '@/types/database.types'

type AssigneeType = 'person' | 'job' | 'location'

interface AssigneeOption {
  id: string
  name: string
}

interface SelectedItem {
  item: InventoryItem
  quantity: number
}

export default function NewCheckoutPage() {
  const router = useRouter()

  // Items state
  const [items, setItems] = useState<InventoryItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter state
  const [filterFolderIds, setFilterFolderIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set())
  const [folderSearchQuery, setFolderSearchQuery] = useState('')

  // Selection state
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map())

  // Assignee state
  const [assigneeType, setAssigneeType] = useState<AssigneeType>('person')
  const [assigneeId, setAssigneeId] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Assignee options
  const [people, setPeople] = useState<AssigneeOption[]>([])
  const [jobs, setJobs] = useState<AssigneeOption[]>([])
  const [locations, setLocations] = useState<AssigneeOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  // New job creation
  const [showNewJob, setShowNewJob] = useState(false)
  const [newJobName, setNewJobName] = useState('')

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setLoadingOptions(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      // Load items and assignee options in parallel
      const [itemsRes, profilesRes, jobsRes, foldersRes] = await Promise.all([
         
        (supabase as any)
          .from('inventory_items')
          .select('*, folders(name, color)')
          .eq('tenant_id', profile.tenant_id)
          .is('deleted_at', null)
          .gt('quantity', 0)
          .order('name', { ascending: true }),
         
        (supabase as any).from('profiles').select('id, full_name, email').order('full_name'),
         
        (supabase as any).from('jobs').select('id, name').eq('status', 'active').order('name'),
         
        (supabase as any)
          .from('folders')
          .select('id, name')
          .eq('tenant_id', profile.tenant_id)
          .order('name'),
      ])

      setItems((itemsRes.data || []) as InventoryItem[])
      setFolders((foldersRes.data || []) as Folder[])

      if (profilesRes.data) {
        setPeople(
          profilesRes.data.map((p: Profile) => ({
            id: p.id,
            name: p.full_name || p.email,
          }))
        )
      }

      if (jobsRes.data) {
        setJobs(
          (jobsRes.data || []).map((j: Job) => ({
            id: j.id,
            name: j.name,
          }))
        )
      }

      if (foldersRes.data) {
        setLocations(
          foldersRes.data.map((f: Folder) => ({
            id: f.id,
            name: f.name,
          }))
        )
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
      setLoadingOptions(false)
    }
  }

  // Filter helper functions
  function toggleFolderFilter(folderId: string) {
    setFilterFolderIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  function toggleStatusFilter(status: string) {
    setFilterStatus((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  function clearFilters() {
    setFilterFolderIds(new Set())
    setFilterStatus(new Set())
  }

  // Filter folders for dropdown search
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(folderSearchQuery.toLowerCase())
  )

  const activeFilterCount = filterFolderIds.size + filterStatus.size

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))

      // Folder filter
      const matchesFolder =
        filterFolderIds.size === 0 ||
        (item.folder_id && filterFolderIds.has(item.folder_id)) ||
        (item.folder_id === null && filterFolderIds.has('root'))

      // Status filter
      const matchesStatus = filterStatus.size === 0 || (item.status && filterStatus.has(item.status))

      return matchesSearch && matchesFolder && matchesStatus
    })
  }, [items, searchQuery, filterFolderIds, filterStatus])

  function toggleItem(item: InventoryItem) {
    const newSelected = new Map(selectedItems)
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id)
    } else {
      newSelected.set(item.id, { item, quantity: 1 })
    }
    setSelectedItems(newSelected)
  }

  function updateQuantity(itemId: string, delta: number) {
    const selected = selectedItems.get(itemId)
    if (!selected) return

    const newQty = Math.max(1, Math.min(selected.quantity + delta, selected.item.quantity))
    const newSelected = new Map(selectedItems)
    newSelected.set(itemId, { ...selected, quantity: newQty })
    setSelectedItems(newSelected)
  }

  function selectAll() {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Map())
    } else {
      const newSelected = new Map<string, SelectedItem>()
      filteredItems.forEach((item) => {
        newSelected.set(item.id, { item, quantity: 1 })
      })
      setSelectedItems(newSelected)
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
    const selected = options.find((opt) => opt.id === id)
    setAssigneeName(selected?.name || '')
  }

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
        setJobs((prev) => [...prev, newJob])
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
    if (selectedItems.size === 0) {
      setError('Please select at least one item')
      return
    }

    if (!assigneeName) {
      setError('Please select an assignee')
      return
    }

    setSubmitting(true)
    setError(null)

    const checkoutItems: BatchCheckoutItem[] = Array.from(selectedItems.values()).map(
      ({ item, quantity }) => ({
        itemId: item.id,
        itemName: item.name,
        quantity,
      })
    )

    try {
      const result = await batchCheckout(
        checkoutItems,
        assigneeType,
        assigneeId || undefined,
        assigneeName,
        dueDate || undefined,
        notes || undefined
      )

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/tasks/checkouts')
        }, 1500)
      } else {
        if (result.failedItems && result.failedItems.length > 0) {
          const failedNames = result.failedItems.map((f) => f.itemName).join(', ')
          setError(`Failed to checkout: ${failedNames}`)
        } else {
          setError(result.error || 'Failed to checkout items')
        }
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An error occurred while checking out items')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCount = selectedItems.size
  const totalQuantity = Array.from(selectedItems.values()).reduce((sum, s) => sum + s.quantity, 0)
  const assigneeOptions = getAssigneeOptions()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex items-center gap-4">
          <Link href="/tasks/checkouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Check Out Items</h1>
            <p className="mt-1 text-neutral-500">Assign items to people, jobs, or locations</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-8 mt-4 flex flex-shrink-0 items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5" />
          Items checked out successfully! Redirecting...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-8 mt-4 flex-shrink-0 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <div className="flex-1 overflow-hidden px-8 py-6">
        <div className="grid h-full w-full gap-6 lg:grid-cols-2">
          {/* Left Column - Item Selection */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex-shrink-0 border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Select Items</h2>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedItems.size === filteredItems.length && filteredItems.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="rounded-full bg-primary px-1.5 text-xs text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Filter by Folder</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Search folders..."
                        value={folderSearchQuery}
                        onChange={(e) => setFolderSearchQuery(e.target.value)}
                        className="h-8 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {!folderSearchQuery && (
                        <DropdownMenuCheckboxItem
                          checked={filterFolderIds.has('root')}
                          onCheckedChange={() => toggleFolderFilter('root')}
                        >
                          No Folder (Root)
                        </DropdownMenuCheckboxItem>
                      )}
                      {filteredFolders.length > 0 ? (
                        filteredFolders.map((folder) => (
                          <DropdownMenuCheckboxItem
                            key={folder.id}
                            checked={filterFolderIds.has(folder.id)}
                            onCheckedChange={() => toggleFolderFilter(folder.id)}
                          >
                            <span className="truncate">{folder.name}</span>
                          </DropdownMenuCheckboxItem>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-sm text-neutral-500">No folders found</div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.has('in_stock')}
                      onCheckedChange={() => toggleStatusFilter('in_stock')}
                    >
                      In Stock
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.has('low_stock')}
                      onCheckedChange={() => toggleStatusFilter('low_stock')}
                    >
                      Low Stock
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.has('out_of_stock')}
                      onCheckedChange={() => toggleStatusFilter('out_of_stock')}
                    >
                      Out of Stock
                    </DropdownMenuCheckboxItem>
                    {activeFilterCount > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <button
                          onClick={clearFilters}
                          className="w-full px-2 py-1.5 text-left text-sm text-red-600 hover:bg-neutral-50"
                        >
                          Clear all filters
                        </button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
              ) : filteredItems.length > 0 ? (
                <ul className="divide-y divide-neutral-200">
                  {filteredItems.map((item) => {
                    const selected = selectedItems.get(item.id)
                    const isSelected = !!selected
                    return (
                      <li
                        key={item.id}
                        className={`flex cursor-pointer items-center gap-4 px-6 py-3 hover:bg-neutral-50 ${
                          isSelected ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleItem(item)}
                      >
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                          {item.image_urls && item.image_urls.length > 0 ? (
                            <img
                              src={item.image_urls[0]}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">
                            {item.sku && `${item.sku} · `}
                            {item.quantity} available
                          </p>
                        </div>
                        {isSelected && (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {selected.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="py-12 text-center text-neutral-500">
                  {searchQuery ? 'No items match your search' : 'No items available'}
                </div>
              )}
            </div>

            {selectedCount > 0 && (
              <div className="flex-shrink-0 border-t border-neutral-200 bg-neutral-50 px-6 py-3">
                <span className="text-sm font-medium text-neutral-700">
                  {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected ({totalQuantity}{' '}
                  total)
                </span>
              </div>
            )}
          </div>

          {/* Right Column - Assignment */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex-shrink-0 border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Assign To</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Assignee Type Tabs */}
              <div className="mb-4 flex gap-2">
                {[
                  { type: 'person' as const, icon: User, label: 'Person' },
                  { type: 'job' as const, icon: Briefcase, label: 'Job' },
                  { type: 'location' as const, icon: MapPin, label: 'Location' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setAssigneeType(type)
                      setAssigneeId('')
                      setAssigneeName('')
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                      assigneeType === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Assignee Dropdown */}
              {loadingOptions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : (
                <>
                  <select
                    value={assigneeId}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                    <div className="mt-3">
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
                          <Button size="sm" variant="ghost" onClick={() => setShowNewJob(false)}>
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

              {/* Due Date */}
              <div className="mt-6">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  Due Date (optional)
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this checkout..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Checkout Button */}
            <div className="flex-shrink-0 border-t border-neutral-200 p-6">
              <Button
                className="w-full"
                size="lg"
                disabled={submitting || selectedCount === 0 || !assigneeName}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Check Out {totalQuantity > 0 ? `${totalQuantity} Item${totalQuantity !== 1 ? 's' : ''}` : 'Items'}
                    {assigneeName && ` to ${assigneeName}`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

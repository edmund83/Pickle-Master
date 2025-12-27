'use client'

import { useState, useEffect } from 'react'
import { createPickList, getTeamMembers, searchInventoryItems, type CreatePickListInput } from '@/app/actions/pick-lists'
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Minus,
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PickListModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  quantity: number
  image_urls: string[] | null
  unit: string | null
}

interface SelectedItem {
  item: InventoryItem
  requested_quantity: number
}

const countries = [
  'Malaysia', 'Singapore', 'United States', 'United Kingdom', 'Australia',
  'Canada', 'China', 'Japan', 'South Korea', 'India', 'Indonesia',
  'Thailand', 'Vietnam', 'Philippines', 'Hong Kong', 'Taiwan', 'Other'
]

export function PickListModal({ isOpen, onClose, onSuccess }: PickListModalProps) {
  // Form state
  const [name, setName] = useState('')
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Ship To state
  const [showShipTo, setShowShipTo] = useState(false)
  const [shipToName, setShipToName] = useState('')
  const [shipToAddress1, setShipToAddress1] = useState('')
  const [shipToAddress2, setShipToAddress2] = useState('')
  const [shipToCity, setShipToCity] = useState('')
  const [shipToState, setShipToState] = useState('')
  const [shipToPostalCode, setShipToPostalCode] = useState('')
  const [shipToCountry, setShipToCountry] = useState('')

  // Items state
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [showItemSearch, setShowItemSearch] = useState(false)
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load team members on mount
  useEffect(() => {
    if (isOpen) {
      loadTeamMembers()
      // Generate default name
      const today = new Date()
      setName(`Pick List ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
    }
  }, [isOpen])

  // Search items with debounce
  useEffect(() => {
    if (!showItemSearch) return

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const results = await searchInventoryItems(itemSearchQuery)
        // Filter out already selected items
        const selectedIds = new Set(selectedItems.map(s => s.item.id))
        setSearchResults(results.filter((item: InventoryItem) => !selectedIds.has(item.id)))
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [itemSearchQuery, showItemSearch, selectedItems])

  async function loadTeamMembers() {
    try {
      const members = await getTeamMembers()
      setTeamMembers(members)
    } catch (err) {
      console.error('Error loading team members:', err)
    }
  }

  function addItem(item: InventoryItem) {
    setSelectedItems(prev => [...prev, { item, requested_quantity: 1 }])
    setShowItemSearch(false)
    setItemSearchQuery('')
  }

  function removeItem(itemId: string) {
    setSelectedItems(prev => prev.filter(s => s.item.id !== itemId))
  }

  function updateQuantity(itemId: string, quantity: number) {
    setSelectedItems(prev =>
      prev.map(s =>
        s.item.id === itemId
          ? { ...s, requested_quantity: Math.max(1, Math.min(quantity, s.item.quantity)) }
          : s
      )
    )
  }

  function resetForm() {
    setName('')
    setAssignedTo(null)
    setDueDate('')
    setNotes('')
    setShowShipTo(false)
    setShipToName('')
    setShipToAddress1('')
    setShipToAddress2('')
    setShipToCity('')
    setShipToState('')
    setShipToPostalCode('')
    setShipToCountry('')
    setSelectedItems([])
    setError(null)
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Please enter a name for the pick list')
      return
    }

    if (selectedItems.length === 0) {
      setError('Please add at least one item to the pick list')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const input: CreatePickListInput = {
        name: name.trim(),
        assigned_to: assignedTo,
        due_date: dueDate || null,
        notes: notes.trim() || null,
        ship_to_name: shipToName.trim() || null,
        ship_to_address1: shipToAddress1.trim() || null,
        ship_to_address2: shipToAddress2.trim() || null,
        ship_to_city: shipToCity.trim() || null,
        ship_to_state: shipToState.trim() || null,
        ship_to_postal_code: shipToPostalCode.trim() || null,
        ship_to_country: shipToCountry || null,
        items: selectedItems.map(s => ({
          item_id: s.item.id,
          requested_quantity: s.requested_quantity
        }))
      }

      const result = await createPickList(input)

      if (result.success) {
        resetForm()
        onSuccess()
        onClose()
      } else {
        setError(result.error || 'Failed to create pick list')
      }
    } catch (err) {
      console.error('Create pick list error:', err)
      setError('An error occurred while creating the pick list')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pickle-100">
              <ClipboardList className="h-5 w-5 text-pickle-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Create New Pick List</h2>
              <p className="text-sm text-neutral-500">Add items to pick from inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Pick List Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter pick list name"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
            />
          </div>

          {/* Assignment Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assign To */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Assign To
              </label>
              <select
                value={assignedTo || ''}
                onChange={(e) => setAssignedTo(e.target.value || null)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">
                Items to Pick
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowItemSearch(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Item Search */}
            {showItemSearch && (
              <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Search items by name or SKU..."
                    autoFocus
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  />
                  <button
                    onClick={() => {
                      setShowItemSearch(false)
                      setItemSearchQuery('')
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {searchLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addItem(item)}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white"
                      >
                        {item.image_urls?.[0] ? (
                          <Image
                            src={item.image_urls[0]}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100">
                            <Package className="h-4 w-4 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">
                            {item.sku && `SKU: ${item.sku} · `}
                            {item.quantity} {item.unit || 'units'} available
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-pickle-600" />
                      </button>
                    ))}
                  </div>
                ) : itemSearchQuery ? (
                  <p className="py-4 text-center text-sm text-neutral-500">No items found</p>
                ) : (
                  <p className="py-4 text-center text-sm text-neutral-500">Type to search items</p>
                )}
              </div>
            )}

            {/* Selected Items Table */}
            {selectedItems.length > 0 ? (
              <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-neutral-600">Item Description</th>
                      <th className="px-3 py-2 text-center font-medium text-neutral-600 w-32">Pick Quantity</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {selectedItems.map((selected) => (
                      <tr key={selected.item.id} className="hover:bg-neutral-50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {selected.item.image_urls?.[0] ? (
                              <Image
                                src={selected.item.image_urls[0]}
                                alt={selected.item.name}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100">
                                <Package className="h-4 w-4 text-neutral-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-neutral-900">{selected.item.name}</p>
                              <p className="text-xs text-neutral-500">
                                {selected.item.quantity} available
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateQuantity(selected.item.id, selected.requested_quantity - 1)}
                              disabled={selected.requested_quantity <= 1}
                              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={selected.item.quantity}
                              value={selected.requested_quantity}
                              onChange={(e) => updateQuantity(selected.item.id, parseInt(e.target.value) || 1)}
                              className="w-16 rounded border border-neutral-300 px-2 py-1 text-center text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                            />
                            <button
                              onClick={() => updateQuantity(selected.item.id, selected.requested_quantity + 1)}
                              disabled={selected.requested_quantity >= selected.item.quantity}
                              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeItem(selected.item.id)}
                            className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 py-8 text-center">
                <Package className="mx-auto h-8 w-8 text-neutral-400" />
                <p className="mt-2 text-sm text-neutral-500">No items added yet</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowItemSearch(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            )}
          </div>

          {/* Ship To Section (Collapsible) */}
          <div className="rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => setShowShipTo(!showShipTo)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-neutral-700">Ship To (Optional)</span>
              {showShipTo ? (
                <ChevronUp className="h-4 w-4 text-neutral-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              )}
            </button>

            {showShipTo && (
              <div className="border-t border-neutral-200 px-4 py-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Name</label>
                  <input
                    type="text"
                    value={shipToName}
                    onChange={(e) => setShipToName(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Address Line 1</label>
                  <input
                    type="text"
                    value={shipToAddress1}
                    onChange={(e) => setShipToAddress1(e.target.value)}
                    placeholder="Street address"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Address Line 2</label>
                  <input
                    type="text"
                    value={shipToAddress2}
                    onChange={(e) => setShipToAddress2(e.target.value)}
                    placeholder="Apt, suite, unit, etc."
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">City</label>
                    <input
                      type="text"
                      value={shipToCity}
                      onChange={(e) => setShipToCity(e.target.value)}
                      placeholder="City"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">State / Province / Region</label>
                    <input
                      type="text"
                      value={shipToState}
                      onChange={(e) => setShipToState(e.target.value)}
                      placeholder="State"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">Zip / Postal Code</label>
                    <input
                      type="text"
                      value={shipToPostalCode}
                      onChange={(e) => setShipToPostalCode(e.target.value)}
                      placeholder="Postal code"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">Country</label>
                    <select
                      value={shipToCountry}
                      onChange={(e) => setShipToCountry(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 border-t border-neutral-200 bg-white px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || selectedItems.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ClipboardList className="mr-2 h-4 w-4" />
                Create Pick List
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

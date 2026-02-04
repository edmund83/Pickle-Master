'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  Wand2,
  Search,
  AlertTriangle,
  AlertCircle,
  Check,
  Package,
  Hash,
  Loader2,
} from 'lucide-react'

// ============ TYPES ============

interface PickListItemTrackingProps {
  pickListItemId: string
  itemId: string
  itemName: string
  itemSku?: string
  requestedQuantity: number
  trackingType: 'none' | 'serial' | 'lot'
  isEditable?: boolean
  onAllocationChange?: (isComplete: boolean) => void
}

interface LotAllocation {
  id: string
  lot_id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  quantity: number
  available: number
}

interface SerialAllocation {
  id: string
  serial_id: string
  serial_number: string
  status: string
}

interface AvailableLot {
  id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  quantity: number
  status: string
}

interface AvailableSerial {
  id: string
  serial_number: string
  status: string
}

// ============ HELPER FUNCTIONS ============

function getExpiryStatus(expiryDate: string | null): 'expired' | 'expiring_soon' | 'ok' | 'no_expiry' {
  if (!expiryDate) return 'no_expiry'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'expiring_soon'
  return 'ok'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ============ STATUS BADGE COMPONENTS ============

function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  const status = getExpiryStatus(expiryDate)

  if (status === 'no_expiry') return null

  const badges = {
    expired: {
      className: 'bg-red-100 text-red-700',
      icon: AlertCircle,
      label: 'Expired',
    },
    expiring_soon: {
      className: 'bg-amber-100 text-amber-700',
      icon: AlertTriangle,
      label: 'Expiring soon',
    },
    ok: null,
  }

  const badge = badges[status]
  if (!badge) return null

  const Icon = badge.icon

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', badge.className)}>
      <Icon className="h-3 w-3" />
      {badge.label}
    </span>
  )
}

function AllocationStatusBadge({ allocated, requested }: { allocated: number; requested: number }) {
  const isComplete = allocated >= requested

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      )}
    >
      {isComplete ? (
        <>
          <Check className="h-3 w-3" />
          Assigned
        </>
      ) : (
        <>
          <AlertTriangle className="h-3 w-3" />
          Pending
        </>
      )}
    </span>
  )
}

function TrackingTypeBadge({ type }: { type: 'serial' | 'lot' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        type === 'lot' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
      )}
    >
      {type === 'lot' ? (
        <>
          <Package className="h-3 w-3" />
          Lot
        </>
      ) : (
        <>
          <Hash className="h-3 w-3" />
          Serial
        </>
      )}
    </span>
  )
}

// ============ MAIN COMPONENT ============

export function PickListItemTracking({
  pickListItemId,
  itemId,
  itemName,
  itemSku,
  requestedQuantity,
  trackingType,
  isEditable = true,
  onAllocationChange,
}: PickListItemTrackingProps) {
  // Don't render for non-tracked items
  if (trackingType === 'none') return null

  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Allocated items (from get_pick_list_item_tracking)
  const [allocatedLots, setAllocatedLots] = useState<LotAllocation[]>([])
  const [allocatedSerials, setAllocatedSerials] = useState<SerialAllocation[]>([])

  // Available items for selection
  const [availableLots, setAvailableLots] = useState<AvailableLot[]>([])
  const [availableSerials, setAvailableSerials] = useState<AvailableSerial[]>([])

  // Local state for editing
  const [lotQuantities, setLotQuantities] = useState<Record<string, number>>({})
  const [selectedSerialIds, setSelectedSerialIds] = useState<Set<string>>(new Set())
  const [serialSearch, setSerialSearch] = useState('')

  // Calculate totals
  const totalAllocated = trackingType === 'lot'
    ? Object.values(lotQuantities).reduce((sum, qty) => sum + (qty || 0), 0)
    : selectedSerialIds.size

  const isComplete = totalAllocated >= requestedQuantity

  // Notify parent of allocation status changes
  useEffect(() => {
    onAllocationChange?.(isComplete)
  }, [isComplete, onAllocationChange])

  // Load data when expanded
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Load current allocations
      // Note: RPC types may not be generated yet, using type assertion
      const { data: trackingData, error: trackingError } = await (supabase as any).rpc(
        'get_pick_list_item_tracking',
        { p_pick_list_item_id: pickListItemId }
      )

      if (trackingError) throw trackingError

      const result = trackingData as { success: boolean; error?: string; lots?: LotAllocation[]; serials?: SerialAllocation[] }

      if (!result.success) {
        throw new Error(result.error || 'Failed to load tracking data')
      }

      // Set allocated data
      const lots = result.lots || []
      const serials = result.serials || []
      setAllocatedLots(lots)
      setAllocatedSerials(serials)

      // Initialize local state from allocations
      if (trackingType === 'lot') {
        const quantities: Record<string, number> = {}
        lots.forEach((lot) => {
          quantities[lot.lot_id] = lot.quantity
        })
        setLotQuantities(quantities)

        // Load available lots
        const { data: lotsData, error: lotsError } = await supabase
          .from('lots')
          .select('id, lot_number, batch_code, expiry_date, quantity, status')
          .eq('item_id', itemId)
          .eq('status', 'active')
          .gt('quantity', 0)
          .order('expiry_date', { ascending: true, nullsFirst: false })

        if (lotsError) throw lotsError
        setAvailableLots(lotsData || [])
      } else {
        // Serial tracking
        const serialIds = new Set(serials.map((s) => s.serial_id))
        setSelectedSerialIds(serialIds)

        // Load available serials
        const { data: serialsData, error: serialsError } = await supabase
          .from('serial_numbers')
          .select('id, serial_number, status')
          .eq('item_id', itemId)
          .eq('status', 'available')
          .order('created_at', { ascending: true })

        if (serialsError) throw serialsError

        // Cast to our expected type
        const availableFromDb = (serialsData || []) as Array<{
          id: string
          serial_number: string
          status: string
        }>

        // Merge allocated (even if not available status) with available
        const allocatedNotInAvailable = serials.filter(
          (s) => !availableFromDb.some((a) => a.id === s.serial_id)
        ).map((s) => ({
          id: s.serial_id,
          serial_number: s.serial_number,
          status: s.status,
        }))

        setAvailableSerials([...allocatedNotInAvailable, ...availableFromDb])
      }
    } catch (err) {
      console.error('Error loading tracking data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [pickListItemId, itemId, trackingType])

  useEffect(() => {
    if (isExpanded) {
      loadData()
    }
  }, [isExpanded, loadData])

  // Auto-assign handler
  const handleAutoAssign = async () => {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    try {
      const rpcName = trackingType === 'lot' ? 'auto_allocate_lots_fefo' : 'auto_allocate_serials_fifo'

      // Note: RPC types may not be generated yet, using type assertion
      const { data, error: rpcError } = await (supabase as any).rpc(rpcName, {
        p_pick_list_item_id: pickListItemId,
      })

      if (rpcError) throw rpcError

      const result = data as { success: boolean; error?: string }

      if (!result.success) {
        throw new Error(result.error || 'Auto-assign failed')
      }

      // Reload data to show new allocations
      await loadData()
    } catch (err) {
      console.error('Error auto-assigning:', err)
      setError(err instanceof Error ? err.message : 'Auto-assign failed')
    } finally {
      setIsSaving(false)
    }
  }

  // Save lot allocations
  const saveLotAllocations = async () => {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    try {
      const allocations = Object.entries(lotQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([lotId, quantity]) => ({ lot_id: lotId, quantity }))

      // Note: RPC types may not be generated yet, using type assertion
      const { data, error: rpcError } = await (supabase as any).rpc('allocate_pick_list_item_lots', {
        p_pick_list_item_id: pickListItemId,
        p_allocations: allocations,
      })

      if (rpcError) throw rpcError

      const result = data as { success: boolean; error?: string }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save allocations')
      }

      // Reload to confirm
      await loadData()
    } catch (err) {
      console.error('Error saving lot allocations:', err)
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Save serial allocations
  const saveSerialAllocations = async () => {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    try {
      const serialIds = Array.from(selectedSerialIds)

      // Note: RPC types may not be generated yet, using type assertion
      const { data, error: rpcError } = await (supabase as any).rpc('allocate_pick_list_item_serials', {
        p_pick_list_item_id: pickListItemId,
        p_serial_ids: serialIds,
      })

      if (rpcError) throw rpcError

      const result = data as { success: boolean; error?: string }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save allocations')
      }

      // Reload to confirm
      await loadData()
    } catch (err) {
      console.error('Error saving serial allocations:', err)
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle lot quantity change
  const handleLotQuantityChange = (lotId: string, value: string) => {
    const qty = parseInt(value, 10) || 0
    setLotQuantities((prev) => ({ ...prev, [lotId]: Math.max(0, qty) }))
  }

  // Handle serial toggle
  const handleSerialToggle = (serialId: string) => {
    setSelectedSerialIds((prev) => {
      const next = new Set(prev)
      if (next.has(serialId)) {
        next.delete(serialId)
      } else {
        // Don't allow selecting more than requested
        if (next.size < requestedQuantity) {
          next.add(serialId)
        }
      }
      return next
    })
  }

  // Filter serials by search
  const filteredSerials = availableSerials.filter((s) =>
    s.serial_number.toLowerCase().includes(serialSearch.toLowerCase())
  )

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      {/* Collapsed Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TrackingTypeBadge type={trackingType} />
          <div className="text-left">
            <span className="text-sm font-medium text-neutral-900">{itemName}</span>
            {itemSku && (
              <span className="ml-2 text-xs text-neutral-500">({itemSku})</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">
            {totalAllocated} / {requestedQuantity}
          </span>
          <AllocationStatusBadge allocated={totalAllocated} requested={requestedQuantity} />
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-100 px-4 py-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              {/* Toolbar */}
              {isEditable && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoAssign}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Auto-assign {trackingType === 'lot' ? 'FEFO' : 'FIFO'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-500">Need:</span>
                    <span className={cn('font-medium', isComplete ? 'text-green-600' : 'text-amber-600')}>
                      {totalAllocated} / {requestedQuantity}
                    </span>
                    {isComplete && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
              )}

              {/* Lot Table */}
              {trackingType === 'lot' && (
                <div className="space-y-4">
                  {availableLots.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                      <p>No lots available for this item</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-lg border border-neutral-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-neutral-700">Lot #</th>
                              <th className="px-3 py-2 text-left font-medium text-neutral-700">Expiry</th>
                              <th className="px-3 py-2 text-right font-medium text-neutral-700">Available</th>
                              <th className="px-3 py-2 text-right font-medium text-neutral-700">Allocate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {availableLots.map((lot) => {
                              const expiryStatus = getExpiryStatus(lot.expiry_date)
                              const isExpired = expiryStatus === 'expired'

                              return (
                                <tr
                                  key={lot.id}
                                  className={cn(
                                    'hover:bg-neutral-50',
                                    isExpired && 'bg-red-50/50'
                                  )}
                                >
                                  <td className="px-3 py-2">
                                    <span className="font-mono text-neutral-900">
                                      {lot.lot_number || lot.batch_code || '-'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-neutral-600">
                                        {formatDate(lot.expiry_date)}
                                      </span>
                                      <ExpiryBadge expiryDate={lot.expiry_date} />
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <span className="font-medium text-neutral-900">{lot.quantity}</span>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {isEditable ? (
                                      <Input
                                        type="number"
                                        min={0}
                                        max={lot.quantity}
                                        value={lotQuantities[lot.id] || ''}
                                        onChange={(e) => handleLotQuantityChange(lot.id, e.target.value)}
                                        className="h-8 w-20 text-right ml-auto"
                                        placeholder="0"
                                      />
                                    ) : (
                                      <span className="font-medium">
                                        {lotQuantities[lot.id] || 0}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {isEditable && (
                        <div className="flex justify-end">
                          <Button onClick={saveLotAllocations} disabled={isSaving} size="sm">
                            {isSaving ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Save Allocations
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Serial Checkbox List */}
              {trackingType === 'serial' && (
                <div className="space-y-4">
                  {availableSerials.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <Hash className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                      <p>No serials available for this item</p>
                    </div>
                  ) : (
                    <>
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                          type="text"
                          placeholder="Search serials..."
                          value={serialSearch}
                          onChange={(e) => setSerialSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      {/* Serial List */}
                      <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                        {filteredSerials.length === 0 ? (
                          <div className="px-4 py-8 text-center text-neutral-500">
                            No serials match your search
                          </div>
                        ) : (
                          filteredSerials.map((serial) => {
                            const isSelected = selectedSerialIds.has(serial.id)
                            const isDisabled = !isEditable || (!isSelected && selectedSerialIds.size >= requestedQuantity)

                            return (
                              <label
                                key={serial.id}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors',
                                  isDisabled && !isSelected && 'opacity-50 cursor-not-allowed'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSerialToggle(serial.id)}
                                  disabled={isDisabled}
                                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
                                />
                                <span className="font-mono text-sm text-neutral-900">
                                  {serial.serial_number}
                                </span>
                                {serial.status !== 'available' && (
                                  <span className="text-xs text-neutral-500">({serial.status})</span>
                                )}
                              </label>
                            )
                          })
                        )}
                      </div>

                      {isEditable && (
                        <div className="flex justify-end">
                          <Button onClick={saveSerialAllocations} disabled={isSaving} size="sm">
                            {isSaving ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Save Allocations
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

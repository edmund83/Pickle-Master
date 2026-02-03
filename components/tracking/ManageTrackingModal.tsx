'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ColumnDef } from '@tanstack/react-table'
import {
  X,
  Package,
  Hash,
  Calendar,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import { CreateLotModal } from '@/components/lots/CreateLotModal'

// ============ TYPES ============

interface Batch {
  id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  quantity: number
  status: 'active' | 'expired' | 'depleted' | 'blocked'
  days_until_expiry: number | null
  expiry_status: 'no_expiry' | 'expired' | 'expiring_soon' | 'expiring_month' | 'ok'
}

interface Serial {
  id: string
  serial_number: string
  status: 'available' | 'checked_out' | 'sold' | 'damaged' | 'returned'
  location_name: string | null
  checked_out_to: string | null
}

interface ManageTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemName: string
  trackingType: 'batch' | 'serial'
}

// ============ EDITABLE SERIAL CELL ============

function EditableSerialCell({
  serial,
  onUpdate,
}: {
  serial: Serial
  onUpdate: (id: string, newValue: string) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(serial.serial_number)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (value === serial.serial_number) {
      setIsEditing(false)
      return
    }
    setLoading(true)
    try {
      await onUpdate(serial.id, value)
      setIsEditing(false)
    } catch {
      setValue(serial.serial_number)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      setValue(serial.serial_number)
      setIsEditing(false)
    }
  }

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-7 px-2 py-1 text-sm font-mono"
        />
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-text font-mono rounded px-2 py-1 hover:bg-neutral-100 transition-colors"
      title="Click to edit"
    >
      {serial.serial_number}
    </div>
  )
}

// ============ STATUS BADGE ============

function StatusBadge({ status }: { status: Serial['status'] }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    available: { bg: 'bg-green-100', text: 'text-green-700' },
    checked_out: { bg: 'bg-amber-100', text: 'text-amber-700' },
    sold: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
    damaged: { bg: 'bg-red-100', text: 'text-red-700' },
    returned: { bg: 'bg-blue-100', text: 'text-blue-700' },
  }

  const statusLabels: Record<string, string> = {
    available: 'Available',
    checked_out: 'Checked out',
    sold: 'Sold',
    damaged: 'Damaged',
    returned: 'Returned',
  }

  const style = statusColors[status] || statusColors.available

  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', style.bg, style.text)}>
      {statusLabels[status]}
    </span>
  )
}

// ============ BATCH LIST ITEM ============

function BatchListItem({
  batch,
  isSelected,
  onSelect,
  formatDate,
}: {
  batch: Batch
  isSelected: boolean
  onSelect: () => void
  formatDate: (date: string) => string
}) {
  const expiryColors: Record<string, string> = {
    expired: 'text-red-600',
    expiring_soon: 'text-amber-600',
    expiring_month: 'text-yellow-600',
    ok: 'text-green-600',
    no_expiry: 'text-neutral-500',
  }

  const expiryLabels: Record<string, string> = {
    expired: 'Expired',
    expiring_soon: 'Expiring soon',
    expiring_month: 'Expiring this month',
    ok: '',
    no_expiry: '',
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0',
          isSelected ? 'border-primary bg-primary' : 'border-neutral-300'
        )}
      >
        {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
      </div>

      {/* Batch info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900">
            {batch.lot_number || batch.batch_code || 'Unnamed batch'}
          </span>
          {expiryLabels[batch.expiry_status] && (
            <span className={cn('text-xs font-medium', expiryColors[batch.expiry_status])}>
              {expiryLabels[batch.expiry_status]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
          {batch.expiry_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Exp: {formatDate(batch.expiry_date)}
            </span>
          )}
          <span>Qty: {batch.quantity}</span>
        </div>
      </div>

      {/* Arrow for selected */}
      {isSelected && <ChevronRight className="h-5 w-5 text-primary" />}
    </button>
  )
}

// ============ MAIN MODAL ============

export function ManageTrackingModal({
  isOpen,
  onClose,
  itemId,
  itemName,
  trackingType,
}: ManageTrackingModalProps) {
  const router = useRouter()
  const { formatShortDate } = useFormatting()

  // Data state
  const [batches, setBatches] = useState<Batch[]>([])
  const [serials, setSerials] = useState<Serial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Batch selection state (for override)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [overrideQuantity, setOverrideQuantity] = useState<string>('')

  // Sub-modal state
  const [showCreateBatch, setShowCreateBatch] = useState(false)

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, itemId, trackingType])

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null)
      setOverrideQuantity('')
    }
  }, [isOpen])

  async function loadData() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (trackingType === 'batch') {
        const { data, error: rpcError } = await (supabase as any).rpc('get_item_lots', {
          p_item_id: itemId,
          p_include_depleted: false,
        })

        if (rpcError) throw rpcError
        setBatches((data || []) as Batch[])
      } else {
        const { data, error: rpcError } = await (supabase as any).rpc('get_item_serials', {
          p_item_id: itemId,
          p_include_unavailable: true,
        })

        if (rpcError) throw rpcError
        setSerials((data || []) as Serial[])
      }
    } catch (err) {
      console.error('Error loading tracking data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateSerial(serialId: string, newSerialNumber: string) {
    const supabase = createClient()

    const { error: updateError } = await (supabase as any)
      .from('serial_numbers')
      .update({ serial_number: newSerialNumber.trim() })
      .eq('id', serialId)

    if (updateError) {
      setError('Failed to update serial number')
      throw updateError
    }

    // Update local state
    setSerials((prev) =>
      prev.map((s) => (s.id === serialId ? { ...s, serial_number: newSerialNumber.trim() } : s))
    )
    router.refresh()
  }

  function handleBatchCreated() {
    loadData()
    router.refresh()
  }

  function handleSelect(id: string) {
    if (selectedId === id) {
      setSelectedId(null)
      setOverrideQuantity('')
    } else {
      setSelectedId(id)
      setOverrideQuantity('')
    }
  }

  // Get selected batch for quantity input
  const selectedBatch = batches.find((b) => b.id === selectedId)

  // Serial table columns
  const serialColumns: ColumnDef<Serial>[] = [
    {
      accessorKey: 'serial_number',
      header: 'Serial Number',
      cell: ({ row }) => (
        <EditableSerialCell serial={row.original} onUpdate={handleUpdateSerial} />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ]

  if (!isOpen) return null

  const title = trackingType === 'batch' ? 'Manage Batches' : 'Manage Serials'
  const Icon = trackingType === 'batch' ? Package : Hash
  const isEmpty = trackingType === 'batch' ? batches.length === 0 : serials.length === 0

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Icon className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
                <p className="text-sm text-neutral-500">{itemName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>

          {/* Helper text - only for batch */}
          {trackingType === 'batch' && (
            <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100">
              <p className="text-sm text-neutral-600">
                System auto-picks oldest first. Tap a batch to use it instead.
              </p>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
                  <Icon className="h-8 w-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 mb-1">
                  {trackingType === 'batch' ? 'No batches yet' : 'No serial numbers yet'}
                </p>
                <p className="text-sm text-neutral-400">
                  {trackingType === 'batch'
                    ? 'Add batches to track expiry dates'
                    : 'Serial numbers are added via Stock In'}
                </p>
              </div>
            ) : trackingType === 'batch' ? (
              <div className="space-y-3">
                {batches.map((batch) => (
                  <BatchListItem
                    key={batch.id}
                    batch={batch}
                    isSelected={selectedId === batch.id}
                    onSelect={() => handleSelect(batch.id)}
                    formatDate={formatShortDate}
                  />
                ))}
              </div>
            ) : (
              <DataTable
                columns={serialColumns}
                data={serials}
                searchKey="serial_number"
                searchPlaceholder="Search serials..."
                pageSize={5}
              />
            )}

            {/* Override quantity input for batches */}
            {selectedBatch && (
              <div className="mt-4 p-4 rounded-xl bg-primary/5 border-2 border-primary">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Override: Use this batch instead of auto-pick
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      max={selectedBatch.quantity}
                      value={overrideQuantity}
                      onChange={(e) => setOverrideQuantity(e.target.value)}
                      placeholder={`Qty (max ${selectedBatch.quantity})`}
                    />
                  </div>
                  <Button
                    disabled={!overrideQuantity || parseInt(overrideQuantity) <= 0}
                    onClick={() => {
                      // TODO: Implement override action
                      console.log('Override batch', selectedBatch.id, 'qty', overrideQuantity)
                    }}
                  >
                    Use This Batch
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4 bg-neutral-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {trackingType === 'batch' && (
              <Button onClick={() => setShowCreateBatch(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Batch
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Create Batch Sub-modal */}
      {trackingType === 'batch' && (
        <CreateLotModal
          isOpen={showCreateBatch}
          onClose={() => setShowCreateBatch(false)}
          onSuccess={handleBatchCreated}
          itemId={itemId}
          itemName={itemName}
        />
      )}
    </>
  )
}

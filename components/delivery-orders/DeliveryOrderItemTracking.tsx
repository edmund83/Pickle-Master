'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Package, Hash } from 'lucide-react'

// ============ TYPES ============

interface TrackingRecord {
  id: string
  serial_number: string
  lot_id: string | null
  quantity: number
}

interface DeliveryOrderItemTrackingProps {
  deliveryOrderItemId: string
  itemName: string
  isEditable?: boolean
  sourcePickListId?: string
}

// ============ BADGE COMPONENTS ============

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

export function DeliveryOrderItemTracking({
  deliveryOrderItemId,
  itemName,
  isEditable = false,
  sourcePickListId,
}: DeliveryOrderItemTrackingProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load tracking data on mount
  useEffect(() => {
    async function loadTracking() {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      try {
        const { data, error: fetchError } = await (supabase as any)
          .from('delivery_order_item_serials')
          .select('id, serial_number, lot_id, quantity')
          .eq('delivery_order_item_id', deliveryOrderItemId)
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError

        setTrackingRecords(data || [])
      } catch (err) {
        console.error('Error loading DO item tracking:', err)
        setError(err instanceof Error ? err.message : 'Failed to load tracking')
      } finally {
        setIsLoading(false)
      }
    }

    loadTracking()
  }, [deliveryOrderItemId])

  // If loading, show skeleton
  if (isLoading) {
    return <Skeleton className="h-5 w-24" />
  }

  // If error, show dash
  if (error) {
    return <span className="text-neutral-400">-</span>
  }

  // If no tracking records, show dash
  if (trackingRecords.length === 0) {
    return <span className="text-neutral-400">-</span>
  }

  // Group records by type: lots have lot_id, serials don't
  const lotRecords = trackingRecords.filter((r) => r.lot_id !== null)
  const serialRecords = trackingRecords.filter((r) => r.lot_id === null)

  // If we have lots, display them as "LOT-NUMBER (qty)"
  if (lotRecords.length > 0) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <TrackingTypeBadge type="lot" />
        <div className="flex flex-wrap gap-1">
          {lotRecords.map((lot) => (
            <span
              key={lot.id}
              className="inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700"
            >
              {lot.serial_number}
              {lot.quantity > 1 && (
                <span className="ml-1 text-purple-500">({lot.quantity})</span>
              )}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // If we have serials, display them as comma-separated list
  if (serialRecords.length > 0) {
    // Show first 3 serials, then +N more if there are more
    const displayLimit = 3
    const displayedSerials = serialRecords.slice(0, displayLimit)
    const remainingCount = serialRecords.length - displayLimit

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <TrackingTypeBadge type="serial" />
        <div className="flex flex-wrap gap-1">
          {displayedSerials.map((serial) => (
            <span
              key={serial.id}
              className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-mono text-blue-700"
            >
              {serial.serial_number}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
              +{remainingCount} more
            </span>
          )}
        </div>
      </div>
    )
  }

  // Fallback - should not reach here
  return <span className="text-neutral-400">-</span>
}

// ============ COMPACT INLINE VERSION ============

interface DeliveryOrderItemTrackingInlineProps {
  deliveryOrderItemId: string
}

/**
 * A more compact version that just shows the serial/lot numbers inline without badges.
 * Good for table cells where space is limited.
 */
export function DeliveryOrderItemTrackingInline({
  deliveryOrderItemId,
}: DeliveryOrderItemTrackingInlineProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>([])

  useEffect(() => {
    async function loadTracking() {
      setIsLoading(true)

      const supabase = createClient()

      try {
        const { data, error: fetchError } = await (supabase as any)
          .from('delivery_order_item_serials')
          .select('id, serial_number, lot_id, quantity')
          .eq('delivery_order_item_id', deliveryOrderItemId)
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError

        setTrackingRecords(data || [])
      } catch (err) {
        console.error('Error loading DO item tracking:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTracking()
  }, [deliveryOrderItemId])

  if (isLoading) {
    return <Skeleton className="h-4 w-16" />
  }

  if (trackingRecords.length === 0) {
    return null
  }

  const lotRecords = trackingRecords.filter((r) => r.lot_id !== null)
  const serialRecords = trackingRecords.filter((r) => r.lot_id === null)

  if (lotRecords.length > 0) {
    const summary = lotRecords
      .map((l) => (l.quantity > 1 ? `${l.serial_number} (${l.quantity})` : l.serial_number))
      .join(', ')
    return (
      <span className="text-xs text-purple-600" title={summary}>
        <Package className="inline h-3 w-3 mr-1" />
        {summary.length > 30 ? summary.slice(0, 30) + '...' : summary}
      </span>
    )
  }

  if (serialRecords.length > 0) {
    const summary = serialRecords.map((s) => s.serial_number).join(', ')
    return (
      <span className="text-xs text-blue-600" title={summary}>
        <Hash className="inline h-3 w-3 mr-1" />
        {serialRecords.length} serial{serialRecords.length !== 1 ? 's' : ''}
      </span>
    )
  }

  return null
}

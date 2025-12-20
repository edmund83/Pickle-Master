'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Warehouse, Truck, Store, Briefcase, Package, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LocationStock {
  location_id: string
  location_name: string
  location_type: 'warehouse' | 'van' | 'store' | 'job_site'
  quantity: number
  min_quantity: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface ItemLocationsPanelProps {
  itemId: string
  itemName: string
  onTransfer?: (fromLocationId: string) => void
}

const LOCATION_ICONS: Record<string, React.ElementType> = {
  warehouse: Warehouse,
  van: Truck,
  store: Store,
  job_site: Briefcase,
}

const LOCATION_COLORS: Record<string, string> = {
  warehouse: 'bg-blue-100 text-blue-600',
  van: 'bg-orange-100 text-orange-600',
  store: 'bg-green-100 text-green-600',
  job_site: 'bg-purple-100 text-purple-600',
}

const STATUS_COLORS: Record<string, string> = {
  in_stock: 'text-green-600',
  low_stock: 'text-yellow-600',
  out_of_stock: 'text-red-600',
}

export function ItemLocationsPanel({ itemId, itemName, onTransfer }: ItemLocationsPanelProps) {
  const [locations, setLocations] = useState<LocationStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLocations()
  }, [itemId])

  async function loadLocations() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('get_item_locations', { p_item_id: itemId })

      if (rpcError) {
        console.error('Error loading locations:', rpcError)
        setError('Failed to load location data')
        return
      }

      setLocations((data || []) as LocationStock[])
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const totalQuantity = locations.reduce((sum, loc) => sum + loc.quantity, 0)

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Stock by Location
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Stock by Location
          </h2>
        </div>
        <div className="flex items-center justify-center gap-2 py-8 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Stock by Location
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Package className="h-10 w-10 text-neutral-300" />
          <p className="mt-2 text-sm text-neutral-500">
            This item is not tracked across multiple locations
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Enable multi-location in Settings to track stock at different locations
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Stock by Location
          </h2>
        </div>
        <span className="text-sm text-neutral-500">
          Total: <span className="font-semibold text-neutral-900">{totalQuantity}</span>
        </span>
      </div>

      <div className="space-y-3">
        {locations.map((location) => {
          const Icon = LOCATION_ICONS[location.location_type] || Warehouse
          const colorClass = LOCATION_COLORS[location.location_type] || LOCATION_COLORS.warehouse
          const statusColor = STATUS_COLORS[location.status] || STATUS_COLORS.in_stock
          const percentage = totalQuantity > 0 ? (location.quantity / totalQuantity) * 100 : 0

          return (
            <div
              key={location.location_id}
              className="group flex items-center gap-4 rounded-lg border border-neutral-100 p-3 hover:border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              {/* Location Icon */}
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClass)}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Location Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">{location.location_name}</span>
                  <span className="text-xs text-neutral-400 capitalize">
                    {location.location_type.replace('_', ' ')}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      location.status === 'out_of_stock' ? 'bg-red-400' :
                      location.status === 'low_stock' ? 'bg-yellow-400' : 'bg-green-400'
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="text-right">
                <p className={cn('text-lg font-semibold', statusColor)}>
                  {location.quantity}
                </p>
                {location.min_quantity > 0 && (
                  <p className="text-xs text-neutral-400">
                    min: {location.min_quantity}
                  </p>
                )}
              </div>

              {/* Transfer Button */}
              {onTransfer && location.quantity > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onTransfer(location.location_id)}
                  title="Transfer from this location"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Low stock warning */}
      {locations.some(l => l.status === 'low_stock' || l.status === 'out_of_stock') && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Some locations have low or zero stock</span>
        </div>
      )}
    </div>
  )
}

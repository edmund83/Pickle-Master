import Link from 'next/link'
import { ScanLine, ChevronRight } from 'lucide-react'
import { ItemDetailCard } from './item-detail-card'
import type { ItemTrackingMode } from '@/types/database.types'

interface SerialStats {
  total: number
  available: number
  checked_out: number
  sold: number
  damaged: number
  returned: number
}

interface LotStats {
  activeLots: number
  totalQuantity: number
  expiredCount: number
  expiringSoonCount: number // within 7 days
  expiringCount: number // within 30 days
  daysUntilNextExpiry: number | null
}

interface TrackingCardProps {
  itemId: string
  trackingMode: ItemTrackingMode | null
  serialNumber?: string | null // legacy serial number field
  serialStats?: SerialStats | null
  lotStats?: LotStats | null
}

export function TrackingCard({
  itemId,
  trackingMode,
  serialNumber,
  serialStats,
  lotStats,
}: TrackingCardProps) {
  const mode = trackingMode || 'none'

  // Badge styling based on mode
  const badgeClass =
    mode === 'serialized'
      ? 'bg-blue-100 text-blue-700'
      : mode === 'lot_expiry'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-neutral-100 text-neutral-600'

  const badgeLabel =
    mode === 'serialized'
      ? 'Serialized'
      : mode === 'lot_expiry'
      ? 'Lot / Expiry'
      : 'Standard'

  return (
    <ItemDetailCard title="Tracking & Traceability" icon={<ScanLine className="h-5 w-5" />}>
      <div className="space-y-3 text-sm">
        {/* Tracking Mode Badge */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-500">Tracking Mode</span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Serialized Items Stats */}
        {mode === 'serialized' && serialStats && serialStats.total > 0 && (
          <>
            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Serial Numbers</span>
                <span className="font-semibold text-neutral-900">{serialStats.total}</span>
              </div>
              <div className="ml-3 space-y-1">
                {serialStats.available > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Available</span>
                    <span className="text-green-600">{serialStats.available}</span>
                  </div>
                )}
                {serialStats.checked_out > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Checked Out</span>
                    <span className="text-amber-600">{serialStats.checked_out}</span>
                  </div>
                )}
                {serialStats.sold > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Sold</span>
                    <span className="text-neutral-500">{serialStats.sold}</span>
                  </div>
                )}
                {serialStats.damaged > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Damaged</span>
                    <span className="text-red-600">{serialStats.damaged}</span>
                  </div>
                )}
                {serialStats.returned > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Returned</span>
                    <span className="text-neutral-500">{serialStats.returned}</span>
                  </div>
                )}
              </div>
            </div>
            <Link
              href={`/inventory/${itemId}/edit#tracking`}
              className="flex items-center justify-end gap-1 text-xs text-pickle-600 hover:text-pickle-700 pt-1"
            >
              View All Serials
              <ChevronRight className="h-3 w-3" />
            </Link>
          </>
        )}

        {/* Serialized but no serials yet */}
        {mode === 'serialized' && (!serialStats || serialStats.total === 0) && (
          <p className="text-xs text-neutral-400 pt-1 border-t border-neutral-100">
            No serial numbers assigned yet. Add serials in edit mode.
          </p>
        )}

        {/* Legacy Serial Number (for items with old serial_number field) */}
        {serialNumber && mode !== 'serialized' && (
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-neutral-500">Serial Number</span>
            <span className="font-mono font-medium text-neutral-900">{serialNumber}</span>
          </div>
        )}

        {/* Lot/Expiry Items Stats */}
        {mode === 'lot_expiry' && lotStats && lotStats.activeLots > 0 && (
          <>
            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Active Lots</span>
                <span className="font-semibold text-neutral-900">{lotStats.activeLots}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Quantity</span>
                <span className="font-medium text-neutral-900">
                  {lotStats.totalQuantity.toLocaleString()} units
                </span>
              </div>
            </div>

            {/* Expiry Status Section */}
            {(lotStats.expiredCount > 0 ||
              lotStats.expiringSoonCount > 0 ||
              lotStats.expiringCount > 0) && (
              <div className="border-t border-neutral-100 pt-3 space-y-1.5">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Expiry Status
                </span>
                <div className="ml-1 space-y-1">
                  {lotStats.expiredCount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span className="text-neutral-500">Expired</span>
                      </span>
                      <span className="text-red-600 font-medium">
                        {lotStats.expiredCount} lot{lotStats.expiredCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {lotStats.expiringSoonCount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span className="text-neutral-500">Expiring Soon</span>
                      </span>
                      <span className="text-amber-600 font-medium">
                        {lotStats.expiringSoonCount} lot{lotStats.expiringSoonCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {lotStats.expiringCount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                        <span className="text-neutral-500">Expiring (30d)</span>
                      </span>
                      <span className="text-yellow-600 font-medium">
                        {lotStats.expiringCount} lot{lotStats.expiringCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Expiry */}
            {lotStats.daysUntilNextExpiry !== null && (
              <div className="flex justify-between pt-1">
                <span className="text-neutral-500 text-xs">Next Expiry</span>
                <span
                  className={`text-xs font-medium ${
                    lotStats.daysUntilNextExpiry <= 0
                      ? 'text-red-600'
                      : lotStats.daysUntilNextExpiry <= 7
                      ? 'text-amber-600'
                      : lotStats.daysUntilNextExpiry <= 30
                      ? 'text-yellow-600'
                      : 'text-neutral-600'
                  }`}
                >
                  {lotStats.daysUntilNextExpiry <= 0
                    ? 'Expired'
                    : lotStats.daysUntilNextExpiry === 1
                    ? 'Tomorrow'
                    : `in ${lotStats.daysUntilNextExpiry} days`}
                </span>
              </div>
            )}

            <Link
              href={`/inventory/${itemId}/edit#tracking`}
              className="flex items-center justify-end gap-1 text-xs text-pickle-600 hover:text-pickle-700 pt-1"
            >
              View Lots
              <ChevronRight className="h-3 w-3" />
            </Link>
          </>
        )}

        {/* Lot/Expiry but no lots yet */}
        {mode === 'lot_expiry' && (!lotStats || lotStats.activeLots === 0) && (
          <p className="text-xs text-neutral-400 pt-1 border-t border-neutral-100">
            No lots created yet. Add lots to track batches and expiry dates.
          </p>
        )}

        {/* Standard Mode */}
        {mode === 'none' && !serialNumber && (
          <p className="text-xs text-neutral-400">
            Standard quantity-based tracking without serial or lot numbers.
          </p>
        )}
      </div>
    </ItemDetailCard>
  )
}

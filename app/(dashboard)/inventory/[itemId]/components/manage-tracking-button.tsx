'use client'

import { useState } from 'react'
import { ChevronRight, Hash, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ManageTrackingModal } from '@/components/tracking/ManageTrackingModal'

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
  expiringSoonCount: number
  expiringCount: number
  daysUntilNextExpiry: number | null
}

interface ManageTrackingButtonProps {
  itemId: string
  itemName: string
  trackingMode: 'none' | 'serialized' | 'lot_expiry'
  serialStats?: SerialStats | null
  lotStats?: LotStats | null
}

export function ManageTrackingButton({
  itemId,
  itemName,
  trackingMode,
  serialStats,
  lotStats,
}: ManageTrackingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (trackingMode === 'none') {
    return null
  }

  const isSerial = trackingMode === 'serialized'
  const trackingType = isSerial ? 'serial' : 'batch'

  // Status summary for display
  let statusText = ''
  let Icon = isSerial ? Hash : Layers

  if (isSerial && serialStats) {
    const parts = []
    if (serialStats.available > 0) {
      parts.push(`${serialStats.available} available`)
    }
    if (serialStats.checked_out > 0) {
      parts.push(`${serialStats.checked_out} checked out`)
    }
    statusText = parts.join(' · ') || 'No serials'
  } else if (!isSerial && lotStats) {
    const parts = []
    if (lotStats.activeLots > 0) {
      parts.push(`${lotStats.activeLots} active lots`)
    }
    if (lotStats.expiringSoonCount > 0) {
      parts.push(`${lotStats.expiringSoonCount} expiring soon`)
    }
    statusText = parts.join(' · ') || 'No lots'
  }

  const totalCount = isSerial
    ? (serialStats?.total ?? 0)
    : (lotStats?.activeLots ?? 0)

  return (
    <>
      <div className="border-t border-neutral-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-neutral-400" />
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase">
                {isSerial ? 'Serials' : 'Batches'}
                <span className="ml-2 text-neutral-900">{totalCount}</span>
              </p>
              {statusText && (
                <p className="text-sm text-neutral-600 mt-0.5">
                  {isSerial && serialStats ? (
                    <>
                      {serialStats.available > 0 && (
                        <span className="text-green-600">{serialStats.available} available</span>
                      )}
                      {serialStats.available > 0 && serialStats.checked_out > 0 && (
                        <span className="mx-1.5 text-neutral-300">·</span>
                      )}
                      {serialStats.checked_out > 0 && (
                        <span className="text-amber-600">{serialStats.checked_out} checked out</span>
                      )}
                    </>
                  ) : !isSerial && lotStats ? (
                    <>
                      {lotStats.activeLots > 0 && (
                        <span className="text-green-600">{lotStats.activeLots} active</span>
                      )}
                      {lotStats.activeLots > 0 && lotStats.expiringSoonCount > 0 && (
                        <span className="mx-1.5 text-neutral-300">·</span>
                      )}
                      {lotStats.expiringSoonCount > 0 && (
                        <span className="text-amber-600">{lotStats.expiringSoonCount} expiring soon</span>
                      )}
                    </>
                  ) : null}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-primary hover:text-primary"
          >
            Manage
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <ManageTrackingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemId={itemId}
        itemName={itemName}
        trackingType={trackingType}
      />
    </>
  )
}

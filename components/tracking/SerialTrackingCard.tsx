'use client'

import { useState } from 'react'
import { Hash, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ManageTrackingModal } from './ManageTrackingModal'

interface SerialStats {
  total: number
  available: number
  checked_out: number
  sold: number
  damaged: number
  returned: number
}

interface SerialTrackingCardProps {
  itemId: string
  itemName: string
  stats: SerialStats | null
  className?: string
}

function StatusLine({ stats }: { stats: SerialStats | null }) {
  if (!stats || stats.total === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Add serial numbers to track individual units
      </p>
    )
  }

  const { available, checked_out } = stats

  // All available
  if (checked_out === 0 && available > 0) {
    return (
      <p className="text-sm text-neutral-600">
        <span className="text-green-600">{available} available</span>
      </p>
    )
  }

  // All checked out
  if (available === 0 && checked_out > 0) {
    return (
      <p className="text-sm text-amber-600">
        All checked out
      </p>
    )
  }

  // Mixed
  return (
    <p className="text-sm text-neutral-600">
      <span className="text-green-600">{available} available</span>
      <span className="mx-2 text-neutral-300">·</span>
      <span className="text-amber-600">{checked_out} checked out</span>
    </p>
  )
}

export function SerialTrackingCard({
  itemId,
  itemName,
  stats,
  className,
}: SerialTrackingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const totalSerials = stats?.total ?? 0

  return (
    <>
      <Card className={cn('rounded-xl shadow-none', className)}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-neutral-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Serials
            </h2>
          </div>
          <span className="text-sm text-neutral-500">
            Total: <span className="font-semibold text-neutral-900">{totalSerials}</span>
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <StatusLine stats={stats} />
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
      </Card>

      <ManageTrackingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemId={itemId}
        itemName={itemName}
        trackingType="serial"
      />
    </>
  )
}

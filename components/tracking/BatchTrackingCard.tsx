'use client'

import { useState } from 'react'
import { Package, ChevronRight, AlertCircle, AlertTriangle, Calendar, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ManageTrackingModal } from './ManageTrackingModal'

interface BatchStats {
  totalQuantity: number
  activeBatches: number
  expiredCount: number
  expiringSoonCount: number // within 7 days
  expiringMonthCount: number // within 30 days
}

interface BatchTrackingCardProps {
  itemId: string
  itemName: string
  stats: BatchStats | null
  className?: string
}

type StatusPriority = 'expired' | 'expiring_soon' | 'expiring_month' | 'ok' | 'empty'

function getStatusPriority(stats: BatchStats | null): StatusPriority {
  if (!stats || stats.activeBatches === 0) return 'empty'
  if (stats.expiredCount > 0) return 'expired'
  if (stats.expiringSoonCount > 0) return 'expiring_soon'
  if (stats.expiringMonthCount > 0) return 'expiring_month'
  return 'ok'
}

function StatusLine({ stats }: { stats: BatchStats | null }) {
  const priority = getStatusPriority(stats)

  switch (priority) {
    case 'expired':
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{stats!.expiredCount} expired</span>
        </div>
      )
    case 'expiring_soon':
      return (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span>{stats!.expiringSoonCount} expiring soon</span>
        </div>
      )
    case 'expiring_month':
      return (
        <div className="flex items-center gap-2 text-sm text-yellow-600">
          <Calendar className="h-4 w-4" />
          <span>{stats!.expiringMonthCount} expiring this month</span>
        </div>
      )
    case 'ok':
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All batches OK</span>
        </div>
      )
    case 'empty':
    default:
      return (
        <p className="text-sm text-neutral-500">
          Add batches to track expiry dates
        </p>
      )
  }
}

export function BatchTrackingCard({
  itemId,
  itemName,
  stats,
  className,
}: BatchTrackingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const totalQuantity = stats?.totalQuantity ?? 0

  return (
    <>
      <Card className={cn('rounded-xl shadow-none', className)}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-neutral-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Batches
            </h2>
          </div>
          <span className="text-sm text-neutral-500">
            Total: <span className="font-semibold text-neutral-900">{totalQuantity}</span>
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
        trackingType="batch"
      />
    </>
  )
}

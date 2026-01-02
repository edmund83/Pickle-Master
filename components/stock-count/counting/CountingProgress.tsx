'use client'

import { Package, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountingProgressProps {
  total: number
  counted: number
  pending: number
  variance: number
  compact?: boolean
}

export function CountingProgress({
  total,
  counted,
  pending,
  variance,
  compact = false,
}: CountingProgressProps) {
  const percent = total > 0 ? Math.round((counted / total) * 100) : 0

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Progress</span>
          <span className="font-semibold text-neutral-900">
            {counted} of {total} ({percent}%)
          </span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Counting Progress</span>
          <span className="text-lg font-bold text-neutral-900 tabular-nums">
            {percent}%
          </span>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              percent === 100 ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard
          icon={Package}
          label="Total"
          value={total}
          color="neutral"
        />
        <StatCard
          icon={CheckCircle}
          label="Counted"
          value={counted}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pending}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Variance"
          value={variance}
          color="amber"
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  color: 'neutral' | 'green' | 'blue' | 'amber' | 'red'
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    neutral: 'bg-neutral-50 text-neutral-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className={cn('p-2 sm:p-3 rounded-xl text-center', colorClasses[color])}>
      <Icon className="h-4 w-4 mx-auto mb-1" />
      <p className="text-lg sm:text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  )
}

'use client'

import { Package, AlertTriangle, XCircle, TrendingUp, Percent } from 'lucide-react'
import { useFormatting } from '@/hooks/useFormatting'

interface Stats {
  totalItems: number
  totalValue: number
  totalProfit: number
  lowStock: number
  outOfStock: number
}

interface FormattedStatCardsProps {
  stats: Stats | null
}

export function FormattedStatCards({ stats }: FormattedStatCardsProps) {
  const { formatCurrency } = useFormatting()

  return (
    <div className="grid gap-3 lg:gap-6 grid-cols-2 lg:grid-cols-5 mb-6 lg:mb-8">
      <StatCard
        title="Total Items"
        value={stats?.totalItems || 0}
        icon={Package}
        color="blue"
      />
      <StatCard
        title="Total Value"
        value={formatCurrency(stats?.totalValue || 0)}
        icon={TrendingUp}
        color="green"
      />
      <StatCard
        title="Potential Profit"
        value={formatCurrency(stats?.totalProfit || 0)}
        icon={Percent}
        color="purple"
      />
      <StatCard
        title="Low Stock"
        value={stats?.lowStock || 0}
        icon={AlertTriangle}
        color="yellow"
      />
      <StatCard
        title="Out of Stock"
        value={stats?.outOfStock || 0}
        icon={XCircle}
        color="red"
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  const borderColors = {
    blue: 'border-blue-200',
    green: 'border-green-200',
    yellow: 'border-yellow-200',
    red: 'border-red-200',
    purple: 'border-purple-200',
  }

  return (
    <div className={`rounded-2xl lg:rounded-xl border-2 lg:border ${borderColors[color]} border-neutral-200 bg-white p-4 lg:p-6 transition-all active:scale-[0.98]`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
        <div className={`flex h-14 w-14 lg:h-12 lg:w-12 items-center justify-center rounded-2xl lg:rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-7 w-7 lg:h-6 lg:w-6" />
        </div>
        <div>
          <p className="text-xs lg:text-sm text-neutral-500 font-medium">{title}</p>
          <p className="text-2xl lg:text-2xl font-bold text-neutral-900 tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  )
}

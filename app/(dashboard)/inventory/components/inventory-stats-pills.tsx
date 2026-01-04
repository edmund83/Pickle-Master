'use client'

import { Folder, Package, Hash, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InventoryStatsCardsProps {
  folderCount: number
  itemCount: number
  totalQuantity: number
  totalValue: number
  currency?: string
  className?: string
}

export function InventoryStatsCards({
  folderCount,
  itemCount,
  totalQuantity,
  totalValue,
  currency = 'RM',
  className,
}: InventoryStatsCardsProps) {
  const formatNumber = (num: number) => num.toLocaleString()

  const formatCurrency = (num: number) =>
    `${currency} ${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const stats = [
    { label: 'Folders', value: formatNumber(folderCount), icon: Folder },
    { label: 'Items', value: formatNumber(itemCount), icon: Package },
    { label: 'Units', value: formatNumber(totalQuantity), icon: Hash },
    { label: 'Value', value: formatCurrency(totalValue), icon: DollarSign },
  ]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            'flex items-center gap-2',
            'h-10 rounded-lg px-3',
            'bg-primary/5 border border-primary/10',
            'transition-all hover:bg-primary/10 hover:border-primary/20'
          )}
        >
          <stat.icon className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex flex-col justify-center leading-none">
            <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
              {stat.label}
            </span>
            <span className="text-xs font-bold text-neutral-900">{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Keep old export name for backwards compatibility
export { InventoryStatsCards as InventoryStatsPills }

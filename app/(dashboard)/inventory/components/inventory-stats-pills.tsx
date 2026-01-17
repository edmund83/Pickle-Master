'use client'

import { Folder, Package, Hash, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'

interface InventoryStatsCardsProps {
  folderCount: number
  itemCount: number
  totalQuantity: number
  totalValue: number
  todayNetMovement?: number | null // positive = net in, negative = net out, null = loading
  className?: string
}

export function InventoryStatsCards({
  folderCount,
  itemCount,
  totalQuantity,
  totalValue,
  todayNetMovement,
  className,
}: InventoryStatsCardsProps) {
  const { formatCurrency } = useFormatting()
  const formatNumber = (num: number) => num.toLocaleString()

  // Determine movement display
  const getMovementDisplay = () => {
    if (todayNetMovement === null || todayNetMovement === undefined) {
      return { value: '—', icon: Minus, color: 'text-neutral-400', bg: 'bg-neutral-100 border-neutral-200' }
    }
    if (todayNetMovement > 0) {
      return {
        value: `+${formatNumber(todayNetMovement)}`,
        icon: TrendingUp,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 border-emerald-200'
      }
    }
    if (todayNetMovement < 0) {
      return {
        value: formatNumber(todayNetMovement),
        icon: TrendingDown,
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200'
      }
    }
    return { value: '0', icon: Minus, color: 'text-neutral-500', bg: 'bg-neutral-100 border-neutral-200' }
  }

  const movement = getMovementDisplay()

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

      {/* Today's Net Movement Card */}
      <div
        className={cn(
          'flex items-center gap-2',
          'h-10 rounded-lg px-3',
          'border',
          movement.bg,
          'transition-all'
        )}
      >
        <movement.icon className={cn('h-4 w-4 flex-shrink-0', movement.color)} />
        <div className="flex flex-col justify-center leading-none">
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
            Today
          </span>
          <span className={cn('text-xs font-bold', movement.color)}>{movement.value}</span>
        </div>
      </div>
    </div>
  )
}

// Keep old export name for backwards compatibility
export { InventoryStatsCards as InventoryStatsPills }

'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'

export type AlertFilter = 'all' | 'low_stock' | 'out_of_stock' | 'expiring' | 'expired'

interface InventoryAlertIndicatorProps {
  lowStockCount: number
  outOfStockCount: number
  expiringCount?: number
  expiredCount?: number
  onFilterAlerts: (filter: AlertFilter) => void
  className?: string
}

interface AlertState {
  totalCount: number
  severity: 'none' | 'warning' | 'critical'
  message: string
}

function getAlertState(
  lowStockCount: number,
  outOfStockCount: number,
  expiringCount: number,
  expiredCount: number
): AlertState {
  const totalCount = lowStockCount + outOfStockCount + expiringCount + expiredCount

  if (totalCount === 0) {
    return { totalCount: 0, severity: 'none', message: '' }
  }

  // Critical: Has expired items or out of stock
  if (expiredCount > 0 || outOfStockCount > 0) {
    return {
      totalCount,
      severity: 'critical',
      message: `${totalCount} items need attention`,
    }
  }

  // Warning: Only low stock or expiring soon
  return {
    totalCount,
    severity: 'warning',
    message: `${totalCount} items to check`,
  }
}

// Zoe-style Avatar
function ZoeAlertAvatar() {
  return (
    <div className={cn(
      'flex items-center justify-center',
      'h-7 w-7 rounded-full',
      'bg-gradient-to-br from-violet-500 to-purple-600',
      'text-white text-xs font-semibold',
      'shadow-sm'
    )}>
      Z
    </div>
  )
}

export function InventoryAlertIndicator({
  lowStockCount,
  outOfStockCount,
  expiringCount = 0,
  expiredCount = 0,
  onFilterAlerts,
  className,
}: InventoryAlertIndicatorProps) {
  const alertState = getAlertState(lowStockCount, outOfStockCount, expiringCount, expiredCount)

  // Don't render if no alerts
  if (alertState.severity === 'none') {
    return null
  }

  const alertItems = [
    { label: 'Out of Stock', count: outOfStockCount, color: 'bg-red-500', filter: 'out_of_stock' as AlertFilter },
    { label: 'Low Stock', count: lowStockCount, color: 'bg-amber-500', filter: 'low_stock' as AlertFilter },
    { label: 'Expiring Soon', count: expiringCount, color: 'bg-orange-500', filter: 'expiring' as AlertFilter },
    { label: 'Expired', count: expiredCount, color: 'bg-red-600', filter: 'expired' as AlertFilter },
  ].filter(item => item.count > 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            'flex items-center gap-2.5',
            'h-10 pl-1.5 pr-3 rounded-full',
            'bg-gradient-to-r from-violet-50 to-purple-50',
            'border border-violet-200/60',
            'cursor-pointer',
            'transition-all duration-300',
            'hover:shadow-md hover:border-violet-300',
            'hover:from-violet-100 hover:to-purple-100',
            'active:scale-[0.98]',
            className
          )}
        >
          {/* Zoe Avatar with notification dot */}
          <div className="relative">
            <ZoeAlertAvatar />
            {/* Pulsing notification dot */}
            <span className={cn(
              'absolute -top-0.5 -right-0.5',
              'h-3 w-3 rounded-full',
              'border-2 border-white',
              alertState.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500',
              'animate-pulse'
            )} />
          </div>

          {/* Message */}
          <span className="text-sm font-medium text-violet-700">
            {alertState.message}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden rounded-xl shadow-lg">
        {/* Header with Zoe branding */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
          <ZoeAlertAvatar />
          <div>
            <h3 className="text-sm font-semibold text-violet-900">Zoe&apos;s Inventory Alert</h3>
            <p className="text-xs text-violet-600">Here&apos;s what needs your attention</p>
          </div>
        </div>

        {/* Alert List */}
        <div className="py-2">
          {alertItems.map((item) => (
            <button
              key={item.filter}
              onClick={() => onFilterAlerts(item.filter)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3',
                'hover:bg-violet-50 transition-colors',
                'text-left group'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  item.color
                )} />
                <span className="text-sm text-neutral-700 group-hover:text-violet-700">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                  {item.count}
                </span>
                <span className="text-xs text-neutral-400 group-hover:text-violet-500">
                  View →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer with action */}
        <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-t border-violet-100">
          <button
            onClick={() => onFilterAlerts('all')}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'py-2 px-4 rounded-lg',
              'bg-violet-600 hover:bg-violet-700',
              'text-white text-sm font-medium',
              'transition-colors'
            )}
          >
            <Sparkles className="h-4 w-4" />
            Show all {alertState.totalCount} items
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

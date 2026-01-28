import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ColorScheme = 'blue' | 'green' | 'purple' | 'amber'

interface UsageStatCardProps {
  label: string
  icon: LucideIcon
  current: number
  max: number
  colorScheme: ColorScheme
  className?: string
}

const colorSchemes = {
  blue: {
    border: 'border border-neutral-200',
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    progress: 'bg-primary/80',
    unlimited: 'bg-neutral-200',
  },
  green: {
    border: 'border border-neutral-200',
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    progress: 'bg-primary/80',
    unlimited: 'bg-neutral-200',
  },
  purple: {
    border: 'border border-neutral-200',
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    progress: 'bg-primary/80',
    unlimited: 'bg-neutral-200',
  },
  amber: {
    border: 'border border-neutral-200',
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    progress: 'bg-primary/80',
    unlimited: 'bg-neutral-200',
  },
}

function isUnlimited(value: number): boolean {
  return value === -1 || value === null || value === undefined || value === 0
}

function getUsagePercent(current: number, max: number): number {
  if (isUnlimited(max)) return 0
  return Math.min(100, Math.round((current / max) * 100))
}

function getProgressColor(percent: number, defaultColor: string): string {
  if (percent > 90) return 'bg-red-500'
  if (percent > 75) return 'bg-yellow-500'
  return defaultColor
}

export function UsageStatCard({
  label,
  icon: Icon,
  current,
  max,
  colorScheme,
  className,
}: UsageStatCardProps) {
  const colors = colorSchemes[colorScheme]
  const unlimited = isUnlimited(max)
  const percent = getUsagePercent(current, max)
  const progressColor = getProgressColor(percent, colors.progress)
  const showWarning = !unlimited && percent > 80

  return (
    <div className={cn('rounded-xl bg-white p-5', colors.border, className)}>
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            colors.iconBg
          )}
        >
          <Icon className={cn('h-6 w-6', colors.iconColor)} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-neutral-900">
            {current.toLocaleString()}
          </p>
          <p className="text-sm text-neutral-500">
            of {unlimited ? 'unlimited' : max.toLocaleString()}
          </p>
        </div>
      </div>

      <p className="mb-2 text-sm font-medium text-neutral-600">{label}</p>

      {unlimited ? (
        <div className={cn('h-2 rounded-full', colors.unlimited)} />
      ) : (
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progressColor
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {showWarning && (
        <p className="mt-2 text-xs text-amber-700">
          {percent >= 90 ? 'Limit reached' : 'Approaching limit'} - consider upgrading
        </p>
      )}
    </div>
  )
}

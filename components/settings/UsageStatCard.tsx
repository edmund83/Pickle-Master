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
    gradient: 'from-blue-500/20 to-blue-500/40',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    progress: 'bg-blue-500',
    unlimitedGradient: 'from-blue-200 via-blue-300 to-blue-200',
  },
  green: {
    gradient: 'from-green-500/20 to-green-500/40',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    progress: 'bg-green-500',
    unlimitedGradient: 'from-green-200 via-green-300 to-green-200',
  },
  purple: {
    gradient: 'from-purple-500/20 to-purple-500/40',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    progress: 'bg-purple-500',
    unlimitedGradient: 'from-purple-200 via-purple-300 to-purple-200',
  },
  amber: {
    gradient: 'from-amber-500/20 to-amber-500/40',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    progress: 'bg-amber-500',
    unlimitedGradient: 'from-amber-200 via-amber-300 to-amber-200',
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
    <div
      className={cn(
        'rounded-xl bg-gradient-to-r p-[1px]',
        colors.gradient,
        className
      )}
    >
      <div className="h-full rounded-[11px] bg-white p-5">
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
          <div
            className={cn(
              'h-2 rounded-full bg-gradient-to-r',
              colors.unlimitedGradient
            )}
          />
        ) : (
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
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
          <p className="mt-2 text-xs text-yellow-600">
            {percent >= 90 ? 'Limit reached' : 'Approaching limit'} - consider upgrading
          </p>
        )}
      </div>
    </div>
  )
}

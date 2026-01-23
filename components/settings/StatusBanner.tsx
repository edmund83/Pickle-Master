import { LucideIcon, Sparkles, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type BannerSeverity = 'info' | 'warning' | 'danger'

interface StatusBannerProps {
  severity: BannerSeverity
  title: string
  description: string
  ctaText?: string
  ctaHref?: string
  onCtaClick?: () => void
  icon?: LucideIcon
  className?: string
}

const severityConfig = {
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-primary/10',
    border: 'border border-primary/20',
    iconBg: 'bg-primary text-white',
    titleColor: 'text-primary',
    descColor: 'text-primary/80',
    defaultIcon: Sparkles,
    buttonVariant: 'default' as const,
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
    border: 'border border-orange-200',
    iconBg: 'bg-orange-500 text-white',
    titleColor: 'text-orange-700',
    descColor: 'text-orange-600',
    defaultIcon: AlertTriangle,
    buttonVariant: 'default' as const,
  },
  danger: {
    bg: 'bg-gradient-to-r from-red-50 to-red-100/50',
    border: 'border border-red-200',
    iconBg: 'bg-red-500 text-white',
    titleColor: 'text-red-700',
    descColor: 'text-red-600',
    defaultIcon: XCircle,
    buttonVariant: 'destructive' as const,
  },
}

export function StatusBanner({
  severity,
  title,
  description,
  ctaText,
  ctaHref,
  onCtaClick,
  icon,
  className,
}: StatusBannerProps) {
  const config = severityConfig[severity]
  const Icon = icon || config.defaultIcon

  const handleClick = () => {
    if (onCtaClick) {
      onCtaClick()
    } else if (ctaHref) {
      const element = document.querySelector(ctaHref)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm',
            config.iconBg
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('font-semibold', config.titleColor)}>{title}</p>
          <p className={cn('text-sm', config.descColor)}>{description}</p>
        </div>
        {ctaText && (
          <Button
            variant={config.buttonVariant}
            onClick={handleClick}
            className="shrink-0"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  )
}

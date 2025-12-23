import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ItemDetailCardProps {
  title: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  titleClassName?: string
  contentClassName?: string
}

export function ItemDetailCard({
  title,
  icon,
  action,
  children,
  className,
  headerClassName,
  titleClassName,
  contentClassName,
}: ItemDetailCardProps) {
  return (
    <Card className={cn('rounded-xl shadow-none', className)}>
      <div
        className={cn(
          'flex items-start justify-between gap-3 border-b border-neutral-100 px-6 py-4',
          headerClassName
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon ? <span className="text-neutral-400">{icon}</span> : null}
          <h2
            className={cn(
              'truncate text-xs font-semibold uppercase tracking-wide text-neutral-500',
              titleClassName
            )}
          >
            {title}
          </h2>
        </div>
        {action ? <div className="flex flex-shrink-0 items-center">{action}</div> : null}
      </div>
      <div className={cn('px-6 py-5', contentClassName)}>{children}</div>
    </Card>
  )
}

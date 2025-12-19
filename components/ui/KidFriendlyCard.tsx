'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface KidFriendlyCardProps {
  children: ReactNode
  onClick?: () => void
  variant?: CardVariant
  className?: string
  disabled?: boolean
  selected?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'border-neutral-200 bg-white hover:border-neutral-300',
  success: 'border-green-200 bg-green-50 hover:border-green-300',
  warning: 'border-amber-200 bg-amber-50 hover:border-amber-300',
  danger: 'border-red-200 bg-red-50 hover:border-red-300',
  info: 'border-blue-200 bg-blue-50 hover:border-blue-300',
}

export function KidFriendlyCard({
  children,
  onClick,
  variant = 'default',
  className,
  disabled = false,
  selected = false,
}: KidFriendlyCardProps) {
  const isInteractive = !!onClick && !disabled

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      className={cn(
        // Base styles
        'relative',
        'min-h-[120px]',
        'rounded-3xl',
        'border-2',
        'p-5',
        'shadow-sm',
        // Transitions
        'transition-all duration-200 ease-out',
        // Variant styles
        variantStyles[variant],
        // Interactive states
        isInteractive && [
          'cursor-pointer',
          'active:scale-[0.98]',
          'hover:shadow-md',
        ],
        // Selected state
        selected && [
          'border-pickle-500',
          'ring-2 ring-pickle-200',
          'bg-pickle-50',
        ],
        // Disabled state
        disabled && [
          'opacity-50',
          'pointer-events-none',
        ],
        className
      )}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

/**
 * Item card variant for inventory items
 */
interface ItemCardProps {
  name: string
  quantity: number
  unit?: string
  imageUrl?: string
  status?: 'in_stock' | 'low_stock' | 'out_of_stock'
  onClick?: () => void
  className?: string
}

const statusConfig = {
  in_stock: {
    variant: 'success' as CardVariant,
    label: 'In Stock',
    color: 'text-green-600 bg-green-100',
  },
  low_stock: {
    variant: 'warning' as CardVariant,
    label: 'Low Stock',
    color: 'text-amber-600 bg-amber-100',
  },
  out_of_stock: {
    variant: 'danger' as CardVariant,
    label: 'Out of Stock',
    color: 'text-red-600 bg-red-100',
  },
}

export function KidFriendlyItemCard({
  name,
  quantity,
  unit = '',
  imageUrl,
  status = 'in_stock',
  onClick,
  className,
}: ItemCardProps) {
  const config = statusConfig[status]

  return (
    <KidFriendlyCard
      variant={config.variant}
      onClick={onClick}
      className={cn('flex items-center gap-4', className)}
    >
      {/* Image */}
      <div
        className={cn(
          'flex-shrink-0',
          'w-20 h-20',
          'rounded-2xl',
          'bg-white',
          'border border-neutral-200',
          'flex items-center justify-center',
          'overflow-hidden'
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl">📦</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-neutral-900 truncate">
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-3xl font-bold tabular-nums text-neutral-900">
            {quantity}
          </span>
          {unit && (
            <span className="text-lg text-neutral-500">{unit}</span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div
        className={cn(
          'absolute top-3 right-3',
          'px-3 py-1',
          'rounded-full',
          'text-xs font-semibold',
          config.color
        )}
      >
        {config.label}
      </div>
    </KidFriendlyCard>
  )
}

/**
 * Action card for dashboard shortcuts
 */
interface ActionCardProps {
  icon: ReactNode
  label: string
  description?: string
  onClick: () => void
  color?: 'pickle' | 'blue' | 'green' | 'amber' | 'red'
  className?: string
}

const colorStyles = {
  pickle: 'bg-pickle-50 text-pickle-600 hover:bg-pickle-100',
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  green: 'bg-green-50 text-green-600 hover:bg-green-100',
  amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  red: 'bg-red-50 text-red-600 hover:bg-red-100',
}

export function KidFriendlyActionCard({
  icon,
  label,
  description,
  onClick,
  color = 'pickle',
  className,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center',
        'min-h-[120px] p-5',
        'rounded-3xl',
        'border-2 border-transparent',
        'transition-all duration-200',
        'active:scale-95',
        colorStyles[color],
        className
      )}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <span className="font-semibold text-lg">{label}</span>
      {description && (
        <span className="text-sm opacity-70 mt-1">{description}</span>
      )}
    </button>
  )
}

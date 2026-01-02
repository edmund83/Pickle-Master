'use client'

import { LucideIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  icon?: LucideIcon
  label?: string
  onClick: () => void
  variant?: 'primary' | 'scan' | 'success'
  className?: string
  disabled?: boolean
}

const variantStyles = {
  primary: 'bg-primary hover:bg-primary text-white shadow-primary/30',
  scan: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30',
  success: 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30',
}

export function FloatingActionButton({
  icon: Icon = Plus,
  label,
  onClick,
  variant = 'primary',
  className,
  disabled = false,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Positioning - above bottom nav
        'fixed z-40',
        'right-4',
        'bottom-[calc(80px+env(safe-area-inset-bottom,0px))]',
        // Only show on mobile/tablet
        'lg:hidden',
        // Base styles
        'flex items-center justify-center gap-2',
        'rounded-2xl',
        'shadow-lg',
        'transition-all duration-200 ease-out',
        // Size - large touch target
        label ? 'h-14 px-6' : 'h-16 w-16',
        // Variant styles
        variantStyles[variant],
        // Interactive states
        'active:scale-95',
        'disabled:opacity-50 disabled:pointer-events-none',
        // Animation
        'animate-slide-up',
        className
      )}
      aria-label={label || 'Add'}
    >
      <Icon className="h-7 w-7" strokeWidth={2.5} />
      {label && (
        <span className="font-semibold text-base">{label}</span>
      )}
      {/* Pulse ring effect */}
      <span
        className={cn(
          'absolute inset-0 rounded-2xl',
          'animate-ping opacity-20',
          variant === 'primary' && 'bg-primary',
          variant === 'scan' && 'bg-blue-500',
          variant === 'success' && 'bg-green-500'
        )}
        style={{ animationDuration: '2s' }}
      />
    </button>
  )
}

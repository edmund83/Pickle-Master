'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'kid' | 'icon' | 'icon-lg' | 'icon-kid'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center whitespace-nowrap font-medium',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          // Touch feedback
          'active:scale-[0.97]',
          // Variant styles
          {
            'bg-primary text-white hover:bg-primary shadow-sm': variant === 'default',
            'bg-neutral-100 text-neutral-900 hover:bg-neutral-200': variant === 'secondary',
            'border border-neutral-300 bg-white hover:bg-neutral-50': variant === 'outline',
            'hover:bg-neutral-100': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline': variant === 'link',
            'bg-red-500 text-white hover:bg-red-600 shadow-sm': variant === 'destructive',
          },
          // Size styles
          {
            // Standard sizes
            'h-10 px-4 py-2 text-sm rounded-lg': size === 'default',
            'h-8 px-3 text-xs rounded-lg': size === 'sm',
            'h-12 px-6 text-base rounded-lg': size === 'lg',
            // Extra large - Apple minimum touch target (56px)
            'h-14 px-8 text-lg rounded-xl': size === 'xl',
            // Kid-friendly - extra large touch target (64px)
            'h-16 px-10 text-xl rounded-2xl font-semibold': size === 'kid',
            // Icon buttons
            'h-10 w-10 rounded-lg': size === 'icon',
            'h-14 w-14 rounded-xl': size === 'icon-lg',
            'h-16 w-16 rounded-2xl': size === 'icon-kid',
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              'animate-spin',
              size === 'kid' || size === 'icon-kid' ? 'mr-3 h-6 w-6' :
              size === 'xl' || size === 'icon-lg' ? 'mr-2 h-5 w-5' :
              'mr-2 h-4 w-4'
            )}
          />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }

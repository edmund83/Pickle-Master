'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  ScanBarcode,
  ArrowUpFromLine,
  ArrowDownToLine,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FABAction {
  id: string
  icon: LucideIcon
  label: string
  description: string
  onClick: () => void
  color: string
  bgColor: string
}

interface MultiFABProps {
  className?: string
}

export function MultiFAB({ className }: MultiFABProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Close when clicking backdrop
  const handleBackdropClick = useCallback(() => {
    setIsOpen(false)
  }, [])

  const actions: FABAction[] = [
    {
      id: 'scan',
      icon: ScanBarcode,
      label: 'Scan',
      description: 'Scan barcode to find item',
      onClick: () => {
        setIsOpen(false)
        router.push('/scan')
      },
      color: 'text-white',
      bgColor: 'bg-blue-500',
    },
    {
      id: 'check-out',
      icon: ArrowUpFromLine,
      label: 'Check Out',
      description: 'Assign item to person or job',
      onClick: () => {
        setIsOpen(false)
        router.push('/scan?mode=checkout')
      },
      color: 'text-white',
      bgColor: 'bg-amber-500',
    },
    {
      id: 'check-in',
      icon: ArrowDownToLine,
      label: 'Check In',
      description: 'Return checked out items',
      onClick: () => {
        setIsOpen(false)
        router.push('/workflows/checkouts?filter=active')
      },
      color: 'text-white',
      bgColor: 'bg-green-500',
    },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* FAB Container */}
      <div
        className={cn(
          'fixed z-50 right-4',
          'bottom-[calc(80px+env(safe-area-inset-bottom,0px))]',
          'lg:hidden',
          className
        )}
      >
        {/* Action Items */}
        <div
          className={cn(
            'absolute bottom-20 right-0',
            'flex flex-col-reverse gap-3',
            'transition-all duration-300 ease-out',
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={cn(
                'flex items-center gap-3 justify-end',
                'transition-all duration-200',
                isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              {/* Label Card */}
              <button
                onClick={action.onClick}
                className={cn(
                  'flex flex-col items-end',
                  'px-4 py-2',
                  'bg-white rounded-xl shadow-lg',
                  'border border-neutral-100',
                  'active:scale-95 transition-transform',
                  'max-w-[200px]'
                )}
              >
                <span className="font-semibold text-neutral-900 text-sm">
                  {action.label}
                </span>
                <span className="text-xs text-neutral-500 text-right">
                  {action.description}
                </span>
              </button>

              {/* Icon Button */}
              <button
                onClick={action.onClick}
                className={cn(
                  'flex items-center justify-center',
                  'h-14 w-14',
                  'rounded-full shadow-lg',
                  'active:scale-90 transition-all duration-150',
                  action.bgColor,
                  action.color
                )}
                aria-label={action.label}
              >
                <action.icon className="h-6 w-6" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-center',
            'h-16 w-16',
            'rounded-2xl shadow-xl',
            'transition-all duration-300 ease-out',
            'active:scale-90',
            isOpen
              ? 'bg-neutral-800 rotate-45'
              : 'bg-pickle-500 rotate-0',
            'text-white'
          )}
          aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
          aria-expanded={isOpen}
        >
          <Plus className="h-8 w-8" strokeWidth={2.5} />
        </button>

        {/* Pulse Animation (only when closed) */}
        {!isOpen && (
          <span
            className={cn(
              'absolute inset-0 rounded-2xl',
              'animate-ping opacity-20 bg-pickle-500',
              'pointer-events-none'
            )}
            style={{ animationDuration: '2s' }}
          />
        )}
      </div>
    </>
  )
}

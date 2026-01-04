'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown, type LucideIcon } from 'lucide-react'

export interface SubmenuItem {
  name: string
  href: string
  icon?: LucideIcon
}

interface NavSubmenuProps {
  icon: LucideIcon
  label: string
  items: SubmenuItem[]
  sidebarExpanded: boolean
  storageKey?: string
}

export function NavSubmenu({
  icon: Icon,
  label,
  items,
  sidebarExpanded,
  storageKey = 'nav-submenu-expanded'
}: NavSubmenuProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showFlyout, setShowFlyout] = useState(false)
  const flyoutRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Check if any child route is active
  const isActive = items.some(item => pathname.startsWith(item.href))

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'true') {
      setIsOpen(true)
    }
  }, [storageKey])

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, String(isOpen))
  }, [isOpen, storageKey])

  // Auto-expand if a child route is active
  useEffect(() => {
    if (isActive && !isOpen) {
      setIsOpen(true)
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close flyout when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        flyoutRef.current &&
        triggerRef.current &&
        !flyoutRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowFlyout(false)
      }
    }

    if (showFlyout) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFlyout])

  // Collapsed sidebar: show flyout menu
  if (!sidebarExpanded) {
    return (
      <div className="relative">
        <button
          ref={triggerRef}
          onClick={() => setShowFlyout(!showFlyout)}
          onMouseEnter={() => setShowFlyout(true)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
            isActive
              ? 'bg-white text-primary'
              : 'text-white hover:bg-white/10'
          )}
          title={label}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </button>

        {/* Flyout menu */}
        {showFlyout && (
          <div
            ref={flyoutRef}
            className="absolute left-full top-0 z-50 ml-2"
            onMouseLeave={() => setShowFlyout(false)}
          >
            <div className="w-48 rounded-xl bg-primary py-2 shadow-lg">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                {label}
              </div>
              {items.map((item) => {
                const ItemIcon = item.icon
                const isItemActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowFlyout(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                      isItemActive
                        ? 'bg-white/20 text-white'
                        : 'text-white hover:bg-white/10'
                    )}
                  >
                    {ItemIcon && <ItemIcon className="h-4 w-4" />}
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Expanded sidebar: show collapsible submenu
  return (
    <div>
      {/* Header button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl px-3 transition-colors',
          isActive
            ? 'bg-white text-primary'
            : 'text-white hover:bg-white/10'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Submenu items */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="mt-1 space-y-0.5 pl-4">
          {items.map((item) => {
            const ItemIcon = item.icon
            const isItemActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isItemActive
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white hover:bg-white/10'
                )}
              >
                {ItemIcon && <ItemIcon className="h-4 w-4" />}
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

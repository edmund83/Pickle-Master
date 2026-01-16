'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ScanLine,
  ScanBarcode,
  Package,
  LayoutDashboard,
  PackageOpen,
  LayoutGrid,
  Settings,
  ClipboardList,
  ClipboardCheck,
  Plus,
  ArrowUpFromLine,
  ArrowDownToLine,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  icon: LucideIcon
  label: string
  color: string
  bgColor: string
  href: string
  position: { x: number; y: number }
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  activeIcon: React.ElementType
}

// Left side tabs (before center button)
const leftItems: NavItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: LayoutDashboard,
    activeIcon: LayoutGrid,
  },
  {
    name: 'Items',
    href: '/inventory',
    icon: Package,
    activeIcon: PackageOpen,
  },
]

// Right side tabs (after center button)
const rightItems: NavItem[] = [
  {
    name: 'Activity',
    href: '/reports',
    icon: ClipboardList,
    activeIcon: ClipboardCheck,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    activeIcon: Settings,
  },
]

// Quick actions that fan out from center button
const quickActions: QuickAction[] = [
  {
    id: 'scan',
    icon: ScanBarcode,
    label: 'Scan',
    color: 'text-white',
    bgColor: 'bg-blue-500',
    href: '/scan',
    position: { x: 0, y: -80 }, // Center
  },
  {
    id: 'new-item',
    icon: Package,
    label: 'New',
    color: 'text-white',
    bgColor: 'bg-primary',
    href: '/inventory/new',
    position: { x: 0, y: -150 }, // Top center
  },
  {
    id: 'check-out',
    icon: ArrowUpFromLine,
    label: 'Out',
    color: 'text-white',
    bgColor: 'bg-amber-500',
    href: '/scan?mode=checkout',
    position: { x: 70, y: -115 }, // Top right
  },
  {
    id: 'check-in',
    icon: ArrowDownToLine,
    label: 'In',
    color: 'text-white',
    bgColor: 'bg-green-500',
    href: '/tasks/checkouts?filter=active',
    position: { x: -70, y: -115 }, // Top left
  },
]

export function BottomNavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const isOnScanPage = pathname === '/scan' || pathname.startsWith('/scan/')

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false)
    }
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isExpanded])

  // Close menu when route changes
  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

  const handleActionClick = useCallback((href: string) => {
    setIsExpanded(false)
    router.push(href)
  }, [router])

  const handleBackdropClick = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
    const Icon = isActive ? item.activeIcon : item.icon

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'flex flex-col items-center justify-center',
          'flex-1 min-h-14 py-2',
          'transition-all duration-200 ease-out',
          'active:scale-95',
          isActive
            ? 'text-primary'
            : 'text-neutral-400 hover:text-neutral-600'
        )}
      >
        <div
          className={cn(
            'relative flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'transition-all duration-200',
            isActive && 'bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6 transition-transform duration-200',
              isActive && 'scale-105'
            )}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </div>
        <span
          className={cn(
            'text-[10px] font-medium mt-0.5',
            'transition-all duration-200',
            isActive ? 'opacity-100' : 'opacity-70'
          )}
        >
          {item.name}
        </span>
      </Link>
    )
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white/95 backdrop-blur-md',
        'border-t border-neutral-200',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
      )}
      style={{
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Container for tabs with space for center button */}
      <div className="relative flex items-center h-16">
        {/* Left tabs */}
        <div className="flex flex-1">
          {leftItems.map(renderNavItem)}
        </div>

        {/* Center spacer for the raised button */}
        <div className="w-20" />

        {/* Right tabs */}
        <div className="flex flex-1">
          {rightItems.map(renderNavItem)}
        </div>

        {/* Backdrop when expanded */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}

        {/* Quick Action Buttons - Fan out from center */}
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.href)}
            className={cn(
              'absolute left-1/2 z-50',
              'w-14 h-14',
              'rounded-full',
              'flex flex-col items-center justify-center',
              action.bgColor,
              action.color,
              'shadow-lg',
              'transition-all duration-300 ease-out',
              isExpanded
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-0 pointer-events-none'
            )}
            style={{
              transform: isExpanded
                ? `translate(-50%, 0) translate(${action.position.x}px, ${action.position.y}px)`
                : 'translate(-50%, 0)',
              top: '-6px',
              transitionDelay: isExpanded ? `${index * 50}ms` : '0ms',
            }}
            aria-label={action.label}
          >
            <action.icon className="h-6 w-6" strokeWidth={2} />
            <span className="text-[10px] font-medium mt-0.5">{action.label}</span>
          </button>
        ))}

        {/* Center Button - Expandable */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            // Position - centered and raised
            'absolute left-1/2 -translate-x-1/2 z-50',
            '-top-6',
            // Size - 72px diameter
            'w-[72px] h-[72px]',
            'rounded-full',
            // Flex for centering icon
            'flex items-center justify-center',
            // Colors
            isExpanded
              ? 'bg-neutral-800'
              : isOnScanPage
                ? 'bg-primary'
                : 'bg-primary',
            'text-white',
            // Shadow for floating effect
            'shadow-xl',
            isExpanded ? 'shadow-neutral-800/40' : 'shadow-primary/40',
            // Border to separate from background
            'border-4 border-white',
            // Animation
            'transition-all duration-300 ease-out',
            'active:scale-90',
            // Rotation when expanded
            isExpanded && 'rotate-45'
          )}
          aria-label={isExpanded ? 'Close menu' : 'Open quick actions'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <Plus className="h-8 w-8" strokeWidth={2.5} />
          ) : (
            <ScanLine
              className={cn(
                'h-8 w-8',
                'transition-transform duration-200',
                isOnScanPage && 'scale-110'
              )}
              strokeWidth={2.5}
            />
          )}

          {/* Pulse animation when not expanded and not on scan page */}
          {!isExpanded && !isOnScanPage && (
            <span
              className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 pointer-events-none"
              style={{ animationDuration: '2s' }}
            />
          )}

          {/* Active ring indicator when on scan page */}
          {!isExpanded && isOnScanPage && (
            <span
              className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping opacity-75"
              style={{ animationDuration: '1.5s' }}
            />
          )}
        </button>
      </div>
    </nav>
  )
}

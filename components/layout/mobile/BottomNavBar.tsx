'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ScanLine,
  Package,
  LayoutDashboard,
  PackageOpen,
  LayoutGrid,
  Settings,
  ClipboardList,
  ClipboardCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function BottomNavBar() {
  const pathname = usePathname()
  const isOnScanPage = pathname === '/scan' || pathname.startsWith('/scan/')

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
            ? 'text-pickle-600'
            : 'text-neutral-400 hover:text-neutral-600'
        )}
      >
        <div
          className={cn(
            'relative flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'transition-all duration-200',
            isActive && 'bg-pickle-50'
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

        {/* Center Scan Button - Raised above the nav bar */}
        <Link
          href="/scan"
          className={cn(
            // Position - centered and raised
            'absolute left-1/2 -translate-x-1/2',
            '-top-6',
            // Size - 72px diameter
            'w-[72px] h-[72px]',
            'rounded-full',
            // Flex for centering icon
            'flex items-center justify-center',
            // Colors
            isOnScanPage
              ? 'bg-pickle-600'
              : 'bg-pickle-500',
            'text-white',
            // Shadow for floating effect
            'shadow-xl shadow-pickle-500/40',
            // Border to separate from background
            'border-4 border-white',
            // Animation
            'transition-all duration-200 ease-out',
            'active:scale-90',
            // Pulse animation when not on scan page
            !isOnScanPage && 'center-button-pulse'
          )}
        >
          <ScanLine
            className={cn(
              'h-8 w-8',
              'transition-transform duration-200',
              isOnScanPage && 'scale-110'
            )}
            strokeWidth={2.5}
          />

          {/* Active ring indicator */}
          {isOnScanPage && (
            <span
              className="absolute inset-0 rounded-full border-4 border-pickle-300 animate-ping opacity-75"
              style={{ animationDuration: '1.5s' }}
            />
          )}
        </Link>
      </div>
    </nav>
  )
}

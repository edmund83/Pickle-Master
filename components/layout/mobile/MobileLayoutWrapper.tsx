'use client'

import { ReactNode } from 'react'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'
import { useSidebarState } from '@/lib/hooks/useSidebarState'
import { PrimarySidebar } from '../primary-sidebar'
import { BottomNavBar } from './BottomNavBar'
import { MobileHeader } from './MobileHeader'
import { cn } from '@/lib/utils'

interface MobileLayoutWrapperProps {
  children: ReactNode
}

export function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  const isDesktop = useIsDesktop()
  const { isExpanded, toggle } = useSidebarState()

  // During SSR/hydration, render mobile layout as default (most common case)
  // This ensures consistent HTML between server and client
  // The layout will switch to desktop after hydration if needed

  // Desktop layout: sidebar on left
  if (isDesktop === true) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <PrimarySidebar isExpanded={isExpanded} onToggle={toggle} />
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    )
  }

  // Mobile/Tablet layout (also used during SSR when isDesktop is null): header on top, bottom nav bar
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <MobileHeader />
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          'overscroll-contain',
          // Add bottom padding for bottom nav bar
          'pb-[calc(64px+env(safe-area-inset-bottom,0px))]'
        )}
      >
        {children}
      </main>
      <BottomNavBar />
    </div>
  )
}

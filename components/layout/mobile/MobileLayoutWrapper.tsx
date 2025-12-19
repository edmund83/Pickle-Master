'use client'

import { ReactNode } from 'react'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'
import { PrimarySidebar } from '../primary-sidebar'
import { BottomNavBar } from './BottomNavBar'
import { MobileHeader } from './MobileHeader'
import { cn } from '@/lib/utils'

interface MobileLayoutWrapperProps {
  children: ReactNode
}

export function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  const isDesktop = useIsDesktop()

  // Desktop layout: sidebar on left
  if (isDesktop) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <PrimarySidebar />
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    )
  }

  // Mobile/Tablet layout: header on top, bottom nav bar
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

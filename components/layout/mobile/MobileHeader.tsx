'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator'
import { NotificationBell } from '@/components/notifications/NotificationBell'

// Page title mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/inventory': 'Inventory',
  '/scan': 'Scanner',
  '/settings': 'Settings',
  '/search': 'Search',
  '/tags': 'Tags',
  '/reports': 'Reports',
  '/settings/bulk-import': 'Bulk Import',
}

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }

  // Check for item detail page
  if (pathname.startsWith('/inventory/')) {
    return 'Item Details'
  }

  // Check for nested routes
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) {
      return title
    }
  }

  return 'Nook'
}

export function MobileHeader() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'bg-white/95 backdrop-blur-md',
        'border-b border-neutral-100',
        'flex items-center justify-between',
        'px-4',
        'shadow-sm'
      )}
      style={{
        height: 'calc(56px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <h1 className="text-lg font-semibold text-neutral-900">
          {title}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Sync Status */}
        <SyncStatusIndicator size="sm" />

        {/* Notifications */}
        <NotificationBell variant="mobile" />
      </div>
    </header>
  )
}

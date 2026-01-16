'use client'

import { usePathname } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearchTrigger } from '@/components/search/GlobalSearchTrigger'
import { useTenantName } from '@/contexts/TenantSettingsContext'

// Page title mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/inventory': 'Inventory',
  '/scan': 'Scanner',
  '/tasks': 'Tasks',
  '/settings': 'Settings',
  '/search': 'Search',
  '/tags': 'Tags',
  '/reports': 'Reports',
  '/reminders': 'Reminders',
  '/partners/vendors': 'Vendors',
  '/partners/customers': 'Customers',
  '/ai-assistant': 'Ask Zoe',
  '/help': 'Help',
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

  return 'StockZip'
}

export function MobileHeader() {
  const pathname = usePathname()
  const tenantName = useTenantName()
  const title = getPageTitle(pathname)

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'bg-white/95 backdrop-blur-md',
        'border-b border-neutral-100',
        'px-4',
        'shadow-sm'
      )}
      style={{
        minHeight: 'calc(56px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center justify-between h-14">
        {/* Logo / Brand / Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary flex-shrink-0">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-neutral-900 truncate">
              {title}
            </h1>
            {/* Warehouse context indicator */}
            {tenantName && (
              <div className="flex items-center gap-1 -mt-0.5">
                <MapPin className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                <span className="text-xs text-neutral-500 truncate">
                  {tenantName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Global Search */}
          <GlobalSearchTrigger variant="mobile" />

          {/* Sync Status */}
          <SyncStatusIndicator size="sm" />

          {/* Notifications */}
          <NotificationBell variant="mobile" />
        </div>
      </div>
    </header>
  )
}

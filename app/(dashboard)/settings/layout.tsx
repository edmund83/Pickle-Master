'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Building2,
  CreditCard,
  Users,
  Bell,
  Palette,
  Database,
  Tag,
  Truck,
  Upload,
  Settings2,
  Zap,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsNavItems = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/company', label: 'Company', icon: Building2 },
  { href: '/settings/team', label: 'Team', icon: Users },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings/preferences', label: 'Preferences', icon: Palette },
  { href: '/settings/features', label: 'Features', icon: Zap },
  { href: '/settings/locations', label: 'Locations', icon: MapPin },
  { href: '/settings/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings/custom-fields', label: 'Custom Fields', icon: Database },
  { href: '/settings/tags', label: 'Tags', icon: Tag },
  { href: '/settings/vendors', label: 'Vendors', icon: Truck },
  { href: '/settings/bulk-import', label: 'Bulk Import', icon: Upload },
  { href: '/settings/integrations', label: 'Integrations', icon: Settings2 },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Settings Sidebar */}
      <div className="flex w-56 flex-col border-r border-neutral-200 bg-white">
        <div className="flex h-16 items-center border-b border-neutral-200 px-4">
          <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {settingsNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-neutral-600 hover:bg-neutral-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-50">{children}</div>
    </div>
  )
}

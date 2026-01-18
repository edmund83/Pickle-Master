'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Building2,
  CreditCard,
  Users,
  Bell,
  Database,
  Tag,
  Upload,
  Settings2,
  Zap,
  ChevronDown,
  UserCircle,
  Package,
  FileBarChart,
  Menu,
  X,
  Receipt,
  Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

const settingsNavGroups: NavGroup[] = [
  {
    label: 'Account',
    icon: UserCircle,
    items: [
      { href: '/settings/profile', label: 'Profile', icon: User },
      { href: '/settings/billing', label: 'Billing', icon: CreditCard },
    ],
  },
  {
    label: 'Organization',
    icon: Building2,
    items: [
      { href: '/settings/company', label: 'Company', icon: Building2 },
      { href: '/settings/team', label: 'Team', icon: Users },
      { href: '/settings/features', label: 'Features', icon: Zap },
    ],
  },
  {
    label: 'Inventory',
    icon: Package,
    items: [
      { href: '/settings/custom-fields', label: 'Custom Fields', icon: Database },
      { href: '/settings/labels', label: 'Labels', icon: Tag },
      { href: '/settings/payment-terms', label: 'Payment Terms', icon: Receipt },
      { href: '/settings/taxes', label: 'Tax Rates', icon: Percent },
    ],
  },
  {
    label: 'Data & Alerts',
    icon: FileBarChart,
    items: [
      { href: '/settings/alerts', label: 'Alerts', icon: Bell },
      { href: '/settings/bulk-import', label: 'Bulk Import', icon: Upload },
      { href: '/settings/integrations', label: 'Integrations', icon: Settings2 },
    ],
  },
]

interface UserProfile {
  full_name: string | null
  email: string | null
  role: string | null
  avatar_url: string | null
}

function NavGroupComponent({
  group,
  pathname,
  defaultExpanded = false,
}: {
  group: NavGroup
  pathname: string
  defaultExpanded?: boolean
}) {
  const hasActiveItem = group.items.some((item) => pathname === item.href)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || hasActiveItem)
  const GroupIcon = group.icon

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          hasActiveItem
            ? 'text-neutral-900'
            : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
        )}
      >
        <span className="flex items-center gap-2">
          <GroupIcon className="h-4 w-4" />
          {group.label}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="ml-2 mt-1 space-y-0.5 border-l border-neutral-200 pl-2">
          {group.items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary border-l-2 border-primary -ml-[9px] pl-[17px]'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function UserProfileCard({ profile }: { profile: UserProfile | null }) {
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">
          {profile?.full_name || 'User'}
        </p>
        <p className="truncate text-xs text-neutral-500 capitalize">
          {profile?.role || 'Member'}
        </p>
      </div>
    </div>
  )
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
         
        const { data } = await (supabase as any)
          .from('profiles')
          .select('full_name, email, role, avatar_url')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
        }
      }
    }

    loadProfile()
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const SidebarContent = () => (
    <>
      {/* User Profile Card */}
      <div className="p-4 border-b border-neutral-200">
        <UserProfileCard profile={profile} />
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3">
        {settingsNavGroups.map((group, index) => (
          <NavGroupComponent
            key={group.label}
            group={group}
            pathname={pathname}
            defaultExpanded={index === 0}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-4">
        <p className="text-xs text-neutral-400 text-center">
          Settings • StockZip
        </p>
      </div>
    </>
  )

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="fixed top-16 left-4 z-40 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="bg-white shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex h-[calc(100%-3.5rem)] flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden w-64 flex-col border-r border-neutral-200 bg-white lg:flex">
        <div className="flex h-14 items-center border-b border-neutral-200 px-4">
          <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <SidebarContent />
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 lg:pl-0 pl-0">
        <div className="pt-16 lg:pt-0">{children}</div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Search,
  Tags,
  FileText,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Tags', href: '/tags', icon: Tags },
  { name: 'Workflows', href: '/workflows', icon: ClipboardList },
  { name: 'Reports', href: '/reports', icon: FileText },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

interface PrimarySidebarProps {
  isExpanded?: boolean
  onToggle?: () => void
}

export function PrimarySidebar({ isExpanded = false, onToggle }: PrimarySidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <div
        className={cn(
          'flex h-full flex-col bg-pickle-500 transition-all duration-200 ease-out',
          isExpanded ? 'w-52' : 'w-16'
        )}
      >

      {/* Logo */}
      <div className={cn('flex h-16 items-center', isExpanded ? 'px-4' : 'justify-center')}>
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3',
            !isExpanded && 'h-10 w-10 justify-center rounded-xl bg-white/20'
          )}
        >
          {isExpanded ? (
            <>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <span className="text-xl font-bold text-white">P</span>
              </div>
              <span className="text-lg font-bold text-white">Pickle</span>
            </>
          ) : (
            <span className="text-xl font-bold text-white">P</span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className={cn('flex flex-1 flex-col gap-1 py-4', isExpanded ? 'px-3' : 'items-center px-2')}>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-xl transition-colors',
                isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
                isActive
                  ? 'bg-white text-pickle-500'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
              title={!isExpanded ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className={cn('flex flex-col gap-1 py-4', isExpanded ? 'px-3' : 'items-center px-2')}>
        {bottomNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-xl transition-colors',
                isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
                isActive
                  ? 'bg-white text-pickle-500'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
              title={!isExpanded ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          )
        })}

        {/* Notifications with badge */}
        <NotificationBell variant="sidebar" isExpanded={isExpanded} />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white',
            isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center'
          )}
          title={!isExpanded ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>

        {/* Collapse/Expand Toggle */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'mt-2 flex items-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white',
              isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center'
            )}
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      </div>

      {/* Edge expand button - visible handle at the top right */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={cn(
            'absolute top-4 right-0 translate-x-1/2 z-10',
            'flex h-6 w-6 items-center justify-center',
            'rounded-full bg-pickle-600 text-white shadow-md',
            'hover:bg-pickle-700 transition-colors',
            'border-2 border-white'
          )}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  )
}

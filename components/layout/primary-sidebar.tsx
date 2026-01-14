'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Search,
  Bell,
  FileText,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  ArrowRightLeft,
  Sparkles,
  Activity,
  BarChart3,
  ShoppingCart,
  Users,
  Truck,
} from 'lucide-react'
import { NavSubmenu, SubmenuItem } from '@/components/layout/nav-submenu'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useZoe } from '@/contexts/ZoeContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NotificationBell } from '@/components/notifications/NotificationBell'

// Task - Daily warehouse tasks
const taskItems: SubmenuItem[] = [
  { name: 'Stock In', href: '/tasks/inbound', icon: PackageOpen },
  { name: 'Stock Out', href: '/tasks/fulfillment', icon: ClipboardList },
  { name: 'Adjustments', href: '/tasks/inventory-operations', icon: ArrowRightLeft },
  { name: 'Reorder', href: '/tasks/reorder-suggestions', icon: ShoppingCart },
]

// Insights - Reports & Organization
const insightsItems: SubmenuItem[] = [
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Reminders', href: '/reminders', icon: Bell },
]

// Partners - Suppliers & Collaborators
const partnerItems: SubmenuItem[] = [
  { name: 'Vendor', href: '/partners/vendors', icon: Truck },
]

// System (bottom)
const systemNav = [
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
  const { openSearch } = useGlobalSearch()
  const { openZoe } = useZoe()

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
          'flex h-full flex-col bg-primary transition-all duration-200 ease-out',
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
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold text-white">StockZip</span>
            </>
          ) : (
            <span className="text-xl font-bold text-white">S</span>
          )}
        </Link>
      </div>

      {/* Search & Zoe AI Buttons */}
      <div className={cn('flex flex-col gap-1 py-2', isExpanded ? 'px-3' : 'items-center px-2')}>
        {/* Search Button */}
        <button
          onClick={openSearch}
          className={cn(
            'flex items-center rounded-xl transition-colors',
            isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
            'text-white hover:bg-white/10'
          )}
          title={!isExpanded ? 'Search (⌘K)' : undefined}
        >
          <Search className="h-5 w-5 shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-sm font-medium text-left">Search</span>
          )}
          {isExpanded && (
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-white/50 bg-white/10 rounded">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          )}
        </button>

        {/* Zoe AI Button */}
        <button
          onClick={openZoe}
          className={cn(
            'flex items-center rounded-xl transition-colors',
            isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
            'text-white hover:bg-white/10'
          )}
          title={!isExpanded ? 'Ask Zoe AI' : undefined}
        >
          <Sparkles className="h-5 w-5 shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium">Ask Zoe</span>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className={cn('py-2', isExpanded ? 'px-3' : 'px-2')}>
        <div className="h-px bg-white/20" />
      </div>

      {/* Main Navigation */}
      <nav className={cn('flex flex-1 flex-col gap-1', isExpanded ? 'px-3' : 'items-center px-2')}>
        {/* Home */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center rounded-xl transition-colors',
            isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
            pathname === '/dashboard'
              ? 'bg-white text-primary'
              : 'text-white hover:bg-white/10'
          )}
          title={!isExpanded ? 'Home' : undefined}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Home</span>}
        </Link>

        {/* Inventory */}
        <Link
          href="/inventory"
          className={cn(
            'flex items-center rounded-xl transition-colors',
            isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
            pathname.startsWith('/inventory')
              ? 'bg-white text-primary'
              : 'text-white hover:bg-white/10'
          )}
          title={!isExpanded ? 'My Inventory' : undefined}
        >
          <Package className="h-5 w-5 shrink-0" />
          {isExpanded && <span className="text-sm font-medium">My Inventory</span>}
        </Link>

        {/* Task Section */}
        <NavSubmenu
          icon={Activity}
          label="Task"
          items={taskItems}
          sidebarExpanded={isExpanded}
          storageKey="nav-task-expanded"
        />

        {/* Insights Section */}
        <NavSubmenu
          icon={BarChart3}
          label="Insights"
          items={insightsItems}
          sidebarExpanded={isExpanded}
          storageKey="nav-insights-expanded"
        />

        {/* Partners Section */}
        <NavSubmenu
          icon={Users}
          label="Partners"
          items={partnerItems}
          sidebarExpanded={isExpanded}
          storageKey="nav-partners-expanded"
        />

        {/* Spacer to push system nav to bottom */}
        <div className="flex-1" />
      </nav>

      {/* System Navigation (Bottom) */}
      <div className={cn('flex flex-col gap-1 py-4', isExpanded ? 'px-3' : 'items-center px-2')}>
        {systemNav.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-xl transition-colors',
                isExpanded ? 'h-10 gap-3 px-3' : 'h-10 w-10 justify-center',
                isActive
                  ? 'bg-white text-primary'
                  : 'text-white hover:bg-white/10'
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
            'flex items-center rounded-xl text-white transition-colors hover:bg-white/10',
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
              'mt-2 flex items-center rounded-xl text-white transition-colors hover:bg-white/10',
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
            'rounded-full bg-primary text-white shadow-md',
            'hover:bg-primary/90 transition-colors',
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

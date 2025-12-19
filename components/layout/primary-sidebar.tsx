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
  Bell,
  LogOut,
  ScanLine,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Scan', href: '/scan', icon: ScanLine },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Tags', href: '/tags', icon: Tags },
  { name: 'Workflows', href: '/workflows', icon: ClipboardList },
  { name: 'Reports', href: '/reports', icon: FileText },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
]

export function PrimarySidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-16 flex-col bg-pickle-500">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center">
        <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <span className="text-xl font-bold text-white">P</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                isActive
                  ? 'bg-white text-pickle-500'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
              title={item.name}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center gap-1 px-2 py-4">
        {bottomNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                isActive
                  ? 'bg-white text-pickle-500'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
              title={item.name}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

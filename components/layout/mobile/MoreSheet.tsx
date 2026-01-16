'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  X,
  ChevronRight,
  FileText,
  Bell,
  Truck,
  Building2,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  BarChart3,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/stores/auth-store'

interface MoreSheetProps {
  isOpen: boolean
  onClose: () => void
}

interface NavGroup {
  title: string
  items: {
    name: string
    href: string
    icon: React.ElementType
    description?: string
  }[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Insights',
    items: [
      { name: 'Reports', href: '/reports', icon: FileText, description: 'View reports & analytics' },
      { name: 'Reminders', href: '/reminders', icon: Bell, description: 'Manage reminders' },
    ],
  },
  {
    title: 'Partners',
    items: [
      { name: 'Vendors', href: '/partners/vendors', icon: Truck, description: 'Supplier management' },
      { name: 'Customers', href: '/partners/customers', icon: Building2, description: 'Customer management' },
    ],
  },
  {
    title: 'Assistant',
    items: [
      { name: 'Ask Zoe', href: '/ai-assistant', icon: Sparkles, description: 'AI-powered help' },
    ],
  },
  {
    title: 'Settings & Support',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings, description: 'App preferences' },
      { name: 'Help', href: '/help', icon: HelpCircle, description: 'Get support' },
    ],
  },
]

export function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { email } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close sheet when route changes (only after initial mount)
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      onClose()
    }
  }, [pathname, onClose])

  const handleNavigation = useCallback((href: string) => {
    onClose()
    router.push(href)
  }, [onClose, router])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      onClose()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }, [onClose, router])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
        className={cn(
          'relative w-full bg-white overflow-hidden',
          'animate-in duration-300 slide-in-from-bottom-4',
          'rounded-t-3xl',
          'max-h-[85vh]'
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        {/* Header with user info */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="more-sheet-title" className="text-base font-semibold text-neutral-900 truncate">
                {email || 'User'}
              </h2>
              <p className="text-xs text-neutral-500">Manage your account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {/* Navigation groups */}
          <div className="px-4 py-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.title}>
                <h3 className="px-2 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
                          'transition-all duration-150',
                          'active:scale-[0.98]',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg',
                            isActive ? 'bg-primary/10' : 'bg-neutral-100'
                          )}
                        >
                          <item.icon
                            className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-neutral-600')}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-sm font-medium">{item.name}</span>
                          {item.description && (
                            <p className="text-xs text-neutral-500">{item.description}</p>
                          )}
                        </div>
                        <ChevronRight
                          className={cn(
                            'h-4 w-4',
                            isActive ? 'text-primary/60' : 'text-neutral-300'
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sign out section */}
          <div className="px-4 py-4 border-t border-neutral-100">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
                'text-red-600 hover:bg-red-50 active:bg-red-100',
                'transition-all duration-150',
                'active:scale-[0.98]',
                isLoggingOut && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <LogOut className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-sm font-medium">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoreSheet

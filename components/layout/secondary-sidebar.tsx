'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon?: LucideIcon
}

interface SecondarySidebarProps {
  title: string
  items: NavItem[]
  footer?: React.ReactNode
}

export function SecondarySidebar({ title, items, footer }: SecondarySidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-56 flex-col border-r border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-neutral-200 px-4">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {footer && (
        <div className="border-t border-neutral-200 p-4">
          {footer}
        </div>
      )}
    </div>
  )
}

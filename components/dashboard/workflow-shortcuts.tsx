'use client'

import Link from 'next/link'
import { Package, Shuffle, LogOut, ClipboardCheck } from 'lucide-react'

interface ShortcutItem {
  name: string
  href: string
  icon: React.ElementType
  color: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
}

const shortcuts: ShortcutItem[] = [
  {
    name: 'RECEIVE NEW',
    href: '/tasks/receives',
    icon: Package,
    color: 'primary',
  },
  {
    name: 'MOVE ITEMS',
    href: '/tasks/moves',
    icon: Shuffle,
    color: 'secondary',
  },
  {
    name: 'CHECK OUT',
    href: '/tasks/checkouts',
    icon: LogOut,
    color: 'tertiary',
  },
  {
    name: 'VERIFY COUNT',
    href: '/scan',
    icon: ClipboardCheck,
    color: 'quaternary',
  },
]

export function WorkflowShortcuts() {
  return (
    <div className="hidden lg:block mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold tracking-wider text-pickle-600 uppercase">
          Workflow Shortcuts
        </span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shortcuts.map((shortcut) => (
          <ShortcutCard key={shortcut.name} {...shortcut} />
        ))}
      </div>
    </div>
  )
}

function ShortcutCard({ name, href, icon: Icon, color }: ShortcutItem) {
  const iconBgClasses = {
    primary: 'bg-pickle-500 text-white',
    secondary: 'bg-pickle-600 text-white',
    tertiary: 'bg-pickle-700 text-white',
    quaternary: 'bg-pickle-800 text-white',
  }

  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-pickle-300 hover:shadow-md hover:bg-pickle-50"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${iconBgClasses[color]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-semibold tracking-wide text-neutral-600 text-center group-hover:text-pickle-700">
        {name}
      </span>
    </Link>
  )
}

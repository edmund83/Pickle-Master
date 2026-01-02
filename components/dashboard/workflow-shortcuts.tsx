'use client'

import Link from 'next/link'
import { Package, Shuffle, LogOut, ClipboardCheck } from 'lucide-react'

interface ShortcutItem {
  name: string
  href: string
  icon: React.ElementType
}

const shortcuts: ShortcutItem[] = [
  {
    name: 'RECEIVE NEW',
    href: '/tasks/receives',
    icon: Package,
  },
  {
    name: 'MOVE ITEMS',
    href: '/tasks/moves',
    icon: Shuffle,
  },
  {
    name: 'CHECK OUT',
    href: '/tasks/checkouts',
    icon: LogOut,
  },
  {
    name: 'VERIFY COUNT',
    href: '/scan',
    icon: ClipboardCheck,
  },
]

export function WorkflowShortcuts() {
  return (
    <div className="hidden lg:block mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold tracking-wider text-primary uppercase">
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

function ShortcutCard({ name, href, icon: Icon }: ShortcutItem) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md hover:bg-primary/10"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition-transform group-hover:scale-110">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-semibold tracking-wide text-neutral-600 text-center group-hover:text-primary">
        {name}
      </span>
    </Link>
  )
}

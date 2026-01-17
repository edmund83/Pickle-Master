'use client'

import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  ChevronRight,
  Rocket,
  LayoutDashboard,
  Package,
  FolderTree,
  ScanBarcode,
  Printer,
  Search,
  ShoppingCart,
  ClipboardList,
  Calculator,
  ArrowLeftRight,
  Layers,
  Hash,
  Bell,
  RefreshCw,
  Users,
  BarChart3,
  UserCog,
  Settings,
  FileSpreadsheet,
  Smartphone,
  Keyboard,
  LifeBuoy
} from 'lucide-react'
import Link from 'next/link'

const HELP_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Create your account and learn the basics',
    icon: Rocket,
    href: '/help/getting-started',
    color: 'bg-green-50 text-green-600',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Understand your inventory at a glance',
    icon: LayoutDashboard,
    href: '/help/dashboard',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'items',
    title: 'Managing Items',
    description: 'Add, edit, and organize your inventory',
    icon: Package,
    href: '/help/items',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'folders',
    title: 'Organizing with Folders',
    description: 'Create locations and categories',
    icon: FolderTree,
    href: '/help/folders',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'scanning',
    title: 'Barcode Scanning',
    description: 'Scan barcodes and QR codes',
    icon: ScanBarcode,
    href: '/help/scanning',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    id: 'labels',
    title: 'Printing Labels',
    description: 'Create and print custom labels',
    icon: Printer,
    href: '/help/labels',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'search',
    title: 'Search & Filtering',
    description: 'Find items quickly',
    icon: Search,
    href: '/help/search',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'purchase-orders',
    title: 'Purchase Orders',
    description: 'Order and receive stock',
    icon: ShoppingCart,
    href: '/help/purchase-orders',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'pick-lists',
    title: 'Pick Lists',
    description: 'Fulfill orders efficiently',
    icon: ClipboardList,
    href: '/help/pick-lists',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'stock-counts',
    title: 'Stock Counts',
    description: 'Verify inventory accuracy',
    icon: Calculator,
    href: '/help/stock-counts',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    id: 'checkouts',
    title: 'Check-In / Check-Out',
    description: 'Track items assigned to people',
    icon: ArrowLeftRight,
    href: '/help/checkouts',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    id: 'lots',
    title: 'Lot & Batch Tracking',
    description: 'Track expiry dates and batches',
    icon: Layers,
    href: '/help/lots',
    color: 'bg-lime-50 text-lime-600',
  },
  {
    id: 'serials',
    title: 'Serial Numbers',
    description: 'Track individual units',
    icon: Hash,
    href: '/help/serials',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'reminders',
    title: 'Reminders & Alerts',
    description: 'Never miss a restock',
    icon: Bell,
    href: '/help/reminders',
    color: 'bg-red-50 text-red-600',
  },
  {
    id: 'reorder',
    title: 'Auto-Reorder',
    description: 'Smart reorder suggestions',
    icon: RefreshCw,
    href: '/help/reorder',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'vendors',
    title: 'Vendors & Partners',
    description: 'Manage suppliers and customers',
    icon: Users,
    href: '/help/vendors',
    color: 'bg-fuchsia-50 text-fuchsia-600',
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Insights about your inventory',
    icon: BarChart3,
    href: '/help/reports',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    id: 'team',
    title: 'Team Management',
    description: 'Invite and manage users',
    icon: UserCog,
    href: '/help/team',
    color: 'bg-slate-50 text-slate-600',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize StockZip',
    icon: Settings,
    href: '/help/settings',
    color: 'bg-neutral-100 text-neutral-600',
  },
  {
    id: 'import-export',
    title: 'Import & Export',
    description: 'Move data in and out',
    icon: FileSpreadsheet,
    href: '/help/import-export',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'mobile',
    title: 'Mobile & Offline',
    description: 'Use on your phone, even offline',
    icon: Smartphone,
    href: '/help/mobile',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Speed up your workflow',
    icon: Keyboard,
    href: '/help/shortcuts',
    color: 'bg-gray-50 text-gray-600',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fix common problems',
    icon: LifeBuoy,
    href: '/help/troubleshooting',
    color: 'bg-red-50 text-red-600',
  },
]

export default function HelpPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-4 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Help Center</h1>
            <p className="mt-0.5 text-neutral-500">
              Learn how to use StockZip - written in simple, everyday language
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {/* Welcome Message */}
        <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-900">Welcome to StockZip Help!</h2>
          <p className="mt-2 text-green-800">
            This guide explains everything in simple words that anyone can understand.
            No confusing tech talk - just clear, step-by-step instructions to help you
            manage your inventory like a pro.
          </p>
          <div className="mt-4">
            <Link
              href="/help/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Rocket className="h-4 w-4" />
              Start Here - Getting Started Guide
            </Link>
          </div>
        </div>

        {/* All Help Topics */}
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">All Help Topics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_SECTIONS.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${section.color}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-neutral-900 group-hover:text-primary">
                  {section.title}
                </h3>
                <p className="mt-0.5 truncate text-sm text-neutral-500">{section.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Mail className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900">Still Need Help?</h3>
              <p className="mt-1 text-neutral-600">
                Can&apos;t find what you&apos;re looking for? Our friendly support team is ready to help you.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="mailto:support@stockzip.app"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  Email Support
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

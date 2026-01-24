'use client'

import { useState } from 'react'
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
  LifeBuoy,
  Sparkles,
  ArrowRight,
  Zap,
  Bug,
  LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { ReportProblemDialog } from '@/components/help/ReportProblemDialog'

// Unified color scheme - minimal palette for visual calm
const ICON_COLOR = 'bg-neutral-100 text-neutral-600 ring-neutral-200/50'
const ICON_COLOR_PRIMARY = 'bg-primary/10 text-primary ring-primary/20'

// Organize help sections into categories for better UX
const QUICK_START = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Create your account and learn the basics',
    icon: Rocket,
    href: '/help/getting-started',
    color: ICON_COLOR_PRIMARY,
    featured: true,
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Understand your inventory at a glance',
    icon: LayoutDashboard,
    href: '/help/dashboard',
    color: ICON_COLOR,
  },
]

const CORE_FEATURES = [
  {
    id: 'items',
    title: 'Managing Items',
    description: 'Add, edit, and organize your inventory',
    icon: Package,
    href: '/help/items',
    color: ICON_COLOR,
  },
  {
    id: 'folders',
    title: 'Organizing with Folders',
    description: 'Create locations and categories',
    icon: FolderTree,
    href: '/help/folders',
    color: ICON_COLOR,
  },
  {
    id: 'scanning',
    title: 'Barcode Scanning',
    description: 'Scan barcodes and QR codes',
    icon: ScanBarcode,
    href: '/help/scanning',
    color: ICON_COLOR,
  },
  {
    id: 'labels',
    title: 'Printing Labels',
    description: 'Create and print custom labels',
    icon: Printer,
    href: '/help/labels',
    color: ICON_COLOR,
  },
  {
    id: 'search',
    title: 'Search & Filtering',
    description: 'Find items quickly',
    icon: Search,
    href: '/help/search',
    color: ICON_COLOR,
  },
]

const OPERATIONS = [
  {
    id: 'purchase-orders',
    title: 'Purchase Orders',
    description: 'Order and receive stock',
    icon: ShoppingCart,
    href: '/help/purchase-orders',
    color: ICON_COLOR,
  },
  {
    id: 'pick-lists',
    title: 'Pick Lists',
    description: 'Fulfill orders efficiently',
    icon: ClipboardList,
    href: '/help/pick-lists',
    color: ICON_COLOR,
  },
  {
    id: 'stock-counts',
    title: 'Stock Counts',
    description: 'Verify inventory accuracy',
    icon: Calculator,
    href: '/help/stock-counts',
    color: ICON_COLOR,
  },
  {
    id: 'checkouts',
    title: 'Check-In / Check-Out',
    description: 'Track items assigned to people',
    icon: ArrowLeftRight,
    href: '/help/checkouts',
    color: ICON_COLOR,
  },
]

const ADVANCED_FEATURES = [
  {
    id: 'lots',
    title: 'Lot & Batch Tracking',
    description: 'Track expiry dates and batches',
    icon: Layers,
    href: '/help/lots',
    color: ICON_COLOR,
  },
  {
    id: 'serials',
    title: 'Serial Numbers',
    description: 'Track individual units',
    icon: Hash,
    href: '/help/serials',
    color: ICON_COLOR,
  },
  {
    id: 'reminders',
    title: 'Reminders & Alerts',
    description: 'Never miss a restock',
    icon: Bell,
    href: '/help/reminders',
    color: ICON_COLOR,
  },
  {
    id: 'reorder',
    title: 'Auto-Reorder',
    description: 'Smart reorder suggestions',
    icon: RefreshCw,
    href: '/help/reorder',
    color: ICON_COLOR,
  },
  {
    id: 'vendors',
    title: 'Vendors & Partners',
    description: 'Manage suppliers and customers',
    icon: Users,
    href: '/help/vendors',
    color: ICON_COLOR,
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Insights about your inventory',
    icon: BarChart3,
    href: '/help/reports',
    color: ICON_COLOR,
  },
]

const SETUP_GUIDES = [
  {
    id: 'team',
    title: 'Team Management',
    description: 'Invite and manage users',
    icon: UserCog,
    href: '/help/team',
    color: ICON_COLOR,
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize StockZip',
    icon: Settings,
    href: '/help/settings',
    color: ICON_COLOR,
  },
  {
    id: 'import-export',
    title: 'Import & Export',
    description: 'Move data in and out',
    icon: FileSpreadsheet,
    href: '/help/import-export',
    color: ICON_COLOR,
  },
  {
    id: 'mobile',
    title: 'Mobile & Offline',
    description: 'Use on your phone, even offline',
    icon: Smartphone,
    href: '/help/mobile',
    color: ICON_COLOR,
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Speed up your workflow',
    icon: Keyboard,
    href: '/help/shortcuts',
    color: ICON_COLOR,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fix common problems',
    icon: LifeBuoy,
    href: '/help/troubleshooting',
    color: ICON_COLOR,
  },
]

interface HelpCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
  featured?: boolean
}

function HelpCard({ title, description, icon: Icon, href, color, featured }: HelpCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all hover:shadow-lg hover:shadow-neutral-200/50 ${
        featured
          ? 'border-primary/20 ring-2 ring-primary/10'
          : 'border-neutral-200/60 hover:border-primary/30'
      }`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${color}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-neutral-900 transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
    </div>
  )
}

export default function HelpPage() {
  const [showReportDialog, setShowReportDialog] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-50/80 to-white">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden border-b border-neutral-200/60 bg-white">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary/5" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-100/50 to-transparent blur-3xl" />

        <div className="relative px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Help Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              How can we help you?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
              Everything explained in simple words. No confusing tech talk — just clear,
              step-by-step guides to help you master inventory management.
            </p>

            {/* Quick search hint */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/help/getting-started"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                <Rocket className="h-4 w-4" />
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setShowReportDialog(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:border-neutral-400"
              >
                <Bug className="h-4 w-4" />
                Report a Problem
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-12">

          {/* Quick Start Section */}
          <section>
            <SectionHeader
              title="Quick Start"
              description="New to StockZip? Start here"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {QUICK_START.map((item) => (
                <HelpCard key={item.id} {...item} />
              ))}
            </div>
          </section>

          {/* Core Features */}
          <section>
            <SectionHeader
              title="Core Features"
              description="Master the essentials of inventory management"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CORE_FEATURES.map((item) => (
                <HelpCard key={item.id} {...item} />
              ))}
            </div>
          </section>

          {/* Operations */}
          <section>
            <SectionHeader
              title="Operations"
              description="Day-to-day inventory tasks"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {OPERATIONS.map((item) => (
                <HelpCard key={item.id} {...item} />
              ))}
            </div>
          </section>

          {/* Advanced Features */}
          <section>
            <SectionHeader
              title="Advanced Features"
              description="Powerful tools for complex workflows"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ADVANCED_FEATURES.map((item) => (
                <HelpCard key={item.id} {...item} />
              ))}
            </div>
          </section>

          {/* Setup & Configuration */}
          <section>
            <SectionHeader
              title="Setup & Configuration"
              description="Customize StockZip for your team"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SETUP_GUIDES.map((item) => (
                <HelpCard key={item.id} {...item} />
              ))}
            </div>
          </section>

          {/* Support Section */}
          <section className="pt-4">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-gradient-to-br from-white via-neutral-50/50 to-primary/5">
              {/* Decorative element */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative grid gap-8 p-8 sm:grid-cols-2 lg:p-10">
                {/* Left side - main CTA */}
                <div className="flex flex-col justify-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MessageCircle className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                    Still have questions?
                  </h3>
                  <p className="mt-2 text-neutral-600">
                    Our support team is ready to help. We typically respond within a few hours.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="mailto:support@stockzip.app"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-lg hover:shadow-primary/20"
                    >
                      <Mail className="h-4 w-4" />
                      Email Support
                    </a>
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:border-neutral-400"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Live Chat
                    </a>
                  </div>
                </div>

                {/* Right side - quick tips */}
                <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/60 bg-white p-6">
                  <h4 className="flex items-center gap-2 font-semibold text-neutral-900">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Quick Tips
                  </h4>
                  <ul className="space-y-3 text-sm text-neutral-600">
                    <li className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>Press <kbd className="mx-1 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs font-semibold">?</kbd> anywhere to see keyboard shortcuts</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>Use <kbd className="mx-1 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs font-semibold">⌘K</kbd> to search for anything</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>Ask Zoe, our AI assistant, for instant help</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Report Problem Dialog */}
      <ReportProblemDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
      />
    </div>
  )
}

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, PackageOpen, ArrowRightLeft, Clock, User, FileText, Package, CheckSquare, BarChart3, ChevronRight } from 'lucide-react'
import { getTaskSummary } from '@/app/actions/task-summaries'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'

// This page uses cookies for authentication, so it must be rendered dynamically
export const dynamic = 'force-dynamic'

const categories = [
  {
    href: '/tasks/inbound',
    title: 'Inbound',
    description: 'Purchase orders and receiving stock from suppliers',
    icon: PackageOpen,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    tasks: ['Purchase Orders', 'Receives'],
  },
  {
    href: '/tasks/fulfillment',
    title: 'Fulfillment',
    description: 'Pick lists for order processing and shipping',
    icon: ClipboardList,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    tasks: ['Pick Lists'],
  },
  {
    href: '/tasks/inventory-operations',
    title: 'Inventory Operations',
    description: 'Asset tracking, transfers, moves, and stock counts',
    icon: ArrowRightLeft,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    tasks: ['Check-In/Out', 'Transfers', 'Moves', 'Stock Count'],
  },
]

const typeIcons = {
  purchase_order: FileText,
  receive: Package,
  pick_list: ClipboardList,
  stock_count: BarChart3,
}

const typeLabels = {
  purchase_order: 'PO',
  receive: 'Receive',
  pick_list: 'Pick List',
  stock_count: 'Stock Count',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
}

export default async function TasksPage() {
  const summary = await getTaskSummary()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-neutral-900">Tasks</h1>
        <p className="text-neutral-500">Manage inventory operations</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Recent Drafts Section */}
        {summary.recentDrafts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Recent Drafts</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {summary.recentDrafts.map((draft) => {
                const Icon = typeIcons[draft.type]
                return (
                  <Link
                    key={draft.id}
                    href={draft.href}
                    aria-label={`Continue ${typeLabels[draft.type]}: ${draft.title}`}
                    className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 hover:border-neutral-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 group-hover:bg-neutral-200 transition-colors" aria-hidden="true">
                      <Icon className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{draft.title}</p>
                      <p className="text-xs text-neutral-500">
                        {typeLabels[draft.type]} · <FormattedShortDate date={draft.updated_at} />
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Assigned to Me Section */}
        {summary.assignedTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Assigned to Me</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {summary.assignedTasks.slice(0, 8).map((task) => {
                const Icon = typeIcons[task.type]
                return (
                  <Link
                    key={task.id}
                    href={task.href}
                    aria-label={`View assigned ${task.type === 'pick_list' ? 'Pick List' : 'Stock Count'}: ${task.title}`}
                    className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 hover:border-neutral-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors" aria-hidden="true">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[task.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-neutral-500">
                            Due <FormattedShortDate date={task.due_date} />
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Category Cards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="h-4 w-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Task Categories</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link key={category.href} href={category.href}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div
                        className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${category.bgColor}`}
                      >
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {category.tasks.map((task) => (
                          <span
                            key={task}
                            className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600"
                          >
                            {task}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

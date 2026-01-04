import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCheck, FolderInput, Calculator, ArrowLeft } from 'lucide-react'

const tasks = [
  {
    href: '/tasks/checkouts',
    title: 'Check-In / Check-Out',
    description: 'Track items assigned to people, jobs, and locations',
    icon: UserCheck,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/tasks/moves',
    title: 'Move Items',
    description: 'Reorganize items between folders',
    icon: FolderInput,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/tasks/stock-count',
    title: 'Stock Count',
    description: 'Count your inventory and fix any differences',
    icon: Calculator,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
]

export default function InventoryOperationsTasksPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <Link
          href="/tasks"
          className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900">Inventory Operations</h1>
        <p className="text-neutral-500">Asset tracking, transfers, moves, and stock counts</p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {tasks.map((task) => {
            const Icon = task.icon
            return (
              <Link key={task.href} href={task.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div
                      className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${task.bgColor}`}
                    >
                      <Icon className={`h-6 w-6 ${task.color}`} />
                    </div>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, PackageOpen, ArrowRightLeft } from 'lucide-react'

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

export default function TasksPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-neutral-900">Tasks</h1>
        <p className="text-neutral-500">Manage inventory operations</p>
      </div>

      <div className="p-6">
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
  )
}

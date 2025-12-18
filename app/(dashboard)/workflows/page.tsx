import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, ShoppingCart, ArrowRightLeft, PackageOpen } from 'lucide-react'

const workflows = [
  {
    href: '/workflows/pick-lists',
    title: 'Pick Lists',
    description: 'Create and manage picking lists for orders',
    icon: ClipboardList,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    href: '/workflows/purchase-orders',
    title: 'Purchase Orders',
    description: 'Track incoming stock from suppliers',
    icon: ShoppingCart,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    href: '/workflows/moves',
    title: 'Stock Moves',
    description: 'Transfer items between locations',
    icon: ArrowRightLeft,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    href: '/workflows/receives',
    title: 'Receives',
    description: 'Record incoming stock receipts',
    icon: PackageOpen,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
]

export default function WorkflowsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-neutral-900">Workflows</h1>
        <p className="text-neutral-500">Manage inventory operations</p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {workflows.map((workflow) => {
            const Icon = workflow.icon
            return (
              <Link key={workflow.href} href={workflow.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div
                      className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${workflow.bgColor}`}
                    >
                      <Icon className={`h-6 w-6 ${workflow.color}`} />
                    </div>
                    <CardTitle>{workflow.title}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
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

import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, PackageOpen, ArrowLeft } from 'lucide-react'

const workflows = [
  {
    href: '/workflows/purchase-orders',
    title: 'Purchase Orders',
    description: 'Create and manage orders to suppliers',
    icon: ShoppingCart,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    href: '/workflows/receives',
    title: 'Receives',
    description: 'Record incoming stock receipts against POs',
    icon: PackageOpen,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
]

export default function InboundWorkflowsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <Link
          href="/workflows"
          className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workflows
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900">Inbound</h1>
        <p className="text-neutral-500">Manage incoming stock from suppliers</p>
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

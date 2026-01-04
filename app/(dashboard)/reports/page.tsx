import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertTriangle,
  Package,
  TrendingUp,
  BarChart3,
  Activity,
  DollarSign,
  Calendar,
  Percent,
} from 'lucide-react'

const reports = [
  {
    href: '/reports/low-stock',
    title: 'Low Stock Alert',
    description: 'Items running low and need restocking',
    icon: AlertTriangle,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/reports/inventory-summary',
    title: 'Inventory Summary',
    description: 'Overview of all inventory by category',
    icon: Package,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/reports/inventory-value',
    title: 'Inventory Value',
    description: 'Total value of your inventory',
    icon: DollarSign,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/reports/profit-margin',
    title: 'Profit Margin',
    description: 'Analyze margins and potential profit',
    icon: Percent,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/reports/activity',
    title: 'Activity Log',
    description: 'Recent changes and actions',
    icon: Activity,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/reports/trends',
    title: 'Inventory Trends',
    description: 'Track changes over time',
    icon: TrendingUp,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/reports/stock-movement',
    title: 'Stock Movement',
    description: 'In and out movements analysis',
    icon: BarChart3,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  {
    href: '/reports/expiring',
    title: 'Expiring Items',
    description: 'Items approaching expiration date',
    icon: Calendar,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
]

export default function ReportsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-neutral-900">Reports</h1>
        <p className="text-neutral-500">Analyze your inventory data</p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon
            return (
              <Link key={report.href} href={report.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${report.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${report.color}`} />
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
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

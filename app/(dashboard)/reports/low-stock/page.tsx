import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InventoryItem } from '@/types/database.types'

async function getLowStockItems(): Promise<InventoryItem[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('inventory_items')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .in('status', ['low_stock', 'out_of_stock'])
    .order('quantity', { ascending: true })

  return (data || []) as InventoryItem[]
}

export default async function LowStockReportPage() {
  const items = await getLowStockItems()

  const outOfStock = items.filter((i) => i.status === 'out_of_stock')
  const lowStock = items.filter((i) => i.status === 'low_stock')

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-4">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Low Stock Report</h1>
          <p className="text-neutral-500">Items that need restocking</p>
        </div>
      </div>

      <div className="p-6">
        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-900">{outOfStock.length}</p>
                <p className="text-sm text-neutral-500">Out of Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-900">{lowStock.length}</p>
                <p className="text-sm text-neutral-500">Low Stock</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        {items.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Items Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/inventory/${item.id}`}
                    className="flex items-center justify-between py-4 hover:bg-neutral-50 -mx-4 px-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                        {item.image_urls?.[0] ? (
                          <img
                            src={item.image_urls[0]}
                            alt={item.name}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{item.name}</p>
                        {item.sku && (
                          <p className="text-xs text-neutral-500">SKU: {item.sku}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-neutral-900">
                          {item.quantity} / {item.min_quantity} {item.unit}
                        </p>
                        <p className="text-xs text-neutral-500">Current / Minimum</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.status === 'out_of_stock'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">All stocked up!</h3>
              <p className="mt-1 text-neutral-500">No items are running low.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

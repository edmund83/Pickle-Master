import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Package, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InventoryItem, Profile } from '@/types/database.types'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ itemId: string }>
}

async function getItemData(itemId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const profile = profileData as { tenant_id: string | null } | null

  if (!profile?.tenant_id) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any)
    .from('inventory_items')
    .select('*')
    .eq('id', itemId)
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .single()

  // Get creator profile
  let creator: Profile | null = null
  if (item?.created_by) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: creatorData } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', item.created_by)
      .single()
    creator = creatorData as Profile | null
  }

  return { item: item as InventoryItem | null, creator }
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { itemId } = await params
  const data = await getItemData(itemId)

  if (!data?.item) {
    notFound()
  }

  const { item, creator } = data

  const statusColors: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{item.name}</h1>
            {item.sku && <p className="text-sm text-neutral-500">SKU: {item.sku}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/inventory/${item.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card>
              <CardContent className="p-6">
                <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-100">
                  {item.image_urls?.[0] ? (
                    <img
                      src={item.image_urls[0]}
                      alt={item.name}
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-neutral-300" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {item.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">{item.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {item.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 whitespace-pre-wrap">{item.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Status & Quantity */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Status</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusColors[item.status || 'in_stock'] || statusColors.in_stock
                    }`}
                  >
                    {statusLabels[item.status || 'in_stock'] || 'In Stock'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Quantity</span>
                  <span className="text-lg font-semibold text-neutral-900">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                {(item.min_quantity ?? 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Min. Quantity</span>
                    <span className="text-neutral-900">{item.min_quantity} {item.unit}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            {(item.price ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Price</span>
                    <span className="font-medium text-neutral-900">
                      RM {(item.price ?? 0).toFixed(2)} / {item.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            {item.location && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-900">{item.location}</p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {item.created_at && (
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Clock className="h-4 w-4" />
                    <span>Created {format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {item.updated_at && (
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Clock className="h-4 w-4" />
                    <span>Updated {format(new Date(item.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {creator && (
                  <div className="flex items-center gap-2 text-neutral-500">
                    <User className="h-4 w-4" />
                    <span>Created by {creator.full_name || creator.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

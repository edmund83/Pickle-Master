import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  MapPin,
  Tag,
  DollarSign,
  Barcode,
  FileText,
  Clock,
  Edit,
  Trash2,
  Printer,
  MoreHorizontal,
  Plus,
  Minus,
  FolderInput,
  History,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { InventoryItem, Folder, Tag as TagType } from '@/types/database.types'
import { format } from 'date-fns'
import { ItemCheckoutSection } from './item-checkout-section'
import { ItemQuickActions } from './components/item-quick-actions'

interface PageProps {
  params: Promise<{ itemId: string }>
}

interface ActivityLogItem {
  id: string
  action_type: string
  entity_name: string
  quantity_delta: number | null
  user_name: string | null
  created_at: string
  changes: Record<string, unknown> | null
}

interface ItemWithRelations {
  item: InventoryItem
  folder: Folder | null
  itemTags: TagType[]
  activityLogs: ActivityLogItem[]
}

async function getItemDetails(itemId: string): Promise<ItemWithRelations | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile for tenant_id
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

  // Get item details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item, error } = await (supabase as any)
    .from('inventory_items')
    .select('*')
    .eq('id', itemId)
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .single()

  if (error || !item) {
    return null
  }

  const typedItem = item as InventoryItem

  // Get folder if item has one
  let folder: Folder | null = null
  if (typedItem.folder_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: folderData } = await (supabase as any)
      .from('folders')
      .select('*')
      .eq('id', typedItem.folder_id)
      .single()
    folder = folderData as Folder | null
  }

  // Get tags for the item using RPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: itemTags } = await (supabase as any)
    .rpc('get_item_tags', { p_item_id: itemId })

  // Get recent activity logs for this item
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activityLogs } = await (supabase as any)
    .rpc('get_activity_logs', {
      p_entity_id: itemId,
      p_entity_type: 'item',
      p_limit: 10
    })

  return {
    item: typedItem,
    folder,
    itemTags: (itemTags || []) as TagType[],
    activityLogs: (activityLogs || []) as ActivityLogItem[]
  }
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { itemId } = await params
  const data = await getItemDetails(itemId)

  if (!data) {
    notFound()
  }

  const { item, folder, itemTags, activityLogs } = data

  const statusColors: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-700 border-green-200',
    low_stock: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    out_of_stock: 'bg-red-100 text-red-700 border-red-200',
  }

  const statusLabels: Record<string, string> = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  }

  const actionColors: Record<string, string> = {
    create: 'bg-green-500',
    update: 'bg-blue-500',
    adjust_quantity: 'bg-purple-500',
    move: 'bg-orange-500',
    delete: 'bg-red-500',
    restore: 'bg-teal-500',
  }

  const totalValue = (item.quantity || 0) * (item.price || 0)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{item.name}</h1>
            {item.sku && (
              <p className="text-sm text-neutral-500">SKU: {item.sku}</p>
            )}
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-medium ${statusColors[item.status || 'in_stock'] || statusColors.in_stock
              }`}
          >
            {statusLabels[item.status || 'in_stock'] || 'In Stock'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/inventory/${item.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Label
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Photo Gallery */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex aspect-square items-center justify-center rounded-lg bg-neutral-100">
                {item.image_urls && item.image_urls.length > 0 ? (
                  <img
                    src={item.image_urls[0]}
                    alt={item.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <Package className="h-24 w-24 text-neutral-300" />
                )}
              </div>
              {item.image_urls && item.image_urls.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {item.image_urls.map((url, index) => (
                    <button
                      key={index}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${index === 0 ? 'border-pickle-500 ring-2 ring-pickle-200' : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                    >
                      <img
                        src={url}
                        alt={`${item.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions & Stock Info */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <ItemQuickActions
                itemId={item.id}
                currentQuantity={item.quantity}
                unit={item.unit || 'units'}
              />

              {/* Stock Card */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-neutral-400" />
                  <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                    Stock Information
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Current Quantity</p>
                    <p className="text-2xl font-bold text-neutral-900">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Min Quantity</p>
                    <p className="text-2xl font-bold text-neutral-900">{item.min_quantity || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Unit</p>
                    <p className="text-lg font-medium text-neutral-900">{item.unit || 'units'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Status</p>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[item.status || 'in_stock']
                        }`}
                    >
                      {statusLabels[item.status || 'in_stock']}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <ItemCheckoutSection item={item} />
          </div>

          {/* Info Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Location Card */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-neutral-400" />
                <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                  Location
                </h2>
              </div>
              {folder ? (
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: folder.color || '#6b7280' }}
                  />
                  <span className="font-medium text-neutral-900">{folder.name}</span>
                </div>
              ) : item.location ? (
                <p className="font-medium text-neutral-900">{item.location}</p>
              ) : (
                <p className="text-neutral-400 italic">No location set</p>
              )}
            </div>

            {/* Pricing Card */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-neutral-400" />
                <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                  Pricing
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Unit Price</span>
                  <span className="font-medium text-neutral-900">
                    {item.currency || 'RM'} {(item.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-2">
                  <span className="text-neutral-500">Total Value</span>
                  <span className="font-bold text-pickle-600">
                    {item.currency || 'RM'} {totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Identifiers Card */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Barcode className="h-5 w-5 text-neutral-400" />
                <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                  Identifiers
                </h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">SKU</span>
                  <span className="font-mono text-neutral-900">{item.sku || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Barcode</span>
                  <span className="font-mono text-neutral-900">{item.barcode || '-'}</span>
                </div>
                {item.qr_code && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">QR Code</span>
                    <QrCode className="h-4 w-4 text-neutral-600" />
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Serial #</span>
                  <span className="font-mono text-neutral-900">{item.serial_number || '-'}</span>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-neutral-400" />
                  <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                    Tags
                  </h2>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-neutral-100">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {itemTags && itemTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {itemTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color || '#6b7280',
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: tag.color || '#6b7280' }}
                      />
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 italic">No tags assigned</p>
              )}
            </div>

            {/* Notes Card */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-neutral-400" />
                <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                  Description & Notes
                </h2>
              </div>
              <div className="space-y-4">
                {item.description ? (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Description</p>
                    <p className="text-neutral-600">{item.description}</p>
                  </div>
                ) : null}
                {item.notes ? (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Notes</p>
                    <p className="text-neutral-600 whitespace-pre-wrap">{item.notes}</p>
                  </div>
                ) : null}
                {!item.description && !item.notes && (
                  <p className="text-neutral-400 italic">No description or notes added</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-neutral-400" />
                <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                  Recent Activity
                </h2>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            {activityLogs && activityLogs.length > 0 ? (
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${actionColors[log.action_type] || 'bg-neutral-400'}`} />
                      <div className="flex-1 w-px bg-neutral-200 mt-1" />
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <p className="text-sm text-neutral-900">
                        <span className="font-medium capitalize">{log.action_type.replace(/_/g, ' ')}</span>
                        {log.quantity_delta ? (
                          <span className={log.quantity_delta > 0 ? 'text-green-600' : 'text-red-600'}>
                            {' '}({log.quantity_delta > 0 ? '+' : ''}{log.quantity_delta})
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {log.user_name || 'System'} • {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 italic">No activity recorded yet</p>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex flex-wrap gap-4">
              {item.created_at && (
                <span>Created: {format(new Date(item.created_at), 'MMM d, yyyy')}</span>
              )}
              {item.updated_at && (
                <span>Updated: {format(new Date(item.updated_at), 'MMM d, yyyy')}</span>
              )}
            </div>
            <span className="font-mono text-[10px]">ID: {item.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

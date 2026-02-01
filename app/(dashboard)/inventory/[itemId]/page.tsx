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
  History,
  Ruler,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { InventoryItem, Folder, Tag as TagType } from '@/types/database.types'
import { format } from 'date-fns'
import { ItemCheckoutHistoryCard, ItemCheckoutStatusCard } from './item-checkout-section'
import { ItemQuickActions } from './components/item-quick-actions'
import { TagsManager } from './components/tags-manager'
import { BatchTrackingCard, SerialTrackingCard } from '@/components/tracking'
import PrintLabelButton from './components/print-label-button'
import QRBarcodeSection from './components/qr-barcode-section'
import { SetHighlightedFolder } from './components/set-highlighted-folder'
import { ItemDetailCard } from './components/item-detail-card'
import { InlineReminders } from './components/inline-reminders'
import { FormattedPricingCard } from './components/FormattedPricingCard'
import { FormattedDateTime, FormattedShortDate } from '@/components/formatting/FormattedDate'
import { ItemMoreOptions } from './components/item-more-options'
import { ChatterPanel } from '@/components/chatter'
import { hasFeature } from '@/lib/features/gating'
import type { PlanId } from '@/lib/plans/config'

interface FeaturesEnabled {
  shipping_dimensions?: boolean
  lot_tracking?: boolean
  serial_tracking?: boolean
}

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

interface SerialStats {
  total: number
  available: number
  checked_out: number
  sold: number
  damaged: number
  returned: number
}

interface LotStats {
  activeLots: number
  totalQuantity: number
  expiredCount: number
  expiringSoonCount: number
  expiringCount: number
  daysUntilNextExpiry: number | null
}

interface ItemWithRelations {
  item: InventoryItem
  folder: Folder | null
  itemTags: TagType[]
  activityLogs: ActivityLogItem[]
  features: FeaturesEnabled
  tenantLogo: string | null
  userEmail: string | null
  userId: string
  serialStats: SerialStats | null
  lotStats: LotStats | null
}

async function getItemDetails(itemId: string): Promise<ItemWithRelations | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile for tenant_id
   
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
     
    const { data: folderData } = await (supabase as any)
      .from('folders')
      .select('*')
      .eq('id', typedItem.folder_id)
      .single()
    folder = folderData as Folder | null
  }

  // Get tags for the item using RPC
   
  const { data: itemTags } = await (supabase as any)
    .rpc('get_item_tags', { p_item_id: itemId })

  // Get recent activity logs for this item
   
  const { data: activityLogs } = await (supabase as any)
    .rpc('get_activity_logs', {
      p_entity_id: itemId,
      p_entity_type: 'item',
      p_limit: 10
    })

  // Get tenant settings for feature flags and logo
  const { data: tenant } = await (supabase as any)
    .from('tenants')
    .select('subscription_tier, settings, logo_url')
    .eq('id', profile.tenant_id)
    .single()

  // Use plan-based feature gating instead of settings flags
  const subscriptionTier = (tenant?.subscription_tier as PlanId) || 'starter'
  const settings = tenant?.settings as Record<string, unknown> | null
  const features: FeaturesEnabled = {
    lot_tracking: hasFeature(subscriptionTier, 'lot_tracking'),
    serial_tracking: hasFeature(subscriptionTier, 'serial_tracking'),
    shipping_dimensions: (settings?.features_enabled as FeaturesEnabled)?.shipping_dimensions || false,
  }
  const tenantLogo = (tenant?.logo_url as string) || null

  // Fetch tracking stats based on item's tracking mode
  let serialStats: SerialStats | null = null
  let lotStats: LotStats | null = null

  if (typedItem.tracking_mode === 'serialized') {
    // Get serial number stats by status
     
    const { data: serialData } = await (supabase as any)
      .from('serial_numbers')
      .select('status')
      .eq('item_id', itemId)

    if (serialData && serialData.length > 0) {
      const statusCounts = (serialData as { status: string }[]).reduce(
        (acc, row) => {
          acc[row.status] = (acc[row.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      serialStats = {
        total: serialData.length,
        available: statusCounts['available'] || 0,
        checked_out: statusCounts['checked_out'] || 0,
        sold: statusCounts['sold'] || 0,
        damaged: statusCounts['damaged'] || 0,
        returned: statusCounts['returned'] || 0,
      }
    }
  }

  if (typedItem.tracking_mode === 'lot_expiry') {
    // Get lots for this item using RPC
     
    const { data: lotsData } = await (supabase as any)
      .rpc('get_item_lots', { p_item_id: itemId, p_include_depleted: false })

    if (lotsData && lotsData.length > 0) {
      interface LotRow {
        status: string
        quantity: number
        expiry_status: string
        days_until_expiry: number | null
      }
      const lots = lotsData as LotRow[]
      const activeLots = lots.filter((l) => l.status === 'active')
      const totalQuantity = activeLots.reduce((sum, l) => sum + (l.quantity || 0), 0)

      // Count by expiry status
      const expiredCount = lots.filter(
        (l) => l.expiry_status === 'expired' || l.status === 'expired'
      ).length
      const expiringSoonCount = lots.filter((l) => l.expiry_status === 'expiring_soon').length
      const expiringCount = lots.filter((l) => l.expiry_status === 'expiring_month').length

      // Find earliest expiry
      const lotsWithExpiry = lots.filter((l) => l.days_until_expiry !== null)
      const daysUntilNextExpiry =
        lotsWithExpiry.length > 0
          ? Math.min(...lotsWithExpiry.map((l) => l.days_until_expiry as number))
          : null

      lotStats = {
        activeLots: activeLots.length,
        totalQuantity,
        expiredCount,
        expiringSoonCount,
        expiringCount,
        daysUntilNextExpiry,
      }
    }
  }

  return {
    item: typedItem,
    folder,
    itemTags: (itemTags || []) as TagType[],
    activityLogs: (activityLogs || []) as ActivityLogItem[],
    features,
    tenantLogo,
    userEmail: user.email || null,
    userId: user.id,
    serialStats,
    lotStats,
  }
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { itemId } = await params
  const data = await getItemDetails(itemId)

  if (!data) {
    notFound()
  }

  const { item, folder, itemTags, activityLogs, features, tenantLogo, userEmail, userId, serialStats, lotStats } = data

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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Set the highlighted folder in sidebar */}
      <SetHighlightedFolder folderId={item.folder_id} />

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
          <PrintLabelButton
            item={{
              id: item.id,
              name: item.name,
              sku: item.sku,
              barcode: item.barcode,
              price: item.price,
              cost_price: item.cost_price,
              currency: item.currency,
              quantity: item.quantity,
              min_quantity: item.min_quantity,
              notes: item.notes,
              description: item.description,
              image_urls: item.image_urls,
              tags: itemTags.map((t) => ({ id: t.id, name: t.name, color: t.color || '#6b7280' })),
            }}
            tenantLogo={tenantLogo}
            userEmail={userEmail}
          />
          <ItemMoreOptions
            itemId={item.id}
            itemName={item.name}
            currentFolderId={item.folder_id}
            currentFolderName={folder?.name || null}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
            {/* Photo Gallery */}
            <Card className="rounded-xl shadow-none">
              <div className="p-4">
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
                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${index === 0 ? 'border-primary ring-2 ring-primary/30' : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        type="button"
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
            </Card>

            {/* Inventory */}
            <div className="space-y-4 lg:sticky lg:top-6">
              <ItemDetailCard
                title="Inventory"
                icon={<Package className="h-5 w-5" />}
                action={
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[item.status || 'in_stock'] || statusColors.in_stock
                      }`}
                  >
                    {statusLabels[item.status || 'in_stock'] || 'In Stock'}
                  </span>
                }
                contentClassName="space-y-5"
              >
                <ItemQuickActions
                  itemId={item.id}
                  itemName={item.name}
                  currentQuantity={item.quantity}
                  unit={item.unit || 'units'}
                  variant="inline"
                  trackingMode={(item.tracking_mode as 'none' | 'serialized' | 'lot_expiry') || 'none'}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-500">Min quantity</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {item.min_quantity ?? '-'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-500">Unit</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {item.unit || 'units'}
                    </p>
                  </div>
                </div>

                {/* Inline Reminders */}
                <div className="border-t border-neutral-100 pt-4">
                  <InlineReminders
                    itemId={item.id}
                    minQuantity={item.min_quantity}
                  />
                </div>
              </ItemDetailCard>
            </div>
          </div>

          {/* Borrowing Section */}
          <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <ItemCheckoutStatusCard item={item} />
            <ItemCheckoutHistoryCard itemId={item.id} limit={5} />
          </div>

          {/* Info Cards Grid - Priority-based rows */}
          {/* Row 1: Key Information */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Location Card */}
            <ItemDetailCard title="Location" icon={<MapPin className="h-5 w-5" />}>
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
            </ItemDetailCard>

            {/* Pricing Card */}
            <FormattedPricingCard
              price={item.price || 0}
              costPrice={item.cost_price}
              quantity={item.quantity || 0}
            />

            {/* Batch Tracking Card */}
            {item.tracking_mode === 'lot_expiry' && (
              <BatchTrackingCard
                itemId={item.id}
                itemName={item.name}
                stats={lotStats ? {
                  totalQuantity: lotStats.totalQuantity,
                  activeBatches: lotStats.activeLots,
                  expiredCount: lotStats.expiredCount,
                  expiringSoonCount: lotStats.expiringSoonCount,
                  expiringMonthCount: lotStats.expiringCount,
                } : null}
              />
            )}

            {/* Serial Tracking Card */}
            {item.tracking_mode === 'serialized' && (
              <SerialTrackingCard
                itemId={item.id}
                itemName={item.name}
                stats={serialStats}
              />
            )}
          </div>

          {/* Row 2: Secondary Information */}
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Identifiers Card */}
            <ItemDetailCard title="Identifiers" icon={<Barcode className="h-5 w-5" />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">SKU</span>
                  <span className="font-mono text-neutral-900">{item.sku || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Barcode</span>
                  <span className="font-mono text-neutral-900">{item.barcode || '-'}</span>
                </div>
              </div>
            </ItemDetailCard>

            {/* Shipping & Dimensions Card */}
            {features.shipping_dimensions ? (
              <ItemDetailCard title="Shipping & Dimensions" icon={<Ruler className="h-5 w-5" />}>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Weight</span>
                    <span className="font-medium text-neutral-900">
                      {item.weight ? `${item.weight} ${item.weight_unit || 'kg'}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Dimensions (L × W × H)</span>
                    <span className="font-medium text-neutral-900">
                      {item.length && item.width && item.height
                        ? `${item.length} × ${item.width} × ${item.height} ${item.dimension_unit || 'cm'}`
                        : '-'}
                    </span>
                  </div>
                  {item.length && item.width && item.height && (
                    <div className="flex justify-between border-t border-neutral-100 pt-2">
                      <span className="text-neutral-500">Volume</span>
                      <span className="font-medium text-neutral-900">
                        {(item.length * item.width * item.height).toLocaleString()} {item.dimension_unit || 'cm'}³
                      </span>
                    </div>
                  )}
                  {item.weight && item.length && item.width && item.height && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Volumetric Weight</span>
                      <span className="font-medium text-neutral-900">
                        {((item.length * item.width * item.height) / 5000).toFixed(2)} kg
                      </span>
                    </div>
                  )}
                </div>
              </ItemDetailCard>
            ) : (
              /* Tags Card - show here if no shipping dimensions */
              <ItemDetailCard
                title="Tags"
                icon={<Tag className="h-5 w-5" />}
                action={
                  <TagsManager
                    itemId={item.id}
                    currentTagIds={itemTags.map(t => t.id)}
                  />
                }
              >
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
              </ItemDetailCard>
            )}

            {/* QR & Barcode Card */}
            <QRBarcodeSection
              item={{
                id: item.id,
                name: item.name,
                sku: item.sku,
                barcode: item.barcode,
                price: item.price,
                cost_price: item.cost_price,
                currency: item.currency,
                quantity: item.quantity,
                min_quantity: item.min_quantity,
                notes: item.notes,
                description: item.description,
                image_urls: item.image_urls,
                tags: itemTags.map((t) => ({ id: t.id, name: t.name, color: t.color || '#6b7280' })),
              }}
              tenantLogo={tenantLogo}
              userEmail={userEmail}
            />
          </div>

          {/* Row 3: Supplementary Information */}
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {/* Tags Card - show here if shipping dimensions enabled */}
            {features.shipping_dimensions && (
              <ItemDetailCard
                title="Tags"
                icon={<Tag className="h-5 w-5" />}
                action={
                  <TagsManager
                    itemId={item.id}
                    currentTagIds={itemTags.map(t => t.id)}
                  />
                }
              >
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
              </ItemDetailCard>
            )}

            {/* Notes Card */}
            <ItemDetailCard
              title="Description & Notes"
              icon={<FileText className="h-5 w-5" />}
              className={features.shipping_dimensions ? 'md:col-span-2' : 'md:col-span-2'}
            >
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
            </ItemDetailCard>
          </div>

          {/* Activity History */}
          <ItemDetailCard
            title="Recent Activity"
            icon={<History className="h-5 w-5" />}
            action={
              <Link href={`/inventory/${item.id}/activity`}>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            }
            className="mt-6"
          >
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
                        {log.user_name || 'System'} • <FormattedDateTime date={log.created_at} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 italic">No activity recorded yet</p>
            )}
          </ItemDetailCard>

          {/* Chatter - Team Communication */}
          <ChatterPanel
            entityType="item"
            entityId={item.id}
            entityName={item.name}
            currentUserId={userId}
            className="mt-6"
          />

          {/* Metadata Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex flex-wrap gap-4">
              {item.created_at && (
                <span>Created: <FormattedShortDate date={item.created_at} /></span>
              )}
              {item.updated_at && (
                <span>Updated: <FormattedShortDate date={item.updated_at} /></span>
              )}
            </div>
            <span className="font-mono text-[10px]">ID: {item.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

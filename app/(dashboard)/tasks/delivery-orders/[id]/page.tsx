import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DeliveryOrderDetailClient } from './DeliveryOrderDetailClient'
import { getCustomers, type Customer } from '@/app/actions/customers'

export interface DeliveryOrderWithDetails {
  id: string
  tenant_id: string
  display_id: string | null
  sales_order_id: string | null
  customer_id: string | null
  pick_list_id: string | null
  status: string | null
  carrier: string | null
  tracking_number: string | null
  shipping_method: string | null
  scheduled_date: string | null
  dispatched_at: string | null
  delivered_at: string | null
  ship_to_name: string | null
  ship_to_address1: string | null
  ship_to_address2: string | null
  ship_to_city: string | null
  ship_to_state: string | null
  ship_to_postal_code: string | null
  ship_to_country: string | null
  ship_to_phone: string | null
  received_by: string | null
  signature_url: string | null
  delivery_photo_url: string | null
  delivery_notes: string | null
  total_packages: number
  total_weight: number | null
  weight_unit: string | null
  notes: string | null
  created_by: string | null
  dispatched_by: string | null
  created_at: string | null
  updated_at: string | null
  // Relations
  sales_order: {
    id: string
    display_id: string | null
    customer_id: string | null
    customers: {
      id: string
      name: string
      email: string | null
      phone: string | null
    } | null
  } | null
  // Direct customer for standalone DOs
  customers: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  pick_list: {
    id: string
    display_id: string | null
  } | null
  items: Array<{
    id: string
    item_id: string | null
    item_name: string
    sku: string | null
    quantity_shipped: number
    quantity_delivered: number
    condition: string | null
    notes: string | null
    inventory_item: {
      id: string
      name: string
      sku: string | null
      image_urls: string[] | null
    } | null
  }>
}

async function getDeliveryOrderWithDetails(id: string): Promise<(DeliveryOrderWithDetails & { created_by_name: string | null; dispatched_by_name: string | null }) | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await (supabase as any)
    .from('delivery_orders')
    .select(`
      *,
      sales_orders(id, display_id, customer_id, customers(id, name, email, phone)),
      customers(id, name, email, phone),
      pick_lists(id, display_id),
      delivery_order_items(
        *,
        inventory_items(id, name, sku, image_urls)
      ),
      created_by_profile:profiles!delivery_orders_created_by_fkey(full_name),
      dispatched_by_profile:profiles!delivery_orders_dispatched_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching delivery order:', error)
    return null
  }

  if (!data) return null

  return {
    ...data,
    sales_order: data.sales_orders || null,
    customers: data.customers || null,
    pick_list: data.pick_lists || null,
    items: (data.delivery_order_items || []).map((item: Record<string, unknown>) => ({
      ...item,
      inventory_item: item.inventory_items || null
    })),
    created_by_name: data.created_by_profile?.full_name || null,
    dispatched_by_name: data.dispatched_by_profile?.full_name || null
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export default async function DeliveryOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [deliveryOrder, userId, customers] = await Promise.all([
    getDeliveryOrderWithDetails(id),
    getCurrentUserId(),
    getCustomers()
  ])

  if (!deliveryOrder) {
    notFound()
  }

  return (
    <DeliveryOrderDetailClient
      deliveryOrder={deliveryOrder}
      createdByName={deliveryOrder.created_by_name}
      dispatchedByName={deliveryOrder.dispatched_by_name}
      currentUserId={userId}
      customers={customers}
    />
  )
}

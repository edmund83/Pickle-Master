import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { SalesOrderDetailClient } from './SalesOrderDetailClient'

export interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

export interface Customer {
  id: string
  name: string
  customer_code: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_state: string | null
  billing_postal_code: string | null
  billing_country: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_postal_code: string | null
  shipping_country: string | null
}

export interface Location {
  id: string
  name: string
}

export interface SalesOrderWithDetails {
  id: string
  tenant_id: string
  display_id: string | null
  order_number: string | null
  customer_id: string | null
  status: string | null
  priority: string | null
  order_date: string | null
  requested_date: string | null
  promised_date: string | null
  shipped_date: string | null
  delivered_date: string | null
  subtotal: number | null
  discount_total: number | null
  tax_total: number | null
  shipping_total: number | null
  total: number | null
  internal_notes: string | null
  customer_notes: string | null
  created_by: string | null
  assigned_to: string | null
  created_at: string | null
  updated_at: string | null
  // Ship To address
  ship_to_name: string | null
  ship_to_address1: string | null
  ship_to_address2: string | null
  ship_to_city: string | null
  ship_to_state: string | null
  ship_to_postal_code: string | null
  ship_to_country: string | null
  ship_to_phone: string | null
  // Bill To address
  bill_to_name: string | null
  bill_to_address1: string | null
  bill_to_address2: string | null
  bill_to_city: string | null
  bill_to_state: string | null
  bill_to_postal_code: string | null
  bill_to_country: string | null
  // Source location
  source_location_id: string | null
  // Submission and approval tracking
  submitted_by: string | null
  submitted_at: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  // Related pick list
  pick_list_id: string | null
  // Relations
  customer: {
    id: string
    name: string
    customer_code: string | null
    contact_name: string | null
    email: string | null
    phone: string | null
  } | null
  pick_list: {
    id: string
    display_id: string | null
    status: string | null
  } | null
  items: Array<{
    id: string
    item_id: string | null
    item_name: string
    sku: string | null
    quantity_ordered: number
    quantity_picked: number
    quantity_shipped: number
    quantity_delivered: number
    unit_price: number
    discount_percent: number
    discount_amount: number
    tax_rate: number
    line_total: number
    notes: string | null
    inventory_item: {
      id: string
      name: string
      sku: string | null
      quantity: number
      unit: string | null
      image_urls: string[] | null
    } | null
  }>
}

async function getSalesOrderWithDetails(id: string): Promise<(SalesOrderWithDetails & { created_by_name: string | null; assigned_to_name: string | null }) | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get SO with customer, items, pick list, and creator/assigned profiles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('sales_orders')
    .select(`
      *,
      customers(id, name, customer_code, contact_name, email, phone),
      pick_lists(id, display_id, status),
      sales_order_items(
        *,
        inventory_items(id, name, sku, quantity, unit, image_urls)
      ),
      created_by_profile:profiles!sales_orders_created_by_fkey(full_name),
      assigned_to_profile:profiles!sales_orders_assigned_to_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching sales order:', error)
    return null
  }

  if (!data) return null

  // Transform the data structure
  return {
    ...data,
    customer: data.customers || null,
    pick_list: data.pick_lists || null,
    items: (data.sales_order_items || []).map((item: Record<string, unknown>) => ({
      ...item,
      inventory_item: item.inventory_items || null
    })),
    created_by_name: data.created_by_profile?.full_name || null,
    assigned_to_name: data.assigned_to_profile?.full_name || null
  }
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, email')
    .eq('tenant_id', profile.tenant_id)
    .order('full_name')

  return data || []
}

async function getCustomersList(): Promise<Customer[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('customers')
    .select(`
      id, name, customer_code, contact_name, email, phone,
      billing_address_line1, billing_address_line2, billing_city, billing_state, billing_postal_code, billing_country,
      shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country
    `)
    .eq('tenant_id', profile.tenant_id)
    .eq('is_active', true)
    .order('name')

  return data || []
}

async function getLocationsList(): Promise<Location[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('folders')
    .select('id, name')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('name')

  return data || []
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export default async function SalesOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [salesOrder, teamMembers, customers, locations, userId] = await Promise.all([
    getSalesOrderWithDetails(id),
    getTeamMembers(),
    getCustomersList(),
    getLocationsList(),
    getCurrentUserId()
  ])

  if (!salesOrder) {
    notFound()
  }

  return (
    <SalesOrderDetailClient
      salesOrder={salesOrder}
      teamMembers={teamMembers}
      customers={customers}
      locations={locations}
      createdByName={salesOrder.created_by_name}
      assignedToName={salesOrder.assigned_to_name}
      currentUserId={userId}
    />
  )
}

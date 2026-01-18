import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PurchaseOrderDetailClient } from './PurchaseOrderDetailClient'

export interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

export interface Vendor {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  payment_terms: string | null
}

export interface PurchaseOrderWithDetails {
  id: string
  tenant_id: string
  display_id: string | null
  order_number: string | null
  vendor_id: string | null
  status: string | null
  expected_date: string | null
  received_date: string | null
  subtotal: number | null
  tax: number | null
  shipping: number | null
  total: number | null
  notes: string | null
  created_by: string | null
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
  // Bill To address
  bill_to_name: string | null
  bill_to_address1: string | null
  bill_to_address2: string | null
  bill_to_city: string | null
  bill_to_state: string | null
  bill_to_postal_code: string | null
  bill_to_country: string | null
  // Submission and approval tracking
  submitted_by: string | null
  submitted_at: string | null
  approved_by: string | null
  approved_at: string | null
  vendor: {
    id: string
    name: string
    contact_name: string | null
    email: string | null
    phone: string | null
    payment_terms: string | null
  } | null
  items: Array<{
    id: string
    item_id: string | null
    item_name: string
    sku: string | null
    part_number: string | null
    ordered_quantity: number
    received_quantity: number
    unit_price: number
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

async function getPurchaseOrderWithDetails(id: string): Promise<(PurchaseOrderWithDetails & { created_by_name: string | null }) | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get PO with vendor, items, and creator profile - consolidates separate getCreatorName query
   
  const { data, error } = await (supabase as any)
    .from('purchase_orders')
    .select(`
      *,
      vendors(id, name, contact_name, email, phone, payment_terms),
      purchase_order_items(
        *,
        inventory_items(id, name, sku, quantity, unit, image_urls)
      ),
      created_by_profile:profiles!purchase_orders_created_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching purchase order:', error)
    return null
  }

  if (!data) return null

  // Transform the data structure
  return {
    ...data,
    vendor: data.vendors || null,
    items: (data.purchase_order_items || []).map((item: Record<string, unknown>) => ({
      ...item,
      inventory_item: item.inventory_items || null
    })),
    created_by_name: data.created_by_profile?.full_name || null
  }
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

   
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, email')
    .eq('tenant_id', profile.tenant_id)
    .order('full_name')

  return data || []
}

async function getVendorsList(): Promise<Vendor[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

   
  const { data } = await (supabase as any)
    .from('vendors')
    .select('id, name, contact_name, email, phone, address_line1, address_line2, city, state, postal_code, country, payment_terms')
    .eq('tenant_id', profile.tenant_id)
    .order('name')

  return data || []
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export default async function PurchaseOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [purchaseOrder, teamMembers, vendors, userId] = await Promise.all([
    getPurchaseOrderWithDetails(id),
    getTeamMembers(),
    getVendorsList(),
    getCurrentUserId()
  ])

  if (!purchaseOrder) {
    notFound()
  }

  // created_by_name is now included in the main PO query (consolidated)
  return (
    <PurchaseOrderDetailClient
      purchaseOrder={purchaseOrder}
      teamMembers={teamMembers}
      vendors={vendors}
      createdByName={purchaseOrder.created_by_name}
      currentUserId={userId}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCustomers } from '@/app/actions/customers'
import { InvoiceDetailClient } from './InvoiceDetailClient'

export interface InvoiceWithDetails {
  id: string
  tenant_id: string
  display_id: string | null
  invoice_number: string | null
  sales_order_id: string | null
  delivery_order_id: string | null
  customer_id: string
  status: string
  invoice_date: string
  due_date: string | null
  bill_to_name: string | null
  bill_to_address1: string | null
  bill_to_address2: string | null
  bill_to_city: string | null
  bill_to_state: string | null
  bill_to_postal_code: string | null
  bill_to_country: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total: number
  amount_paid: number
  balance_due: number
  payment_term_id: string | null
  last_payment_date: string | null
  internal_notes: string | null
  customer_notes: string | null
  terms_and_conditions: string | null
  sent_at: string | null
  sent_to_email: string | null
  cancelled_at: string | null
  created_by: string | null
  sent_by: string | null
  cancelled_by: string | null
  created_at: string | null
  updated_at: string | null
  // Relations
  customer: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  sales_order: {
    id: string
    display_id: string | null
  } | null
  delivery_order: {
    id: string
    display_id: string | null
  } | null
  items: Array<{
    id: string
    sales_order_item_id: string | null
    delivery_order_item_id: string | null
    item_id: string | null
    item_name: string
    sku: string | null
    description: string | null
    quantity: number
    unit_price: number
    discount_percent: number
    discount_amount: number
    tax_rate: number
    tax_amount: number
    line_total: number
    sort_order: number
    inventory_item: {
      id: string
      name: string
      sku: string | null
      image_urls: string[] | null
    } | null
    line_item_taxes: Array<{
      id: string
      tax_rate_id: string | null
      tax_name: string
      tax_rate: number
      tax_amount: number
    }>
  }>
  payments: Array<{
    id: string
    amount: number
    payment_date: string
    payment_method: string | null
    reference_number: string | null
    notes: string | null
    created_at: string
  }>
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  billing_address1: string | null
  billing_address2: string | null
  billing_city: string | null
  billing_state: string | null
  billing_postal_code: string | null
  billing_country: string | null
}

async function getInvoiceWithDetails(id: string): Promise<(InvoiceWithDetails & { created_by_name: string | null; sent_by_name: string | null }) | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

   
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select(`
      *,
      customers(id, name, email, phone),
      sales_orders(id, display_id),
      delivery_orders(id, display_id),
      invoice_items(
        *,
        inventory_items(id, name, sku, image_urls),
        line_item_taxes(id, tax_rate_id, tax_name, tax_rate, tax_amount)
      ),
      invoice_payments(*),
      created_by_profile:profiles!invoices_created_by_fkey(full_name),
      sent_by_profile:profiles!invoices_sent_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching invoice:', error)
    return null
  }

  if (!data) return null

  return {
    ...data,
    customer: data.customers || null,
    sales_order: data.sales_orders || null,
    delivery_order: data.delivery_orders || null,
    items: (data.invoice_items || []).map((item: Record<string, unknown>) => ({
      ...item,
      inventory_item: item.inventory_items || null,
      line_item_taxes: item.line_item_taxes || []
    })),
    payments: data.invoice_payments || [],
    created_by_name: data.created_by_profile?.full_name || null,
    sent_by_name: data.sent_by_profile?.full_name || null
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export default async function InvoiceDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [invoice, userId, customers] = await Promise.all([
    getInvoiceWithDetails(id),
    getCurrentUserId(),
    getCustomers()
  ])

  if (!invoice) {
    notFound()
  }

  return (
    <InvoiceDetailClient
      invoice={invoice}
      customers={customers}
      createdByName={invoice.created_by_name}
      sentByName={invoice.sent_by_name}
      currentUserId={userId}
    />
  )
}

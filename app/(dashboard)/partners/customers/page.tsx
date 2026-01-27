'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  CustomersDataTable,
  CustomerFormDialog,
  type CustomerFormData,
} from '@/components/partners/customers'
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  reactivateCustomer,
  type CustomerListItem,
} from '@/app/actions/customers'
import {
  Plus,
  Check,
  Users,
  AlertCircle,
} from 'lucide-react'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'

interface PaymentTermOption {
  id: string
  name: string
}

export default function CustomersPage() {
  const router = useRouter()
  const isDesktop = useIsDesktop()

  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermOption[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerListItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete confirmation state
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState<CustomerListItem | null>(null)

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return
      setTenantId(profile.tenant_id)

      // Build customers query
       
      let customersQuery = (supabase as any)
        .from('customers')
        .select(`
          id,
          display_id,
          name,
          customer_code,
          contact_name,
          email,
          phone,
          billing_city,
          billing_country,
          credit_limit,
          is_active,
          created_at,
          updated_at
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('name', { ascending: true })

      if (!showInactive) {
        customersQuery = customersQuery.eq('is_active', true)
      }

      // Fetch customers and payment terms in parallel
      const [customersResult, paymentTermsResult] = await Promise.all([
        customersQuery,
         
        (supabase as any)
          .from('payment_terms')
          .select('id, name')
          .eq('tenant_id', profile.tenant_id)
          .order('sort_order', { ascending: true }),
      ])

      setCustomers((customersResult.data || []) as CustomerListItem[])
      setPaymentTerms((paymentTermsResult.data || []) as PaymentTermOption[])
    } finally {
      setLoading(false)
    }
  }, [showInactive])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  // Open dialog for creating new customer (desktop) or navigate (mobile)
  function handleAddCustomer() {
    if (isDesktop === true) {
      setEditingCustomer(null)
      setDialogOpen(true)
    } else {
      router.push('/partners/customers/new')
    }
  }

  // Open dialog for editing existing customer (desktop) or navigate (mobile)
  function handleEditCustomer(customer: CustomerListItem) {
    if (isDesktop === true) {
      setEditingCustomer(customer)
      setDialogOpen(true)
    } else {
      router.push(`/partners/customers/${customer.id}/edit`)
    }
  }

  // Handle save from dialog (create or update)
  async function handleSaveCustomer(formData: CustomerFormData) {
    if (!tenantId) return

    setSaving(true)
    setMessage(null)

    try {
      if (editingCustomer) {
        // Update existing customer
        const result = await updateCustomer(editingCustomer.id, {
          name: formData.name.trim(),
          customer_code: formData.customer_code || null,
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          billing_address_line1: formData.billing_address_line1 || null,
          billing_address_line2: formData.billing_address_line2 || null,
          billing_city: formData.billing_city || null,
          billing_state: formData.billing_state || null,
          billing_postal_code: formData.billing_postal_code || null,
          billing_country: formData.billing_country || null,
          shipping_address_line1: formData.shipping_address_line1 || null,
          shipping_address_line2: formData.shipping_address_line2 || null,
          shipping_city: formData.shipping_city || null,
          shipping_state: formData.shipping_state || null,
          shipping_postal_code: formData.shipping_postal_code || null,
          shipping_country: formData.shipping_country || null,
          shipping_same_as_billing: formData.shipping_same_as_billing,
          payment_term_id: formData.payment_term_id || null,
          credit_limit: formData.credit_limit || 0,
          notes: formData.notes || null,
        })

        if (!result.success) {
          throw new Error(result.error)
        }

        setMessage({ type: 'success', text: 'Customer updated successfully' })
      } else {
        // Create new customer
        const result = await createCustomer({
          name: formData.name.trim(),
          customer_code: formData.customer_code || null,
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          billing_address_line1: formData.billing_address_line1 || null,
          billing_address_line2: formData.billing_address_line2 || null,
          billing_city: formData.billing_city || null,
          billing_state: formData.billing_state || null,
          billing_postal_code: formData.billing_postal_code || null,
          billing_country: formData.billing_country || null,
          shipping_address_line1: formData.shipping_address_line1 || null,
          shipping_address_line2: formData.shipping_address_line2 || null,
          shipping_city: formData.shipping_city || null,
          shipping_state: formData.shipping_state || null,
          shipping_postal_code: formData.shipping_postal_code || null,
          shipping_country: formData.shipping_country || null,
          shipping_same_as_billing: formData.shipping_same_as_billing,
          payment_term_id: formData.payment_term_id || null,
          credit_limit: formData.credit_limit || 0,
          notes: formData.notes || null,
        })

        if (!result.success) {
          throw new Error(result.error)
        }

        setMessage({ type: 'success', text: 'Customer added successfully' })
      }

      setDialogOpen(false)
      setEditingCustomer(null)
      loadCustomers()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save customer',
      })
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Handle toggle active status
  async function handleToggleActive(customer: CustomerListItem) {
    setMessage(null)

    try {
      if (customer.is_active) {
        // Deactivate
        const result = await deleteCustomer(customer.id)
        if (!result.success) {
          throw new Error(result.error)
        }
        setMessage({ type: 'success', text: 'Customer deactivated' })
      } else {
        // Reactivate
        const result = await reactivateCustomer(customer.id)
        if (!result.success) {
          throw new Error(result.error)
        }
        setMessage({ type: 'success', text: 'Customer reactivated' })
      }
      loadCustomers()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update customer status',
      })
    }
  }

  // Handle single delete
  function handleDeleteCustomer(customer: CustomerListItem) {
    setDeleteConfirmCustomer(customer)
  }

  async function confirmDelete() {
    if (!deleteConfirmCustomer) return

    try {
      const result = await deleteCustomer(deleteConfirmCustomer.id)
      if (!result.success) {
        throw new Error(result.error)
      }
      setDeleteConfirmCustomer(null)
      setMessage({ type: 'success', text: 'Customer deleted' })
      loadCustomers()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete customer',
      })
    }
  }

  // Handle bulk delete
  async function handleBulkDelete(customersToDelete: CustomerListItem[]) {
    try {
      for (const customer of customersToDelete) {
        const result = await deleteCustomer(customer.id)
        if (!result.success) {
          throw new Error(result.error)
        }
      }

      setMessage({
        type: 'success',
        text: `${customersToDelete.length} customer${customersToDelete.length !== 1 ? 's' : ''} deleted`,
      })
      loadCustomers()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete customers',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-neutral-50 p-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-4 w-64 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Customers</h1>
            <p className="mt-1 text-neutral-500">
              Manage your customers and clients
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              Show inactive
            </label>
            <Button onClick={handleAddCustomer}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Global Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {customers.length > 0 ? (
          <CustomersDataTable
            customers={customers}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onToggleActive={handleToggleActive}
            onBulkDelete={handleBulkDelete}
            enableSelection
          />
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-4 font-medium text-neutral-600">No customers yet</p>
            <p className="mt-1 text-sm text-neutral-400">
              Add customers to create sales orders and invoices
            </p>
            <Button className="mt-4" onClick={handleAddCustomer}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first customer
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <CustomerFormDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingCustomer(null)
        }}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
        saving={saving}
        paymentTerms={paymentTerms}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirmCustomer(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-neutral-900">Delete Customer</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Are you sure you want to delete <strong>{deleteConfirmCustomer.name}</strong>?
              {deleteConfirmCustomer.is_active && ' If this customer has sales orders, they will be deactivated instead.'}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmCustomer(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

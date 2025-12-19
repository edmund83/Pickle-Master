'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Plus, Minus, Check, Loader2, ClipboardList, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PurchaseOrder, PurchaseOrderItem, InventoryItem } from '@/types/database.types'

interface POWithItems extends PurchaseOrder {
  purchase_order_items: (PurchaseOrderItem & { inventory_items: InventoryItem | null })[]
}

export default function ReceivingPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<POWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPO, setSelectedPO] = useState<POWithItems | null>(null)
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [receiving, setReceiving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadPurchaseOrders()
  }, [])

  async function loadPurchaseOrders() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      // Get pending/partial POs with items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('purchase_orders')
        .select(`
          *,
          purchase_order_items(
            *,
            inventory_items(id, name, sku, quantity, unit)
          )
        `)
        .eq('tenant_id', profile.tenant_id)
        .in('status', ['submitted', 'confirmed', 'partial'])
        .order('created_at', { ascending: false })

      setPurchaseOrders((data || []) as POWithItems[])
    } finally {
      setLoading(false)
    }
  }

  function selectPO(po: POWithItems) {
    setSelectedPO(po)
    // Initialize received quantities with remaining quantities
    const quantities: Record<string, number> = {}
    po.purchase_order_items.forEach(item => {
      const remaining = item.ordered_quantity - (item.received_quantity || 0)
      quantities[item.id] = remaining
    })
    setReceivedQuantities(quantities)
    setNotes('')
  }

  function updateQuantity(itemId: string, delta: number) {
    const item = selectedPO?.purchase_order_items.find(i => i.id === itemId)
    if (!item) return

    const remaining = item.ordered_quantity - (item.received_quantity || 0)
    const current = receivedQuantities[itemId] || 0
    const newValue = Math.max(0, Math.min(remaining, current + delta))

    setReceivedQuantities({ ...receivedQuantities, [itemId]: newValue })
  }

  async function handleReceive() {
    if (!selectedPO) return

    setReceiving(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update each PO item and inventory
      for (const item of selectedPO.purchase_order_items) {
        const receivedQty = receivedQuantities[item.id] || 0
        if (receivedQty <= 0) continue

        // Update PO item received quantity
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('purchase_order_items')
          .update({
            received_quantity: (item.received_quantity || 0) + receivedQty
          })
          .eq('id', item.id)

        // Update inventory quantity
        if (item.item_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: currentItem } = await (supabase as any)
            .from('inventory_items')
            .select('quantity')
            .eq('id', item.item_id)
            .single()

          if (currentItem) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('inventory_items')
              .update({
                quantity: currentItem.quantity + receivedQty,
                last_modified_by: user.id
              })
              .eq('id', item.item_id)
          }
        }
      }

      // Check if PO is fully received
      const allReceived = selectedPO.purchase_order_items.every(item => {
        const newReceived = (item.received_quantity || 0) + (receivedQuantities[item.id] || 0)
        return newReceived >= item.ordered_quantity
      })

      // Update PO status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('purchase_orders')
        .update({
          status: allReceived ? 'received' : 'partial',
          notes: notes ? `${selectedPO.notes || ''}\n[Received] ${notes}`.trim() : selectedPO.notes
        })
        .eq('id', selectedPO.id)

      setSuccess(true)
      setSelectedPO(null)
      loadPurchaseOrders()
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setReceiving(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Receiving</h1>
        <p className="mt-1 text-neutral-500">
          Receive items from purchase orders and update inventory
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-8 mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5" />
          Items received successfully! Inventory has been updated.
        </div>
      )}

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : selectedPO ? (
          /* Receiving Form */
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    PO #{selectedPO.order_number || selectedPO.id.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {selectedPO.vendor_id ? `Vendor ID: ${selectedPO.vendor_id.slice(0, 8)}` : 'Unknown Vendor'} • {selectedPO.created_at ? new Date(selectedPO.created_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedPO(null)}>
                  Back to List
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Items */}
              <div className="mb-6 space-y-4">
                {selectedPO.purchase_order_items.map((item) => {
                  const remaining = item.ordered_quantity - (item.received_quantity || 0)
                  const receiving = receivedQuantities[item.id] || 0

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Package className="h-8 w-8 text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900">
                            {item.inventory_items?.name || item.item_name || 'Unknown Item'}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Ordered: {item.ordered_quantity} • Received: {item.received_quantity || 0} • Remaining: {remaining}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={receiving <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-16 text-center text-lg font-semibold">
                          {receiving}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={receiving >= remaining}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Receiving Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this delivery..."
                  className="h-24 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedPO(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReceive}
                  disabled={receiving || Object.values(receivedQuantities).every(q => q === 0)}
                >
                  {receiving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Confirm Receipt
                </Button>
              </div>
            </div>
          </div>
        ) : purchaseOrders.length > 0 ? (
          /* PO List */
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                Pending Purchase Orders
              </h2>
            </div>
            <ul className="divide-y divide-neutral-200">
              {purchaseOrders.map((po) => {
                const totalOrdered = po.purchase_order_items.reduce((sum, item) => sum + item.ordered_quantity, 0)
                const totalReceived = po.purchase_order_items.reduce((sum, item) => sum + (item.received_quantity || 0), 0)
                const progress = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0

                return (
                  <li
                    key={po.id}
                    className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-neutral-50"
                    onClick={() => selectPO(po)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">PO #{po.order_number || po.id.slice(0, 8)}</p>
                        <p className="text-sm text-neutral-500">
                          {po.vendor_id ? `Vendor ID: ${po.vendor_id.slice(0, 8)}` : 'Unknown Vendor'} • {po.purchase_order_items.length} items
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900">
                          {totalReceived} / {totalOrdered} received
                        </p>
                        <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-neutral-200">
                          <div
                            className="h-full bg-pickle-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        po.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {po.status === 'partial' ? 'Partial' : 'Pending'}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <ClipboardList className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">No pending orders</h3>
            <p className="mt-1 text-neutral-500">
              There are no purchase orders waiting to be received
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

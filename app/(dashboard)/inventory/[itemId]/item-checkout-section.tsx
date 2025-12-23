'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LogIn, Clock, User, Briefcase, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckOutModal, CheckInModal, CheckoutHistory } from '@/components/checkout'
import type { InventoryItem } from '@/types/database.types'
import { format } from 'date-fns'
import { ItemDetailCard } from './components/item-detail-card'

interface ActiveCheckout {
  id: string
  quantity: number
  assignee_type: 'person' | 'job' | 'location'
  assignee_id: string | null
  assignee_name: string | null
  checked_out_at: string
  due_date: string | null
  status: 'checked_out' | 'returned' | 'overdue'
  notes: string | null
  checked_out_by_name: string | null
  is_overdue: boolean
  days_until_due: number | null
}

interface ItemCheckoutSectionProps {
  item: InventoryItem
}

const assigneeTypeIcons = {
  person: <User className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />
}

export function ItemCheckoutStatusCard({ item }: ItemCheckoutSectionProps) {
  const router = useRouter()
  const [activeCheckout, setActiveCheckout] = useState<ActiveCheckout | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)

  useEffect(() => {
    loadActiveCheckout()
  }, [item.id])

  async function loadActiveCheckout() {
    setLoading(true)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: checkoutData } = await (supabase as any)
        .from('checkouts')
        .select('*')
        .eq('item_id', item.id)
        .neq('status', 'returned')
        .maybeSingle() // Use maybeSingle to avoid error if no checkout found

      if (checkoutData) {
        // Calculate overdue status manually since we aren't using RPC
        const isOverdue = checkoutData.due_date ? new Date(checkoutData.due_date) < new Date() : false
        const daysUntilDue = checkoutData.due_date ? Math.ceil((new Date(checkoutData.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

        setActiveCheckout({
          ...checkoutData,
          is_overdue: isOverdue,
          days_until_due: daysUntilDue,
          checked_out_by_name: null // Simplified, logic would need another join or separate fetch if needed, but for now null is fine
        })
      } else {
        setActiveCheckout(null)
      }
    } catch (err) {
      console.error('Error loading active checkout:', err)
      setActiveCheckout(null)
    } finally {
      setLoading(false)
    }
  }

  function handleSuccess() {
    loadActiveCheckout()
    router.refresh()
  }

  if (loading) {
    return (
      <ItemDetailCard title="Checkout" icon={<Clock className="h-5 w-5" />}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      </ItemDetailCard>
    )
  }

  return (
    <>
      {activeCheckout ? (
        <ItemDetailCard
          title={activeCheckout.is_overdue ? 'Overdue' : 'Checked Out'}
          icon={
            <LogOut
              className={`h-5 w-5 ${activeCheckout.is_overdue ? 'text-red-500' : 'text-amber-500'
                }`}
            />
          }
          className={
            activeCheckout.is_overdue
              ? 'border-red-200 bg-red-50'
              : 'border-amber-200 bg-amber-50'
          }
          headerClassName={
            activeCheckout.is_overdue ? 'border-red-200' : 'border-amber-200'
          }
          titleClassName={activeCheckout.is_overdue ? 'text-red-700' : 'text-amber-700'}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">
                {assigneeTypeIcons[activeCheckout.assignee_type]}
              </span>
              <span className="font-medium text-neutral-900">
                {activeCheckout.assignee_name || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Checked out: </span>
                <span className="text-neutral-700">
                  {format(new Date(activeCheckout.checked_out_at), 'MMM d, yyyy')}
                </span>
              </div>
              {activeCheckout.due_date && (
                <div>
                  <span className="text-neutral-500">Due: </span>
                  <span className={activeCheckout.is_overdue ? 'font-medium text-red-600' : 'text-neutral-700'}>
                    {format(new Date(activeCheckout.due_date), 'MMM d, yyyy')}
                    {activeCheckout.is_overdue && ` (${Math.abs(activeCheckout.days_until_due || 0)} days overdue)`}
                  </span>
                </div>
              )}
            </div>

            {activeCheckout.checked_out_by_name && (
              <p className="text-xs text-neutral-500">
                by {activeCheckout.checked_out_by_name}
              </p>
            )}
          </div>

          <Button
            onClick={() => setShowCheckInModal(true)}
            className={`mt-4 w-full ${activeCheckout.is_overdue
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-600 hover:bg-amber-700'
              }`}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </ItemDetailCard>
      ) : (
        <ItemDetailCard title="Availability" icon={<Clock className="h-5 w-5" />}>
          <p className="mb-4 text-sm text-neutral-600">
            This item is available for checkout.
          </p>
          <Button
            onClick={() => setShowCheckOutModal(true)}
            className="w-full bg-pickle-600 text-white hover:bg-pickle-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Check Out
          </Button>
        </ItemDetailCard>
      )}

      {/* Modals */}
      <CheckOutModal
        item={item}
        isOpen={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        onSuccess={handleSuccess}
      />

      {activeCheckout && (
        <CheckInModal
          checkout={{
            id: activeCheckout.id,
            item_id: item.id,
            item_name: item.name,
            quantity: activeCheckout.quantity,
            assignee_type: activeCheckout.assignee_type,
            assignee_name: activeCheckout.assignee_name,
            checked_out_at: activeCheckout.checked_out_at,
            due_date: activeCheckout.due_date,
            is_overdue: activeCheckout.is_overdue
          }}
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

export function ItemCheckoutHistoryCard({ itemId, limit = 5 }: { itemId: string; limit?: number }) {
  return (
    <ItemDetailCard title="Checkout History" icon={<Clock className="h-5 w-5" />}>
      <CheckoutHistory itemId={itemId} limit={limit} />
    </ItemDetailCard>
  )
}

export function ItemCheckoutSection({ item }: ItemCheckoutSectionProps) {
  return (
    <>
      <ItemCheckoutStatusCard item={item} />
      <ItemCheckoutHistoryCard itemId={item.id} limit={5} />
    </>
  )
}

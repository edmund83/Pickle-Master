'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LogIn, Clock, User, Briefcase, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckOutModal, CheckInModal, CheckoutHistory } from '@/components/checkout'
import type { InventoryItem } from '@/types/database.types'
import { format } from 'date-fns'

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

export function ItemCheckoutSection({ item }: ItemCheckoutSectionProps) {
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
      const { data } = await (supabase as any).rpc('get_active_checkout', {
        p_item_id: item.id
      })

      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        setActiveCheckout(parsed)
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
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Checkout Status Card - shows if item is checked out */}
      {activeCheckout ? (
        <div className={`rounded-xl border p-6 ${
          activeCheckout.is_overdue
            ? 'border-red-200 bg-red-50'
            : 'border-amber-200 bg-amber-50'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <LogOut className={`h-5 w-5 ${
              activeCheckout.is_overdue ? 'text-red-500' : 'text-amber-500'
            }`} />
            <h2 className={`text-sm font-medium uppercase tracking-wide ${
              activeCheckout.is_overdue ? 'text-red-700' : 'text-amber-700'
            }`}>
              {activeCheckout.is_overdue ? 'Overdue' : 'Checked Out'}
            </h2>
          </div>

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
            className={`mt-4 w-full ${
              activeCheckout.is_overdue
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </div>
      ) : (
        /* Check Out Button - shows if item is available */
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-neutral-400" />
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              Availability
            </h2>
          </div>
          <p className="mb-4 text-sm text-neutral-600">
            This item is available for checkout.
          </p>
          <Button
            onClick={() => setShowCheckOutModal(true)}
            variant="outline"
            className="w-full border-pickle-300 text-pickle-700 hover:bg-pickle-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Check Out
          </Button>
        </div>
      )}

      {/* Checkout History */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Checkout History
          </h2>
        </div>
        <CheckoutHistory itemId={item.id} limit={5} />
      </div>

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

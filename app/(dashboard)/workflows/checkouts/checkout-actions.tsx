'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckInModal } from '@/components/checkout'

interface CheckoutInfo {
  id: string
  item_id: string
  item_name: string
  quantity: number
  assignee_type: string
  assignee_name: string | null
  checked_out_at: string
  due_date: string | null
  is_overdue?: boolean
}

interface CheckoutActionsProps {
  checkout: CheckoutInfo
}

export function CheckoutActions({ checkout }: CheckoutActionsProps) {
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCheckInModal(true)}
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        Check In
      </Button>

      <CheckInModal
        checkout={checkout}
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}

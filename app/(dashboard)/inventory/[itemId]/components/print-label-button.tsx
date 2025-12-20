'use client'

import { useState } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LabelWizard, { type LabelWizardItem } from '@/components/labels/LabelWizard'

interface PrintLabelButtonProps {
  item: LabelWizardItem
  tenantLogo?: string | null
  userEmail?: string | null
}

export default function PrintLabelButton({ item, tenantLogo, userEmail }: PrintLabelButtonProps) {
  const [showWizard, setShowWizard] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowWizard(true)}>
        <Printer className="mr-2 h-4 w-4" />
        Print Label
      </Button>

      {showWizard && (
        <LabelWizard
          item={item}
          tenantLogo={tenantLogo}
          userEmail={userEmail}
          onClose={() => setShowWizard(false)}
          onSave={() => {
            // Could add toast notification here
            console.log('Label saved/printed')
          }}
        />
      )}
    </>
  )
}

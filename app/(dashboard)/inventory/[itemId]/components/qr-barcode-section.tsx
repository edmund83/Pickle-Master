'use client'

import { useState } from 'react'
import QRBarcodeCard from './qr-barcode-card'
import LabelWizard, { type LabelWizardItem } from '@/components/labels/LabelWizard'

interface QRBarcodeSectionProps {
  item: LabelWizardItem
  tenantLogo?: string | null
  userEmail?: string | null
}

export default function QRBarcodeSection({
  item,
  tenantLogo,
  userEmail
}: QRBarcodeSectionProps) {
  const [showWizard, setShowWizard] = useState(false)

  const handlePrintLabel = () => {
    setShowWizard(true)
  }

  return (
    <>
      <QRBarcodeCard
        itemId={item.id}
        itemName={item.name}
        existingBarcode={item.barcode}
        onPrintLabel={handlePrintLabel}
      />

      {showWizard && (
        <LabelWizard
          item={item}
          tenantLogo={tenantLogo}
          userEmail={userEmail}
          onClose={() => setShowWizard(false)}
          onSave={() => {
            console.log('Label saved/printed')
          }}
        />
      )}
    </>
  )
}

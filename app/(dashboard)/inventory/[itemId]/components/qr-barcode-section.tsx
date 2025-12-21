'use client'

import { useState } from 'react'
import QRBarcodeCard from './qr-barcode-card'
import LabelWizard, { type LabelWizardItem } from '@/components/labels/LabelWizard'
import { updateItemField } from '@/app/actions/inventory'
import { generateItemBarcode } from '@/lib/labels/barcode-generator'
import { useRouter } from 'next/navigation'

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
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handlePrintLabel = () => {
    setShowWizard(true)
  }

  const handleGenerateBarcode = async () => {
    setIsGenerating(true)
    try {
      // Generate a new barcode for the item
      const newBarcode = generateItemBarcode(item.id)

      // Save the barcode to the database
      await updateItemField(item.id, 'barcode', newBarcode)

      // Refresh the page to show the new barcode
      router.refresh()
    } catch (error) {
      console.error('Failed to generate barcode:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <QRBarcodeCard
        itemId={item.id}
        itemName={item.name}
        existingBarcode={item.barcode}
        onPrintLabel={handlePrintLabel}
        onGenerateBarcode={handleGenerateBarcode}
        isGenerating={isGenerating}
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

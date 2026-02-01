'use client'

import { useState } from 'react'
import { LotsPanel } from './lots-panel'
import { CreateLotModal } from '@/components/lots/CreateLotModal'
import { AdjustLotModal } from '@/components/lots/AdjustLotModal'

interface ItemAdvancedPanelsProps {
  itemId: string
  itemName: string
  trackingMode: 'none' | 'serialized' | 'lot_expiry'
}

export function ItemAdvancedPanels({
  itemId,
  itemName,
  trackingMode,
}: ItemAdvancedPanelsProps) {
  // Modals state
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showAdjustLot, setShowAdjustLot] = useState(false)
  const [selectedLotId, setSelectedLotId] = useState<string>('')
  const [selectedLotNumber, setSelectedLotNumber] = useState<string>('')
  const [selectedLotQuantity, setSelectedLotQuantity] = useState<number>(0)

  // Refresh key to trigger panel reloads
  const [refreshKey, setRefreshKey] = useState(0)

  function handleCreateLot() {
    setShowCreateLot(true)
  }

  function handleAdjustLot(lotId: string, lotNumber: string, quantity?: number) {
    setSelectedLotId(lotId)
    setSelectedLotNumber(lotNumber)
    setSelectedLotQuantity(quantity || 0)
    setShowAdjustLot(true)
  }

  function handleSuccess() {
    // Trigger refresh of panels
    setRefreshKey((k) => k + 1)
  }

  // Only show panels for lot-tracked items
  if (trackingMode !== 'lot_expiry') {
    return null
  }

  return (
    <>
      {/* Unified Lots Panel with integrated FEFO */}
      <LotsPanel
        key={`lots-${refreshKey}`}
        itemId={itemId}
        itemName={itemName}
        trackingMode={trackingMode}
        onCreateLot={handleCreateLot}
        onAdjustLot={(lotId, lotNumber, quantity) => handleAdjustLot(lotId, lotNumber, quantity)}
      />

      {/* Modals */}
      <CreateLotModal
        isOpen={showCreateLot}
        onClose={() => setShowCreateLot(false)}
        onSuccess={handleSuccess}
        itemId={itemId}
        itemName={itemName}
      />

      <AdjustLotModal
        isOpen={showAdjustLot}
        onClose={() => {
          setShowAdjustLot(false)
          setSelectedLotId('')
          setSelectedLotNumber('')
          setSelectedLotQuantity(0)
        }}
        onSuccess={handleSuccess}
        lotId={selectedLotId}
        lotNumber={selectedLotNumber}
        currentQuantity={selectedLotQuantity}
        itemName={itemName}
      />
    </>
  )
}

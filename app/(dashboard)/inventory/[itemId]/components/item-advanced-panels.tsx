'use client'

import { useState } from 'react'
import { LotsPanel } from './lots-panel'
import { FEFOPanel } from './fefo-panel'
import { ItemLocationsPanel } from './item-locations-panel'
import { CreateLotModal } from '@/components/lots/CreateLotModal'
import { AdjustLotModal } from '@/components/lots/AdjustLotModal'
import { StockTransferModal } from '@/components/transfers/StockTransferModal'

interface ItemAdvancedPanelsProps {
  itemId: string
  itemName: string
  trackingMode: 'none' | 'serialized' | 'lot_expiry'
  multiLocationEnabled: boolean
}

export function ItemAdvancedPanels({
  itemId,
  itemName,
  trackingMode,
  multiLocationEnabled,
}: ItemAdvancedPanelsProps) {
  // Modals state
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showAdjustLot, setShowAdjustLot] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [selectedLotId, setSelectedLotId] = useState<string>('')
  const [selectedLotNumber, setSelectedLotNumber] = useState<string>('')
  const [selectedLotQuantity, setSelectedLotQuantity] = useState<number>(0)
  const [selectedFromLocationId, setSelectedFromLocationId] = useState<string>('')

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

  function handleTransfer(fromLocationId?: string) {
    if (fromLocationId) {
      setSelectedFromLocationId(fromLocationId)
    }
    setShowTransfer(true)
  }

  function handleSuccess() {
    // Trigger refresh of panels
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Multi-Location Stock Panel */}
        {multiLocationEnabled && (
          <ItemLocationsPanel
            key={`locations-${refreshKey}`}
            itemId={itemId}
            itemName={itemName}
            onTransfer={handleTransfer}
          />
        )}

        {/* Lots Panel - for lot-tracked items */}
        {trackingMode === 'lot_expiry' && (
          <LotsPanel
            key={`lots-${refreshKey}`}
            itemId={itemId}
            itemName={itemName}
            trackingMode={trackingMode}
            onCreateLot={handleCreateLot}
            onAdjustLot={(lotId, lotNumber, quantity) => handleAdjustLot(lotId, lotNumber, quantity)}
          />
        )}

        {/* FEFO Panel - for lot-tracked items */}
        {trackingMode === 'lot_expiry' && (
          <FEFOPanel
            key={`fefo-${refreshKey}`}
            itemId={itemId}
            itemName={itemName}
            trackingMode={trackingMode}
          />
        )}
      </div>

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

      <StockTransferModal
        isOpen={showTransfer}
        onClose={() => {
          setShowTransfer(false)
          setSelectedFromLocationId('')
        }}
        onSuccess={handleSuccess}
        itemId={itemId}
        itemName={itemName}
        fromLocationId={selectedFromLocationId || undefined}
      />
    </>
  )
}

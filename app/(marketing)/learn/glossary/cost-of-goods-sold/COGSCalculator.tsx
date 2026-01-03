'use client'

import { useState } from 'react'

export function COGSCalculator() {
  const [beginningInventory, setBeginningInventory] = useState<string>('50000')
  const [purchases, setPurchases] = useState<string>('200000')
  const [endingInventory, setEndingInventory] = useState<string>('60000')

  const beginningNum = parseFloat(beginningInventory) || 0
  const purchasesNum = parseFloat(purchases) || 0
  const endingNum = parseFloat(endingInventory) || 0

  // COGS = Beginning Inventory + Purchases - Ending Inventory
  const cogs = beginningNum + purchasesNum - endingNum
  const goodsAvailable = beginningNum + purchasesNum

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="mt-8 rounded-box bg-base-200 p-6 sm:p-8">
      <h2 className="text-base-content text-xl font-semibold">COGS Calculator</h2>
      <p className="text-base-content/80 mt-1">
        Enter your inventory and purchase values to calculate your Cost of Goods Sold.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="beginningInventory" className="text-base-content text-sm font-medium">
            Beginning Inventory
          </label>
          <div className="relative mt-1">
            <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input
              type="number"
              id="beginningInventory"
              value={beginningInventory}
              onChange={(e) => setBeginningInventory(e.target.value)}
              className="input input-bordered w-full pl-7"
              min="0"
              step="1000"
            />
          </div>
          <p className="text-base-content/60 mt-1 text-xs">Value at start of period</p>
        </div>

        <div>
          <label htmlFor="purchases" className="text-base-content text-sm font-medium">
            Purchases During Period
          </label>
          <div className="relative mt-1">
            <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input
              type="number"
              id="purchases"
              value={purchases}
              onChange={(e) => setPurchases(e.target.value)}
              className="input input-bordered w-full pl-7"
              min="0"
              step="1000"
            />
          </div>
          <p className="text-base-content/60 mt-1 text-xs">Total inventory bought</p>
        </div>

        <div>
          <label htmlFor="endingInventory" className="text-base-content text-sm font-medium">
            Ending Inventory
          </label>
          <div className="relative mt-1">
            <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input
              type="number"
              id="endingInventory"
              value={endingInventory}
              onChange={(e) => setEndingInventory(e.target.value)}
              className="input input-bordered w-full pl-7"
              min="0"
              step="1000"
            />
          </div>
          <p className="text-base-content/60 mt-1 text-xs">Value at end of period</p>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 rounded-lg bg-base-100 p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <p className="text-base-content/60 text-sm">Goods Available for Sale</p>
            <p className="text-base-content text-2xl font-semibold">{formatCurrency(goodsAvailable)}</p>
            <p className="text-base-content/60 mt-1 text-xs">Beginning + Purchases</p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60 text-sm">Ending Inventory</p>
            <p className="text-base-content text-2xl font-semibold">{formatCurrency(endingNum)}</p>
            <p className="text-base-content/60 mt-1 text-xs">Still on hand</p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-primary text-sm font-medium">Cost of Goods Sold</p>
            <p className="text-primary text-3xl font-bold">{formatCurrency(cogs)}</p>
            <p className="text-base-content/60 mt-1 text-xs">COGS</p>
          </div>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="mt-6 rounded-lg border border-base-300 bg-base-100 p-4">
        <p className="text-base-content text-sm font-mono">
          COGS = Beginning Inventory + Purchases - Ending Inventory
          <br />
          COGS = {formatCurrency(beginningNum)} + {formatCurrency(purchasesNum)} - {formatCurrency(endingNum)}
          <br />
          <strong className="text-primary">COGS = {formatCurrency(cogs)}</strong>
        </p>
      </div>

      {/* Interpretation */}
      {cogs !== 0 && (
        <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4">
          <p className="text-base-content">
            <strong>Interpretation:</strong> Your Cost of Goods Sold is{' '}
            <span className="text-primary font-semibold">{formatCurrency(cogs)}</span> for this period. This represents
            the direct cost of the inventory you sold. Subtract this from your revenue to calculate gross profit.
          </p>
          {cogs < 0 && (
            <p className="mt-2 text-warning">
              A negative COGS is unusual. Check that your ending inventory is not greater than beginning inventory plus purchases.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'

export function InventoryTurnoverCalculator() {
  const [cogs, setCogs] = useState<string>('500000')
  const [beginningInventory, setBeginningInventory] = useState<string>('80000')
  const [endingInventory, setEndingInventory] = useState<string>('120000')

  const cogsNum = parseFloat(cogs) || 0
  const beginningNum = parseFloat(beginningInventory) || 0
  const endingNum = parseFloat(endingInventory) || 0

  const averageInventory = (beginningNum + endingNum) / 2
  const inventoryTurnover = averageInventory > 0 ? cogsNum / averageInventory : 0
  const daysInInventory = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0

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
      <h2 className="text-base-content text-xl font-semibold">Inventory Turnover Calculator</h2>
      <p className="text-base-content/80 mt-1">
        Enter your values below to calculate your inventory turnover ratio and days sales of inventory.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="cogs" className="text-base-content text-sm font-medium">
            Cost of Goods Sold (COGS)
          </label>
          <div className="relative mt-1">
            <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input
              type="number"
              id="cogs"
              value={cogs}
              onChange={(e) => setCogs(e.target.value)}
              className="input input-bordered w-full pl-7"
              min="0"
              step="1000"
            />
          </div>
          <p className="text-base-content/60 mt-1 text-xs">Annual cost of goods sold</p>
        </div>

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
          <p className="text-base-content/60 mt-1 text-xs">Inventory value at period start</p>
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
          <p className="text-base-content/60 mt-1 text-xs">Inventory value at period end</p>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 rounded-lg bg-base-100 p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <p className="text-base-content/60 text-sm">Average Inventory</p>
            <p className="text-base-content text-2xl font-semibold">{formatCurrency(averageInventory)}</p>
            <p className="text-base-content/60 mt-1 text-xs">
              ({formatCurrency(beginningNum)} + {formatCurrency(endingNum)}) / 2
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-primary text-sm font-medium">Inventory Turnover</p>
            <p className="text-primary text-3xl font-bold">
              {inventoryTurnover.toFixed(1)} <span className="text-lg font-normal">turns</span>
            </p>
            <p className="text-base-content/60 mt-1 text-xs">per year</p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60 text-sm">Days Sales of Inventory</p>
            <p className="text-base-content text-2xl font-semibold">
              {daysInInventory.toFixed(0)} <span className="text-base font-normal">days</span>
            </p>
            <p className="text-base-content/60 mt-1 text-xs">365 / turnover ratio</p>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      {inventoryTurnover > 0 && (
        <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4">
          <p className="text-base-content">
            <strong>Interpretation:</strong> Your inventory turns over{' '}
            <span className="text-primary font-semibold">{inventoryTurnover.toFixed(1)} times</span> per year. On average,
            items sit in inventory for <span className="text-primary font-semibold">{daysInInventory.toFixed(0)} days</span>{' '}
            before being sold.
            {inventoryTurnover < 2 && (
              <span className="mt-2 block text-warning">
                This is relatively low. Consider reviewing slow-moving stock and demand forecasting.
              </span>
            )}
            {inventoryTurnover >= 2 && inventoryTurnover < 4 && (
              <span className="mt-2 block">
                This is in the moderate range. Check your industry benchmarks above to see how you compare.
              </span>
            )}
            {inventoryTurnover >= 4 && inventoryTurnover < 8 && (
              <span className="mt-2 block text-success">
                This is a healthy turnover rate for most industries. Good inventory management!
              </span>
            )}
            {inventoryTurnover >= 8 && (
              <span className="mt-2 block text-success">
                Excellent turnover! Make sure you are not understocking and losing sales due to stockouts.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

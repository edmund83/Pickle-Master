'use client'

import { useState } from 'react'

export function ReorderPointCalculator() {
  const [leadTime, setLeadTime] = useState<string>('7')
  const [dailyDemand, setDailyDemand] = useState<string>('20')
  const [safetyStock, setSafetyStock] = useState<string>('50')

  const leadTimeNum = parseFloat(leadTime) || 0
  const dailyDemandNum = parseFloat(dailyDemand) || 0
  const safetyStockNum = parseFloat(safetyStock) || 0

  const demandDuringLeadTime = leadTimeNum * dailyDemandNum
  const reorderPoint = demandDuringLeadTime + safetyStockNum

  return (
    <div className="mt-8 rounded-box bg-base-200 p-6 sm:p-8">
      <h2 className="text-base-content text-xl font-semibold">Calculate your reorder point</h2>
      <p className="text-base-content/80 mt-1">
        Enter your values below to calculate when to reorder.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="leadTime" className="text-base-content text-sm font-medium">
            Lead time (days)
          </label>
          <input
            type="number"
            id="leadTime"
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            className="input input-bordered mt-1 w-full"
            min="0"
            step="1"
          />
          <p className="text-base-content/60 mt-1 text-xs">Days from order to delivery</p>
        </div>

        <div>
          <label htmlFor="dailyDemand" className="text-base-content text-sm font-medium">
            Daily demand (units)
          </label>
          <input
            type="number"
            id="dailyDemand"
            value={dailyDemand}
            onChange={(e) => setDailyDemand(e.target.value)}
            className="input input-bordered mt-1 w-full"
            min="0"
            step="0.1"
          />
          <p className="text-base-content/60 mt-1 text-xs">Average units sold per day</p>
        </div>

        <div>
          <label htmlFor="safetyStock" className="text-base-content text-sm font-medium">
            Safety stock (units)
          </label>
          <input
            type="number"
            id="safetyStock"
            value={safetyStock}
            onChange={(e) => setSafetyStock(e.target.value)}
            className="input input-bordered mt-1 w-full"
            min="0"
            step="1"
          />
          <p className="text-base-content/60 mt-1 text-xs">Buffer for demand variability</p>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 rounded-lg bg-base-100 p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <p className="text-base-content/60 text-sm">Demand during lead time</p>
            <p className="text-base-content text-2xl font-semibold">
              {demandDuringLeadTime.toFixed(0)} <span className="text-base font-normal">units</span>
            </p>
            <p className="text-base-content/60 mt-1 text-xs">
              {leadTimeNum} days × {dailyDemandNum} units/day
            </p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60 text-sm">Safety stock</p>
            <p className="text-base-content text-2xl font-semibold">
              {safetyStockNum.toFixed(0)} <span className="text-base font-normal">units</span>
            </p>
            <p className="text-base-content/60 mt-1 text-xs">Buffer inventory</p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-primary text-sm font-medium">Reorder Point</p>
            <p className="text-primary text-3xl font-bold">
              {reorderPoint.toFixed(0)} <span className="text-lg font-normal">units</span>
            </p>
            <p className="text-base-content/60 mt-1 text-xs">Order when stock reaches this level</p>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      {reorderPoint > 0 && (
        <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4">
          <p className="text-base-content">
            <strong>Interpretation:</strong> When your inventory drops to{' '}
            <span className="text-primary font-semibold">{reorderPoint.toFixed(0)} units</span>, place a new order. This
            gives you enough stock to cover {leadTimeNum} days of lead time ({demandDuringLeadTime.toFixed(0)} units) plus{' '}
            {safetyStockNum.toFixed(0)} units of safety stock.
          </p>
        </div>
      )}
    </div>
  )
}

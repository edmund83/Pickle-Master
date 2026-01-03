'use client'

import { useState } from 'react'

export function EOQCalculator() {
  const [annualDemand, setAnnualDemand] = useState<string>('1000')
  const [orderingCost, setOrderingCost] = useState<string>('50')
  const [holdingCost, setHoldingCost] = useState<string>('5')

  const D = parseFloat(annualDemand) || 0
  const S = parseFloat(orderingCost) || 0
  const H = parseFloat(holdingCost) || 0

  // EOQ = sqrt((2 * D * S) / H)
  const eoq = H > 0 ? Math.sqrt((2 * D * S) / H) : 0
  const ordersPerYear = eoq > 0 ? D / eoq : 0
  const reorderInterval = ordersPerYear > 0 ? 365 / ordersPerYear : 0

  // Total annual cost = (D/Q × S) + (Q/2 × H)
  const totalOrderingCost = eoq > 0 ? (D / eoq) * S : 0
  const totalHoldingCost = eoq > 0 ? (eoq / 2) * H : 0
  const totalAnnualCost = totalOrderingCost + totalHoldingCost

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
      <h2 className="text-base-content text-xl font-semibold">EOQ Calculator</h2>
      <p className="text-base-content/80 mt-1">
        Enter your values below to calculate your optimal order quantity.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="annualDemand" className="text-base-content text-sm font-medium">
            Annual Demand (D)
          </label>
          <input
            type="number"
            id="annualDemand"
            value={annualDemand}
            onChange={(e) => setAnnualDemand(e.target.value)}
            className="input input-bordered mt-1 w-full"
            min="0"
            step="100"
          />
          <p className="text-base-content/60 mt-1 text-xs">Total units needed per year</p>
        </div>

        <div>
          <label htmlFor="orderingCost" className="text-base-content text-sm font-medium">
            Ordering Cost (S)
          </label>
          <div className="relative mt-1">
            <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input
              type="number"
              id="orderingCost"
              value={orderingCost}
              onChange={(e) => setOrderingCost(e.target.value)}
              className="input input-bordered w-full pl-7"
              min="0"
              step="5"
            />
          </div>
          <p className="text-base-content/60 mt-1 text-xs">Cost per order placed</p>
        </div>

        <div>
          <label htmlFor="holdingCost" className="text-base-content text-sm font-medium">
            Holding Cost (H)
          </label>
          <div className="relative mt-1">
            <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input
              type="number"
              id="holdingCost"
              value={holdingCost}
              onChange={(e) => setHoldingCost(e.target.value)}
              className="input input-bordered w-full pl-7"
              min="0"
              step="0.5"
            />
          </div>
          <p className="text-base-content/60 mt-1 text-xs">Cost to hold one unit per year</p>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 rounded-lg bg-base-100 p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-primary text-sm font-medium">Optimal Order Quantity</p>
            <p className="text-primary text-3xl font-bold">
              {Math.round(eoq)} <span className="text-lg font-normal">units</span>
            </p>
            <p className="text-base-content/60 mt-1 text-xs">EOQ</p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60 text-sm">Orders Per Year</p>
            <p className="text-base-content text-2xl font-semibold">{ordersPerYear.toFixed(1)}</p>
            <p className="text-base-content/60 mt-1 text-xs">D / EOQ</p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60 text-sm">Reorder Every</p>
            <p className="text-base-content text-2xl font-semibold">
              {Math.round(reorderInterval)} <span className="text-base font-normal">days</span>
            </p>
            <p className="text-base-content/60 mt-1 text-xs">365 / orders per year</p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60 text-sm">Total Annual Cost</p>
            <p className="text-base-content text-2xl font-semibold">{formatCurrency(totalAnnualCost)}</p>
            <p className="text-base-content/60 mt-1 text-xs">Ordering + Holding</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {eoq > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-base-300 bg-base-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-base-content/80 text-sm">Annual Ordering Costs</span>
              <span className="text-base-content font-semibold">{formatCurrency(totalOrderingCost)}</span>
            </div>
            <p className="text-base-content/60 mt-1 text-xs">
              {ordersPerYear.toFixed(1)} orders × {formatCurrency(S)} per order
            </p>
          </div>
          <div className="rounded-lg border border-base-300 bg-base-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-base-content/80 text-sm">Annual Holding Costs</span>
              <span className="text-base-content font-semibold">{formatCurrency(totalHoldingCost)}</span>
            </div>
            <p className="text-base-content/60 mt-1 text-xs">
              {Math.round(eoq / 2)} avg units × {formatCurrency(H)} per unit/year
            </p>
          </div>
        </div>
      )}

      {/* Interpretation */}
      {eoq > 0 && (
        <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4">
          <p className="text-base-content">
            <strong>Interpretation:</strong> Order{' '}
            <span className="text-primary font-semibold">{Math.round(eoq)} units</span> each time to minimize your total
            inventory costs. This means placing about{' '}
            <span className="text-primary font-semibold">{ordersPerYear.toFixed(1)} orders per year</span>, or roughly
            every <span className="text-primary font-semibold">{Math.round(reorderInterval)} days</span>.
          </p>
          {Math.abs(totalOrderingCost - totalHoldingCost) < totalAnnualCost * 0.1 && (
            <p className="mt-2 text-success">
              At EOQ, ordering costs and holding costs are balanced — this is the optimal point.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

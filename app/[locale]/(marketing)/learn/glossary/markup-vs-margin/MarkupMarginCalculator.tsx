'use client'

import { useState } from 'react'

type CalculationMode = 'cost-to-price' | 'price-to-cost'

export function MarkupMarginCalculator() {
  const [mode, setMode] = useState<CalculationMode>('cost-to-price')
  const [cost, setCost] = useState<string>('50')
  const [price, setPrice] = useState<string>('75')
  const [markupPercent, setMarkupPercent] = useState<string>('50')
  const [marginPercent, setMarginPercent] = useState<string>('33.33')

  const costNum = parseFloat(cost) || 0
  const priceNum = parseFloat(price) || 0
  const markupPercentNum = parseFloat(markupPercent) || 0
  const marginPercentNum = parseFloat(marginPercent) || 0

  // Calculate based on mode
  let calculatedPrice = 0
  let calculatedCost = 0
  let calculatedMarkup = 0
  let calculatedMargin = 0
  let profit = 0

  if (mode === 'cost-to-price') {
    // Given cost and markup/margin, calculate price
    calculatedPrice = costNum * (1 + markupPercentNum / 100)
    profit = calculatedPrice - costNum
    calculatedMargin = calculatedPrice > 0 ? (profit / calculatedPrice) * 100 : 0
    calculatedMarkup = markupPercentNum
    calculatedCost = costNum
  } else {
    // Given price and cost, calculate markup and margin
    profit = priceNum - costNum
    calculatedMarkup = costNum > 0 ? (profit / costNum) * 100 : 0
    calculatedMargin = priceNum > 0 ? (profit / priceNum) * 100 : 0
    calculatedPrice = priceNum
    calculatedCost = costNum
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="mt-8 rounded-box bg-base-200 p-6 sm:p-8">
      <h2 className="text-base-content text-xl font-semibold">Markup & Margin Calculator</h2>
      <p className="text-base-content/80 mt-1">Calculate selling price from cost, or find markup and margin from known prices.</p>

      {/* Mode Toggle */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setMode('cost-to-price')}
          className={`btn btn-sm ${mode === 'cost-to-price' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Cost → Price
        </button>
        <button
          onClick={() => setMode('price-to-cost')}
          className={`btn btn-sm ${mode === 'price-to-cost' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Price & Cost → Markup/Margin
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {mode === 'cost-to-price' ? (
          <>
            <div>
              <label htmlFor="cost" className="text-base-content text-sm font-medium">
                Cost
              </label>
              <div className="relative mt-1">
                <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  id="cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="input input-bordered w-full pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-base-content/60 mt-1 text-xs">Your cost per unit</p>
            </div>

            <div>
              <label htmlFor="markupPercent" className="text-base-content text-sm font-medium">
                Desired Markup %
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  id="markupPercent"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                  className="input input-bordered w-full pr-8"
                  min="0"
                  step="1"
                />
                <span className="text-base-content/60 absolute right-3 top-1/2 -translate-y-1/2">%</span>
              </div>
              <p className="text-base-content/60 mt-1 text-xs">Markup percentage on cost</p>
            </div>

            <div className="bg-primary/10 flex flex-col justify-center rounded-lg p-4 text-center">
              <p className="text-primary text-sm font-medium">Selling Price</p>
              <p className="text-primary text-3xl font-bold">{formatCurrency(calculatedPrice)}</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="priceCalc" className="text-base-content text-sm font-medium">
                Selling Price
              </label>
              <div className="relative mt-1">
                <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  id="priceCalc"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input input-bordered w-full pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-base-content/60 mt-1 text-xs">What you sell for</p>
            </div>

            <div>
              <label htmlFor="costCalc" className="text-base-content text-sm font-medium">
                Cost
              </label>
              <div className="relative mt-1">
                <span className="text-base-content/60 absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  id="costCalc"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="input input-bordered w-full pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-base-content/60 mt-1 text-xs">What it costs you</p>
            </div>

            <div className="flex flex-col justify-center gap-2">
              <div className="rounded-lg bg-base-100 p-3 text-center">
                <p className="text-base-content/60 text-xs">Markup</p>
                <p className="text-primary text-xl font-bold">{calculatedMarkup.toFixed(1)}%</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-primary text-xs font-medium">Margin</p>
                <p className="text-primary text-xl font-bold">{calculatedMargin.toFixed(1)}%</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Results Summary */}
      <div className="mt-8 rounded-lg bg-base-100 p-6">
        <div className="grid gap-4 text-center md:grid-cols-4">
          <div>
            <p className="text-base-content/60 text-sm">Cost</p>
            <p className="text-base-content text-xl font-semibold">{formatCurrency(calculatedCost)}</p>
          </div>
          <div>
            <p className="text-base-content/60 text-sm">Profit</p>
            <p className="text-base-content text-xl font-semibold">{formatCurrency(profit)}</p>
          </div>
          <div>
            <p className="text-base-content/60 text-sm">Markup</p>
            <p className="text-base-content text-xl font-semibold">{calculatedMarkup.toFixed(1)}%</p>
            <p className="text-base-content/60 mt-1 text-xs">of cost</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-primary text-sm font-medium">Margin</p>
            <p className="text-primary text-xl font-bold">{calculatedMargin.toFixed(1)}%</p>
            <p className="text-base-content/60 mt-1 text-xs">of price</p>
          </div>
        </div>
      </div>

      {/* Quick Interpretation */}
      {profit > 0 && (
        <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4">
          <p className="text-base-content">
            <strong>Summary:</strong> For every {formatCurrency(calculatedCost)} you spend, you earn{' '}
            <span className="text-primary font-semibold">{formatCurrency(profit)}</span> profit. That&apos;s a{' '}
            <span className="text-primary font-semibold">{calculatedMarkup.toFixed(1)}% markup</span> on your cost, or a{' '}
            <span className="text-primary font-semibold">{calculatedMargin.toFixed(1)}% margin</span> on the selling
            price.
          </p>
        </div>
      )}
    </div>
  )
}

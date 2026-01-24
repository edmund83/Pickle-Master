'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Loader2, RotateCcw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createStandaloneReceive, type ReceiveSourceType } from '@/app/actions/receives'

const sourceTypeOptions: { value: ReceiveSourceType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'customer_return',
    label: 'Customer Return',
    description: 'Items returned by customers',
    icon: <RotateCcw className="h-5 w-5" />,
  },
  {
    value: 'stock_adjustment',
    label: 'Stock Adjustment',
    description: 'Manual stock corrections',
    icon: <Settings2 className="h-5 w-5" />,
  },
]

export default function NewReceivePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourceType, setSourceType] = useState<ReceiveSourceType>('customer_return')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createStandaloneReceive({
        source_type: sourceType,
        notes: notes || null,
      })

      if (!result.success) {
        setError(result.error || 'Failed to create receive')
        return
      }

      // Redirect to the new receive detail page
      router.push(`/tasks/receives/${result.receive_id}`)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-neutral-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex items-center gap-4">
          <Link href="/tasks/receives">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">New Receive</h1>
            <p className="mt-1 text-neutral-500">Create a standalone receive for returns or adjustments</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Receive Details
                </CardTitle>
                <CardDescription>
                  Select the type of receive and add optional notes. After creating, you can add items.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Source Type Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-700">Receive Type</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sourceTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSourceType(option.value)}
                        className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                          sourceType === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className={`rounded-lg p-2 ${
                          sourceType === option.value
                            ? 'bg-primary/10 text-primary'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {option.icon}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{option.label}</div>
                          <div className="text-sm text-neutral-500">{option.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    placeholder="Add any notes about this receive..."
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-none focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/tasks/receives">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Receive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Info Card */}
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">What happens next?</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    After creating the receive, you&apos;ll be able to add items from your inventory.
                    Once you&apos;ve added all items, complete the receive to update stock levels.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

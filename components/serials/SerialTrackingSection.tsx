'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Hash,
  Loader2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SerialNumber {
  id: string
  serial_number: string
  status: string
  location_name: string | null
}

interface SerialTrackingSectionProps {
  itemId: string
  quantity: number
  onSerialsChange?: (serials: string[]) => void
}

export function SerialTrackingSection({
  itemId,
  quantity,
  onSerialsChange,
}: SerialTrackingSectionProps) {
  const [existingSerials, setExistingSerials] = useState<SerialNumber[]>([])
  const [serialText, setSerialText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAutoGenerate, setShowAutoGenerate] = useState(false)
  const [autoPrefix, setAutoPrefix] = useState('SN-')
  const [autoStart, setAutoStart] = useState('001')

  // Parse serial numbers from textarea
  const parsedSerials = useMemo(() => {
    return serialText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }, [serialText])

  // Find duplicates
  const duplicates = useMemo(() => {
    const seen = new Set<string>()
    const dups = new Set<string>()
    parsedSerials.forEach(s => {
      if (seen.has(s.toLowerCase())) {
        dups.add(s.toLowerCase())
      }
      seen.add(s.toLowerCase())
    })
    return dups
  }, [parsedSerials])

  const uniqueCount = parsedSerials.length - duplicates.size
  const missingCount = Math.max(0, quantity - uniqueCount)
  const isValid = uniqueCount === quantity && duplicates.size === 0

  useEffect(() => {
    loadSerials()
  }, [itemId])

  useEffect(() => {
    // Report serials to parent when they change
    onSerialsChange?.(parsedSerials)
  }, [parsedSerials, onSerialsChange])

  async function loadSerials() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('get_item_serials', { p_item_id: itemId, p_include_unavailable: true })

      if (rpcError) {
        console.error('Error loading serials:', rpcError)
        // Might not have the function yet, that's ok
        setExistingSerials([])
        return
      }

      const serialsData = (data || []) as SerialNumber[]
      setExistingSerials(serialsData)

      // Pre-fill textarea with existing serials
      if (serialsData.length > 0) {
        setSerialText(serialsData.map(s => s.serial_number).join('\n'))
      }
    } catch (err) {
      console.error('Error:', err)
      // Don't show error if function doesn't exist yet
      setExistingSerials([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (parsedSerials.length === 0) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('upsert_item_serials', {
          p_item_id: itemId,
          p_serials: parsedSerials,
        })

      if (rpcError) throw rpcError

      if (data?.success) {
        setSuccess(`Saved ${data.total} serial numbers`)
        await loadSerials()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data?.error || 'Failed to save serials')
      }
    } catch (err) {
      console.error('Error saving serials:', err)
      setError('Failed to save serial numbers')
    } finally {
      setSaving(false)
    }
  }

  function handleAutoGenerate() {
    const startNum = parseInt(autoStart) || 1
    const generated: string[] = []

    for (let i = 0; i < missingCount; i++) {
      const num = startNum + i
      const padded = num.toString().padStart(autoStart.length, '0')
      generated.push(`${autoPrefix}${padded}`)
    }

    // Append to existing
    const newText = serialText
      ? serialText + '\n' + generated.join('\n')
      : generated.join('\n')

    setSerialText(newText)
    setShowAutoGenerate(false)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">
            Serial Numbers
          </span>
        </div>
        <span className="text-sm text-neutral-500">
          {quantity} unit{quantity !== 1 ? 's' : ''} = {quantity} serial{quantity !== 1 ? 's' : ''} needed
        </span>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Textarea */}
      <div className="p-4 bg-white">
        <textarea
          value={serialText}
          onChange={(e) => setSerialText(e.target.value)}
          placeholder="Enter serial numbers, one per line...&#10;SN-001&#10;SN-002&#10;SN-003"
          rows={Math.max(5, Math.min(10, quantity))}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1',
            duplicates.size > 0
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-neutral-300 focus:border-primary focus:ring-primary'
          )}
        />

        {/* Count indicator */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-sm">
            <span className={cn(
              'flex items-center gap-1',
              isValid ? 'text-green-600' : 'text-neutral-600'
            )}>
              {isValid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              {uniqueCount} of {quantity} entered
            </span>

            {duplicates.size > 0 && (
              <span className="text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {duplicates.size} duplicate{duplicates.size > 1 ? 's' : ''}
              </span>
            )}

            {missingCount > 0 && duplicates.size === 0 && (
              <span className="text-amber-600">
                {missingCount} missing
              </span>
            )}
          </div>

          {/* Save button */}
          {parsedSerials.length > 0 && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || duplicates.size > 0}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Serials'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Auto-generate section */}
      {missingCount > 0 && (
        <div className="border-t border-neutral-200">
          {!showAutoGenerate ? (
            <button
              onClick={() => setShowAutoGenerate(true)}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Auto-generate {missingCount} serial{missingCount > 1 ? 's' : ''}
            </button>
          ) : (
            <div className="p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Sparkles className="h-4 w-4" />
                Generate {missingCount} serial number{missingCount > 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Prefix
                  </label>
                  <Input
                    type="text"
                    value={autoPrefix}
                    onChange={(e) => setAutoPrefix(e.target.value)}
                    placeholder="SN-"
                    className="h-9 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Start Number
                  </label>
                  <Input
                    type="text"
                    value={autoStart}
                    onChange={(e) => setAutoStart(e.target.value)}
                    placeholder="001"
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              <div className="text-xs text-neutral-500">
                Preview: {autoPrefix}{autoStart}, {autoPrefix}{(parseInt(autoStart) + 1).toString().padStart(autoStart.length, '0')}, ...
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAutoGenerate(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAutoGenerate}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

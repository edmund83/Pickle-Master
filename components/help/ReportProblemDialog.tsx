'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Bug, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { submitBugReport } from '@/app/actions/bug-reports'

// Define categories locally to avoid server/client boundary issues
const categories = [
  { value: 'bug', label: 'Bug / Something broken' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'performance', label: 'Performance Issue' },
  { value: 'ui_ux', label: 'UI/UX Issue' },
  { value: 'data', label: 'Data Issue' },
  { value: 'other', label: 'Other' },
] as const

type CategoryValue = (typeof categories)[number]['value']

interface ReportFormData {
  category: CategoryValue
  subject: string
  description: string
}

const emptyFormData: ReportFormData = {
  category: 'bug',
  subject: '',
  description: '',
}

interface ReportProblemDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportProblemDialog({ isOpen, onClose }: ReportProblemDialogProps) {
  const [formData, setFormData] = useState<ReportFormData>(emptyFormData)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const feedback = useFeedback()

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData(emptyFormData)
      setError(null)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, saving, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.subject.trim()) {
      setError('Please enter a subject')
      return
    }

    if (formData.subject.trim().length < 5) {
      setError('Subject must be at least 5 characters')
      return
    }

    if (!formData.description.trim()) {
      setError('Please describe the issue')
      return
    }

    if (formData.description.trim().length < 10) {
      setError('Please provide more detail (at least 10 characters)')
      return
    }

    setError(null)
    setSaving(true)

    try {
      const result = await submitBugReport({
        category: formData.category,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })

      if (result.success) {
        feedback.success('Report submitted! We\'ll look into it.')
        onClose()
      } else {
        setError(result.error || 'Failed to submit report')
        feedback.error()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
      feedback.error()
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (!saving) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <Bug className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 id="report-dialog-title" className="text-lg font-semibold text-neutral-900">
                Report a Problem
              </h2>
              <p className="text-sm text-neutral-500">
                Help us improve by reporting issues
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CategoryValue }))}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief summary of the issue"
              maxLength={255}
              autoFocus
            />
            <p className="mt-1 text-xs text-neutral-500">
              {formData.subject.length}/255 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please describe the issue in detail. What happened? What did you expect to happen? Include any steps to reproduce the problem."
              rows={5}
              maxLength={2000}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {formData.description.length}/2000 characters
            </p>
          </div>

          <p className="text-xs text-neutral-500">
            Your current page URL and browser info will be included to help us investigate.
          </p>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !formData.subject.trim() || !formData.description.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

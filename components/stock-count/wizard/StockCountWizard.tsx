'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WizardStepScope } from './WizardStepScope'
import { WizardStepAssign } from './WizardStepAssign'
import { WizardStepReview } from './WizardStepReview'
import { createStockCount } from '@/app/actions/stock-counts'

export interface StockCountWizardData {
  name: string
  description: string
  scopeType: 'full' | 'folder' | 'custom'
  scopeFolderId: string | null
  scopeFolderName: string | null
  assignedTo: string | null
  assignedToName: string | null
  dueDate: string | null
  notes: string
  estimatedItemCount: number
}

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface Folder {
  id: string
  name: string
  color: string | null
  parent_id: string | null
}

interface StockCountWizardProps {
  isOpen: boolean
  onClose: () => void
  teamMembers: TeamMember[]
  folders: Folder[]
  totalItemCount: number
}

const INITIAL_DATA: StockCountWizardData = {
  name: '',
  description: '',
  scopeType: 'full',
  scopeFolderId: null,
  scopeFolderName: null,
  assignedTo: null,
  assignedToName: null,
  dueDate: null,
  notes: '',
  estimatedItemCount: 0,
}

export function StockCountWizard({
  isOpen,
  onClose,
  teamMembers,
  folders,
  totalItemCount,
}: StockCountWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<StockCountWizardData>({
    ...INITIAL_DATA,
    estimatedItemCount: totalItemCount,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset wizard when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setData({
        ...INITIAL_DATA,
        estimatedItemCount: totalItemCount,
      })
      setError(null)
    }
  }, [isOpen, totalItemCount])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function updateData(updates: Partial<StockCountWizardData>) {
    setData((prev) => ({ ...prev, ...updates }))
    setError(null)
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createStockCount({
        name: data.name || undefined,
        description: data.description || undefined,
        scope_type: data.scopeType,
        scope_folder_id: data.scopeFolderId || undefined,
        assigned_to: data.assignedTo || undefined,
        due_date: data.dueDate || undefined,
        notes: data.notes || undefined,
      })

      if (result.success && result.id) {
        onClose()
        router.push(`/tasks/stock-count/${result.id}`)
      } else {
        setError(result.error || 'Failed to create stock count')
      }
    } catch (err) {
      console.error('Error creating stock count:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  function canProceed(): boolean {
    if (step === 1) {
      // Scope step: folder scope requires a folder selection
      if (data.scopeType === 'folder' && !data.scopeFolderId) {
        return false
      }
      return true
    }
    if (step === 2) {
      // Assign step: always valid (assignment is optional)
      return true
    }
    return true
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet */}
      <div
        className={cn(
          'relative w-full bg-white overflow-hidden',
          'animate-in duration-300',
          // Mobile: bottom sheet style
          'rounded-t-3xl sm:rounded-2xl',
          'max-h-[90vh] sm:max-h-[85vh]',
          'sm:max-w-xl sm:mx-4',
          // Animation
          'slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              New Stock Count
            </h2>
            <p className="text-sm text-neutral-500">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full bg-pickle-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(85vh-180px)]">
          {step === 1 && (
            <WizardStepScope
              data={data}
              updateData={updateData}
              folders={folders}
              totalItemCount={totalItemCount}
            />
          )}
          {step === 2 && (
            <WizardStepAssign
              data={data}
              updateData={updateData}
              teamMembers={teamMembers}
            />
          )}
          {step === 3 && (
            <WizardStepReview
              data={data}
              folders={folders}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-white">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={step === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Start Counting'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

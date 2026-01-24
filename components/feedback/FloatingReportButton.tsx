'use client'

import { useState } from 'react'
import { Bug, Sparkles, X, MessageCircle } from 'lucide-react'
import { ReportProblemDialog } from '@/components/help/ReportProblemDialog'
import { useZoe } from '@/contexts/ZoeContext'
import { cn } from '@/lib/utils'

export function FloatingReportButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const { openZoe } = useZoe()

  const handleAskZoe = () => {
    setIsExpanded(false)
    openZoe()
  }

  const handleReportProblem = () => {
    setIsExpanded(false)
    setShowReportDialog(true)
  }

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating action menu container */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col-reverse items-end gap-3 md:bottom-6">
        {/* Main FAB button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200',
            isExpanded
              ? 'bg-primary/80 rotate-45'
              : 'bg-primary hover:bg-primary/90 hover:scale-105',
            'text-white'
          )}
          aria-label={isExpanded ? 'Close menu' : 'Open help menu'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </button>

        {/* Expandable options */}
        <div
          className={cn(
            'flex flex-col items-end gap-2 transition-all duration-200',
            isExpanded
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {/* Ask Zoe option */}
          <button
            onClick={handleAskZoe}
            className="flex items-center gap-2 rounded-full bg-violet-600 pl-4 pr-3 py-2.5 text-white shadow-lg transition-all hover:bg-violet-500 hover:scale-105"
            aria-label="Ask Zoe AI assistant"
          >
            <span className="text-sm font-medium">Ask Zoe</span>
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Report Problem option */}
          <button
            onClick={handleReportProblem}
            className="flex items-center gap-2 rounded-full bg-red-600 pl-4 pr-3 py-2.5 text-white shadow-lg transition-all hover:bg-red-500 hover:scale-105"
            aria-label="Report a problem"
          >
            <span className="text-sm font-medium">Report Issue</span>
            <Bug className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ReportProblemDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
      />
    </>
  )
}

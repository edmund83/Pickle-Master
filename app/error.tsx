'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-semibold text-base-content mb-3">
          Something went wrong
        </h1>
        <p className="text-base-content/60 mb-8">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {/* Error digest for support */}
        {error.digest && (
          <p className="text-xs text-base-content/40 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Go to homepage
          </Link>
        </div>

        {/* Help Link */}
        <p className="mt-8 text-sm text-base-content/50">
          Need help?{' '}
          <Link href="/help" className="text-primary hover:underline">
            Visit our Help Center
          </Link>
        </p>
      </div>
    </div>
  )
}

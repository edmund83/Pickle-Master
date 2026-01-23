'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            We encountered a critical error. Please try refreshing the page.
          </p>

          {/* Error digest for support */}
          {error.digest && (
            <p className="text-xs text-gray-400 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
            >
              Try again
            </button>
            {/* Using <a> instead of Link because global-error needs full page reload to recover */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              Go to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}

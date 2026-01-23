import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found - StockZip',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary opacity-20">404</div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-semibold text-base-content mb-3">
          Page not found
        </h1>
        <p className="text-base-content/60 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Go to homepage
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 transition-all duration-200 ease-out active:scale-[0.97]"
          >
            Go to dashboard
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

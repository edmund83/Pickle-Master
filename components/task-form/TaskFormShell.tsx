'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Shared padding for task form content */
export const TASK_FORM_PADDING = 'px-4 sm:px-6 lg:px-8'

export interface TaskFormShellProps {
  backHref: string
  title: string
  subtitle?: ReactNode
  headerAction?: ReactNode
  errorBanner?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function TaskFormShell({
  backHref,
  title,
  subtitle,
  headerAction,
  errorBanner,
  children,
  footer,
  className,
}: TaskFormShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden bg-neutral-50',
        className
      )}
    >
      <header
        className={cn(
          'shrink-0 border-b border-neutral-200 bg-white py-4',
          TASK_FORM_PADDING
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={backHref}
              className="shrink-0 text-neutral-500 hover:text-neutral-700"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-neutral-900">
                {title}
              </h1>
              {subtitle != null && (
                <p className="mt-0.5 truncate text-sm text-neutral-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction != null && (
            <div className="w-full shrink-0 sm:w-auto">{headerAction}</div>
          )}
        </div>
      </header>

      {errorBanner != null && (
        <div className={cn('mt-4 shrink-0', TASK_FORM_PADDING)}>
          {errorBanner}
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-5">
        <div className={cn(TASK_FORM_PADDING)}>{children}</div>
      </main>

      {footer != null && (
        <footer
          className={cn(
            'sticky bottom-0 z-10 shrink-0 border-t border-neutral-200 bg-white py-4',
            TASK_FORM_PADDING
          )}
        >
          {footer}
        </footer>
      )}
    </div>
  )
}

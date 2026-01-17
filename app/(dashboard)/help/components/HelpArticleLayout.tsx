'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface HelpArticleLayoutProps {
  title: string
  description: string
  icon: LucideIcon
  iconColor: string
  children: ReactNode
  prevArticle?: { href: string; title: string }
  nextArticle?: { href: string; title: string }
}

export function HelpArticleLayout({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
  prevArticle,
  nextArticle,
}: HelpArticleLayoutProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-4 py-6 sm:px-8">
        <Link
          href="/help"
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Help Center
        </Link>
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
            <p className="mt-0.5 text-neutral-500">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-neutral max-w-none">
            {children}
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between border-t border-neutral-200 pt-6">
            {prevArticle ? (
              <Link
                href={prevArticle.href}
                className="group flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-sm hover:border-primary/30 hover:bg-primary/5"
              >
                <ChevronLeft className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
                <div className="text-left">
                  <div className="text-xs text-neutral-500">Previous</div>
                  <div className="font-medium text-neutral-900 group-hover:text-primary">
                    {prevArticle.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextArticle ? (
              <Link
                href={nextArticle.href}
                className="group flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-sm hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Next</div>
                  <div className="font-medium text-neutral-900 group-hover:text-primary">
                    {nextArticle.title}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Styled components for help articles
export function HelpSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-8 ${className}`}>{children}</div>
}

export function HelpHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-xl font-semibold text-neutral-900">{children}</h2>
}

export function HelpSubheading({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-lg font-medium text-neutral-800">{children}</h3>
}

export function HelpParagraph({ children }: { children: ReactNode }) {
  return <p className="mb-4 leading-relaxed text-neutral-600">{children}</p>
}

export function HelpList({ children, ordered = false }: { children: ReactNode; ordered?: boolean }) {
  const Component = ordered ? 'ol' : 'ul'
  return (
    <Component className={`mb-4 space-y-2 pl-6 text-neutral-600 ${ordered ? 'list-decimal' : 'list-disc'}`}>
      {children}
    </Component>
  )
}

export function HelpListItem({ children }: { children: ReactNode }) {
  return <li className="leading-relaxed">{children}</li>
}

export function HelpTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-neutral-900">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-neutral-100">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-neutral-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function HelpTip({ children, type = 'info' }: { children: ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    success: 'border-green-200 bg-green-50 text-green-800',
  }
  const titles = {
    info: 'Good to know',
    warning: 'Important',
    success: 'Tip',
  }

  return (
    <div className={`mb-6 rounded-lg border p-4 ${styles[type]}`}>
      <div className="mb-1 font-semibold">{titles[type]}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function HelpSteps({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div className="mb-6 space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {i + 1}
          </div>
          <div className="pt-1">
            <div className="font-medium text-neutral-900">{step.title}</div>
            <div className="mt-1 text-sm text-neutral-600">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

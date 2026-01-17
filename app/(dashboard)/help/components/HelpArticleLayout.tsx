'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, LucideIcon, BookOpen, Clock, ArrowUpRight, ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface HelpArticleLayoutProps {
  title: string
  description: string
  icon: LucideIcon
  iconColor: string
  children: ReactNode
  prevArticle?: { href: string; title: string }
  nextArticle?: { href: string; title: string }
  readingTime?: string
}

export function HelpArticleLayout({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
  prevArticle,
  nextArticle,
  readingTime = '3 min read',
}: HelpArticleLayoutProps) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null)

  const handleFeedback = (value: 'yes' | 'no') => {
    setFeedback(value)
    // Could send to analytics/backend here
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-50/80 to-white">
      {/* Premium Header with gradient backdrop */}
      <div className="relative overflow-hidden border-b border-neutral-200/60 bg-white">
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50" />
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-primary/3 to-transparent blur-2xl" />

        <div className="relative px-4 py-8 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <Link
            href="/help"
            className="group mb-6 inline-flex items-center gap-1.5 rounded-full bg-neutral-100/80 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-200/80 hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Help Center
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            {/* Icon with premium styling */}
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${iconColor}`}>
              <Icon className="h-7 w-7" strokeWidth={1.75} />
            </div>

            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {title}
              </h1>
              <p className="text-base text-neutral-600 sm:text-lg">
                {description}
              </p>

              {/* Reading time badge */}
              <div className="flex items-center gap-4 pt-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                  <Clock className="h-4 w-4" />
                  {readingTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-3xl">
          {/* Content wrapper with premium typography */}
          <article className="prose-article">
            {children}
          </article>

          {/* Article footer with feedback */}
          <div className="mt-16 rounded-2xl border border-neutral-200/60 bg-gradient-to-br from-neutral-50 to-white p-6 sm:p-8">
            {feedback ? (
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Thanks for your feedback!</p>
                  <p className="text-sm text-neutral-500">We appreciate you helping us improve.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900">Was this article helpful?</h3>
                  <p className="mt-1 text-sm text-neutral-500">Let us know how we can improve</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback('yes')}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes
                  </button>
                  <button
                    onClick={() => handleFeedback('no')}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation between articles */}
          <nav className="mt-8 grid gap-4 sm:grid-cols-2">
            {prevArticle ? (
              <Link
                href={prevArticle.href}
                className="group relative flex flex-col rounded-2xl border border-neutral-200/60 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="mb-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </span>
                <span className="font-medium text-neutral-900 transition-colors group-hover:text-primary">
                  {prevArticle.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {nextArticle ? (
              <Link
                href={nextArticle.href}
                className="group relative flex flex-col items-end rounded-2xl border border-neutral-200/60 bg-white p-5 text-right transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="mb-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Next
                  <ChevronRight className="h-3 w-3" />
                </span>
                <span className="font-medium text-neutral-900 transition-colors group-hover:text-primary">
                  {nextArticle.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}

// Premium Styled Components for Help Articles

export function HelpSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`mb-10 ${className}`}>{children}</section>
}

export function HelpHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
      <span className="h-6 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  )
}

export function HelpSubheading({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 mt-6 text-lg font-semibold text-neutral-800">{children}</h3>
}

export function HelpParagraph({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-base leading-relaxed text-neutral-600">{children}</p>
}

export function HelpList({ children, ordered = false }: { children: ReactNode; ordered?: boolean }) {
  const Component = ordered ? 'ol' : 'ul'
  return (
    <Component
      className={`mb-6 space-y-3 pl-0 text-neutral-600 ${
        ordered ? 'list-none' : 'list-none'
      }`}
    >
      {children}
    </Component>
  )
}

export function HelpListItem({ children }: { children: ReactNode }) {
  return (
    <li className="relative flex gap-3 pl-0 leading-relaxed">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
      <span className="flex-1">{children}</span>
    </li>
  )
}

export function HelpTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-gradient-to-r from-neutral-50 to-neutral-100/50">
              {headers.map((header, i) => (
                <th key={i} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-neutral-50/50">
                {row.map((cell, j) => (
                  <td key={j} className="px-5 py-4 text-neutral-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function HelpTip({ children, type = 'info' }: { children: ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: {
      container: 'border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-50/50',
      icon: 'bg-blue-100 text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-800/90',
    },
    warning: {
      container: 'border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/50',
      icon: 'bg-amber-100 text-amber-600',
      title: 'text-amber-900',
      text: 'text-amber-800/90',
    },
    success: {
      container: 'border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-50/50',
      icon: 'bg-emerald-100 text-emerald-600',
      title: 'text-emerald-900',
      text: 'text-emerald-800/90',
    },
  }

  const icons = {
    info: '💡',
    warning: '⚠️',
    success: '✨',
  }

  const titles = {
    info: 'Good to know',
    warning: 'Important',
    success: 'Pro Tip',
  }

  const style = styles[type]

  return (
    <div className={`mb-8 flex gap-4 rounded-2xl border p-5 ${style.container}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${style.icon}`}>
        {icons[type]}
      </div>
      <div className="flex-1">
        <div className={`mb-1 font-semibold ${style.title}`}>{titles[type]}</div>
        <div className={`text-sm leading-relaxed ${style.text}`}>{children}</div>
      </div>
    </div>
  )
}

export function HelpSteps({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div className="mb-8 space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="relative flex gap-5 pb-8 last:pb-0">
          {/* Connecting line */}
          {i < steps.length - 1 && (
            <div className="absolute left-5 top-12 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-primary/40 to-primary/10" />
          )}
          {/* Step number */}
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25">
            {i + 1}
          </div>
          {/* Content */}
          <div className="flex-1 pt-1">
            <div className="font-semibold text-neutral-900">{step.title}</div>
            <div className="mt-1.5 text-sm leading-relaxed text-neutral-600">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function HelpFolderTree({ items }: { items: { name: string; level: number }[] }) {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white shadow-sm">
      <div className="border-b border-neutral-200/60 bg-neutral-100/50 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Folder Structure</span>
      </div>
      <div className="space-y-0.5 p-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center rounded-lg px-2 py-2 text-sm transition-colors hover:bg-neutral-100/70"
            style={{ paddingLeft: `${item.level * 20 + 8}px` }}
          >
            <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600">
              📁
            </span>
            <span className="font-medium text-neutral-700">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Additional Premium Components

export function HelpCallout({
  title,
  description,
  icon,
  href
}: {
  title: string
  description: string
  icon: ReactNode
  href?: string
}) {
  const content = (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900">{title}</h4>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      </div>
      {href && (
        <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-neutral-400 transition-colors group-hover:text-primary" />
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group mb-6 block rounded-2xl border border-neutral-200/60 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200/60 bg-white p-5">
      {content}
    </div>
  )
}

export function HelpKeyboardShortcut({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1 text-neutral-400">+</span>}
          <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-neutral-300 bg-gradient-to-b from-neutral-50 to-neutral-100 px-1.5 text-xs font-semibold text-neutral-600 shadow-sm">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  )
}

export function HelpDivider() {
  return <hr className="my-10 border-t border-neutral-200/60" />
}

export function HelpQuote({ children, author }: { children: ReactNode; author?: string }) {
  return (
    <blockquote className="mb-8 border-l-4 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent py-4 pl-6 pr-4">
      <p className="text-base italic text-neutral-700">{children}</p>
      {author && <cite className="mt-2 block text-sm font-medium text-neutral-500">— {author}</cite>}
    </blockquote>
  )
}

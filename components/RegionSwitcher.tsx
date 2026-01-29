'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  type Locale,
  LOCALES,
  LOCALE_CONFIG,
  isValidLocale,
  DEFAULT_LOCALE,
} from '@/lib/seo/locales'
import { extractPathname, buildLocalePath } from '@/lib/seo/urls'
import { setLocaleCookie } from '@/lib/locale/cookie'
import { cn } from '@/lib/utils'

interface RegionSwitcherProps {
  /** Additional class names */
  className?: string
  /** Show flag emoji (default: true) */
  showFlag?: boolean
  /** Show full country name or short code (default: 'short') */
  nameFormat?: 'full' | 'short'
  /** Variant: 'dropdown' or 'inline' */
  variant?: 'dropdown' | 'inline'
}

/**
 * Region switcher component for user-controlled locale selection.
 *
 * Features:
 * - Displays current region with flag
 * - Dropdown to switch between US, UK, AU, CA
 * - Persists selection in cookie (180 days)
 * - Navigates to same page in new locale
 *
 * @example
 * ```tsx
 * // In navbar
 * <RegionSwitcher className="ml-4" />
 *
 * // In footer with full names
 * <RegionSwitcher nameFormat="full" />
 * ```
 */
export function RegionSwitcher({
  className,
  showFlag = true,
  nameFormat = 'short',
  variant = 'dropdown',
}: RegionSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get current locale from URL
  const paramLocale = params?.locale as string | undefined
  const currentLocale: Locale =
    paramLocale && isValidLocale(paramLocale) ? paramLocale : DEFAULT_LOCALE

  const currentConfig = LOCALE_CONFIG[currentLocale]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle locale change
  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false)
      return
    }

    // Set cookie for persistence
    setLocaleCookie(newLocale)

    // Extract the pathname without locale prefix and rebuild with new locale
    const basePath = extractPathname(pathname)
    const newPath = buildLocalePath(newLocale, basePath)

    // Navigate to new locale
    router.push(newPath)
    setIsOpen(false)
  }

  // Get display name based on format
  const getDisplayName = (locale: Locale): string => {
    const config = LOCALE_CONFIG[locale]
    return nameFormat === 'full' ? config.name : config.shortName
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {LOCALES.map((locale) => {
          const config = LOCALE_CONFIG[locale]
          const isActive = locale === currentLocale
          return (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={cn(
                'px-2 py-1 text-sm rounded transition-colors',
                isActive
                  ? 'bg-primary text-primary-content font-medium'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
              aria-current={isActive ? 'true' : undefined}
            >
              {showFlag && <span className="mr-1">{config.flag}</span>}
              {getDisplayName(locale)}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-lg',
          'bg-white/10 hover:bg-white/20 transition-colors',
          'text-white border border-white/20'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select region"
      >
        {showFlag && <span>{currentConfig.flag}</span>}
        <span>{getDisplayName(currentLocale)}</span>
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 py-1 z-50',
            'bg-white dark:bg-neutral-900 rounded-lg shadow-lg',
            'border border-neutral-200 dark:border-neutral-700'
          )}
          role="listbox"
          aria-label="Select region"
        >
          {LOCALES.map((locale) => {
            const config = LOCALE_CONFIG[locale]
            const isActive = locale === currentLocale
            return (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
                  isActive && 'bg-primary/10 font-medium'
                )}
                role="option"
                aria-selected={isActive}
              >
                {showFlag && <span className="text-base">{config.flag}</span>}
                <span className="flex-1 text-neutral-900 dark:text-neutral-100">
                  {config.name}
                </span>
                {isActive && (
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

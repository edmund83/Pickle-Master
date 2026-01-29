import { LOCALES, type Locale, isValidLocale } from '@/lib/seo/locales'
import { notFound } from 'next/navigation'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Generate static params for all supported locales
 * This enables static generation of locale pages
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({
    locale,
  }))
}

/**
 * Layout for localized marketing pages
 * Validates the locale parameter and renders children
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  // Validate locale - return 404 for invalid locales
  if (!isValidLocale(locale)) {
    notFound()
  }

  return <>{children}</>
}

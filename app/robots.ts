import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().toString().replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api',
          '/auth',
          '/login',
          '/signup',
          '/onboarding',
          '/dashboard',
          '/inventory',
          '/tasks',
          '/reports',
          '/settings',
          '/scan',
          '/search',
          '/help',
          '/ai-assistant',
          '/notifications',
          '/reminders',
          '/tags',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}


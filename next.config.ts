import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html',
  },
  workboxOptions: {
    // Avoid @rollup/plugin-terser worker threads during SW bundling.
    mode: process.env.WORKBOX_MODE ?? 'development',
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'supabase-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
})

const devPort = process.env.PORT ?? '3000'
const extraAllowedOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const devAllowedOrigins = [
  `localhost:${devPort}`,
  `127.0.0.1:${devPort}`,
]

const allowedServerActionOrigins =
  process.env.NODE_ENV === 'production'
    ? extraAllowedOrigins
    : Array.from(new Set([...devAllowedOrigins, ...extraAllowedOrigins]))

const nextConfig: NextConfig = {
  // Add empty turbopack config to satisfy Next.js 16
  turbopack: {},
  experimental: {
    serverActions: {
      allowedOrigins: allowedServerActionOrigins.length > 0 ? allowedServerActionOrigins : undefined,
    },
  },
  async redirects() {
    return [
      // ===== INTERNATIONAL SEO: Root and legacy routes → /en-us =====

      // Root to US locale (permanent redirect)
      {
        source: '/',
        destination: '/en-us',
        permanent: true,
      },

      // Legacy /marketing routes → /en-us
      {
        source: '/marketing',
        destination: '/en-us',
        permanent: true,
      },
      {
        source: '/marketing/:path*',
        destination: '/en-us/:path*',
        permanent: true,
      },

      // Legacy unprefixed marketing routes → /en-us/*
      {
        source: '/pricing',
        destination: '/en-us/pricing',
        permanent: true,
      },
      {
        source: '/pricing/:path*',
        destination: '/en-us/pricing/:path*',
        permanent: true,
      },
      {
        source: '/demo',
        destination: '/en-us/demo',
        permanent: true,
      },
      {
        source: '/features',
        destination: '/en-us/features',
        permanent: true,
      },
      {
        source: '/features/:path*',
        destination: '/en-us/features/:path*',
        permanent: true,
      },
      {
        source: '/solutions',
        destination: '/en-us/solutions',
        permanent: true,
      },
      {
        source: '/solutions/:path*',
        destination: '/en-us/solutions/:path*',
        permanent: true,
      },
      {
        source: '/learn',
        destination: '/en-us/learn',
        permanent: true,
      },
      {
        source: '/learn/:path*',
        destination: '/en-us/learn/:path*',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/en-us/compare',
        permanent: true,
      },
      {
        source: '/compare/:path*',
        destination: '/en-us/compare/:path*',
        permanent: true,
      },
      {
        source: '/migration',
        destination: '/en-us/migration',
        permanent: true,
      },
      {
        source: '/migration/:path*',
        destination: '/en-us/migration/:path*',
        permanent: true,
      },
      {
        source: '/integrations',
        destination: '/en-us/integrations',
        permanent: true,
      },
      {
        source: '/security',
        destination: '/en-us/security',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/en-us/privacy',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/en-us/terms',
        permanent: true,
      },

      // ===== CONTENT RESTRUCTURE: Legacy content paths → /en-us/learn/* =====

      // Blog hub and pages → /en-us/learn/blog/*
      {
        source: '/blog',
        destination: '/en-us/learn/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/en-us/learn/blog/:slug*',
        permanent: true,
      },

      // Glossary hub and pages → /en-us/learn/glossary/*
      {
        source: '/glossary',
        destination: '/en-us/learn/glossary',
        permanent: true,
      },
      {
        source: '/glossary/:slug*',
        destination: '/en-us/learn/glossary/:slug*',
        permanent: true,
      },

      // Tools hub and pages → /en-us/learn/tools/*
      {
        source: '/tools',
        destination: '/en-us/learn/tools',
        permanent: true,
      },
      {
        source: '/tools/:slug*',
        destination: '/en-us/learn/tools/:slug*',
        permanent: true,
      },

      // Templates hub and pages → /en-us/learn/templates/*
      {
        source: '/templates',
        destination: '/en-us/learn/templates',
        permanent: true,
      },
      {
        source: '/templates/:slug*',
        destination: '/en-us/learn/templates/:slug*',
        permanent: true,
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
}

// Wrap with PWA first, then Sentry
const pwaConfig = withPWA(nextConfig)

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
}

export default withSentryConfig(pwaConfig, sentryWebpackPluginOptions)

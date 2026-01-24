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

const nextConfig: NextConfig = {
  // Add empty turbopack config to satisfy Next.js 16
  turbopack: {},
  async redirects() {
    return [
      {
        source: '/marketing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/marketing/:path*',
        destination: '/:path*',
        permanent: true,
      },
      // ===== CONTENT RESTRUCTURE: All content now under /learn/* =====

      // Blog hub and pages → /learn/blog/*
      {
        source: '/blog',
        destination: '/learn/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/learn/blog/:slug*',
        permanent: true,
      },

      // Glossary hub and pages → /learn/glossary/*
      {
        source: '/glossary',
        destination: '/learn/glossary',
        permanent: true,
      },
      {
        source: '/glossary/:slug*',
        destination: '/learn/glossary/:slug*',
        permanent: true,
      },

      // Tools hub and pages → /learn/tools/*
      {
        source: '/tools',
        destination: '/learn/tools',
        permanent: true,
      },
      {
        source: '/tools/:slug*',
        destination: '/learn/tools/:slug*',
        permanent: true,
      },

      // Templates hub and pages → /learn/templates/*
      {
        source: '/templates',
        destination: '/learn/templates',
        permanent: true,
      },
      {
        source: '/templates/:slug*',
        destination: '/learn/templates/:slug*',
        permanent: true,
      },

      // Flat /learn/* guide URLs → nested /learn/guide/* structure
      {
        source: '/learn/perpetual-vs-periodic-inventory',
        destination: '/learn/guide/perpetual-vs-periodic-inventory',
        permanent: true,
      },
      {
        source: '/learn/how-to-set-reorder-points',
        destination: '/learn/guide/how-to-set-reorder-points',
        permanent: true,
      },
    ]
  },
  images: {
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

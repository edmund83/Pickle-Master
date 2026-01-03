import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
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
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutes
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
      {
        source: '/solutions/warehouse-inventory',
        destination: '/solutions/warehouse',
        permanent: true,
      },
      {
        source: '/solutions/ecommerce-inventory',
        destination: '/solutions/ecommerce',
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
    ],
  },
}

export default withPWA(nextConfig)

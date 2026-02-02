import type { Metadata, Viewport } from 'next'
import './globals.css'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'StockZip - Simple Inventory Management',
  description: 'A simple, mobile-first inventory management SaaS for small businesses',
  keywords: ['inventory', 'management', 'small business', 'stock tracking'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StockZip',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'StockZip',
    title: 'StockZip - Simple Inventory Management',
    description: 'A simple, mobile-first inventory management SaaS for small businesses',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#4b6bfb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="stockzip" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-base-100 font-sans antialiased" suppressHydrationWarning>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}

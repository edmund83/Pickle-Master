import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkAuthRateLimit, getClientIp } from '@/lib/auth-rate-limit'

interface CookieToSet {
  name: string
  value: string
  options: CookieOptions
}

const AUTH_RATE_LIMIT_ROUTES = ['/login', '/signup', '/forgot-password']

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rate limit auth pages by IP (no token/session yet)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}-[a-z]{2}/, '') || pathname
  if (AUTH_RATE_LIMIT_ROUTES.some((r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(r + '/'))) {
    const ip = getClientIp(request)
    if (ip !== 'unknown') {
      const { allowed, retryAfter } = checkAuthRateLimit(ip)
      if (!allowed) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined,
        })
      }
    }
  }

  // Skip auth check for API routes (webhooks, etc.)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback', '/accept-invite']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Marketing routes - accessible regardless of auth status (no redirects)
  const marketingRoutes = [
    '/',
    '/features',
    '/solutions',
    '/pricing',
    '/compare',
    '/migration',
    '/demo',
    '/learn',
    '/integrations',
    '/privacy',
    '/terms',
    '/security',
  ]

  // Locale prefixes for international SEO
  const localePrefixes = ['/en-us', '/en-gb', '/en-au', '/en-ca']

  // Check if path is a marketing route (with or without locale prefix)
  const isMarketingRoute = (() => {
    // Direct match for root or marketing routes
    if (marketingRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
      return true
    }
    // Check locale-prefixed marketing routes (e.g., /en-us, /en-us/pricing)
    for (const prefix of localePrefixes) {
      if (pathname === prefix) return true // e.g., /en-us
      if (pathname.startsWith(prefix + '/')) {
        const pathWithoutLocale = pathname.slice(prefix.length) // e.g., /pricing
        if (marketingRoutes.some((route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/'))) {
          return true
        }
      }
    }
    return false
  })()

  // Marketing routes are accessible to everyone, but redirect authenticated users
  // from the landing page to dashboard
  if (isMarketingRoute) {
    // If authenticated user visits landing page (root or locale home), redirect to dashboard
    const isHomePage = pathname === '/' || localePrefixes.includes(pathname)
    if (user && isHomePage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (user && isPublicRoute && !pathname.startsWith('/auth/callback')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check if user needs onboarding (skip for now to avoid type issues)
  // Will be handled in onboarding page itself

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - public folder assets
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|robots\\.txt|sitemap\\.xml|sw\\.js|swe-worker.*\\.js|workbox.*\\.js|fallback.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$).*)',
  ],
}

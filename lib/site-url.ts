export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return new URL(explicit)

  const vercel = process.env.VERCEL_URL
  if (vercel) return new URL(`https://${vercel}`)

  return new URL('http://localhost:3000')
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}


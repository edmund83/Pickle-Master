/**
 * International SEO Tests
 *
 * Validates:
 * 1. Root redirect (/ → /en-us)
 * 2. Self-referencing canonical URLs
 * 3. Hreflang alternates for all locales + x-default
 * 4. Region switcher navigation
 * 5. Internal links stay within current locale
 */
import { test, expect } from '@playwright/test'

const LOCALES = ['en-us', 'en-gb', 'en-au', 'en-ca'] as const
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('International SEO', () => {
  test.describe('Root Redirect', () => {
    test('/ should permanently redirect to /en-us', async ({ request }) => {
      const response = await request.get('/', {
        maxRedirects: 0,
      })

      // Should be a redirect (301 or 308)
      expect([301, 308]).toContain(response.status())

      // Should redirect to /en-us
      const location = response.headers()['location']
      expect(location).toMatch(/\/en-us\/?$/)
    })

    test('/ should eventually resolve to /en-us content', async ({ page }) => {
      await page.goto('/')

      // Should end up at /en-us
      await expect(page).toHaveURL(/\/en-us\/?$/)
    })
  })

  test.describe('Canonical URLs', () => {
    test('/en-us/pricing should have self-referencing canonical', async ({
      page,
    }) => {
      await page.goto('/en-us/pricing')

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href')
      expect(canonical).toContain('/en-us/pricing')
    })

    test('/en-gb/pricing should have self-referencing canonical', async ({
      page,
    }) => {
      await page.goto('/en-gb/pricing')

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href')
      expect(canonical).toContain('/en-gb/pricing')
    })

    test('/en-au/pricing should have self-referencing canonical', async ({
      page,
    }) => {
      await page.goto('/en-au/pricing')

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href')
      expect(canonical).toContain('/en-au/pricing')
    })

    test('/en-ca/pricing should have self-referencing canonical', async ({
      page,
    }) => {
      await page.goto('/en-ca/pricing')

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href')
      expect(canonical).toContain('/en-ca/pricing')
    })
  })

  test.describe('Hreflang Alternates', () => {
    test('/en-gb/pricing should have all hreflang alternates', async ({
      page,
    }) => {
      await page.goto('/en-gb/pricing')

      // Check en-US alternate
      const enUS = await page
        .locator('link[rel="alternate"][hreflang="en-US"]')
        .getAttribute('href')
      expect(enUS).toContain('/en-us/pricing')

      // Check en-GB alternate (self-referencing)
      const enGB = await page
        .locator('link[rel="alternate"][hreflang="en-GB"]')
        .getAttribute('href')
      expect(enGB).toContain('/en-gb/pricing')

      // Check en-AU alternate
      const enAU = await page
        .locator('link[rel="alternate"][hreflang="en-AU"]')
        .getAttribute('href')
      expect(enAU).toContain('/en-au/pricing')

      // Check en-CA alternate
      const enCA = await page
        .locator('link[rel="alternate"][hreflang="en-CA"]')
        .getAttribute('href')
      expect(enCA).toContain('/en-ca/pricing')

      // Check x-default (should point to US)
      const xDefault = await page
        .locator('link[rel="alternate"][hreflang="x-default"]')
        .getAttribute('href')
      expect(xDefault).toContain('/en-us/pricing')
    })

    test('home page should have all hreflang alternates', async ({ page }) => {
      await page.goto('/en-us')

      // Verify all alternates exist
      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .all()

      // Should have 5 alternates: en-US, en-GB, en-AU, en-CA, x-default
      expect(alternates.length).toBe(5)

      // Check each hreflang is present
      const hreflangs = await Promise.all(
        alternates.map((el) => el.getAttribute('hreflang'))
      )
      expect(hreflangs).toContain('en-US')
      expect(hreflangs).toContain('en-GB')
      expect(hreflangs).toContain('en-AU')
      expect(hreflangs).toContain('en-CA')
      expect(hreflangs).toContain('x-default')
    })
  })

  test.describe('Region Switcher', () => {
    test('switching from UK to US should navigate to same page in US locale', async ({
      page,
    }) => {
      // Start on UK pricing page
      await page.goto('/en-gb/pricing')

      // Click region switcher to open dropdown
      const switcher = page.locator('[aria-label="Select region"]')
      await switcher.click()

      // Select United States
      const usOption = page.locator('button[role="option"]', {
        hasText: 'United States',
      })
      await usOption.click()

      // Should navigate to US pricing
      await expect(page).toHaveURL(/\/en-us\/pricing/)
    })

    test('switching from US to Australia should preserve path', async ({
      page,
    }) => {
      // Start on US features page
      await page.goto('/en-us/features')

      // Click region switcher to open dropdown
      const switcher = page.locator('[aria-label="Select region"]')
      await switcher.click()

      // Select Australia
      const auOption = page.locator('button[role="option"]', {
        hasText: 'Australia',
      })
      await auOption.click()

      // Should navigate to AU features
      await expect(page).toHaveURL(/\/en-au\/features/)
    })
  })

  test.describe('Internal Links Stay In Locale', () => {
    test('links on AU home page should stay in AU locale', async ({ page }) => {
      await page.goto('/en-au')

      // Click on Pricing link in navigation
      const pricingLink = page
        .locator('nav')
        .locator('a', { hasText: 'Pricing' })
        .first()
      await pricingLink.click()

      // Should navigate to AU pricing, not US
      await expect(page).toHaveURL(/\/en-au\/pricing/)
    })

    test('CTA buttons on UK page should stay in UK locale', async ({
      page,
    }) => {
      await page.goto('/en-gb')

      // Find a CTA button that links to signup
      const ctaButton = page.locator('a[href*="/signup"]').first()
      const href = await ctaButton.getAttribute('href')

      // Should not have locale prefix (signup is not localized)
      // or if it does have locale prefix, it should be en-gb
      if (href?.includes('/en-')) {
        expect(href).toContain('/en-gb')
      }
    })

    test('footer links on CA page should stay in CA locale', async ({
      page,
    }) => {
      await page.goto('/en-ca')

      // Click on Features link in footer
      const footerLink = page
        .locator('footer')
        .locator('a', { hasText: 'Features' })
        .first()
      await footerLink.click()

      // Should navigate to CA features
      await expect(page).toHaveURL(/\/en-ca\/features/)
    })
  })

  test.describe('Legacy Route Redirects', () => {
    test('/pricing should redirect to /en-us/pricing', async ({ request }) => {
      const response = await request.get('/pricing', {
        maxRedirects: 0,
      })

      expect([301, 308]).toContain(response.status())

      const location = response.headers()['location']
      expect(location).toContain('/en-us/pricing')
    })

    test('/features should redirect to /en-us/features', async ({ request }) => {
      const response = await request.get('/features', {
        maxRedirects: 0,
      })

      expect([301, 308]).toContain(response.status())

      const location = response.headers()['location']
      expect(location).toContain('/en-us/features')
    })

    test('/learn should redirect to /en-us/learn', async ({ request }) => {
      const response = await request.get('/learn', {
        maxRedirects: 0,
      })

      expect([301, 308]).toContain(response.status())

      const location = response.headers()['location']
      expect(location).toContain('/en-us/learn')
    })
  })

  test.describe('Page Renders Correctly', () => {
    for (const locale of LOCALES) {
      test(`/${locale} home page should render`, async ({ page }) => {
        await page.goto(`/${locale}`)

        // Page should have content
        await expect(page.locator('h1')).toBeVisible()

        // Should have navigation
        await expect(page.locator('nav')).toBeVisible()

        // Should have footer
        await expect(page.locator('footer')).toBeVisible()
      })

      test(`/${locale}/pricing should render`, async ({ page }) => {
        await page.goto(`/${locale}/pricing`)

        // Page should have pricing content
        await expect(page.locator('h1')).toBeVisible()

        // Should have pricing cards or content
        const pricingContent = page.locator('[class*="card"]').first()
        await expect(pricingContent).toBeVisible()
      })
    }
  })
})

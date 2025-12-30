import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/reports'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return { type: 'a', props: { href, children } }
  },
}))

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

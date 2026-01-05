'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

/**
 * Auth state for caching user and tenant information
 * Reduces redundant Supabase calls across components
 */
export interface AuthState {
  // User data
  userId: string | null
  tenantId: string | null
  email: string | null
  role: string | null

  // Hydration state
  isHydrated: boolean
  isFetching: boolean
  fetchError: string | null

  // Actions
  setAuth: (data: { userId: string; tenantId: string; email?: string; role?: string }) => void
  clearAuth: () => void
  setHydrated: (hydrated: boolean) => void
  fetchAuthIfNeeded: () => Promise<{ userId: string; tenantId: string } | null>
}

const initialState = {
  userId: null,
  tenantId: null,
  email: null,
  role: null,
  isHydrated: false,
  isFetching: false,
  fetchError: null,
}

/**
 * Zustand store for auth state management
 *
 * Caches userId and tenantId to eliminate redundant auth.getUser()
 * and profile lookup calls. Uses sessionStorage for security.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (data) =>
        set({
          userId: data.userId,
          tenantId: data.tenantId,
          email: data.email ?? null,
          role: data.role ?? null,
          fetchError: null,
        }),

      clearAuth: () =>
        set({
          userId: null,
          tenantId: null,
          email: null,
          role: null,
          fetchError: null,
        }),

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      fetchAuthIfNeeded: async () => {
        const state = get()

        // Return cached data if available
        if (state.userId && state.tenantId) {
          return { userId: state.userId, tenantId: state.tenantId }
        }

        // Prevent concurrent fetches
        if (state.isFetching) {
          // Wait for current fetch to complete
          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              const currentState = get()
              if (!currentState.isFetching) {
                clearInterval(checkInterval)
                if (currentState.userId && currentState.tenantId) {
                  resolve({ userId: currentState.userId, tenantId: currentState.tenantId })
                } else {
                  resolve(null)
                }
              }
            }, 50)
          })
        }

        set({ isFetching: true, fetchError: null })

        try {
          const supabase = createClient()

          // Get authenticated user
          const { data: { user }, error: authError } = await supabase.auth.getUser()
          if (authError || !user) {
            set({ isFetching: false, fetchError: authError?.message ?? 'Not authenticated' })
            return null
          }

          // Get profile with tenant_id
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: profile, error: profileError } = await (supabase as any)
            .from('profiles')
            .select('tenant_id, email, role')
            .eq('id', user.id)
            .single()

          if (profileError || !profile?.tenant_id) {
            set({ isFetching: false, fetchError: profileError?.message ?? 'No tenant found' })
            return null
          }

          const authData = {
            userId: user.id,
            tenantId: profile.tenant_id,
            email: profile.email ?? user.email ?? null,
            role: profile.role ?? null,
          }

          set({
            ...authData,
            isFetching: false,
            fetchError: null,
          })

          return { userId: authData.userId, tenantId: authData.tenantId }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set({ isFetching: false, fetchError: errorMessage })
          return null
        }
      },
    }),
    {
      name: 'stockzip-auth-state',
      // Use sessionStorage for security (clears on tab close)
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist auth data, not loading states
        userId: state.userId,
        tenantId: state.tenantId,
        email: state.email,
        role: state.role,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      },
    }
  )
)

/**
 * Hook to get auth data with automatic fetching
 * Use this in components that need tenantId
 */
export function useAuth() {
  const { userId, tenantId, email, role, isHydrated, isFetching, fetchError, fetchAuthIfNeeded } =
    useAuthStore()

  return {
    userId,
    tenantId,
    email,
    role,
    isHydrated,
    isFetching,
    fetchError,
    fetchAuthIfNeeded,
    isAuthenticated: !!userId && !!tenantId,
  }
}

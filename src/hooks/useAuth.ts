import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser, AuthState } from '../types'

// ─── Map a raw Supabase user object to our AuthUser shape ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAuthUser(raw: any): AuthUser {
  const meta = raw.user_metadata ?? {}
  return {
    id:        raw.id,
    email:     raw.email ?? undefined,
    name:      meta.full_name ?? meta.name ?? undefined,
    avatarUrl: meta.avatar_url ?? meta.picture ?? undefined,
    provider:  raw.app_metadata?.provider ?? 'email',
  }
}

/**
 * Subscribes to Supabase Auth state changes.
 * Returns { user, loading }:
 *   - loading = true during the initial session check
 *   - user    = null  when signed out, AuthUser when signed in
 *
 * Automatically reflects sign-in / sign-out / Google OAuth redirect.
 */
export function useAuth(): AuthState {
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // 1. Check the existing session on mount (handles OAuth redirect returns too)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toAuthUser(session.user) : null)
      setLoading(false)
    })

    // 2. Subscribe to all future auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? toAuthUser(session.user) : null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

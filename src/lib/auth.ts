import { supabase } from './supabase'
import type { AuthUser } from '../types'

// ─── Shape helpers ────────────────────────────────────────────────────────────

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

// ─── Sign up with email + password ───────────────────────────────────────────
// Supabase Auth hashes the password with bcrypt before storing it.
// The raw password is NEVER persisted anywhere in your database.

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { full_name: displayName } : undefined,
    },
  })
  if (error) throw error
  if (!data.user) throw new Error('Sign-up succeeded but no user was returned.')
  return toAuthUser(data.user)
}

// ─── Sign in with email + password ───────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('Sign-in succeeded but no user was returned.')
  return toAuthUser(data.user)
}

// ─── Sign in with Google ──────────────────────────────────────────────────────
// Redirects to Google's consent screen. On return, Supabase handles the OAuth
// token exchange and creates/updates the user in auth.users automatically.

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) throw error
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Get current session (used on app boot) ───────────────────────────────────

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user ? toAuthUser(user) : null
}

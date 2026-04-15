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

// ─── Username → email resolution ─────────────────────────────────────────────

/**
 * Look up the email associated with a username.
 * Returns null if not found.
 */
async function emailForUsername(username: string): Promise<string | null> {
  // user_profiles stores (id, username); we join to auth.users via a view
  // Supabase doesn't expose auth.users directly in client queries, so we
  // store email in user_profiles or use a Postgres function.
  //
  // Strategy: query user_profiles for the UUID, then call
  // supabase.auth.admin (not available client-side). Instead, we store
  // email in user_profiles on sign-up.
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email')
    .ilike('username', username)
    .maybeSingle()

  if (error || !data) return null
  return (data as { email: string }).email ?? null
}

// ─── Sign up with email + username + password ─────────────────────────────────

export async function signUpWithEmail(
  email:       string,
  password:    string,
  displayName?: string,
  username?:   string
): Promise<AuthUser> {
  // 1. Check username availability
  if (username) {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .ilike('username', username)
      .maybeSingle()

    if (existing) throw new Error('Username is already taken. Please choose another.')
  }

  // 2. Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...(displayName ? { full_name: displayName } : {}),
        ...(username    ? { username }               : {}),
      },
    },
  })
  if (error) throw error
  if (!data.user) throw new Error('Sign-up succeeded but no user was returned.')

  // 3. Upsert user_profiles with email + chosen username
  if (data.user && username) {
    await supabase.from('user_profiles').upsert({
      id:       data.user.id,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email,
    }, { onConflict: 'id' })
  }

  return toAuthUser(data.user)
}

// ─── Sign in with email OR username ──────────────────────────────────────────

export async function signInWithEmail(
  emailOrUsername: string,
  password:        string
): Promise<AuthUser> {
  let email = emailOrUsername.trim()

  // Detect username (no @ symbol)
  if (!email.includes('@')) {
    const resolved = await emailForUsername(email)
    if (!resolved) {
      throw new Error('No account found with that username. Try signing in with your email instead.')
    }
    email = resolved
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('Sign-in succeeded but no user was returned.')
  return toAuthUser(data.user)
}

// ─── Sign in with Google ──────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) throw error
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user ? toAuthUser(user) : null
}

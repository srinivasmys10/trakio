import { createClient } from '@supabase/supabase-js'
import type { Progress } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Database row shape ───────────────────────────────────────────────────────

interface ProgressRow {
  user_id:    string
  progress:   Progress
  updated_at: string
}

/** Get the currently authenticated user's ID (throws if not signed in) */
async function getAuthUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return user.id
}

/**
 * Load the progress JSON blob for the current authenticated user.
 * Returns {} if no row exists yet (first time user).
 */
export async function loadProgress(): Promise<Progress> {
  const userId = await getAuthUserId()

  const { data, error } = await supabase
    .from('training_progress')
    .select('progress')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return (data as Pick<ProgressRow, 'progress'> | null)?.progress ?? {}
}

/**
 * Upsert the full progress object for the current authenticated user.
 * Supabase Auth handles all password hashing (bcrypt) — raw passwords
 * are never stored in this table or anywhere in your database.
 */
export async function saveProgress(progressData: Progress): Promise<void> {
  const userId = await getAuthUserId()

  const { error } = await supabase
    .from('training_progress')
    .upsert(
      {
        user_id:    userId,
        progress:   progressData,
        updated_at: new Date().toISOString(),
      } satisfies ProgressRow,
      { onConflict: 'user_id' }
    )

  if (error) throw error
}

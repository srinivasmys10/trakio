import { createClient } from '@supabase/supabase-js'
import type { Progress } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/** Single-user personal tracker — no auth needed */
export const USER_ID = 'default_user'

// ─── Database row shape ───────────────────────────────────────────────────────

interface ProgressRow {
  user_id:    string
  progress:   Progress
  updated_at: string
}

/**
 * Load the progress JSON blob for this user.
 * Returns an empty object if no row exists yet.
 */
export async function loadProgress(): Promise<Progress> {
  const { data, error } = await supabase
    .from<string, { Row: ProgressRow }>('training_progress')
    .select('progress')
    .eq('user_id', USER_ID)
    .maybeSingle()

  if (error) throw error
  return (data as ProgressRow | null)?.progress ?? {}
}

/**
 * Upsert the full progress object back to Supabase.
 */
export async function saveProgress(progressData: Progress): Promise<void> {
  const { error } = await supabase
    .from('training_progress')
    .upsert(
      {
        user_id:    USER_ID,
        progress:   progressData,
        updated_at: new Date().toISOString(),
      } satisfies ProgressRow,
      { onConflict: 'user_id' }
    )

  if (error) throw error
}

import { supabase } from './supabase'
import type { ExerciseLibraryItem, NewExerciseLibraryItem, ExerciseType } from '../types'

// ─── DB row shape ─────────────────────────────────────────────────────────────

interface ExerciseRow {
  id:            number
  name:          string
  description:   string
  exercise_type: string
  impact_areas:  string[]
  default_sets:  number
  default_reps:  string
  audio_url:     string | null
  sort_order:    number
  created_at:    string
}

function rowToItem(row: ExerciseRow): ExerciseLibraryItem {
  return {
    id:            row.id,
    name:          row.name,
    description:   row.description,
    exercise_type: row.exercise_type as ExerciseType,
    impact_areas:  row.impact_areas ?? [],
    default_sets:  row.default_sets,
    default_reps:  row.default_reps,
    audio_url:     row.audio_url ?? null,
    sort_order:    row.sort_order,
    created_at:    row.created_at,
  }
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let _cache: ExerciseLibraryItem[] | null = null
let _inflight: Promise<ExerciseLibraryItem[]> | null = null

export function clearExerciseCache() { _cache = null; _inflight = null }

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
  if (_cache) return _cache
  if (_inflight) return _inflight

  _inflight = (async () => {
    const { data, error } = await supabase
      .from('exercise_library')
      .select('*')
      .order('exercise_type')
      .order('sort_order')

    if (error) throw error
    _cache = ((data ?? []) as ExerciseRow[]).map(rowToItem)
    _inflight = null
    return _cache
  })()

  return _inflight
}

// ─── Audio upload to Supabase Storage ─────────────────────────────────────────

export async function uploadAudio(blob: Blob, exerciseName: string): Promise<string> {
  const safe    = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  const ts      = Date.now()
  const path    = `${safe}-${ts}.webm`

  const { error } = await supabase.storage
    .from('exercise-audio')
    .upload(path, blob, { contentType: blob.type || 'audio/webm', upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('exercise-audio').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteAudio(url: string): Promise<void> {
  // Extract path from public URL
  const parts = url.split('/exercise-audio/')
  if (parts.length < 2) return
  const path = parts[1]
  await supabase.storage.from('exercise-audio').remove([path])
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function addExercise(item: NewExerciseLibraryItem): Promise<ExerciseLibraryItem> {
  const { data, error } = await supabase
    .from('exercise_library')
    .insert({
      name:          item.name,
      description:   item.description,
      exercise_type: item.exercise_type,
      impact_areas:  item.impact_areas,
      default_sets:  item.default_sets,
      default_reps:  item.default_reps,
      audio_url:     item.audio_url,
      sort_order:    item.sort_order,
    })
    .select('*')
    .single()

  if (error) throw error
  clearExerciseCache()
  return rowToItem(data as ExerciseRow)
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateExercise(
  id: number,
  fields: Partial<NewExerciseLibraryItem>
): Promise<void> {
  const { error } = await supabase
    .from('exercise_library')
    .update(fields)
    .eq('id', id)

  if (error) throw error
  clearExerciseCache()
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteExercise(id: number, audioUrl?: string | null): Promise<void> {
  if (audioUrl) {
    try { await deleteAudio(audioUrl) } catch { /* best-effort */ }
  }
  const { error } = await supabase.from('exercise_library').delete().eq('id', id)
  if (error) throw error
  clearExerciseCache()
}

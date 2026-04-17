import { supabase } from './supabase'
import type { WorkoutSlot, NewWorkoutSlot, DayCompletion, ExerciseLibraryItem, ExerciseType, Weekday } from '../types'

// ─── DB row shapes ────────────────────────────────────────────────────────────

interface WorkoutRow {
  id:          number
  user_id:     string
  week_start:  string
  weekday:     string
  exercise_id: number
  custom_sets: number | null
  custom_reps: string | null
  notes:       string
  sort_order:  number
  completed:   boolean
  created_at:  string
  exercise_library: {
    id: number; name: string; description: string; exercise_type: string
    impact_areas: string[]; default_sets: number; default_reps: string
    audio_url: string | null; sort_order: number; created_at: string
  }
}

function rowToSlot(row: WorkoutRow): WorkoutSlot {
  const ex = row.exercise_library
  const exercise: ExerciseLibraryItem = {
    id: ex.id, name: ex.name, description: ex.description,
    exercise_type: ex.exercise_type as ExerciseType,
    impact_areas: ex.impact_areas ?? [],
    default_sets: ex.default_sets, default_reps: ex.default_reps,
    audio_url: ex.audio_url ?? null, sort_order: ex.sort_order, created_at: ex.created_at,
  }
  return {
    id: row.id, user_id: row.user_id, week_start: row.week_start,
    weekday: row.weekday as Weekday, exercise_id: row.exercise_id,
    custom_sets: row.custom_sets ?? null, custom_reps: row.custom_reps ?? null,
    notes: row.notes, sort_order: row.sort_order, completed: row.completed ?? false,
    created_at: row.created_at, exercise,
  }
}

async function getAuthUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return user.id
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadWeekWorkout(weekStart: string): Promise<WorkoutSlot[]> {
  const userId = await getAuthUserId()
  const { data, error } = await supabase
    .from('workout_plans')
    .select(`
      id, user_id, week_start, weekday, exercise_id, custom_sets, custom_reps,
      notes, sort_order, completed, created_at,
      exercise_library ( id, name, description, exercise_type, impact_areas,
                         default_sets, default_reps, audio_url, sort_order, created_at )
    `)
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .order('weekday').order('sort_order')

  if (error) throw error
  return ((data ?? []) as unknown as WorkoutRow[]).map(rowToSlot)
}

export async function loadDayCompletions(weekStart: string): Promise<DayCompletion[]> {
  const userId = await getAuthUserId()
  const { data, error } = await supabase
    .from('workout_day_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)

  if (error) throw error
  return (data ?? []) as DayCompletion[]
}

// ─── Add slot ─────────────────────────────────────────────────────────────────

export async function addWorkoutSlot(slot: Omit<NewWorkoutSlot, 'sort_order'>): Promise<WorkoutSlot> {
  const userId = await getAuthUserId()
  const { count } = await supabase
    .from('workout_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId).eq('week_start', slot.week_start).eq('weekday', slot.weekday)

  const { data, error } = await supabase
    .from('workout_plans')
    .insert({
      user_id: userId, week_start: slot.week_start, weekday: slot.weekday,
      exercise_id: slot.exercise_id, custom_sets: slot.custom_sets ?? null,
      custom_reps: slot.custom_reps ?? null, notes: slot.notes,
      sort_order: (count ?? 0) + 1, completed: false,
    })
    .select(`
      id, user_id, week_start, weekday, exercise_id, custom_sets, custom_reps,
      notes, sort_order, completed, created_at,
      exercise_library ( id, name, description, exercise_type, impact_areas,
                         default_sets, default_reps, audio_url, sort_order, created_at )
    `)
    .single()

  if (error) throw error
  return rowToSlot(data as unknown as WorkoutRow)
}

// ─── Toggle exercise completion ───────────────────────────────────────────────

export async function toggleSlotCompletion(id: number, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('workout_plans')
    .update({ completed })
    .eq('id', id)

  if (error) throw error
}

// ─── Day-level completion ─────────────────────────────────────────────────────

export async function setDayCompletion(
  weekStart: string,
  weekday:   Weekday,
  completed: boolean
): Promise<void> {
  const userId = await getAuthUserId()

  if (completed) {
    const { error } = await supabase
      .from('workout_day_completions')
      .upsert(
        { user_id: userId, week_start: weekStart, weekday, completed: true, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,week_start,weekday' }
      )
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('workout_day_completions')
      .delete()
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .eq('weekday', weekday)
    if (error) throw error
  }
}

// ─── Update / Remove slot ─────────────────────────────────────────────────────

export async function updateWorkoutSlot(
  id: number,
  fields: Partial<Pick<WorkoutSlot, 'custom_sets' | 'custom_reps' | 'notes'>>
): Promise<void> {
  const { error } = await supabase.from('workout_plans').update(fields).eq('id', id)
  if (error) throw error
}

export async function removeWorkoutSlot(id: number): Promise<void> {
  const { error } = await supabase.from('workout_plans').delete().eq('id', id)
  if (error) throw error
}

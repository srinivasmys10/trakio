import { supabase } from './supabase'
import type { GymSplit, Exercise, NewExercise } from '../types'

// ─── DB row shapes ────────────────────────────────────────────────────────────

interface GymSplitRow {
  id:         number
  name:       string
  phase:      string
  sort_order: number
}

interface GymExerciseRow {
  id:         number
  split_id:   number
  sort_order: number
  name:       string
  sets:       number
  reps:       string
  weight:     string
  muscles:    string
  notes:      string
}

interface GymSplitWithExercises extends GymSplitRow {
  gym_exercises: GymExerciseRow[]
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

let _cache: Record<string, GymSplit> | null = null
let _fetchPromise: Promise<Record<string, GymSplit>> | null = null

function rowsToMap(rows: GymSplitWithExercises[]): Record<string, GymSplit> {
  const map: Record<string, GymSplit> = {}
  for (const row of rows) {
    const exercises: Exercise[] = [...row.gym_exercises]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(({ id, name, sets, reps, weight, muscles, notes }) => ({
        id, name, sets, reps, weight, muscles, notes,
      }))
    map[row.name] = { id: row.id, phase: row.phase, exercises }
  }
  return map
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadAllGymSplits(): Promise<Record<string, GymSplit>> {
  if (_cache !== null) return _cache
  if (_fetchPromise !== null) return _fetchPromise

  _fetchPromise = (async () => {
    const { data, error } = await supabase
      .from('gym_splits')
      .select(`
        id,
        name,
        phase,
        sort_order,
        gym_exercises (
          id,
          split_id,
          sort_order,
          name,
          sets,
          reps,
          weight,
          muscles,
          notes
        )
      `)
      .order('sort_order', { ascending: true })

    if (error) throw error

    _cache = rowsToMap((data ?? []) as unknown as GymSplitWithExercises[])
    _fetchPromise = null
    return _cache
  })()

  return _fetchPromise
}

export function clearGymSplitsCache(): void {
  _cache = null
  _fetchPromise = null
}

// ─── Write: add exercise ──────────────────────────────────────────────────────

/**
 * Insert a new exercise into a split.
 * sort_order is set to current exercise count + 1 so it appends at the bottom.
 * Clears the in-memory cache so the next load reflects the change.
 */
export async function addExercise(
  splitId:    number,
  sortOrder:  number,
  exercise:   NewExercise
): Promise<void> {
  const { error } = await supabase
    .from('gym_exercises')
    .insert({
      split_id:   splitId,
      sort_order: sortOrder,
      name:       exercise.name,
      sets:       exercise.sets,
      reps:       exercise.reps,
      weight:     exercise.weight,
      muscles:    exercise.muscles,
      notes:      exercise.notes,
    })

  if (error) throw error
  clearGymSplitsCache()
}

// ─── Write: delete exercise ───────────────────────────────────────────────────

/**
 * Delete a single exercise by its DB id.
 * Clears the in-memory cache so the next load reflects the change.
 */
export async function deleteExercise(exerciseId: number): Promise<void> {
  const { error } = await supabase
    .from('gym_exercises')
    .delete()
    .eq('id', exerciseId)

  if (error) throw error
  clearGymSplitsCache()
}

// ─── Write: update exercise ───────────────────────────────────────────────────

/**
 * Update a single exercise by its DB id.
 * Clears the in-memory cache so the next load reflects the change.
 */
export async function updateExercise(
  exerciseId: number,
  fields: Partial<NewExercise>
): Promise<void> {
  const { error } = await supabase
    .from('gym_exercises')
    .update(fields)
    .eq('id', exerciseId)

  if (error) throw error
  clearGymSplitsCache()
}

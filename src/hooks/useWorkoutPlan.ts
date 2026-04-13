import { useState, useEffect, useCallback } from 'react'
import {
  loadWeekWorkout, addWorkoutSlot,
  updateWorkoutSlot, removeWorkoutSlot,
} from '../lib/workoutPlan'
import type { WorkoutSlot } from '../types'

export interface UseWorkoutPlanResult {
  slots:       WorkoutSlot[]
  loading:     boolean
  error:       string | null
  saving:      boolean
  addSlot:     (params: { weekStart: string; weekday: string; exerciseId: number; sets?: number | null; reps?: string | null; notes?: string }) => Promise<void>
  updateSlot:  (id: number, fields: { custom_sets?: number | null; custom_reps?: string | null; notes?: string }) => Promise<void>
  removeSlot:  (id: number) => Promise<void>
  refetch:     () => Promise<void>
}

export function useWorkoutPlan(weekStart: string): UseWorkoutPlanResult {
  const [slots,   setSlots]   = useState<WorkoutSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [saving,  setSaving]  = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setSlots(await loadWeekWorkout(weekStart)) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load workout plan') }
    finally { setLoading(false) }
  }, [weekStart])

  useEffect(() => { void fetch() }, [fetch])

  const addSlot = useCallback(async ({ weekStart: ws, weekday, exerciseId, sets, reps, notes }: { weekStart: string; weekday: string; exerciseId: number; sets?: number | null; reps?: string | null; notes?: string }) => {
    setSaving(true)
    try {
      const created = await addWorkoutSlot({
        week_start:  ws,
        weekday:     weekday as WorkoutSlot['weekday'],
        exercise_id: exerciseId,
        custom_sets: sets ?? null,
        custom_reps: reps ?? null,
        notes:       notes ?? '',
      })
      setSlots(prev => [...prev, created])
    } finally { setSaving(false) }
  }, [])

  const updateSlot = useCallback(async (id: number, fields: { custom_sets?: number | null; custom_reps?: string | null; notes?: string }) => {
    setSaving(true)
    try {
      await updateWorkoutSlot(id, fields)
      setSlots(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s))
    } finally { setSaving(false) }
  }, [])

  const removeSlot = useCallback(async (id: number) => {
    setSaving(true)
    try {
      await removeWorkoutSlot(id)
      setSlots(prev => prev.filter(s => s.id !== id))
    } finally { setSaving(false) }
  }, [])

  return { slots, loading, error, saving, addSlot, updateSlot, removeSlot, refetch: fetch }
}

import { useState, useEffect, useCallback } from 'react'
import {
  loadWeekWorkout, loadDayCompletions,
  addWorkoutSlot, toggleSlotCompletion,
  setDayCompletion, updateWorkoutSlot, removeWorkoutSlot,
  copyWorkoutSlots, clearWorkoutDay,
} from '../lib/workoutPlan'
import type { WorkoutSlot, DayCompletion, Weekday } from '../types'

export interface UseWorkoutPlanResult {
  slots:           WorkoutSlot[]
  dayCompletions:  DayCompletion[]
  loading:         boolean
  error:           string | null
  saving:          boolean
  addSlot:         (params: { weekStart: string; weekday: string; exerciseId: number; sets?: number | null; reps?: string | null; notes?: string }) => Promise<void>
  toggleCompleted: (id: number, completed: boolean, weekday: Weekday, weekStart: string, allSlots: WorkoutSlot[]) => Promise<void>
  markDayDone:     (weekStart: string, weekday: Weekday, completed: boolean) => Promise<void>
  updateSlot:      (id: number, fields: { custom_sets?: number | null; custom_reps?: string | null; notes?: string }) => Promise<void>
  removeSlot:      (id: number) => Promise<void>
  copySlots:       (slotIds: number[], targetWeekStart: string, targetWeekday: Weekday) => Promise<number>
  clearDay:        (weekStart: string, weekday: Weekday) => Promise<void>
  refetch:         () => Promise<void>
}

export function useWorkoutPlan(weekStart: string): UseWorkoutPlanResult {
  const [slots,          setSlots]          = useState<WorkoutSlot[]>([])
  const [dayCompletions, setDayCompletions] = useState<DayCompletion[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [saving,         setSaving]         = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [s, d] = await Promise.all([
        loadWeekWorkout(weekStart),
        loadDayCompletions(weekStart),
      ])
      setSlots(s)
      setDayCompletions(d)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load workout plan')
    } finally { setLoading(false) }
  }, [weekStart])

  useEffect(() => { void fetch() }, [fetch])

  const addSlot = useCallback(async ({ weekStart: ws, weekday, exerciseId, sets, reps, notes }: {
    weekStart: string; weekday: string; exerciseId: number; sets?: number | null; reps?: string | null; notes?: string
  }) => {
    setSaving(true)
    try {
      const created = await addWorkoutSlot({
        week_start: ws, weekday: weekday as Weekday,
        exercise_id: exerciseId,
        custom_sets: sets ?? null, custom_reps: reps ?? null, notes: notes ?? '',
      })
      setSlots(prev => [...prev, created])
    } finally { setSaving(false) }
  }, [])

  // Toggle an exercise complete/incomplete, then auto-complete/uncomplete the day
  const toggleCompleted = useCallback(async (
    id: number, completed: boolean, weekday: Weekday, ws: string, allSlots: WorkoutSlot[]
  ) => {
    setSaving(true)
    try {
      await toggleSlotCompletion(id, completed)

      // Optimistically update local state
      const updatedSlots = allSlots.map(s => s.id === id ? { ...s, completed } : s)
      setSlots(updatedSlots)

      // Check if all slots for this day are now complete
      const daySlots = updatedSlots.filter(s => s.weekday === weekday && s.week_start === ws)
      const allDone  = daySlots.length > 0 && daySlots.every(s => s.completed)

      // Auto-mark / auto-unmark the day
      await setDayCompletion(ws, weekday, allDone)
      setDayCompletions(prev => {
        const filtered = prev.filter(d => !(d.weekday === weekday && d.week_start === ws))
        if (allDone) {
          return [...filtered, {
            id: Date.now(), user_id: '', week_start: ws, weekday,
            completed: true, completed_at: new Date().toISOString(),
          }]
        }
        return filtered
      })
    } finally { setSaving(false) }
  }, [])

  // Manually toggle the whole day (regardless of individual exercises)
  const markDayDone = useCallback(async (ws: string, weekday: Weekday, completed: boolean) => {
    setSaving(true)
    try {
      await setDayCompletion(ws, weekday, completed)
      setDayCompletions(prev => {
        const filtered = prev.filter(d => !(d.weekday === weekday && d.week_start === ws))
        if (completed) {
          return [...filtered, {
            id: Date.now(), user_id: '', week_start: ws, weekday,
            completed: true, completed_at: new Date().toISOString(),
          }]
        }
        return filtered
      })
      // If marking day done manually, also mark all its exercises done
      if (completed) {
        const daySlots = slots.filter(s => s.weekday === weekday)
        await Promise.all(daySlots.filter(s => !s.completed).map(s => toggleSlotCompletion(s.id, true)))
        setSlots(prev => prev.map(s => s.weekday === weekday ? { ...s, completed: true } : s))
      }
    } finally { setSaving(false) }
  }, [slots])

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

  // Copy exercises to another day (possibly in another week, e.g. "today")
  const copySlots = useCallback(async (slotIds: number[], targetWeekStart: string, targetWeekday: Weekday) => {
    const source = slots.filter(s => slotIds.includes(s.id)).sort((a, b) => a.sort_order - b.sort_order)
    if (source.length === 0) return 0
    setSaving(true)
    try {
      const created = await copyWorkoutSlots(source, targetWeekStart, targetWeekday)
      // New incomplete exercises mean the target day is no longer fully done
      await setDayCompletion(targetWeekStart, targetWeekday, false)
      if (targetWeekStart === weekStart) {
        setSlots(prev => [...prev, ...created])
        setDayCompletions(prev => prev.filter(d => !(d.weekday === targetWeekday && d.week_start === targetWeekStart)))
      }
      return created.length
    } finally { setSaving(false) }
  }, [slots, weekStart])

  // Delete all exercises for a day
  const clearDay = useCallback(async (ws: string, weekday: Weekday) => {
    setSaving(true)
    try {
      await clearWorkoutDay(ws, weekday)
      setSlots(prev => prev.filter(s => !(s.weekday === weekday && s.week_start === ws)))
      setDayCompletions(prev => prev.filter(d => !(d.weekday === weekday && d.week_start === ws)))
    } finally { setSaving(false) }
  }, [])

  return {
    slots, dayCompletions, loading, error, saving,
    addSlot, toggleCompleted, markDayDone, updateSlot, removeSlot, copySlots, clearDay,
    refetch: fetch,
  }
}

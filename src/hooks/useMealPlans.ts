import { useState, useEffect, useCallback } from 'react'
import {
  loadWeekPlan, assignMealToSlot, updateSlotNote, removeSlot,
} from '../lib/mealPlans'
import type { MealPlanSlot, NewMealPlanSlot } from '../types'

export interface UseMealPlansResult {
  slots:       MealPlanSlot[]
  loading:     boolean
  error:       string | null
  saving:      boolean
  assign:      (slot: NewMealPlanSlot) => Promise<void>
  updateNote:  (id: number, notes: string) => Promise<void>
  remove:      (id: number) => Promise<void>
  refetch:     () => Promise<void>
}

export function useMealPlans(weekStart: string): UseMealPlansResult {
  const [slots,   setSlots]   = useState<MealPlanSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [saving,  setSaving]  = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setSlots(await loadWeekPlan(weekStart)) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load plan') }
    finally { setLoading(false) }
  }, [weekStart])

  useEffect(() => { void fetch() }, [fetch])

  const assign = useCallback(async (slot: NewMealPlanSlot) => {
    setSaving(true)
    try {
      const created = await assignMealToSlot(slot)
      setSlots(prev => {
        const filtered = prev.filter(s => !(s.weekday === slot.weekday && s.meal_type === slot.meal_type))
        return [...filtered, created].sort((a, b) => a.id - b.id)
      })
    } finally { setSaving(false) }
  }, [])

  const updateNote = useCallback(async (id: number, notes: string) => {
    setSaving(true)
    try {
      await updateSlotNote(id, notes)
      setSlots(prev => prev.map(s => s.id === id ? { ...s, notes } : s))
    } finally { setSaving(false) }
  }, [])

  const remove = useCallback(async (id: number) => {
    setSaving(true)
    try {
      await removeSlot(id)
      setSlots(prev => prev.filter(s => s.id !== id))
    } finally { setSaving(false) }
  }, [])

  return { slots, loading, error, saving, assign, updateNote, remove, refetch: fetch }
}

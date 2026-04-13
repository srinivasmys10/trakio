import { useState, useEffect, useCallback } from 'react'
import {
  loadExerciseLibrary, addExercise, updateExercise,
  deleteExercise, clearExerciseCache,
} from '../lib/exerciseLibrary'
import type { ExerciseLibraryItem, NewExerciseLibraryItem } from '../types'

export interface UseExerciseLibraryResult {
  exercises: ExerciseLibraryItem[]
  loading:   boolean
  error:     string | null
  saving:    boolean
  add:       (item: NewExerciseLibraryItem) => Promise<ExerciseLibraryItem>
  update:    (id: number, fields: Partial<NewExerciseLibraryItem>) => Promise<void>
  remove:    (id: number, audioUrl?: string | null) => Promise<void>
  refetch:   () => Promise<void>
}

export function useExerciseLibrary(): UseExerciseLibraryResult {
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)

  const fetch = useCallback(async (bust = false) => {
    setLoading(true); setError(null)
    if (bust) clearExerciseCache()
    try { setExercises(await loadExerciseLibrary()) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load exercises') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void fetch() }, [fetch])

  const add = useCallback(async (item: NewExerciseLibraryItem) => {
    setSaving(true)
    try {
      const created = await addExercise(item)
      await fetch(true)
      return created
    } finally { setSaving(false) }
  }, [fetch])

  const update = useCallback(async (id: number, fields: Partial<NewExerciseLibraryItem>) => {
    setSaving(true)
    try { await updateExercise(id, fields); await fetch(true) }
    finally { setSaving(false) }
  }, [fetch])

  const remove = useCallback(async (id: number, audioUrl?: string | null) => {
    setSaving(true)
    try { await deleteExercise(id, audioUrl); await fetch(true) }
    finally { setSaving(false) }
  }, [fetch])

  return { exercises, loading, error, saving, add, update, remove, refetch: () => fetch(true) }
}

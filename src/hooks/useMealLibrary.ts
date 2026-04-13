import { useState, useEffect, useCallback } from 'react'
import {
  loadMealLibrary, addLibraryMeal, updateLibraryMeal,
  deleteLibraryMeal, clearLibraryCache,
} from '../lib/mealLibrary'
import type { MealLibraryItem, NewMealLibraryItem, NewLibraryIngredient } from '../types'

export interface UseMealLibraryResult {
  library:      MealLibraryItem[]
  loading:      boolean
  error:        string | null
  saving:       boolean
  addMeal:      (item: NewMealLibraryItem, ingredients: NewLibraryIngredient[]) => Promise<void>
  updateMeal:   (id: number, item: Partial<NewMealLibraryItem>, ingredients: NewLibraryIngredient[]) => Promise<void>
  deleteMeal:   (id: number) => Promise<void>
  refetch:      () => Promise<void>
}

export function useMealLibrary(): UseMealLibraryResult {
  const [library, setLibrary] = useState<MealLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [saving,  setSaving]  = useState(false)

  const fetch = useCallback(async (bust = false) => {
    setLoading(true); setError(null)
    if (bust) clearLibraryCache()
    try {
      const data = await loadMealLibrary()
      setLibrary(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load meal library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetch() }, [fetch])

  const addMeal = useCallback(async (item: NewMealLibraryItem, ingredients: NewLibraryIngredient[]) => {
    setSaving(true)
    try { await addLibraryMeal(item, ingredients); await fetch(true) }
    finally { setSaving(false) }
  }, [fetch])

  const updateMeal = useCallback(async (id: number, item: Partial<NewMealLibraryItem>, ingredients: NewLibraryIngredient[]) => {
    setSaving(true)
    try { await updateLibraryMeal(id, item, ingredients); await fetch(true) }
    finally { setSaving(false) }
  }, [fetch])

  const deleteMeal = useCallback(async (id: number) => {
    setSaving(true)
    try { await deleteLibraryMeal(id); await fetch(true) }
    finally { setSaving(false) }
  }, [fetch])

  return { library, loading, error, saving, addMeal, updateMeal, deleteMeal, refetch: () => fetch(true) }
}

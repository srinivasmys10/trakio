import { useState, useEffect, useCallback } from 'react'
import { loadAllGymSplits, clearGymSplitsCache } from '../lib/gymSplits'
import type { GymSplit } from '../types'

export interface UseGymSplitsResult {
  gymSplits: Record<string, GymSplit>
  loading:   boolean
  error:     string | null
  refetch:   () => Promise<void>
}

export function useGymSplits(): UseGymSplitsResult {
  const [gymSplits, setGymSplits] = useState<Record<string, GymSplit>>({})
  const [loading,   setLoading]   = useState<boolean>(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchData = useCallback(async (bustCache = false): Promise<void> => {
    setLoading(true)
    setError(null)
    if (bustCache) clearGymSplitsCache()
    try {
      const data = await loadAllGymSplits()
      setGymSplits(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load gym data'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    let cancelled = false
    fetchData().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fetchData])

  /** Call after a mutation (add/delete exercise) to reload from Supabase */
  const refetch = useCallback(() => fetchData(true), [fetchData])

  return { gymSplits, loading, error, refetch }
}

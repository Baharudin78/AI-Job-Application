'use client'

import { useCallback, useEffect, useState } from 'react'
import type { UsageStatsDTO } from '@/lib/db/usage'

interface UseUsage {
  usage: UsageStatsDTO | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/** Fetch the current user's usage stats for this billing period. */
export function useUsage(): UseUsage {
  const [usage, setUsage] = useState<UsageStatsDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/usage')
      const json = (await res.json()) as { data?: UsageStatsDTO; error?: string }
      if (!res.ok || !json.data) {
        setError(json.error ?? 'Could not load usage.')
        setUsage(null)
      } else {
        setUsage(json.data)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { usage, loading, error, reload }
}

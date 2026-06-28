'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type OptimizeState = 'idle' | 'loading' | 'success' | 'error'

export interface OptimizeInput {
  documentId: string
  targetJobTitle?: string
  targetIndustry?: string
  force?: boolean
}

interface UseCvOptimize {
  state: OptimizeState
  error: string | null
  /** Special server codes for tailored UI: 'usage_limit' | 'already_optimized'. */
  errorCode: string | null
  optimizedContent: string | null
  remaining: number | null
  optimize: (input: OptimizeInput) => Promise<void>
  reset: () => void
}

export function useCvOptimize(): UseCvOptimize {
  const [state, setState] = useState<OptimizeState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  // Abort an in-flight request if the component unmounts (the server keeps
  // processing and persists the result regardless).
  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  const optimize = useCallback(async (input: OptimizeInput): Promise<void> => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setState('loading')
    setError(null)
    setErrorCode(null)

    try {
      const res = await fetch('/api/cv/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })
      const json = (await res.json()) as {
        data?: { optimizedContent: string }
        error?: string
        code?: string
        remaining?: number
      }

      if (!res.ok || !json.data) {
        setErrorCode(json.code ?? (json.error === 'already_optimized' ? 'already_optimized' : null))
        setRemaining(typeof json.remaining === 'number' ? json.remaining : null)
        setError(json.error ?? 'Optimization failed. Please try again.')
        setState('error')
        return
      }

      setOptimizedContent(json.data.optimizedContent)
      setState('success')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('Network error. Please check your connection and try again.')
      setState('error')
    }
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    setState('idle')
    setError(null)
    setErrorCode(null)
    setOptimizedContent(null)
    setRemaining(null)
  }, [])

  return { state, error, errorCode, optimizedContent, remaining, optimize, reset }
}

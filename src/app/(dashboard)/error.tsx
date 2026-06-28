'use client'

import { useEffect } from 'react'

import { ErrorDisplay } from '@/components/shared/ErrorDisplay'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard/error]', error)
  }, [error])

  return (
    <div className="py-8">
      <ErrorDisplay message="We couldn't load this page. Please try again." onRetry={reset} />
    </div>
  )
}

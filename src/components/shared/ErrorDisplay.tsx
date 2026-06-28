'use client'

import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  message?: string | null
  onRetry?: () => void
  className?: string
}

/** Reusable inline error panel with an optional retry action. */
export function ErrorDisplay({ message, onRetry, className }: ErrorDisplayProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-10 text-center',
        className,
      )}
    >
      <AlertCircle className="size-6 text-destructive" />
      <p className="text-sm text-muted-foreground">{message ?? 'Something went wrong.'}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

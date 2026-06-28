import { cn } from '@/lib/utils'

interface KeywordBadgeProps {
  label: string
  variant: 'matched' | 'missing'
}

export function KeywordBadge({ label, variant }: KeywordBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variant === 'matched'
          ? 'border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400'
          : 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
    >
      {label}
    </span>
  )
}

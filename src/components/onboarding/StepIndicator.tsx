import { cn } from '@/lib/utils'

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        Step {current} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn('h-1.5 flex-1 rounded-full', i + 1 <= current ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </div>
    </div>
  )
}

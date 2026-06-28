'use client'

import { useState } from 'react'
import type { SubscriptionTier } from '@prisma/client'
import type { FeatureUsageDTO } from '@/lib/db/usage'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UpgradeModal } from './UpgradeModal'

interface UsageMeterProps {
  features: FeatureUsageDTO[]
  tier: SubscriptionTier
  className?: string
}

export function UsageMeter({ features, tier, className }: UsageMeterProps) {
  const [modalOpen, setModalOpen] = useState(false)

  // Only metered features (a finite, > 0 limit) get a bar.
  const metered = features.filter((f) => !f.unlimited && (f.limit ?? 0) > 0)
  const isFree = tier === 'FREE'

  if (metered.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        You&apos;re on {tier} — unlimited usage. 🎉
      </p>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {metered.map((f) => {
        const limit = f.limit ?? 0
        const pct = limit > 0 ? Math.min(100, Math.round((f.used / limit) * 100)) : 0
        const warn = pct >= 80
        return (
          <div key={f.feature} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{f.label}</span>
              <span className={cn('text-muted-foreground', f.isAtLimit && 'text-destructive')}>
                {f.used}/{limit}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  f.isAtLimit ? 'bg-destructive' : warn ? 'bg-amber-500' : 'bg-primary',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}

      {isFree && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setModalOpen(true)}
          >
            Upgrade for unlimited
          </Button>
          <UpgradeModal open={modalOpen} onOpenChange={setModalOpen} />
        </>
      )}
    </div>
  )
}

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UpgradeBannerProps {
  title?: string
  description?: string
  /** Remaining free uses this period — used to build a default description. */
  remaining?: number
  href?: string
  className?: string
}

export function UpgradeBanner({
  title = 'Upgrade to Pro',
  description,
  remaining,
  href = '/settings/billing',
  className,
}: UpgradeBannerProps) {
  const resolvedDescription =
    description ??
    (typeof remaining === 'number'
      ? `You have ${remaining} free ${remaining === 1 ? 'use' : 'uses'} left this month. Go unlimited with Pro.`
      : 'Unlock unlimited CV optimizations, cover letters, and ATS checks.')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{resolvedDescription}</p>
        </div>
      </div>
      <Button asChild className="shrink-0">
        <Link href={href}>Upgrade</Link>
      </Button>
    </div>
  )
}

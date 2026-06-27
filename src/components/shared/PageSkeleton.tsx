import { Skeleton } from '@/components/ui/skeleton'

/** Page-level loading placeholder for dashboard routes. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

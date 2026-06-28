import { PageSkeleton } from '@/components/shared/PageSkeleton'

// Shown while any protected dashboard route streams in (server-rendered pages).
export default function DashboardLoading() {
  return <PageSkeleton />
}

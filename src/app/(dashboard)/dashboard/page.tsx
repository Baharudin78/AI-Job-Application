import Link from 'next/link'
import { FileText, Mail, ScanSearch, Plus, AlertCircle, Clock } from 'lucide-react'

import { requireAuth } from '@/lib/auth/server'
import { getUserSubscription } from '@/lib/db/subscription'
import { resolveEffectiveTier, getUsageStats, serializeUsageStats, type UsageStatsDTO } from '@/lib/db/usage'
import { getDashboardData, type DashboardData, type ActivityType } from '@/lib/db/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UpgradeBanner } from '@/components/shared/UpgradeBanner'
import { UsageMeter } from '@/components/shared/UsageMeter'

const SUMMARY_CARDS = [
  { key: 'cvDocuments' as const, label: 'CVs optimized', href: '/cv', icon: FileText },
  { key: 'coverLetters' as const, label: 'Cover letters', href: '/cover-letter', icon: Mail },
  { key: 'atsChecks' as const, label: 'ATS checks', href: '/ats', icon: ScanSearch },
]

const ACTIVITY_ICONS: Record<ActivityType, typeof FileText> = {
  CV: FileText,
  COVER_LETTER: Mail,
  ATS: ScanSearch,
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const subscription = await getUserSubscription(user.id)
  const tier = resolveEffectiveTier(subscription)

  let data: DashboardData
  let usage: UsageStatsDTO
  try {
    const [dashboardData, usageStats] = await Promise.all([
      getDashboardData(user.id),
      getUsageStats(user.id),
    ])
    data = dashboardData
    usage = serializeUsageStats(usageStats)
  } catch (error) {
    console.error('[dashboard/page]', error)
    return <DashboardError />
  }

  const firstName = user.name?.trim().split(/\s+/)[0] ?? null
  const cv = usage.features.find((f) => f.feature === 'CV_OPTIMIZE')
  const cvRemaining = cv && cv.limit !== null ? (cv.remaining ?? undefined) : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your applications.
        </p>
      </div>

      {tier === 'FREE' && (
        <UpgradeBanner
          remaining={cvRemaining}
          title="You're on the Free plan"
          description={
            typeof cvRemaining === 'number'
              ? `${cvRemaining} CV ${cvRemaining === 1 ? 'optimization' : 'optimizations'} left this month. Go unlimited with Pro.`
              : undefined
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.key} href={card.href} className="group">
              <Card className="transition-colors group-hover:border-primary/40">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.counts[card.key]}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/cv">
            <Plus className="size-4" />
            Optimize new CV
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cover-letter/new">
            <Mail className="size-4" />
            Write cover letter
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <EmptyActivity />
            ) : (
              <ul className="divide-y">
                {data.recentActivity.map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type]
                  return (
                    <li
                      key={`${item.type}-${item.id}`}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This month&apos;s usage</CardTitle>
          </CardHeader>
          <CardContent>
            <UsageMeter features={usage.features} tier={usage.tier} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Clock className="size-5 text-muted-foreground" />
      </span>
      <div>
        <p className="font-medium">Nothing here yet</p>
        <p className="text-sm text-muted-foreground">
          Optimize your first CV to get started — it only takes a minute.
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/cv">
          <Plus className="size-4" />
          Optimize a CV
        </Link>
      </Button>
    </div>
  )
}

function DashboardError() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
      <AlertCircle className="size-6 text-destructive" />
      <div>
        <p className="font-medium">Couldn&apos;t load your dashboard</p>
        <p className="text-sm text-muted-foreground">Please refresh the page in a moment.</p>
      </div>
    </div>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

import { redirect } from 'next/navigation'

import { requireAuth } from '@/lib/auth/server'
import { getUserSubscription } from '@/lib/db/subscription'
import { resolveEffectiveTier } from '@/lib/db/usage'
import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { DashboardHeader } from '@/components/layouts/DashboardHeader'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  // New users must finish onboarding before reaching the dashboard.
  if (!user.onboardingCompletedAt) redirect('/onboarding')
  const subscription = await getUserSubscription(user.id)
  const tier = resolveEffectiveTier(subscription)

  const userInfo = { name: user.name, email: user.email, avatarUrl: user.avatarUrl }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <div className="sticky top-0 h-screen">
          <DashboardSidebar user={userInfo} tier={tier} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={userInfo} tier={tier} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

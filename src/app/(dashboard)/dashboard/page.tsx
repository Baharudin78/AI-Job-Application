import { requireAuth } from '@/lib/auth/server'
import { getUserSubscription } from '@/lib/db/subscription'
import { LogoutButton } from './logout-button'

/**
 * Minimal dashboard placeholder (Session 0.3) — proves auth works end-to-end.
 * The full dashboard (sidebar, summary cards, activity) arrives in Session 0.4.
 */
export default async function DashboardPage() {
  const user = await requireAuth()
  const subscription = await getUserSubscription(user.id)

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="space-y-1 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium">{user.name ?? user.email}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <span className="mt-2 inline-block rounded-full border px-2 py-0.5 text-xs">
          {subscription?.tier ?? 'FREE'} plan
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Authentication works 🎉 — the full dashboard arrives in Session 0.4.
      </p>
    </main>
  )
}

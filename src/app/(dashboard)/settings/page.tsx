import Link from 'next/link'

import { requireAuth } from '@/lib/auth/server'
import { getUserSubscription } from '@/lib/db/subscription'
import { resolveEffectiveTier } from '@/lib/db/usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
  const user = await requireAuth()
  const subscription = await getUserSubscription(user.id)
  const tier = resolveEffectiveTier(subscription)

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Name">{user.name ?? '—'}</Row>
          <Row label="Email">{user.email}</Row>
          <Row label="Language">{user.language.toUpperCase()}</Row>
          <Row label="Plan">
            <Badge variant={tier === 'FREE' ? 'secondary' : 'default'}>{tier}</Badge>
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Manage your plan and payment details.</p>
          <Button asChild variant="outline">
            <Link href="/settings/billing">View plans</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}

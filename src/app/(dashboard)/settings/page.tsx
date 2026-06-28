import Link from 'next/link'

import { requireAuth } from '@/lib/auth/server'
import { getUserSubscription } from '@/lib/db/subscription'
import { resolveEffectiveTier } from '@/lib/db/usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileForm } from './profile-form'

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
        <CardContent>
          <ProfileForm
            email={user.email}
            initialName={user.name ?? ''}
            initialLanguage={user.language}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current plan</span>
            <Badge variant={tier === 'FREE' ? 'secondary' : 'default'}>{tier}</Badge>
          </div>
          <Button asChild variant="outline">
            <Link href="/settings/billing">View plans</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

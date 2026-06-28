import { redirect } from 'next/navigation'

import { requireAuth } from '@/lib/auth/server'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const user = await requireAuth()
  if (user.onboardingCompletedAt) redirect('/dashboard')

  const firstName = user.name?.trim().split(/\s+/)[0] ?? null

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <OnboardingWizard
        firstName={firstName}
        defaults={{
          jobTitle: user.targetJobTitle ?? '',
          industry: user.targetIndustry ?? '',
          language: user.language,
        }}
      />
    </main>
  )
}

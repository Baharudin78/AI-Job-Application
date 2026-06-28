import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import type { SubscriptionTier } from '@prisma/client'

import { requireAuth } from '@/lib/auth/server'
import { getUserSubscription } from '@/lib/db/subscription'
import { resolveEffectiveTier } from '@/lib/db/usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Plan {
  tier: SubscriptionTier
  name: string
  price: string
  period: string
  popular?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    tier: 'FREE',
    name: 'Free',
    price: '$0',
    period: '',
    features: ['3 CV optimizations / mo', '3 cover letters / mo', '5 ATS checks / mo', 'Basic PDF export'],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: '$12',
    period: '/mo',
    popular: true,
    features: [
      'Unlimited CV optimizations',
      'Unlimited cover letters',
      'Unlimited ATS checks',
      'Professional PDF export',
    ],
  },
  {
    tier: 'BOOSTER',
    name: 'Career Booster',
    price: '$24',
    period: '/mo',
    features: ['Everything in Pro', 'Interview practice', 'LinkedIn optimizer', 'AI career coach'],
  },
]

export default async function BillingPage() {
  const user = await requireAuth()
  const subscription = await getUserSubscription(user.id)
  const tier = resolveEffectiveTier(subscription)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Billing &amp; plans</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re currently on the <Badge variant={tier === 'FREE' ? 'secondary' : 'default'}>{tier}</Badge> plan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const current = plan.tier === tier
          return (
            <Card
              key={plan.tier}
              className={cn(plan.popular && 'border-primary', current && 'ring-1 ring-primary')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.popular && <Badge>Most popular</Badge>}
                </div>
                <p>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : plan.tier === 'FREE' ? (
                  <Button variant="outline" className="w-full" disabled>
                    Free plan
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    Upgrade — coming soon
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Payments are processed by Paddle (Merchant of Record). Checkout is being set up and will be
        enabled soon.
      </p>
    </div>
  )
}

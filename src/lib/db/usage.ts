import type { Feature, Subscription, SubscriptionTier, UsageRecord } from '@prisma/client'
import type { UsageCheckResult } from '@/types'
import { prisma } from './client'
import { getUserSubscription } from './subscription'

/**
 * Monthly limits per tier and feature. `Infinity` means unlimited.
 *
 * NOTE: Session 1.5 relocates this to `@/lib/payments/limits.ts` and hardens
 * `checkUsageLimit` to be transaction-atomic. For now it lives here so usage
 * logic is self-contained.
 */
export const TIER_LIMITS: Record<SubscriptionTier, Record<Feature, number>> = {
  FREE: { CV_OPTIMIZE: 3, COVER_LETTER: 3, ATS_CHECK: 5, INTERVIEW: 0 },
  PRO: { CV_OPTIMIZE: Infinity, COVER_LETTER: Infinity, ATS_CHECK: Infinity, INTERVIEW: 10 },
  BOOSTER: {
    CV_OPTIMIZE: Infinity,
    COVER_LETTER: Infinity,
    ATS_CHECK: Infinity,
    INTERVIEW: Infinity,
  },
}

const FEATURE_LABELS: Record<Feature, string> = {
  CV_OPTIMIZE: 'CV optimization',
  COVER_LETTER: 'cover letter',
  ATS_CHECK: 'ATS check',
  INTERVIEW: 'interview practice',
}

/**
 * Resolve the tier a user is effectively entitled to right now.
 * - No subscription record  → FREE
 * - ACTIVE / TRIALING       → the subscription's tier
 * - CANCELED                → keep the paid tier until currentPeriodEnd passes
 * - PAST_DUE / anything else → FREE
 */
export function resolveEffectiveTier(subscription: Subscription | null): SubscriptionTier {
  if (!subscription) return 'FREE'

  switch (subscription.status) {
    case 'ACTIVE':
    case 'TRIALING':
      return subscription.tier
    case 'CANCELED':
      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date()) {
        return subscription.tier
      }
      return 'FREE'
    case 'PAST_DUE':
    default:
      return 'FREE'
  }
}

function formatYearMonth(date: Date): string {
  // UTC so the period is stable regardless of server/client timezone (avoids clock skew).
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * The "YYYY-MM" usage bucket for a user. Paid tiers anchor to the subscription's
 * current period start; FREE (or no subscription) uses the calendar month, which
 * is acceptable for the MVP per the guide.
 */
export function getBillingPeriod(
  tier: SubscriptionTier,
  subscription: Subscription | null,
  reference: Date = new Date(),
): string {
  if (tier !== 'FREE' && subscription?.currentPeriodStart) {
    return formatYearMonth(subscription.currentPeriodStart)
  }
  return formatYearMonth(reference)
}

/**
 * Check whether a user may use a feature in the current billing period.
 * Does NOT mutate anything — call `incrementUsage` after the work succeeds.
 */
export async function checkUsageLimit(userId: string, feature: Feature): Promise<UsageCheckResult> {
  const subscription = await getUserSubscription(userId)
  const tier = resolveEffectiveTier(subscription)
  const limit = TIER_LIMITS[tier][feature]

  if (limit === Infinity) {
    return { allowed: true }
  }
  if (limit <= 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      reason: `${FEATURE_LABELS[feature]} is not available on your current plan.`,
    }
  }

  const billingPeriod = getBillingPeriod(tier, subscription)
  const record = await prisma.usageRecord.findUnique({
    where: { userId_feature_billingPeriod: { userId, feature, billingPeriod } },
  })
  const count = record?.count ?? 0
  const allowed = count < limit

  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - count),
    reason: allowed
      ? undefined
      : `You've reached your ${FEATURE_LABELS[feature]} limit (${limit}/month) for this billing period.`,
  }
}

/**
 * Atomically record one use of a feature. Uses upsert + atomic increment so two
 * concurrent requests can't lose an update (race-safe).
 */
export async function incrementUsage(userId: string, feature: Feature): Promise<UsageRecord> {
  const subscription = await getUserSubscription(userId)
  const tier = resolveEffectiveTier(subscription)
  const billingPeriod = getBillingPeriod(tier, subscription)

  return prisma.usageRecord.upsert({
    where: { userId_feature_billingPeriod: { userId, feature, billingPeriod } },
    update: { count: { increment: 1 } },
    create: { userId, feature, billingPeriod, count: 1 },
  })
}

/** Current-period usage counts for every feature (0 when no record exists yet). */
export async function getMonthlyUsage(userId: string): Promise<Record<Feature, number>> {
  const subscription = await getUserSubscription(userId)
  const tier = resolveEffectiveTier(subscription)
  const billingPeriod = getBillingPeriod(tier, subscription)

  const records = await prisma.usageRecord.findMany({ where: { userId, billingPeriod } })

  const usage: Record<Feature, number> = {
    CV_OPTIMIZE: 0,
    COVER_LETTER: 0,
    ATS_CHECK: 0,
    INTERVIEW: 0,
  }
  for (const record of records) {
    usage[record.feature] = record.count
  }
  return usage
}

import type { Feature, Subscription, SubscriptionTier, UsageRecord } from '@prisma/client'
import type { UsageCheckResult } from '@/types'
import { prisma } from './client'
import { getUserSubscription } from './subscription'
import { ALL_FEATURES, FEATURE_LABELS, getTierLimit } from '@/lib/payments/limits'

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
  // UTC so the period is stable regardless of timezone (avoids clock skew).
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * The "YYYY-MM" usage bucket for a user. Paid tiers anchor to the subscription's
 * current period start; FREE uses the calendar month (acceptable for MVP).
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
 * Read-only — call `incrementUsage` after the work succeeds. The increment is
 * atomic (upsert), so concurrent requests cannot lose a count; the check→increment
 * window can over-count by at most one, which is acceptable for the MVP.
 */
export async function checkUsageLimit(userId: string, feature: Feature): Promise<UsageCheckResult> {
  const subscription = await getUserSubscription(userId)
  const tier = resolveEffectiveTier(subscription)
  const limit = getTierLimit(tier, feature)

  if (limit === Infinity) {
    return { allowed: true }
  }
  if (limit <= 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      reason: `${FEATURE_LABELS[feature]} are not available on your current plan.`,
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
      : `You've used all ${limit} ${FEATURE_LABELS[feature].toLowerCase()} for this billing period.`,
  }
}

/** Atomically record one use of a feature (upsert + increment — race-safe). */
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

// ----- Aggregated stats (for meters / dashboard / /api/usage) ---------------

export interface FeatureUsage {
  feature: Feature
  label: string
  used: number
  /** `Infinity` for unlimited. */
  limit: number
  /** `Infinity` for unlimited. */
  remaining: number
  unlimited: boolean
  isAtLimit: boolean
}

export interface UsageStats {
  tier: SubscriptionTier
  billingPeriod: string
  features: FeatureUsage[]
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  const subscription = await getUserSubscription(userId)
  const tier = resolveEffectiveTier(subscription)
  const billingPeriod = getBillingPeriod(tier, subscription)

  const records = await prisma.usageRecord.findMany({ where: { userId, billingPeriod } })
  const counts: Record<Feature, number> = {
    CV_OPTIMIZE: 0,
    COVER_LETTER: 0,
    ATS_CHECK: 0,
    INTERVIEW: 0,
  }
  for (const record of records) counts[record.feature] = record.count

  const features = ALL_FEATURES.map<FeatureUsage>((feature) => {
    const limit = getTierLimit(tier, feature)
    const used = counts[feature]
    const unlimited = limit === Infinity
    return {
      feature,
      label: FEATURE_LABELS[feature],
      used,
      limit,
      remaining: unlimited ? Infinity : Math.max(0, limit - used),
      unlimited,
      isAtLimit: !unlimited && used >= limit,
    }
  })

  return { tier, billingPeriod, features }
}

// JSON-safe DTO (Infinity is not serializable → null) for the API / client.
export interface FeatureUsageDTO {
  feature: Feature
  label: string
  used: number
  limit: number | null
  remaining: number | null
  unlimited: boolean
  isAtLimit: boolean
}

export interface UsageStatsDTO {
  tier: SubscriptionTier
  billingPeriod: string
  features: FeatureUsageDTO[]
}

export function serializeUsageStats(stats: UsageStats): UsageStatsDTO {
  return {
    tier: stats.tier,
    billingPeriod: stats.billingPeriod,
    features: stats.features.map((f) => ({
      feature: f.feature,
      label: f.label,
      used: f.used,
      limit: f.unlimited ? null : f.limit,
      remaining: f.unlimited ? null : f.remaining,
      unlimited: f.unlimited,
      isAtLimit: f.isAtLimit,
    })),
  }
}

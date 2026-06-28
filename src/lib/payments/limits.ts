import type { Feature, SubscriptionTier } from '@prisma/client'

/**
 * Monthly limits per tier and feature. `Infinity` means unlimited.
 * Single source of truth — `lib/db/usage.ts` and the UI both read from here.
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

export function getTierLimit(tier: SubscriptionTier, feature: Feature): number {
  return TIER_LIMITS[tier][feature]
}

export const ALL_FEATURES: Feature[] = ['CV_OPTIMIZE', 'COVER_LETTER', 'ATS_CHECK', 'INTERVIEW']

/** Human labels (plural) for usage meters and limit messages. */
export const FEATURE_LABELS: Record<Feature, string> = {
  CV_OPTIMIZE: 'CV optimizations',
  COVER_LETTER: 'Cover letters',
  ATS_CHECK: 'ATS checks',
  INTERVIEW: 'Interview sessions',
}

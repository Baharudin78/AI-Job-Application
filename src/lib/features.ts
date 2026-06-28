/**
 * Feature flags — flip to `true` when a feature ships and passes its
 * end-of-session verification (see Claude Code Guide.md).
 *
 * Keep this as the single source of truth for "what is live".
 */
export const FEATURES = {
  CV_OPTIMIZER: true,
  COVER_LETTER: true,
  ATS_CHECKER: true,
  INTERVIEW_PRACTICE: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature]
}

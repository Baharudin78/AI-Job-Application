/**
 * Feature flags — flip to `true` when a feature ships and passes its
 * end-of-session verification (see Claude Code Guide.md).
 *
 * Keep this as the single source of truth for "what is live".
 */
export const FEATURES = {
  CV_OPTIMIZER: false,
  COVER_LETTER: false,
  ATS_CHECKER: false,
  INTERVIEW_PRACTICE: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature]
}

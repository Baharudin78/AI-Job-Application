import Anthropic from '@anthropic-ai/sdk'

/**
 * Claude model id. The project standardizes on Claude Sonnet 4.6 (see CLAUDE.md
 * tech stack); kept in an env var so it can be changed without a code change.
 */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'

/** Per-feature output token caps. Always set max_tokens explicitly (CLAUDE.md). */
export const MAX_TOKENS = {
  CV_OPTIMIZE: 4096,
  COVER_LETTER: 2048,
  ATS_CHECK: 1024,
  INTERVIEW: 2048,
} as const

const globalForAnthropic = globalThis as unknown as { anthropic?: Anthropic }

/**
 * Singleton Anthropic client. `maxRetries: 0` disables the SDK's built-in
 * retry so our own `withRetry()` (exponential backoff, overload-only) is the
 * single source of retry behavior.
 */
export const anthropic: Anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 0,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForAnthropic.anthropic = anthropic
}

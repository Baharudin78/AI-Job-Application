/**
 * Barrel export for shared TypeScript types.
 *
 * Add domain types here as features are built (see Claude Code Guide.md).
 * Import everywhere via:  import type { ApiResponse } from '@/types'
 *
 * Prisma-generated model/enum types live in `@prisma/client` after
 * Session 0.2; re-export the ones used across the app from here.
 */

/** Standard API route response envelope (see CLAUDE.md → API Route Pattern). */
export type ApiResponse<T> = { data: T } | { error: string }

/** Utility: a value that may be null (mirrors Prisma nullable fields). */
export type Nullable<T> = T | null

/** Result shape for usage-limit checks (implemented in Session 0.2). */
export interface UsageCheckResult {
  allowed: boolean
  reason?: string
  remaining?: number
  limit?: number
}

/** One actionable ATS suggestion (Session 3.1). */
export interface AtsSuggestion {
  category: string
  issue: string
  fix: string
}

/** Structured ATS-check result returned by the AI service (Session 3.1). */
export interface AtsResult {
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: AtsSuggestion[]
  summary: string
}

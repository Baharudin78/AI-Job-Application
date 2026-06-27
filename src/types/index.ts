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

/** Structured ATS-check result returned by the AI service (Session 1.2). */
export interface AtsResult {
  score: number
  matched: string[]
  missing: string[]
  suggestions: string[]
}

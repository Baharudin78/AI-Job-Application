import { z } from 'zod'

import type { AtsResult } from '@/types'
import { AiInvalidResponseError } from '@/lib/ai/errors'

const MAX_ITEMS = 50

const responseSchema = z.object({
  score: z.number(),
  matched_keywords: z.array(z.string()).default([]),
  missing_keywords: z.array(z.string()).default([]),
  suggestions: z
    .array(
      z.object({
        category: z.string().default(''),
        issue: z.string().default(''),
        fix: z.string().default(''),
      }),
    )
    .default([]),
  summary: z.string().default(''),
})

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1] ?? text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  return start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate
}

function cleanStrings(values: string[]): string[] {
  return values
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_ITEMS)
}

/** Parse + validate Claude's ATS JSON into a safe AtsResult. */
export function parseAtsResponse(raw: string): AtsResult {
  let data: unknown
  try {
    data = JSON.parse(extractJson(raw))
  } catch (error) {
    throw new AiInvalidResponseError('The ATS analysis was not valid JSON.', error)
  }

  const parsed = responseSchema.safeParse(data)
  if (!parsed.success) {
    throw new AiInvalidResponseError('The ATS analysis did not match the expected shape.')
  }

  const d = parsed.data
  return {
    score: Math.max(0, Math.min(100, Math.round(d.score))),
    matchedKeywords: cleanStrings(d.matched_keywords),
    missingKeywords: cleanStrings(d.missing_keywords),
    suggestions: d.suggestions
      .map((s) => ({ category: s.category.trim(), issue: s.issue.trim(), fix: s.fix.trim() }))
      .filter((s) => s.issue.length > 0 || s.fix.length > 0)
      .slice(0, MAX_ITEMS),
    summary: d.summary.trim(),
  }
}

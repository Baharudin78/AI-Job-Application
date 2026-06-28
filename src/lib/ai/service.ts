import Anthropic from '@anthropic-ai/sdk'

import type { AtsResult } from '@/types'
import { anthropic, CLAUDE_MODEL, MAX_TOKENS } from './client'
import {
  AiInvalidResponseError,
  AiOverloadedError,
  AiRateLimitError,
  AiServiceError,
} from './errors'
import { sanitizeUserInput, withRetry } from './utils'
import { buildCvOptimizePrompt, type CvOptimizePromptParams } from './prompts/cv-optimize'
import { buildCoverLetterPrompt, type CoverLetterPromptParams } from './prompts/cover-letter'
import { buildAtsCheckPrompt, type AtsCheckPromptParams } from './prompts/ats-check'
import { parseAtsResponse } from './parsers/ats-response'

interface ClaudeCallParams {
  system: string
  user: string
  maxTokens: number
  /** Minimum acceptable response length; below this we treat it as invalid. */
  minLength?: number
}

/** Map an Anthropic SDK error onto our typed error hierarchy. */
function mapAnthropicError(error: unknown): AiServiceError {
  // Network / timeout — transient, retryable.
  if (error instanceof Anthropic.APIConnectionError) {
    return new AiOverloadedError('Could not reach the AI service. Please try again.', error)
  }
  if (error instanceof Anthropic.APIError) {
    const status = error.status ?? 0
    if (status === 429) return new AiRateLimitError(undefined, error)
    if (status === 529 || status >= 500) return new AiOverloadedError(undefined, error)
    // 4xx (bad key, bad request, etc.) — config issue; don't expose, don't retry.
    return new AiServiceError('The AI service rejected the request.', {
      retryable: false,
      cause: error,
    })
  }
  return new AiServiceError('Unexpected AI service error.', { retryable: false, cause: error })
}

/** Single entry point for a Claude call: send, map errors, validate, extract text. */
async function callClaude({ system, user, maxTokens, minLength = 50 }: ClaudeCallParams): Promise<string> {
  let message: Anthropic.Message
  try {
    message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    })
  } catch (error) {
    throw mapAnthropicError(error)
  }

  if (message.stop_reason === 'refusal') {
    throw new AiInvalidResponseError('The AI declined to process this content.')
  }

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim()

  if (text.length < minLength) {
    throw new AiInvalidResponseError('The AI returned an unexpectedly short response.')
  }
  return text
}

// ----- CV optimization ------------------------------------------------------

export async function optimizeCv(params: CvOptimizePromptParams): Promise<string> {
  const { system, user } = buildCvOptimizePrompt({
    ...params,
    originalCv: sanitizeUserInput(params.originalCv),
  })
  return withRetry(() => callClaude({ system, user, maxTokens: MAX_TOKENS.CV_OPTIMIZE }))
}

// ----- Cover letter ---------------------------------------------------------

export async function generateCoverLetter(params: CoverLetterPromptParams): Promise<string> {
  const { system, user } = buildCoverLetterPrompt({
    ...params,
    jobDescription: sanitizeUserInput(params.jobDescription),
    cvSummary: sanitizeUserInput(params.cvSummary),
  })
  return withRetry(() => callClaude({ system, user, maxTokens: MAX_TOKENS.COVER_LETTER }))
}

// ----- ATS check ------------------------------------------------------------

export async function checkAts(params: AtsCheckPromptParams): Promise<AtsResult> {
  const { system, user } = buildAtsCheckPrompt({
    cvContent: sanitizeUserInput(params.cvContent),
    jobDescription: sanitizeUserInput(params.jobDescription),
  })

  const raw = await withRetry(() =>
    callClaude({ system, user, maxTokens: MAX_TOKENS.ATS_CHECK, minLength: 10 }),
  )
  try {
    return parseAtsResponse(raw)
  } catch {
    // One stricter retry — JSON-only reminder.
    const strictUser = `${user}\n\nIMPORTANT: Respond with ONLY the raw JSON object. No code fences, no explanation.`
    const retryRaw = await withRetry(() =>
      callClaude({ system, user: strictUser, maxTokens: MAX_TOKENS.ATS_CHECK, minLength: 10 }),
    )
    return parseAtsResponse(retryRaw)
  }
}

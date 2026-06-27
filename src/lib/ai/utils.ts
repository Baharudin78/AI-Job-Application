import { AiServiceError } from './errors'

const BASE_DELAY_MS = 1000
const MAX_INPUT_CHARS = 50_000
const CHARS_PER_TOKEN = 4

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a Claude call with exponential backoff (1s, 2s, 4s). Only retries
 * errors flagged `retryable` (overloaded / 5xx / connection) — never rate
 * limits or invalid responses.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const retryable = error instanceof AiServiceError && error.retryable
      if (!retryable || attempt === maxRetries) break
      await sleep(BASE_DELAY_MS * 2 ** attempt)
    }
  }
  throw lastError
}

/**
 * Clean user-provided text before sending to Claude: drop null bytes, normalize
 * line endings/whitespace, and cap the length (defense against prompt-bloat).
 */
export function sanitizeUserInput(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_INPUT_CHARS)
}

/** Rough char-budget truncation (~4 chars/token). For hard input ceilings. */
export function truncateToTokenEstimate(text: string, maxTokens: number): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN
  return text.length <= maxChars ? text : text.slice(0, maxChars)
}

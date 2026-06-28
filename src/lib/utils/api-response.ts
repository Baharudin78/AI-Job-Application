import { NextResponse } from 'next/server'

import { AppError, UsageLimitError } from './errors'

/** Standard success envelope: `{ data: T }`. */
export function success<T>(data: T, statusCode = 200): NextResponse {
  return NextResponse.json({ data }, { status: statusCode })
}

/**
 * Standard error envelope. AppError → `{ error: userMessage, code }` at its
 * status; any other error is logged and returned as a generic 500 (no internals
 * leak to the client).
 */
export function error(err: unknown): NextResponse {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { error: err.userMessage, code: err.code }
    if (err instanceof UsageLimitError) {
      body.remaining = err.remaining
      body.upgradeUrl = err.upgradeUrl
    }
    return NextResponse.json(body, { status: err.statusCode })
  }

  console.error('[api/unhandled]', err)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

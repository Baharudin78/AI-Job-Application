interface AiErrorOptions {
  retryable?: boolean
  cause?: unknown
}

/** Base class for all AI service failures. `retryable` drives withRetry(). */
export class AiServiceError extends Error {
  readonly retryable: boolean

  constructor(message: string, options: AiErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'AiServiceError'
    this.retryable = options.retryable ?? false
  }
}

/** 429 — the user must wait; never auto-retried. */
export class AiRateLimitError extends AiServiceError {
  constructor(message = 'The AI service is busy. Please try again in a moment.', cause?: unknown) {
    super(message, { retryable: false, cause })
    this.name = 'AiRateLimitError'
  }
}

/** 529 / 5xx / connection — transient; safe to retry with backoff. */
export class AiOverloadedError extends AiServiceError {
  constructor(message = 'The AI service is temporarily overloaded.', cause?: unknown) {
    super(message, { retryable: true, cause })
    this.name = 'AiOverloadedError'
  }
}

/** Claude returned empty, too-short, refused, or unparseable output. */
export class AiInvalidResponseError extends AiServiceError {
  constructor(message = 'The AI returned an invalid response. Please try again.', cause?: unknown) {
    super(message, { retryable: false, cause })
    this.name = 'AiInvalidResponseError'
  }
}

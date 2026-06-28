interface AppErrorOptions {
  message: string
  code: string
  statusCode: number
  /** Safe, user-facing message (never leaks internals). Defaults to `message`. */
  userMessage?: string
  cause?: unknown
}

/**
 * Base application error. Carries an HTTP status, a stable machine `code`, and a
 * `userMessage` that is safe to show clients. Use the subclasses below; map them
 * to responses with `@/lib/utils/api-response`.
 */
export class AppError extends Error {
  readonly code: string
  readonly statusCode: number
  readonly userMessage: string

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause })
    this.name = 'AppError'
    this.code = options.code
    this.statusCode = options.statusCode
    this.userMessage = options.userMessage ?? options.message
  }
}

export class ValidationError extends AppError {
  constructor(userMessage = 'Some of the information provided is invalid.', cause?: unknown) {
    super({ message: 'Validation failed', code: 'validation_error', statusCode: 400, userMessage, cause })
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(userMessage = 'You need to be signed in to do that.') {
    super({ message: 'Unauthorized', code: 'auth_error', statusCode: 401, userMessage })
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends AppError {
  constructor(userMessage = 'You do not have access to this resource.') {
    super({ message: 'Forbidden', code: 'forbidden', statusCode: 403, userMessage })
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(userMessage = 'We could not find what you were looking for.') {
    super({ message: 'Not found', code: 'not_found', statusCode: 404, userMessage })
    this.name = 'NotFoundError'
  }
}

export class UsageLimitError extends AppError {
  readonly remaining: number
  readonly upgradeUrl: string

  constructor(userMessage = "You've reached your plan limit.", remaining = 0) {
    super({ message: 'Usage limit reached', code: 'usage_limit', statusCode: 403, userMessage })
    this.name = 'UsageLimitError'
    this.remaining = remaining
    this.upgradeUrl = '/settings/billing'
  }
}

export class PaymentError extends AppError {
  constructor(userMessage = 'There was a problem with your payment.') {
    super({ message: 'Payment error', code: 'payment_error', statusCode: 402, userMessage })
    this.name = 'PaymentError'
  }
}

/**
 * File-upload error. Extends AppError but keeps `message === userMessage` so the
 * existing parsers/routes that read `error.message` still surface a friendly text.
 */
export class UploadError extends AppError {
  constructor(userMessage: string) {
    super({ message: userMessage, code: 'upload_error', statusCode: 400, userMessage })
    this.name = 'UploadError'
  }
}

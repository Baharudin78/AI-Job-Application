interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

/**
 * Simple in-memory fixed-window rate limiter. Adequate for a single-instance
 * deployment; Session 4.2 swaps in a shared store (Upstash) for multi-instance.
 *
 * The `identifier` MUST be derived from trusted server data (e.g. the session
 * user id), never from spoofable request input.
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(identifier)

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt: new Date(resetAt) }
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: new Date(bucket.resetAt) }
  }

  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count, resetAt: new Date(bucket.resetAt) }
}

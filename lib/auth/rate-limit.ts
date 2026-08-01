/**
 * In-memory rate limiter suitable for single-instance deployments.
 * For multi-instance production: replace with a Redis-backed solution (e.g. Upstash).
 */

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15-minute sliding window

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

// Clean up expired entries periodically to avoid memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number }

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    store.set(key, entry)
  }

  entry.count++

  const remaining = Math.max(0, MAX_ATTEMPTS - entry.count)
  return {
    allowed: entry.count <= MAX_ATTEMPTS,
    remaining,
    resetAt: entry.resetAt,
  }
}

export function resetRateLimit(key: string): void {
  store.delete(key)
}

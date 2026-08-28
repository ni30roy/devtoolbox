/**
 * UUID v4 generation using the browser's native Web Crypto API
 * (crypto.randomUUID()) — a cryptographically secure random source, unlike
 * Math.random() which is not suitable for generating identifiers that need
 * to be unpredictable and collision-resistant.
 */

export const MIN_COUNT = 1
export const MAX_COUNT = 100

export function generateUuids(count: number): string[] {
  const clamped = Math.min(Math.max(Math.trunc(count) || MIN_COUNT, MIN_COUNT), MAX_COUNT)
  return Array.from({ length: clamped }, () => crypto.randomUUID())
}

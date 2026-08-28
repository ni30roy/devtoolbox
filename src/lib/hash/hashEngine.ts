/**
 * Cryptographic hashing via the browser's native Web Crypto API
 * (crypto.subtle.digest) — no library needed, and it's the only
 * implementation a browser environment should trust for this anyway.
 *
 * Hashing is one-way: there is no "decode" direction, and this file
 * deliberately has no such function. A hash is not encryption — it doesn't
 * protect or hide the input, it only produces a fixed-size fingerprint of it.
 */

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGORITHMS: HashAlgorithm[] = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1']

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function computeHash(algorithm: HashAlgorithm, input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest(algorithm, bytes)
  return toHex(digest)
}

export async function computeAllHashes(input: string): Promise<Record<HashAlgorithm, string>> {
  const entries = await Promise.all(HASH_ALGORITHMS.map(async (algorithm) => [algorithm, await computeHash(algorithm, input)] as const))
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>
}

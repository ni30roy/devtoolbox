/**
 * Pure, browser-only JWT *decoding* — not verification. A JWT's header and
 * payload are just base64url-encoded JSON; anyone can read them without a
 * key. Only the signature proves the token is genuine, and checking that
 * requires the issuer's secret/public key, which this tool deliberately
 * never asks for or has access to. This file never claims a token is valid.
 */

export interface JwtSegment {
  raw: string
  json: unknown
  pretty: string
}

export interface JwtSuccess {
  ok: true
  header: JwtSegment
  payload: JwtSegment
  signature: string
}

export interface JwtFailure {
  ok: false
  error: { message: string }
}

export type JwtResult = JwtSuccess | JwtFailure

function decodeBase64UrlText(raw: string): { text: string } | { error: string } {
  if (raw.length === 0) return { error: 'is empty' }
  if (!/^[A-Za-z0-9_-]+$/.test(raw)) {
    return { error: 'contains characters outside the base64url alphabet' }
  }
  const base64 = raw.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  try {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { text }
  } catch {
    return { error: 'could not be base64url-decoded' }
  }
}

function decodeSegment(raw: string, label: string): JwtSegment | { error: string } {
  const decoded = decodeBase64UrlText(raw)
  if ('error' in decoded) return { error: `${label} ${decoded.error}.` }
  try {
    const json = JSON.parse(decoded.text)
    return { raw, json, pretty: JSON.stringify(json, null, 2) }
  } catch {
    return { error: `${label} decodes to text that isn't valid JSON.` }
  }
}

export function decodeJwt(input: string): JwtResult {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste a JWT to decode.' } }
  }

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return {
      ok: false,
      error: {
        message: `Invalid JWT: expected 3 dot-separated parts (header.payload.signature), found ${parts.length}.`,
      },
    }
  }
  const [headerRaw, payloadRaw, signatureRaw] = parts

  const header = decodeSegment(headerRaw, 'Header')
  if ('error' in header) return { ok: false, error: { message: header.error } }

  const payload = decodeSegment(payloadRaw, 'Payload')
  if ('error' in payload) return { ok: false, error: { message: payload.error } }

  if (signatureRaw.length === 0 || !/^[A-Za-z0-9_-]+$/.test(signatureRaw)) {
    return { ok: false, error: { message: 'Invalid JWT: the signature part is empty or contains invalid characters.' } }
  }

  return { ok: true, header, payload, signature: signatureRaw }
}

/** Registered numeric-date claims (RFC 7519) worth showing as human-readable dates. */
const TIMESTAMP_CLAIMS: { key: string; label: string }[] = [
  { key: 'iat', label: 'Issued at (iat)' },
  { key: 'exp', label: 'Expires at (exp)' },
  { key: 'nbf', label: 'Not valid before (nbf)' },
]

export interface ClaimTimestamp {
  label: string
  formatted: string
  isPast: boolean
}

/** Reads exp/iat/nbf directly off the decoded payload — a plain read of the
 * claim's stated value, not a verification of anything. */
export function extractTimestampClaims(payload: unknown): ClaimTimestamp[] {
  if (typeof payload !== 'object' || payload === null) return []
  const record = payload as Record<string, unknown>
  const results: ClaimTimestamp[] = []
  for (const { key, label } of TIMESTAMP_CLAIMS) {
    const value = record[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    const date = new Date(value * 1000)
    if (Number.isNaN(date.getTime())) continue
    results.push({
      label,
      formatted: date.toUTCString(),
      isPast: date.getTime() < Date.now(),
    })
  }
  return results
}

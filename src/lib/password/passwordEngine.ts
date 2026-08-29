/**
 * Password generation using crypto.getRandomValues() — Math.random() is
 * not a cryptographically secure random source and must never be used
 * for anything security-sensitive like a password or token.
 *
 * Character selection uses rejection sampling (draw a byte, reject and
 * redraw if it would introduce modulo bias) rather than a naive
 * `byte % length`, so every character in the charset — and every
 * position, via the crypto-random Fisher-Yates shuffle — has exactly
 * equal probability regardless of the charset's size.
 */

export const MIN_LENGTH = 4
export const MAX_LENGTH = 128
export const DEFAULT_LENGTH = 20

const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

// Characters that are easy to misread or mistype in most fonts.
const AMBIGUOUS = new Set('lIO01'.split(''))

export interface PasswordOptions {
  length: number
  lowercase: boolean
  uppercase: boolean
  digits: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

export interface PasswordSuccess {
  ok: true
  password: string
  entropyBits: number
  charsetSize: number
}

export interface PasswordFailure {
  ok: false
  error: { message: string }
}

export type PasswordResult = PasswordSuccess | PasswordFailure

/** Rejection-sampled random index in [0, length) — never biased toward the low end. */
function secureRandomIndex(length: number): number {
  const maxValid = Math.floor(256 / length) * length
  let byte: number
  do {
    byte = crypto.getRandomValues(new Uint8Array(1))[0]
  } while (byte >= maxValid)
  return byte % length
}

function secureShuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function buildCategory(chars: string, excludeAmbiguous: boolean): string {
  return excludeAmbiguous ? chars.split('').filter((c) => !AMBIGUOUS.has(c)).join('') : chars
}

export function generatePassword(options: PasswordOptions): PasswordResult {
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.trunc(options.length) || DEFAULT_LENGTH))

  const categories: string[] = []
  if (options.lowercase) categories.push(buildCategory(CHARSETS.lowercase, options.excludeAmbiguous))
  if (options.uppercase) categories.push(buildCategory(CHARSETS.uppercase, options.excludeAmbiguous))
  if (options.digits) categories.push(buildCategory(CHARSETS.digits, options.excludeAmbiguous))
  if (options.symbols) categories.push(buildCategory(CHARSETS.symbols, options.excludeAmbiguous))

  if (categories.length === 0) {
    return { ok: false, error: { message: 'Select at least one character type.' } }
  }
  if (length < categories.length) {
    return {
      ok: false,
      error: {
        message: `Length must be at least ${categories.length} to include one of each selected character type.`,
      },
    }
  }

  const fullCharset = categories.join('')

  // Guarantee one character from every selected category, then fill the
  // rest from the combined pool, then shuffle — so required characters
  // don't always land in the same positions.
  const required = categories.map((category) => category[secureRandomIndex(category.length)])
  const rest = Array.from({ length: length - required.length }, () => fullCharset[secureRandomIndex(fullCharset.length)])
  const password = secureShuffle([...required, ...rest]).join('')

  return {
    ok: true,
    password,
    entropyBits: Math.round(length * Math.log2(fullCharset.length)),
    charsetSize: fullCharset.length,
  }
}

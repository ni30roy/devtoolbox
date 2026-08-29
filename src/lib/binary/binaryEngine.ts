/**
 * Pure, Unicode-safe binary encode/decode. Mirrors base64Engine.ts and
 * hexEngine.ts: text goes through TextEncoder to get real UTF-8 bytes,
 * each rendered as an 8-bit binary string, and decoding reverses that
 * through TextDecoder (fatal mode) — so multi-byte characters round-trip
 * correctly instead of being mishandled one code unit at a time.
 */

export interface BinarySuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface BinaryFailure {
  ok: false
  error: { message: string }
}

export type BinaryResult = BinarySuccess | BinaryFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function encodeToBinary(input: string): BinaryResult {
  if (input.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Type or paste some text to encode.' } }
  }
  const bytes = new TextEncoder().encode(input)
  const output = Array.from(bytes, (byte) => byte.toString(2).padStart(8, '0')).join(' ')
  return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
}

export function decodeFromBinary(input: string): BinaryResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some binary text to decode.' } }
  }

  // Accept binary grouped into bytes separated by any whitespace, or one
  // continuous run of bits with no separators at all.
  const cleaned = input.replace(/\s+/g, '')

  const invalidChar = [...cleaned].find((char) => char !== '0' && char !== '1')
  if (invalidChar) {
    return {
      ok: false,
      error: { message: `Invalid binary: "${invalidChar}" is not a 0 or 1.` },
    }
  }
  if (cleaned.length % 8 !== 0) {
    return {
      ok: false,
      error: { message: 'Invalid binary: the number of bits is not a multiple of 8 — each byte needs exactly eight.' },
    }
  }

  const bytes = new Uint8Array(cleaned.length / 8)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 8, i * 8 + 8), 2)
  }

  try {
    const output = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
  } catch {
    return {
      ok: false,
      error: {
        message:
          "These are valid binary bytes, but they aren't valid UTF-8 text — it may be binary data (like an image) rather than text.",
      },
    }
  }
}

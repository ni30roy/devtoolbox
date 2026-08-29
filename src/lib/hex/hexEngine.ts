/**
 * Pure, Unicode-safe hex encode/decode. Mirrors base64Engine.ts: text goes
 * through TextEncoder to get real UTF-8 bytes before hex-encoding, and
 * decoded bytes go back through TextDecoder (fatal mode) to reassemble
 * UTF-8 text — so accented characters, CJK, and emoji round-trip
 * correctly instead of being treated one code unit at a time.
 */

export interface HexSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface HexFailure {
  ok: false
  error: { message: string }
}

export type HexResult = HexSuccess | HexFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function encodeToHex(input: string, uppercase: boolean, spaced: boolean): HexResult {
  if (input.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Type or paste some text to encode.' } }
  }
  const bytes = new TextEncoder().encode(input)
  const pairs = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  const joined = pairs.join(spaced ? ' ' : '')
  const output = uppercase ? joined.toUpperCase() : joined
  return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
}

export function decodeFromHex(input: string): HexResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some hex text to decode.' } }
  }

  // Hex copied from a debugger, log, or "0x"-prefixed source often has
  // spaces, newlines, or 0x prefixes that aren't part of the data.
  const cleaned = input.replace(/0[xX]/g, '').replace(/\s+/g, '')

  const invalidChar = [...cleaned].find((char) => !/[0-9a-fA-F]/.test(char))
  if (invalidChar) {
    return {
      ok: false,
      error: { message: `Invalid hex: "${invalidChar}" is not a valid hex digit.` },
    }
  }
  if (cleaned.length % 2 !== 0) {
    return {
      ok: false,
      error: { message: 'Invalid hex: there are an odd number of hex digits — each byte needs exactly two.' },
    }
  }

  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
  }

  try {
    const output = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
  } catch {
    return {
      ok: false,
      error: {
        message:
          "These are valid hex bytes, but they aren't valid UTF-8 text — it may be binary data (like an image) rather than text.",
      },
    }
  }
}

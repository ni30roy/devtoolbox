/**
 * Pure, Unicode-safe Base64 encode/decode. No DOM state — just the Web
 * Encoding/Base64 APIs already built into every browser (and Node, for
 * this file to be testable) — no library needed for something this small.
 *
 * `btoa`/`atob` only operate on Latin1 "binary strings" (one code unit per
 * byte), so encoding first goes through TextEncoder to get real UTF-8 bytes,
 * and decoding goes back through TextDecoder to reassemble UTF-8 text —
 * this is what makes Hindi/emoji/CJK/accents round-trip correctly, unlike a
 * bare `btoa(text)` which throws on any character above U+00FF.
 */

export interface Base64Success {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface Base64Failure {
  ok: false
  error: { message: string }
}

export type Base64Result = Base64Success | Base64Failure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function encodeToBase64(input: string): Base64Result {
  if (input.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Type or paste some text to encode.' } }
  }
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const output = btoa(binary)
  return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
}

export function decodeFromBase64(input: string): Base64Result {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some Base64 text to decode.' } }
  }

  // Base64 copied from an email, a PEM file, or text wrapped at a fixed
  // width often has line breaks or spaces that aren't part of the data —
  // harmless to strip before validating.
  const cleaned = input.replace(/\s+/g, '')

  const invalidChar = [...cleaned].find((char) => !/[A-Za-z0-9+/=]/.test(char))
  if (invalidChar) {
    return {
      ok: false,
      error: { message: `Invalid Base64: "${invalidChar}" is not a valid Base64 character.` },
    }
  }

  let binary: string
  try {
    binary = atob(cleaned)
  } catch {
    return {
      ok: false,
      error: { message: 'Invalid Base64: the text has an incorrect length or padding.' },
    }
  }

  try {
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const output = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
  } catch {
    return {
      ok: false,
      error: {
        message:
          "This decodes to valid Base64 bytes, but they aren't valid UTF-8 text — it may be binary data (like an image) rather than text.",
      },
    }
  }
}

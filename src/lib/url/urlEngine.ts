/**
 * Pure, Unicode-safe URL component encode/decode. Uses the browser's own
 * encodeURIComponent/decodeURIComponent — no library needed for something
 * this small, and no worker: this is a single linear pass, not recursive
 * parsing, so even large input finishes in milliseconds on the main thread.
 *
 * Deliberately component-style (encodeURIComponent), not full-URL-style
 * (encodeURI): this tool encodes a *value* destined to sit inside a URL
 * (a query parameter, a path segment), so structural characters like
 * `: / ? & = #` must be escaped too — encodeURI would leave those alone,
 * which is correct for encoding a whole URI but wrong for a component.
 */

export interface UrlSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface UrlFailure {
  ok: false
  error: { message: string }
}

export type UrlResult = UrlSuccess | UrlFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function encodeUrlComponent(input: string): UrlResult {
  if (input.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Type or paste some text to encode.' } }
  }
  const output = encodeURIComponent(input)
  return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
}

export function decodeUrlComponent(input: string): UrlResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some URL-encoded text to decode.' } }
  }
  try {
    const output = decodeURIComponent(input)
    return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
  } catch {
    // decodeURIComponent throws a single generic URIError for every kind of
    // malformed input (a lone "%", invalid hex digits, an incomplete escape
    // at the end of the string, or a percent-decoded byte sequence that
    // isn't valid UTF-8) — there's no reliable way to tell those apart from
    // the exception itself, so we give one clear, honest message instead of
    // guessing at a more specific cause.
    return {
      ok: false,
      error: {
        message:
          'Invalid URL-encoded input: this text contains a "%" that isn\'t followed by two valid hex digits, or decodes to bytes that aren\'t valid UTF-8.',
      },
    }
  }
}

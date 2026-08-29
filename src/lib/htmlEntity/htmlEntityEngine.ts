/**
 * HTML entity encode/decode using the browser's own HTML parser/serializer
 * — no hand-rolled entity table, which would either be incomplete (there
 * are hundreds of named entities) or risk subtly disagreeing with how a
 * real browser parses them (HTML5's legacy entities can match without a
 * trailing `;`, e.g. `&notit;` decodes as `&not` + `it;` — verified
 * empirically against a live browser before writing this).
 *
 * Encoding: setting `textContent` then reading `innerHTML` gets the
 * browser to escape `&`, `<`, `>` the same way it would when serializing
 * any element's text content. It deliberately does NOT escape quotes —
 * that's only required in attribute-value position — so `"` and `'` are
 * escaped manually on top, making the output safe to embed in an
 * attribute value too.
 *
 * Decoding: setting `innerHTML` on a *detached* element and reading
 * `textContent` runs the real parser (named, decimal, and hex entities
 * all resolve correctly) without ever attaching the element to the
 * document — embedded `<script>`/event-handler content is inert either
 * way, since browsers never execute markup assigned via `.innerHTML`.
 */

export interface HtmlEntitySuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface HtmlEntityFailure {
  ok: false
  error: { message: string }
}

export type HtmlEntityResult = HtmlEntitySuccess | HtmlEntityFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function unescapeHtml(text: string): string {
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent ?? ''
}

export function encodeHtmlEntities(input: string): HtmlEntityResult {
  if (input.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Type or paste some text to encode.' } }
  }
  const output = escapeHtml(input)
  return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
}

export function decodeHtmlEntities(input: string): HtmlEntityResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some HTML-entity-encoded text to decode.' } }
  }
  const output = unescapeHtml(input)
  return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
}

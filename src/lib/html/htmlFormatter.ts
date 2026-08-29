/**
 * Pure HTML formatting. No DOM/browser APIs (deliberately not using
 * DOMParser — it silently "corrects" malformed markup, reorders content per
 * the HTML5 parsing algorithm, and lowercases tags/attributes, none of
 * which a beautifier should do to someone's input). Instead this is a
 * small hand-rolled tag scanner, the same style as jsonEngine.ts's syntax
 * scanner and csvToJson.ts's row scanner — quote-aware, so it never gets
 * confused by a stray `>` inside an attribute value.
 */
import type { IndentOption } from '@/lib/json/jsonEngine'

export interface HtmlFormatSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface HtmlFormatFailure {
  ok: false
  error: { message: string }
}

export type HtmlFormatResult = HtmlFormatSuccess | HtmlFormatFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

function indentUnit(option: IndentOption): string {
  return option === 'tab' ? '\t' : ' '.repeat(Number(option))
}

// script/style content isn't visually rendered, so it's fine to put on its
// own indented lines for readability. pre/textarea content IS rendered
// verbatim (including whitespace) — adding so much as an extra newline
// around it would change what the page displays, so that content is
// spliced back in byte-for-byte instead of being reformatted.
const RAW_TEXT_ELEMENTS = new Set(['script', 'style'])
const WHITESPACE_SENSITIVE_ELEMENTS = new Set(['pre', 'textarea'])
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function readTagName(input: string, start: number): string {
  let name = ''
  let i = start
  while (i < input.length && /[a-zA-Z0-9:-]/.test(input[i])) {
    name += input[i]
    i++
  }
  return name
}

/** Scans from `<` to the end of a tag, respecting quoted attribute values so an embedded `>` doesn't end it early. */
function scanTagEnd(input: string, start: number): number {
  let inSingle = false
  let inDouble = false
  let i = start
  while (i < input.length) {
    const ch = input[i]
    if (inSingle) {
      if (ch === "'") inSingle = false
      i++
      continue
    }
    if (inDouble) {
      if (ch === '"') inDouble = false
      i++
      continue
    }
    if (ch === "'") {
      inSingle = true
      i++
      continue
    }
    if (ch === '"') {
      inDouble = true
      i++
      continue
    }
    if (ch === '>') return i + 1
    i++
  }
  return i
}

function findClosingTag(input: string, tagName: string, from: number): { start: number; end: number } | null {
  const pattern = new RegExp(`</\\s*${tagName}\\s*>`, 'i')
  const match = pattern.exec(input.slice(from))
  if (!match) return null
  return { start: from + match.index, end: from + match.index + match[0].length }
}

export function formatHtml(input: string, indentOption: IndentOption = '2'): string {
  const lines: string[] = []
  let depth = 0
  let i = 0
  const len = input.length
  const indentAt = (atDepth: number) => indentUnit(indentOption).repeat(atDepth)
  const pushLine = (text: string, atDepth: number) => lines.push(indentAt(atDepth) + text)

  while (i < len) {
    if (input[i] !== '<') {
      const nextTag = input.indexOf('<', i)
      const textEnd = nextTag === -1 ? len : nextTag
      const text = input.slice(i, textEnd)
      if (text.trim().length > 0) pushLine(text.trim(), depth)
      i = textEnd
      continue
    }

    if (input.startsWith('<!--', i)) {
      const end = input.indexOf('-->', i + 4)
      const commentEnd = end === -1 ? len : end + 3
      pushLine(input.slice(i, commentEnd), depth)
      i = commentEnd
      continue
    }

    // Doctype and other `<!...>` declarations.
    if (input.startsWith('<!', i)) {
      const end = input.indexOf('>', i)
      const declEnd = end === -1 ? len : end + 1
      pushLine(input.slice(i, declEnd), depth)
      i = declEnd
      continue
    }

    if (input.startsWith('</', i)) {
      const tagEnd = scanTagEnd(input, i)
      depth = Math.max(0, depth - 1)
      pushLine(input.slice(i, tagEnd), depth)
      i = tagEnd
      continue
    }

    const tagEnd = scanTagEnd(input, i)
    const tagText = input.slice(i, tagEnd)
    const tagName = readTagName(input, i + 1)
    const lowerName = tagName.toLowerCase()
    const selfClosing = /\/\s*>$/.test(tagText)
    const isVoid = VOID_ELEMENTS.has(lowerName)

    if (selfClosing || isVoid) {
      pushLine(tagText, depth)
      i = tagEnd
      continue
    }

    if (WHITESPACE_SENSITIVE_ELEMENTS.has(lowerName)) {
      const closing = findClosingTag(input, lowerName, tagEnd)
      const contentEnd = closing ? closing.start : len
      const rawContent = input.slice(tagEnd, contentEnd)
      const closeTagText = closing ? input.slice(closing.start, closing.end) : ''
      // One array entry holding embedded newlines reproduces the original
      // bytes exactly — join() below won't add anything beyond what's here.
      lines.push(indentAt(depth) + tagText + rawContent + closeTagText)
      i = closing ? closing.end : len
      continue
    }

    pushLine(tagText, depth)
    i = tagEnd

    if (RAW_TEXT_ELEMENTS.has(lowerName)) {
      const closing = findClosingTag(input, lowerName, i)
      const contentEnd = closing ? closing.start : len
      const rawContent = input.slice(i, contentEnd)
      if (rawContent.trim().length > 0) {
        for (const rawLine of rawContent.split('\n')) {
          if (rawLine.length === 0) continue
          lines.push(rawLine.replace(/\r$/, ''))
        }
      }
      if (closing) {
        pushLine(input.slice(closing.start, closing.end), depth)
        i = closing.end
      }
      continue
    }

    depth++
  }

  return lines.join('\n') + '\n'
}

export function formatHtmlDocument(input: string, indentOption: IndentOption = '2'): HtmlFormatResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some HTML to format.' } }
  }
  const output = formatHtml(input, indentOption)
  return {
    ok: true,
    output,
    inputBytes: byteLength(input),
    outputBytes: byteLength(output),
  }
}

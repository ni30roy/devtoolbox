/**
 * Pure XML formatting. No DOM/browser APIs (deliberately not using
 * DOMParser, for the same reasons as htmlFormatter.ts — it would
 * normalize the document rather than just format it).
 *
 * XML needs an extra safety rule HTML doesn't: browsers collapse
 * whitespace when rendering HTML, so adding newlines around inline text
 * is harmless there. XML has no such rule — `<name>John</name>` read via
 * `textContent` gives exactly "John"; reformatting it to put "John" on
 * its own indented line would change that value to "\n  John\n". So any
 * element containing actual (non-whitespace) text among its children —
 * "mixed content" — has its entire inner content left byte-for-byte
 * untouched. Only elements containing nothing but child elements (plus
 * insignificant whitespace) get re-indented.
 */
import type { IndentOption } from '@/lib/json/jsonEngine'

export interface XmlFormatSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface XmlFormatFailure {
  ok: false
  error: { message: string }
}

export type XmlFormatResult = XmlFormatSuccess | XmlFormatFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

type XmlNode =
  | { type: 'text'; text: string }
  | { type: 'comment' | 'cdata' | 'pi' | 'doctype'; text: string }
  | {
      type: 'element'
      openTag: string
      closeTag: string
      selfClosing: boolean
      children: XmlNode[]
      /** Raw source between the end of openTag and the start of closeTag, verbatim. */
      rawContent: string
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

function parseChildren(input: string, start: number): { nodes: XmlNode[]; next: number } {
  const nodes: XmlNode[] = []
  let i = start
  while (i < input.length) {
    if (input.startsWith('</', i)) return { nodes, next: i }

    if (input[i] !== '<') {
      const nextLt = input.indexOf('<', i)
      const end = nextLt === -1 ? input.length : nextLt
      nodes.push({ type: 'text', text: input.slice(i, end) })
      i = end
      continue
    }

    if (input.startsWith('<!--', i)) {
      const end = input.indexOf('-->', i + 4)
      const commentEnd = end === -1 ? input.length : end + 3
      nodes.push({ type: 'comment', text: input.slice(i, commentEnd) })
      i = commentEnd
      continue
    }

    if (input.startsWith('<![CDATA[', i)) {
      const end = input.indexOf(']]>', i + 9)
      const cdataEnd = end === -1 ? input.length : end + 3
      nodes.push({ type: 'cdata', text: input.slice(i, cdataEnd) })
      i = cdataEnd
      continue
    }

    if (input.startsWith('<?', i)) {
      const end = input.indexOf('?>', i + 2)
      const piEnd = end === -1 ? input.length : end + 2
      nodes.push({ type: 'pi', text: input.slice(i, piEnd) })
      i = piEnd
      continue
    }

    if (input.startsWith('<!', i)) {
      // DOCTYPE (or other declaration) — track [...] internal-subset brackets so a '>' inside them doesn't end it early.
      let j = i + 2
      let bracketDepth = 0
      while (j < input.length) {
        if (input[j] === '[') bracketDepth++
        else if (input[j] === ']') bracketDepth = Math.max(0, bracketDepth - 1)
        else if (input[j] === '>' && bracketDepth === 0) {
          j++
          break
        }
        j++
      }
      nodes.push({ type: 'doctype', text: input.slice(i, j) })
      i = j
      continue
    }

    // Element.
    const tagEnd = scanTagEnd(input, i)
    const tagText = input.slice(i, tagEnd)
    const selfClosing = /\/\s*>$/.test(tagText)
    if (selfClosing) {
      nodes.push({ type: 'element', openTag: tagText, closeTag: '', selfClosing: true, children: [], rawContent: '' })
      i = tagEnd
      continue
    }

    const { nodes: children, next: afterChildren } = parseChildren(input, tagEnd)
    let closeTag = ''
    let after = afterChildren
    if (input.startsWith('</', afterChildren)) {
      const closeEnd = scanTagEnd(input, afterChildren)
      closeTag = input.slice(afterChildren, closeEnd)
      after = closeEnd
    }
    nodes.push({
      type: 'element',
      openTag: tagText,
      closeTag,
      selfClosing: false,
      children,
      rawContent: input.slice(tagEnd, afterChildren),
    })
    i = after
  }
  return { nodes, next: i }
}

function indentUnit(option: IndentOption): string {
  return option === 'tab' ? '\t' : ' '.repeat(Number(option))
}

function formatXmlNodes(nodes: XmlNode[], depth: number, indentOption: IndentOption, lines: string[]): void {
  const indentAt = (atDepth: number) => indentUnit(indentOption).repeat(atDepth)

  for (const node of nodes) {
    const pad = indentAt(depth)
    if (node.type === 'text') {
      if (node.text.trim().length > 0) lines.push(pad + node.text.trim())
      continue
    }
    if (node.type !== 'element') {
      lines.push(pad + node.text)
      continue
    }

    if (node.selfClosing) {
      lines.push(pad + node.openTag)
      continue
    }

    const hasMeaningfulText = node.children.some(
      (child) => (child.type === 'text' && child.text.trim().length > 0) || child.type === 'cdata',
    )
    if (hasMeaningfulText) {
      // Mixed content — reproduce the inner source exactly, no reformatting.
      lines.push(pad + node.openTag + node.rawContent + node.closeTag)
      continue
    }

    const structuralChildren = node.children.filter((child) => child.type !== 'text')
    if (structuralChildren.length === 0) {
      lines.push(pad + node.openTag + node.closeTag)
      continue
    }

    lines.push(pad + node.openTag)
    formatXmlNodes(structuralChildren, depth + 1, indentOption, lines)
    lines.push(pad + node.closeTag)
  }
}

export function formatXml(input: string, indentOption: IndentOption = '2'): string {
  const { nodes } = parseChildren(input, 0)
  const lines: string[] = []
  formatXmlNodes(nodes, 0, indentOption, lines)
  return lines.join('\n') + '\n'
}

export function formatXmlDocument(input: string, indentOption: IndentOption = '2'): XmlFormatResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some XML to format.' } }
  }
  const output = formatXml(input, indentOption)
  return {
    ok: true,
    output,
    inputBytes: byteLength(input),
    outputBytes: byteLength(output),
  }
}

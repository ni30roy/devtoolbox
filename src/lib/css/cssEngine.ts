/**
 * Pure CSS formatting/minification. No DOM/browser APIs, so this can run
 * on the main thread or inside a Web Worker unchanged.
 *
 * This is a small hand-rolled recursive-descent parser rather than a
 * regex-based rewrite: CSS has enough sharp edges — strings that can
 * contain `{`, `}`, `;`, or `:`; `url(...)` values with embedded slashes
 * and colons; `calc()` expressions where a stray removed space changes
 * the result — that a naive find-and-replace would corrupt real
 * stylesheets. Structure (rules, nested rules, at-rules, declarations,
 * comments) is parsed once and reused by both format and minify.
 */
import type { IndentOption } from '@/lib/json/jsonEngine'

export interface CssSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface CssFailure {
  ok: false
  error: { message: string }
}

export type CssResult = CssSuccess | CssFailure

export type CssAction = 'format' | 'minify'

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

type CssNode =
  | { type: 'comment'; text: string }
  | { type: 'at-statement'; text: string }
  | { type: 'declaration'; text: string }
  | { type: 'rule'; prelude: string; children: CssNode[] }

function skipWs(input: string, i: number): number {
  while (i < input.length && /\s/.test(input[i])) i++
  return i
}

/** Scans forward, tracking string/comment/paren state, until an unquoted `{`, `;`, or `}` at paren depth 0. */
function scanUntilBoundary(input: string, start: number): { text: string; boundary: string | null; next: number } {
  let i = start
  let parenDepth = 0
  let text = ''
  while (i < input.length) {
    const ch = input[i]
    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2)
      const commentEnd = end === -1 ? input.length : end + 2
      text += input.slice(i, commentEnd)
      i = commentEnd
      continue
    }
    if (ch === '"' || ch === "'") {
      const quote = ch
      let j = i + 1
      while (j < input.length && input[j] !== quote) {
        if (input[j] === '\\') j++
        j++
      }
      j = Math.min(j + 1, input.length)
      text += input.slice(i, j)
      i = j
      continue
    }
    if (ch === '(') {
      parenDepth++
      text += ch
      i++
      continue
    }
    if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      text += ch
      i++
      continue
    }
    if (parenDepth === 0 && (ch === '{' || ch === ';' || ch === '}')) {
      return { text, boundary: ch, next: i + 1 }
    }
    text += ch
    i++
  }
  return { text, boundary: null, next: i }
}

function leafNode(text: string): CssNode {
  const trimmed = text.trim()
  return { type: trimmed.startsWith('@') ? 'at-statement' : 'declaration', text: trimmed }
}

function parseBlockContent(input: string, start: number): { nodes: CssNode[]; next: number } {
  const nodes: CssNode[] = []
  let i = start
  for (;;) {
    i = skipWs(input, i)
    if (i >= input.length) return { nodes, next: i }
    if (input[i] === '}') return { nodes, next: i + 1 }
    if (input.startsWith('/*', i)) {
      const end = input.indexOf('*/', i + 2)
      const commentEnd = end === -1 ? input.length : end + 2
      nodes.push({ type: 'comment', text: input.slice(i, commentEnd) })
      i = commentEnd
      continue
    }

    const { text, boundary, next } = scanUntilBoundary(input, i)
    if (boundary === '{') {
      const { nodes: children, next: afterBlock } = parseBlockContent(input, next)
      nodes.push({ type: 'rule', prelude: text, children })
      i = afterBlock
      continue
    }
    if (boundary === ';') {
      if (text.trim().length > 0) nodes.push(leafNode(text))
      i = next
      continue
    }
    if (boundary === '}') {
      if (text.trim().length > 0) nodes.push(leafNode(text))
      return { nodes, next }
    }
    // End of input mid-segment.
    if (text.trim().length > 0) nodes.push(leafNode(text))
    return { nodes, next: input.length }
  }
}

function parseCss(input: string): CssNode[] {
  return parseBlockContent(input, 0).nodes
}

/** Collapses runs of whitespace to a single space, but never touches whitespace inside a quoted string. */
function collapseWhitespaceOutsideStrings(text: string): string {
  let result = ''
  let i = 0
  let inSingle = false
  let inDouble = false
  while (i < text.length) {
    const ch = text[i]
    if (inSingle || inDouble) {
      if (ch === '\\') {
        result += ch
        i++
        if (i < text.length) {
          result += text[i]
          i++
        }
        continue
      }
      result += ch
      if (inSingle && ch === "'") inSingle = false
      if (inDouble && ch === '"') inDouble = false
      i++
      continue
    }
    if (ch === "'") {
      inSingle = true
      result += ch
      i++
      continue
    }
    if (ch === '"') {
      inDouble = true
      result += ch
      i++
      continue
    }
    if (/\s/.test(ch)) {
      let j = i
      while (j < text.length && /\s/.test(text[j])) j++
      result += ' '
      i = j
      continue
    }
    result += ch
    i++
  }
  return result.trim()
}

/** Finds the property/value separator `:` in a declaration, ignoring one inside a string or `(...)`. */
function findTopLevelColon(text: string): number {
  let inSingle = false
  let inDouble = false
  let parenDepth = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inSingle) {
      if (ch === '\\') i++
      else if (ch === "'") inSingle = false
      continue
    }
    if (inDouble) {
      if (ch === '\\') i++
      else if (ch === '"') inDouble = false
      continue
    }
    if (ch === "'") {
      inSingle = true
      continue
    }
    if (ch === '"') {
      inDouble = true
      continue
    }
    if (ch === '(') {
      parenDepth++
      continue
    }
    if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      continue
    }
    if (ch === ':' && parenDepth === 0) return i
  }
  return -1
}

function indentUnit(option: IndentOption): string {
  return option === 'tab' ? '\t' : ' '.repeat(Number(option))
}

function formatNodes(nodes: CssNode[], depth: number, indentOption: IndentOption, lines: string[]): void {
  nodes.forEach((node, idx) => {
    const pad = indentUnit(indentOption).repeat(depth)
    if (node.type === 'comment') {
      lines.push(pad + node.text)
      return
    }
    if (node.type === 'at-statement') {
      lines.push(pad + collapseWhitespaceOutsideStrings(node.text) + ';')
      return
    }
    if (node.type === 'declaration') {
      const colonIdx = findTopLevelColon(node.text)
      if (colonIdx === -1) {
        lines.push(pad + collapseWhitespaceOutsideStrings(node.text) + ';')
      } else {
        const prop = collapseWhitespaceOutsideStrings(node.text.slice(0, colonIdx))
        const value = collapseWhitespaceOutsideStrings(node.text.slice(colonIdx + 1))
        lines.push(`${pad}${prop}: ${value};`)
      }
      return
    }
    // rule
    const prelude = collapseWhitespaceOutsideStrings(node.prelude)
    lines.push(`${pad}${prelude} {`)
    formatNodes(node.children, depth + 1, indentOption, lines)
    lines.push(`${pad}}`)
    if (depth === 0 && idx < nodes.length - 1) lines.push('')
  })
}

function minifyNodes(nodes: CssNode[]): string {
  let out = ''
  for (const node of nodes) {
    if (node.type === 'comment') {
      if (node.text.startsWith('/*!')) out += node.text
      continue
    }
    if (node.type === 'at-statement') {
      out += collapseWhitespaceOutsideStrings(node.text) + ';'
      continue
    }
    if (node.type === 'declaration') {
      const colonIdx = findTopLevelColon(node.text)
      if (colonIdx === -1) {
        out += collapseWhitespaceOutsideStrings(node.text) + ';'
      } else {
        const prop = collapseWhitespaceOutsideStrings(node.text.slice(0, colonIdx))
        const value = collapseWhitespaceOutsideStrings(node.text.slice(colonIdx + 1))
        out += `${prop}:${value};`
      }
      continue
    }
    // rule
    const prelude = collapseWhitespaceOutsideStrings(node.prelude)
    out += `${prelude}{${minifyNodes(node.children)}}`
  }
  return out
}

export function formatCss(input: string, indentOption: IndentOption = '2'): string {
  const lines: string[] = []
  formatNodes(parseCss(input), 0, indentOption, lines)
  return lines.join('\n') + '\n'
}

export function minifyCss(input: string): string {
  return minifyNodes(parseCss(input))
}

export function runCssAction(action: CssAction, input: string, indentOption: IndentOption = '2'): CssResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: `Input is empty. Paste some CSS to ${action}.` } }
  }
  const output = action === 'minify' ? minifyCss(input) : formatCss(input, indentOption)
  return {
    ok: true,
    output,
    inputBytes: byteLength(input),
    outputBytes: byteLength(output),
  }
}

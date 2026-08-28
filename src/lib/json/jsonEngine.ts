/**
 * Pure JSON parsing/formatting helpers. No DOM/browser APIs, so this can
 * run on the main thread or inside a Web Worker unchanged.
 */

export type IndentOption = '2' | '4' | 'tab'

export interface JsonErrorInfo {
  message: string
  /** 1-indexed line number, when it could be determined. */
  line?: number
  /** 1-indexed column number, when it could be determined. */
  column?: number
  /** 0-indexed character offset into the input, when it could be determined. */
  position?: number
  /** A couple of lines of surrounding context, for display. */
  snippet?: string
}

export interface JsonSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface JsonFailure {
  ok: false
  error: JsonErrorInfo
}

export type JsonResult = JsonSuccess | JsonFailure

function byteLength(value: string): number {
  // TextEncoder gives the actual UTF-8 byte size, which is what matters for
  // "how big is this over the wire / on disk" — not the JS string length.
  return new TextEncoder().encode(value).length
}

function indentString(option: IndentOption): string | number {
  if (option === 'tab') return '\t'
  return Number(option)
}

function positionToLineColumn(input: string, rawPosition: number) {
  const position = Math.max(0, Math.min(rawPosition, input.length))
  const before = input.slice(0, position)
  const lines = before.split('\n')
  const line = lines.length
  const column = lines[lines.length - 1].length + 1
  return { line, column, position }
}

function buildSnippet(input: string, line: number): string {
  const lines = input.split('\n')
  const start = Math.max(0, line - 2)
  const end = Math.min(lines.length, line + 1)
  const width = String(end).length
  return lines
    .slice(start, end)
    .map((text, index) => {
      const lineNumber = start + index + 1
      const marker = lineNumber === line ? '>' : ' '
      return `${marker} ${String(lineNumber).padStart(width, ' ')} | ${text}`
    })
    .join('\n')
}

/**
 * A small hand-rolled JSON grammar scanner used purely to *locate* syntax
 * errors. JSON.parse's own error messages are not reliable for this: the
 * exact wording and whether a character position is included at all
 * differs by engine and has changed across Chrome/V8 versions (recent V8
 * dropped the numeric "position" from some messages entirely). Running our
 * own linear scan after JSON.parse has already thrown gives a consistent,
 * accurate line/column on every browser, plus messages tailored to the
 * mistakes people actually make (trailing commas, single quotes, comments).
 * It only runs on the error path, never on a successful parse.
 */
class JsonSyntaxError extends Error {
  position: number
  constructor(message: string, position: number) {
    super(message)
    this.position = position
  }
}

function fail(message: string, position: number): never {
  throw new JsonSyntaxError(message, position)
}

function isWhitespace(ch: string | undefined): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'
}

function isDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= '0' && ch <= '9'
}

function describeChar(ch: string | undefined): string {
  return ch === undefined ? 'end of input' : `'${ch}'`
}

function skipWs(s: string, i: number): number {
  while (i < s.length && isWhitespace(s[i])) i++
  return i
}

function scanValue(s: string, i: number): number {
  i = skipWs(s, i)
  const ch = s[i]
  if (ch === undefined) fail('Unexpected end of JSON input', i)
  if (ch === '{') return scanObject(s, i)
  if (ch === '[') return scanArray(s, i)
  if (ch === '"') return scanString(s, i)
  if (ch === '-' || isDigit(ch)) return scanNumber(s, i)
  if (s.startsWith('true', i)) return i + 4
  if (s.startsWith('false', i)) return i + 5
  if (s.startsWith('null', i)) return i + 4
  if (ch === "'") fail('Strings must use double quotes, not single quotes', i)
  if (ch === '/') fail('Comments are not allowed in JSON', i)
  if (/[A-Za-z]/.test(ch)) fail(`Unexpected token ${describeChar(ch)} — did you mean to quote this?`, i)
  fail(`Unexpected token ${describeChar(ch)}`, i)
}

function scanObject(s: string, i: number): number {
  i++ // consume '{'
  i = skipWs(s, i)
  if (s[i] === '}') return i + 1
  for (;;) {
    i = skipWs(s, i)
    if (s[i] !== '"') {
      if (s[i] === "'") fail('Object keys must use double quotes, not single quotes', i)
      if (s[i] !== undefined && /[A-Za-z_$]/.test(s[i])) fail('Object keys must be double-quoted strings', i)
      fail(`Expected a double-quoted key, found ${describeChar(s[i])}`, i)
    }
    i = scanString(s, i)
    i = skipWs(s, i)
    if (s[i] !== ':') fail(`Expected ':' after object key, found ${describeChar(s[i])}`, i)
    i = scanValue(s, i + 1)
    i = skipWs(s, i)
    if (s[i] === ',') {
      i = skipWs(s, i + 1)
      if (s[i] === '}') fail("Trailing comma is not allowed before '}'", i)
      continue
    }
    if (s[i] === '}') return i + 1
    fail(`Expected ',' or '}', found ${describeChar(s[i])}`, i)
  }
}

function scanArray(s: string, i: number): number {
  i++ // consume '['
  i = skipWs(s, i)
  if (s[i] === ']') return i + 1
  for (;;) {
    i = scanValue(s, i)
    i = skipWs(s, i)
    if (s[i] === ',') {
      i = skipWs(s, i + 1)
      if (s[i] === ']') fail("Trailing comma is not allowed before ']'", i)
      continue
    }
    if (s[i] === ']') return i + 1
    fail(`Expected ',' or ']', found ${describeChar(s[i])}`, i)
  }
}

function scanString(s: string, i: number): number {
  const start = i
  i++ // consume opening quote
  for (;;) {
    const ch = s[i]
    if (ch === undefined) fail('Unterminated string', start)
    if (ch === '"') return i + 1
    if (ch === '\\') {
      const next = s[i + 1]
      if (next === undefined) fail('Unterminated escape sequence', i)
      if (next === 'u') {
        if (!/^[0-9a-fA-F]{4}$/.test(s.slice(i + 2, i + 6))) fail('Invalid unicode escape sequence', i)
        i += 6
        continue
      }
      if (!'"\\/bfnrt'.includes(next)) fail(`Invalid escape character '\\${next}'`, i)
      i += 2
      continue
    }
    if (ch.charCodeAt(0) < 0x20) fail('Control characters in a string must be escaped', i)
    i++
  }
}

function scanNumber(s: string, i: number): number {
  const start = i
  if (s[i] === '-') i++
  if (s[i] === '0') {
    i++
  } else if (isDigit(s[i])) {
    while (isDigit(s[i])) i++
  } else {
    fail('Invalid number', start)
  }
  if (s[i] === '.') {
    i++
    if (!isDigit(s[i])) fail('Expected a digit after the decimal point', i)
    while (isDigit(s[i])) i++
  }
  if (s[i] === 'e' || s[i] === 'E') {
    i++
    if (s[i] === '+' || s[i] === '-') i++
    if (!isDigit(s[i])) fail('Expected a digit in the exponent', i)
    while (isDigit(s[i])) i++
  }
  return i
}

/** Returns the first syntax problem found, or null if the scanner sees no issue. */
function locateJsonSyntaxError(input: string): { message: string; position: number } | null {
  try {
    const end = skipWs(input, scanValue(input, 0))
    if (end < input.length) fail(`Unexpected trailing content ${describeChar(input[end])}`, end)
    return null
  } catch (error) {
    if (error instanceof JsonSyntaxError) return { message: error.message, position: error.position }
    return null
  }
}

/** Turn a native JSON.parse SyntaxError into a line/column-aware error. */
export function describeJsonError(error: unknown, input: string): JsonErrorInfo {
  const located = locateJsonSyntaxError(input)
  if (located) {
    const { line, column, position } = positionToLineColumn(input, located.position)
    return { message: located.message, line, column, position, snippet: buildSnippet(input, line) }
  }

  // Our scanner agreed the input parses fine (shouldn't normally happen,
  // since this only runs after JSON.parse already threw) — fall back to
  // whatever the engine's own message says, without a location.
  const message = error instanceof Error ? error.message : String(error)
  return { message }
}

export function validateJson(input: string): JsonResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some JSON to validate.' } }
  }
  try {
    JSON.parse(input)
    return { ok: true, output: input, inputBytes: byteLength(input), outputBytes: byteLength(input) }
  } catch (error) {
    return { ok: false, error: describeJsonError(error, input) }
  }
}

export function formatJson(input: string, indent: IndentOption = '2'): JsonResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some JSON to format.' } }
  }
  try {
    const data = JSON.parse(input)
    const output = JSON.stringify(data, null, indentString(indent))
    return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
  } catch (error) {
    return { ok: false, error: describeJsonError(error, input) }
  }
}

export function minifyJson(input: string): JsonResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some JSON to minify.' } }
  }
  try {
    const data = JSON.parse(input)
    const output = JSON.stringify(data)
    return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
  } catch (error) {
    return { ok: false, error: describeJsonError(error, input) }
  }
}

export type JsonAction = 'format' | 'validate' | 'minify'

export function runJsonAction(action: JsonAction, input: string, indent: IndentOption = '2'): JsonResult {
  switch (action) {
    case 'format':
      return formatJson(input, indent)
    case 'minify':
      return minifyJson(input)
    case 'validate':
      return validateJson(input)
  }
}

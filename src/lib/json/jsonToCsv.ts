/**
 * Pure JSON→CSV conversion. No DOM/browser APIs, so this can run on the
 * main thread or inside a Web Worker unchanged — mirrors jsonToYaml.ts.
 */
import { describeJsonError, type JsonErrorInfo } from './jsonEngine'

export interface CsvSuccess {
  ok: true
  output: string
  rowCount: number
  columnCount: number
  inputBytes: number
  outputBytes: number
}

export interface CsvFailure {
  ok: false
  error: JsonErrorInfo
}

export type CsvResult = CsvSuccess | CsvFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Flattens a nested object into dot-notation keys (`address.city`). Arrays
 * are left as-is and later JSON-stringified into a single cell — CSV has no
 * native way to represent a list, and indexing them (`tags.0`, `tags.1`)
 * would make every row's column set depend on that row's array lengths.
 */
function flattenRow(value: unknown, prefix = '', out: Record<string, unknown> = {}): Record<string, unknown> {
  if (isPlainObject(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0 && prefix) {
      out[prefix] = '{}'
      return out
    }
    for (const [key, v] of entries) {
      flattenRow(v, prefix ? `${prefix}.${key}` : key, out)
    }
    return out
  }
  out[prefix] = value
  return out
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function collectRows(data: unknown): Record<string, unknown>[] {
  const items = Array.isArray(data) ? data : [data]
  return items.map((item) => (isPlainObject(item) ? flattenRow(item) : { value: item }))
}

export function convertJsonToCsv(input: string): CsvResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some JSON to convert.' } }
  }

  let data: unknown
  try {
    data = JSON.parse(input)
  } catch (error) {
    return { ok: false, error: describeJsonError(error, input) }
  }

  const rows = collectRows(data)
  if (rows.length === 0) {
    return { ok: false, error: { message: 'The JSON array is empty — there are no rows to convert.' } }
  }

  const columns: string[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }

  // CRLF line endings (RFC 4180) — the format Excel and most spreadsheet
  // tools expect from a downloaded .csv file.
  const lines = [columns.map(csvEscape).join(',')]
  for (const row of rows) {
    lines.push(columns.map((column) => csvEscape(row[column])).join(','))
  }
  const output = lines.join('\r\n') + '\r\n'

  return {
    ok: true,
    output,
    rowCount: rows.length,
    columnCount: columns.length,
    inputBytes: byteLength(input),
    outputBytes: byteLength(output),
  }
}

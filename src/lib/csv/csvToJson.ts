/**
 * Pure CSV→JSON conversion. No DOM/browser APIs, so this can run on the
 * main thread or inside a Web Worker unchanged — mirrors jsonToCsv.ts.
 */

export interface CsvToJsonSuccess {
  ok: true
  output: string
  rowCount: number
  columnCount: number
  inputBytes: number
  outputBytes: number
}

export interface CsvToJsonFailure {
  ok: false
  error: { message: string }
}

export type CsvToJsonResult = CsvToJsonSuccess | CsvToJsonFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

function stripBom(input: string): string {
  return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
}

/**
 * A small hand-rolled CSV scanner (RFC 4180-ish) rather than a naive
 * `line.split(',')`: that breaks the moment a field contains a quoted
 * comma, a quoted newline, or an escaped `""` quote, all of which are
 * common in real-world CSV exports.
 */
function parseCsvRows(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const len = input.length

  while (i < len) {
    const ch = input[i]
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\r' || ch === '\n') {
      row.push(field)
      field = ''
      rows.push(row)
      row = []
      i++
      if (ch === '\r' && input[i] === '\n') i++
      continue
    }
    field += ch
    i++
  }

  // Flush a final field/row that wasn't terminated by a trailing newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function isBlankRow(row: string[]): boolean {
  return row.length === 1 && row[0] === ''
}

export function convertCsvToJson(input: string): CsvToJsonResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some CSV to convert.' } }
  }

  const rows = parseCsvRows(stripBom(input)).filter((row) => !isBlankRow(row))
  if (rows.length === 0) {
    return { ok: false, error: { message: 'No rows found in this CSV.' } }
  }

  const header = rows[0]
  const dataRows = rows.slice(1)
  if (dataRows.length === 0) {
    return { ok: false, error: { message: 'This CSV only has a header row — there is no data to convert.' } }
  }

  const objects = dataRows.map((row) => {
    const obj: Record<string, string> = {}
    header.forEach((key, index) => {
      obj[key] = row[index] ?? ''
    })
    return obj
  })

  const output = JSON.stringify(objects, null, 2)
  return {
    ok: true,
    output,
    rowCount: objects.length,
    columnCount: header.length,
    inputBytes: byteLength(input),
    outputBytes: byteLength(output),
  }
}

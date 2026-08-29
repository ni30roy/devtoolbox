/**
 * SQL formatting via sql-formatter — a real tokenizer/dialect-aware
 * formatter rather than a regex-based rewrite. SQL has the same sharp
 * edges as other languages on this site: string literals that can
 * contain keywords or semicolons, block/line comments that can contain
 * anything, and quoting rules that differ by dialect (backticks
 * in MySQL, double quotes in Postgres, brackets in T-SQL). A naive
 * find-and-replace formatter can easily corrupt any of these.
 */
import { format } from 'sql-formatter'
import type { IndentOption } from '@/lib/json/jsonEngine'

export type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'tsql' | 'sqlite' | 'bigquery' | 'plsql'

export const SQL_DIALECTS: { value: SqlDialect; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'tsql', label: 'SQL Server (T-SQL)' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'plsql', label: 'Oracle (PL/SQL)' },
]

export interface SqlFormatSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface SqlFormatFailure {
  ok: false
  error: { message: string }
}

export type SqlFormatResult = SqlFormatSuccess | SqlFormatFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

function indentOptions(indentOption: IndentOption): { tabWidth?: number; useTabs?: boolean } {
  if (indentOption === 'tab') return { useTabs: true }
  return { tabWidth: Number(indentOption) }
}

export function formatSqlDocument(input: string, dialect: SqlDialect, indentOption: IndentOption = '2'): SqlFormatResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some SQL to format.' } }
  }

  try {
    const output = format(input, { language: dialect, ...indentOptions(indentOption) })
    return {
      ok: true,
      output,
      inputBytes: byteLength(input),
      outputBytes: byteLength(output),
    }
  } catch (error) {
    return { ok: false, error: { message: error instanceof Error ? error.message : String(error) } }
  }
}

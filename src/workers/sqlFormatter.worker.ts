/// <reference lib="webworker" />
import { formatSqlDocument, type SqlDialect, type SqlFormatResult } from '@/lib/sql/sqlFormatter'
import type { IndentOption } from '@/lib/json/jsonEngine'

export interface SqlFormatterWorkerRequest {
  id: number
  input: string
  dialect: SqlDialect
  indent: IndentOption
}

export interface SqlFormatterWorkerResponse {
  id: number
  result: SqlFormatResult
}

self.onmessage = (event: MessageEvent<SqlFormatterWorkerRequest>) => {
  const { id, input, dialect, indent } = event.data
  const result = formatSqlDocument(input, dialect, indent)
  const response: SqlFormatterWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

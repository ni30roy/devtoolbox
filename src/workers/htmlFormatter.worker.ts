/// <reference lib="webworker" />
import { formatHtmlDocument, type HtmlFormatResult } from '@/lib/html/htmlFormatter'
import type { IndentOption } from '@/lib/json/jsonEngine'

export interface HtmlFormatterWorkerRequest {
  id: number
  input: string
  indent: IndentOption
}

export interface HtmlFormatterWorkerResponse {
  id: number
  result: HtmlFormatResult
}

self.onmessage = (event: MessageEvent<HtmlFormatterWorkerRequest>) => {
  const { id, input, indent } = event.data
  const result = formatHtmlDocument(input, indent)
  const response: HtmlFormatterWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

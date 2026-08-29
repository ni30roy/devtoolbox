/// <reference lib="webworker" />
import { formatXmlDocument, type XmlFormatResult } from '@/lib/xml/xmlFormatter'
import type { IndentOption } from '@/lib/json/jsonEngine'

export interface XmlFormatterWorkerRequest {
  id: number
  input: string
  indent: IndentOption
}

export interface XmlFormatterWorkerResponse {
  id: number
  result: XmlFormatResult
}

self.onmessage = (event: MessageEvent<XmlFormatterWorkerRequest>) => {
  const { id, input, indent } = event.data
  const result = formatXmlDocument(input, indent)
  const response: XmlFormatterWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

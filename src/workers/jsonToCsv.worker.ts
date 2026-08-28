/// <reference lib="webworker" />
import { convertJsonToCsv, type CsvResult } from '@/lib/json/jsonToCsv'

export interface JsonToCsvWorkerRequest {
  id: number
  input: string
}

export interface JsonToCsvWorkerResponse {
  id: number
  result: CsvResult
}

self.onmessage = (event: MessageEvent<JsonToCsvWorkerRequest>) => {
  const { id, input } = event.data
  const result = convertJsonToCsv(input)
  const response: JsonToCsvWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

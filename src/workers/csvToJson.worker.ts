/// <reference lib="webworker" />
import { convertCsvToJson, type CsvToJsonResult } from '@/lib/csv/csvToJson'

export interface CsvToJsonWorkerRequest {
  id: number
  input: string
}

export interface CsvToJsonWorkerResponse {
  id: number
  result: CsvToJsonResult
}

self.onmessage = (event: MessageEvent<CsvToJsonWorkerRequest>) => {
  const { id, input } = event.data
  const result = convertCsvToJson(input)
  const response: CsvToJsonWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

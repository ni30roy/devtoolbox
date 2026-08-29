/// <reference lib="webworker" />
import { minifyJavaScript, type JsMinifyResult } from '@/lib/javascript/jsMinifier'

export interface JsMinifierWorkerRequest {
  id: number
  input: string
}

export interface JsMinifierWorkerResponse {
  id: number
  result: JsMinifyResult
}

self.onmessage = async (event: MessageEvent<JsMinifierWorkerRequest>) => {
  const { id, input } = event.data
  const result = await minifyJavaScript(input)
  const response: JsMinifierWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

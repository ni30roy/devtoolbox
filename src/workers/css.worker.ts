/// <reference lib="webworker" />
import { runCssAction, type CssAction, type CssResult } from '@/lib/css/cssEngine'
import type { IndentOption } from '@/lib/json/jsonEngine'

export interface CssWorkerRequest {
  id: number
  action: CssAction
  input: string
  indent: IndentOption
}

export interface CssWorkerResponse {
  id: number
  result: CssResult
}

self.onmessage = (event: MessageEvent<CssWorkerRequest>) => {
  const { id, action, input, indent } = event.data
  const result = runCssAction(action, input, indent)
  const response: CssWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

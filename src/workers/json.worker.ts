/// <reference lib="webworker" />
import { runJsonAction, type JsonAction, type IndentOption } from '@/lib/json/jsonEngine'

export interface JsonWorkerRequest {
  id: number
  action: JsonAction
  input: string
  indent: IndentOption
}

export interface JsonWorkerResponse {
  id: number
  result: ReturnType<typeof runJsonAction>
}

self.onmessage = (event: MessageEvent<JsonWorkerRequest>) => {
  const { id, action, input, indent } = event.data
  const result = runJsonAction(action, input, indent)
  const response: JsonWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

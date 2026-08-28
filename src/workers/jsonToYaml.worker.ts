/// <reference lib="webworker" />
import { convertJsonToYaml, type YamlResult } from '@/lib/json/jsonToYaml'

export interface JsonToYamlWorkerRequest {
  id: number
  input: string
}

export interface JsonToYamlWorkerResponse {
  id: number
  result: YamlResult
}

self.onmessage = (event: MessageEvent<JsonToYamlWorkerRequest>) => {
  const { id, input } = event.data
  const result = convertJsonToYaml(input)
  const response: JsonToYamlWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

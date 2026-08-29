/// <reference lib="webworker" />
import { testRegex, type RegexResult } from '@/lib/regex/regexEngine'

export interface RegexWorkerRequest {
  id: number
  pattern: string
  flags: string
  testString: string
}

export interface RegexWorkerResponse {
  id: number
  result: RegexResult
}

self.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const { id, pattern, flags, testString } = event.data
  const result = testRegex(pattern, flags, testString)
  const response: RegexWorkerResponse = { id, result }
  ;(self as unknown as Worker).postMessage(response)
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { IndentOption, JsonAction, JsonResult } from '@/lib/json/jsonEngine'
import type { JsonWorkerRequest, JsonWorkerResponse } from '@/workers/json.worker'

/**
 * Runs JSON format/validate/minify in a Web Worker so large documents
 * don't block the main thread (typing, scrolling, animations stay smooth
 * while a big paste is being parsed).
 */
export function useJsonWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: JsonResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/json.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<JsonWorkerResponse>) => {
      const { id, result } = event.data
      const resolve = pendingRef.current.get(id)
      if (resolve) {
        pendingRef.current.delete(id)
        resolve(result)
      }
    }
    workerRef.current = worker
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const run = useCallback((action: JsonAction, input: string, indent: IndentOption = '2') => {
    const worker = workerRef.current
    if (!worker) return Promise.resolve<JsonResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<JsonResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: JsonWorkerRequest = { id, action, input, indent }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

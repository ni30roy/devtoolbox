import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvResult } from '@/lib/json/jsonToCsv'
import type { JsonToCsvWorkerRequest, JsonToCsvWorkerResponse } from '@/workers/jsonToCsv.worker'

/**
 * Runs JSON→CSV conversion in a Web Worker so large documents don't block
 * the main thread. Mirrors useJsonToYamlWorker.ts.
 */
export function useJsonToCsvWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: CsvResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/jsonToCsv.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<JsonToCsvWorkerResponse>) => {
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

  const run = useCallback((input: string) => {
    const worker = workerRef.current
    if (!worker) return Promise.resolve<CsvResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<CsvResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: JsonToCsvWorkerRequest = { id, input }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvToJsonResult } from '@/lib/csv/csvToJson'
import type { CsvToJsonWorkerRequest, CsvToJsonWorkerResponse } from '@/workers/csvToJson.worker'

/**
 * Runs CSV→JSON conversion in a Web Worker so large files don't block the
 * main thread. Mirrors useJsonToCsvWorker.ts.
 */
export function useCsvToJsonWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: CsvToJsonResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/csvToJson.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<CsvToJsonWorkerResponse>) => {
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
    if (!worker) return Promise.resolve<CsvToJsonResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<CsvToJsonResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: CsvToJsonWorkerRequest = { id, input }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

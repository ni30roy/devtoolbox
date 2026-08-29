import { useCallback, useEffect, useRef, useState } from 'react'
import type { JsMinifyResult } from '@/lib/javascript/jsMinifier'
import type { JsMinifierWorkerRequest, JsMinifierWorkerResponse } from '@/workers/jsMinifier.worker'

/**
 * Runs JS minification (via terser) in a Web Worker so the — comparatively
 * heavy — parse/mangle/compress pass never blocks the main thread.
 */
export function useJsMinifierWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: JsMinifyResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/jsMinifier.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<JsMinifierWorkerResponse>) => {
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
    if (!worker) return Promise.resolve<JsMinifyResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<JsMinifyResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: JsMinifierWorkerRequest = { id, input }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

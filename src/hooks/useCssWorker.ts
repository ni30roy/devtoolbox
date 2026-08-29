import { useCallback, useEffect, useRef, useState } from 'react'
import type { CssAction, CssResult } from '@/lib/css/cssEngine'
import type { IndentOption } from '@/lib/json/jsonEngine'
import type { CssWorkerRequest, CssWorkerResponse } from '@/workers/css.worker'

/**
 * Runs CSS format/minify in a Web Worker so large stylesheets don't block
 * the main thread. Mirrors useJsonWorker.ts.
 */
export function useCssWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: CssResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/css.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<CssWorkerResponse>) => {
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

  const run = useCallback((action: CssAction, input: string, indent: IndentOption) => {
    const worker = workerRef.current
    if (!worker) return Promise.resolve<CssResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<CssResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: CssWorkerRequest = { id, action, input, indent }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

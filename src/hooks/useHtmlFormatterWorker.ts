import { useCallback, useEffect, useRef, useState } from 'react'
import type { HtmlFormatResult } from '@/lib/html/htmlFormatter'
import type { IndentOption } from '@/lib/json/jsonEngine'
import type { HtmlFormatterWorkerRequest, HtmlFormatterWorkerResponse } from '@/workers/htmlFormatter.worker'

/**
 * Runs HTML formatting in a Web Worker so large documents don't block the
 * main thread. Mirrors useJsonToCsvWorker.ts.
 */
export function useHtmlFormatterWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: HtmlFormatResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/htmlFormatter.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<HtmlFormatterWorkerResponse>) => {
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

  const run = useCallback((input: string, indent: IndentOption) => {
    const worker = workerRef.current
    if (!worker) return Promise.resolve<HtmlFormatResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<HtmlFormatResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: HtmlFormatterWorkerRequest = { id, input, indent }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

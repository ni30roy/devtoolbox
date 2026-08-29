import { useCallback, useEffect, useRef, useState } from 'react'
import type { XmlFormatResult } from '@/lib/xml/xmlFormatter'
import type { IndentOption } from '@/lib/json/jsonEngine'
import type { XmlFormatterWorkerRequest, XmlFormatterWorkerResponse } from '@/workers/xmlFormatter.worker'

/**
 * Runs XML formatting in a Web Worker so large documents don't block the
 * main thread. Mirrors useHtmlFormatterWorker.ts.
 */
export function useXmlFormatterWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: XmlFormatResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/xmlFormatter.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<XmlFormatterWorkerResponse>) => {
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
    if (!worker) return Promise.resolve<XmlFormatResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<XmlFormatResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: XmlFormatterWorkerRequest = { id, input, indent }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { YamlResult } from '@/lib/json/jsonToYaml'
import type { JsonToYamlWorkerRequest, JsonToYamlWorkerResponse } from '@/workers/jsonToYaml.worker'

/**
 * Runs JSON→YAML conversion in a Web Worker so large documents don't block
 * the main thread. Mirrors useJsonWorker.ts, kept separate rather than
 * extending the shared JSON worker so the existing format/validate/minify
 * tools can't be affected by this addition.
 */
export function useJsonToYamlWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: YamlResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/jsonToYaml.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<JsonToYamlWorkerResponse>) => {
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
    if (!worker) return Promise.resolve<YamlResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<YamlResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: JsonToYamlWorkerRequest = { id, input }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SqlDialect, SqlFormatResult } from '@/lib/sql/sqlFormatter'
import type { IndentOption } from '@/lib/json/jsonEngine'
import type { SqlFormatterWorkerRequest, SqlFormatterWorkerResponse } from '@/workers/sqlFormatter.worker'

/**
 * Runs SQL formatting in a Web Worker so large scripts don't block the
 * main thread. Mirrors useCssWorker.ts.
 */
export function useSqlFormatterWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: SqlFormatResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/sqlFormatter.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<SqlFormatterWorkerResponse>) => {
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

  const run = useCallback((input: string, dialect: SqlDialect, indent: IndentOption) => {
    const worker = workerRef.current
    if (!worker) return Promise.resolve<SqlFormatResult>({ ok: false, error: { message: 'Worker unavailable.' } })

    setBusy(true)
    return new Promise<SqlFormatResult>((resolve) => {
      const id = nextIdRef.current++
      pendingRef.current.set(id, (result) => {
        setBusy(false)
        resolve(result)
      })
      const request: SqlFormatterWorkerRequest = { id, input, dialect, indent }
      worker.postMessage(request)
    })
  }, [])

  return { run, busy }
}

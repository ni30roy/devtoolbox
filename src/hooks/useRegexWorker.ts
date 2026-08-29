import { useCallback, useEffect, useRef, useState } from 'react'
import type { RegexResult } from '@/lib/regex/regexEngine'
import type { RegexWorkerRequest, RegexWorkerResponse } from '@/workers/regex.worker'

// Unlike every other "fast" operation on this site, regex matching can
// pathologically hang forever on a catastrophic-backtracking pattern —
// there's no way to interrupt a synchronous RegExp.exec() from the
// inside. Running it in a worker means that if it doesn't answer within
// this window, we can forcibly terminate the worker (killing the hung
// computation) and spin up a fresh one, rather than freezing the tab.
const TIMEOUT_MS = 2000

function createWorker() {
  return new Worker(new URL('../workers/regex.worker.ts', import.meta.url), { type: 'module' })
}

/**
 * Runs regex matching in a Web Worker, with a hard timeout that
 * terminates and replaces the worker if a pattern never returns.
 */
export function useRegexWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<number, (result: RegexResult) => void>())
  const nextIdRef = useRef(0)
  const [busy, setBusy] = useState(false)

  const attachHandlers = useCallback((worker: Worker) => {
    worker.onmessage = (event: MessageEvent<RegexWorkerResponse>) => {
      const { id, result } = event.data
      const resolve = pendingRef.current.get(id)
      if (resolve) {
        pendingRef.current.delete(id)
        resolve(result)
      }
    }
  }, [])

  useEffect(() => {
    const worker = createWorker()
    attachHandlers(worker)
    workerRef.current = worker
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [attachHandlers])

  const run = useCallback(
    (pattern: string, flags: string, testString: string) => {
      const worker = workerRef.current
      if (!worker) return Promise.resolve<RegexResult>({ ok: false, error: { message: 'Worker unavailable.' } })

      setBusy(true)
      return new Promise<RegexResult>((resolve) => {
        const id = nextIdRef.current++

        const timeoutId = window.setTimeout(() => {
          pendingRef.current.delete(id)
          worker.terminate()
          const fresh = createWorker()
          attachHandlers(fresh)
          workerRef.current = fresh
          setBusy(false)
          resolve({
            ok: false,
            error: {
              message:
                'This pattern took too long to run — it may be causing catastrophic backtracking against this test string. Try simplifying the pattern or shortening the input.',
            },
          })
        }, TIMEOUT_MS)

        pendingRef.current.set(id, (result) => {
          window.clearTimeout(timeoutId)
          setBusy(false)
          resolve(result)
        })

        const request: RegexWorkerRequest = { id, pattern, flags, testString }
        worker.postMessage(request)
      })
    },
    [attachHandlers],
  )

  return { run, busy }
}

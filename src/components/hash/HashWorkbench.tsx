import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { computeAllHashes, HASH_ALGORITHMS, type HashAlgorithm } from '@/lib/hash/hashEngine'
import { CopyIcon, DownloadIcon, SparklesIcon, TrashIcon } from '@/components/icons/Icons'

const SAMPLE_TEXT = 'Hello from CodeTool 🚀 — नमस्ते'

export function HashWorkbench() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string> | null>(null)
  const [busy, setBusy] = useState(false)
  const [copiedAlgorithm, setCopiedAlgorithm] = useState<HashAlgorithm | null>(null)

  const runHash = useCallback(async () => {
    if (input.length === 0) return
    setBusy(true)
    setCopiedAlgorithm(null)
    const result = await computeAllHashes(input)
    setHashes(result)
    setBusy(false)
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setHashes(null)
    setCopiedAlgorithm(null)
  }, [])

  const handleSample = useCallback(() => {
    setInput(SAMPLE_TEXT)
    setHashes(null)
    setCopiedAlgorithm(null)
  }, [])

  const handleCopy = useCallback(async (algorithm: HashAlgorithm) => {
    if (!hashes) return
    await navigator.clipboard.writeText(hashes[algorithm])
    setCopiedAlgorithm(algorithm)
    window.setTimeout(() => setCopiedAlgorithm(null), 1800)
  }, [hashes])

  const handleDownload = useCallback(() => {
    if (!hashes) return
    const text = HASH_ALGORITHMS.map((algorithm) => `${algorithm}: ${hashes[algorithm]}`).join('\n')
    const blob = new Blob([text + '\n'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hashes.txt'
    link.click()
    URL.revokeObjectURL(url)
  }, [hashes])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: () => void runHash() },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runHash, handleClear],
    ),
  )

  const inputBytes = useMemo(() => new TextEncoder().encode(input).length, [input])

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => void runHash()}
          disabled={busy || input.length === 0}
          className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate hashes
        </button>
        <button
          type="button"
          onClick={handleSample}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <SparklesIcon className="h-3.5 w-3.5" /> Sample
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={input.length === 0}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <TrashIcon className="h-3.5 w-3.5" /> Clear
        </button>
        {busy && (
          <span className="text-xs text-slate-400" role="status">
            Hashing…
          </span>
        )}
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> generate &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      {/* Input */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Text</span>
        </div>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
            setHashes(null)
          }}
          spellCheck={false}
          aria-label="Text to hash"
          placeholder="Type or paste text here…"
          className="focus-ring h-28 w-full resize-none border-0 bg-transparent px-4 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-inset dark:text-slate-100 dark:placeholder:text-slate-600"
        />
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
          {inputBytes.toLocaleString()} bytes
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {!hashes && (
          <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-600">
            Click "Generate hashes" to see SHA-256, SHA-384, SHA-512, and SHA-1 here.
          </p>
        )}

        {hashes && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDownload}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <DownloadIcon className="h-3.5 w-3.5" /> Download all
              </button>
            </div>

            {HASH_ALGORITHMS.map((algorithm) => (
              <div key={algorithm} role="region" aria-label={`${algorithm} hash`} className="rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
                  <span className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                    {algorithm}
                    {algorithm === 'SHA-1' && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                        Legacy — insecure
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopy(algorithm)}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    <CopyIcon className="h-3.5 w-3.5" /> {copiedAlgorithm === algorithm ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="overflow-x-auto p-3 font-mono text-sm break-all text-slate-800 dark:text-slate-100">
                  {hashes[algorithm]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

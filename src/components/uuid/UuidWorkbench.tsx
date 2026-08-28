import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { generateUuids, MAX_COUNT, MIN_COUNT } from '@/lib/uuid/uuidEngine'
import { CopyIcon, DownloadIcon, SparklesIcon, TrashIcon } from '@/components/icons/Icons'

const SAMPLE_COUNT = 3

export function UuidWorkbench() {
  const [count, setCount] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(() => {
    setCopied(false)
    setUuids(generateUuids(count))
  }, [count])

  const handleSample = useCallback(() => {
    setCopied(false)
    setCount(SAMPLE_COUNT)
    setUuids(generateUuids(SAMPLE_COUNT))
  }, [])

  const handleClear = useCallback(() => {
    setUuids([])
    setCopied(false)
  }, [])

  const handleCopy = useCallback(async () => {
    if (uuids.length === 0) return
    await navigator.clipboard.writeText(uuids.join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [uuids])

  const handleDownload = useCallback(() => {
    if (uuids.length === 0) return
    const blob = new Blob([uuids.join('\n') + '\n'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'uuids.txt'
    link.click()
    URL.revokeObjectURL(url)
  }, [uuids])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: handleGenerate },
        { combo: 'mod+shift+c', handler: () => void handleCopy() },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [handleGenerate, handleCopy, handleClear],
    ),
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={handleGenerate}
          className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Generate
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          How many
          <input
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={(event) => setCount(Number(event.target.value) || MIN_COUNT)}
            aria-label="Number of UUIDs to generate"
            className="focus-ring w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

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
          disabled={uuids.length === 0}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <TrashIcon className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> generate &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          {uuids.length > 0 ? `${uuids.length} UUID${uuids.length === 1 ? '' : 's'}` : 'Result'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={uuids.length === 0}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <CopyIcon className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={uuids.length === 0}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <DownloadIcon className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>

      <div role="region" aria-label="Generated UUIDs" className="min-h-32 px-4 pb-4">
        {uuids.length === 0 ? (
          <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
            Click Generate to create one or more UUID v4 values.
          </p>
        ) : (
          <ul className="space-y-1.5 font-mono text-sm text-slate-800 dark:text-slate-100">
            {uuids.map((uuid, index) => (
              <li key={`${uuid}-${index}`} className="rounded-md bg-slate-50 px-3 py-1.5 dark:bg-slate-800/60">
                {uuid}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import {
  generateRandomNumbers,
  MAX_COUNT,
  MIN_COUNT,
  type RandomNumberResult,
} from '@/lib/randomNumber/randomNumberEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { CopyIcon, DiceIcon, TrashIcon } from '@/components/icons/Icons'

export function RandomNumberWorkbench() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [count, setCount] = useState(5)
  const [unique, setUnique] = useState(false)
  const [result, setResult] = useState<RandomNumberResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(() => {
    setCopied(false)
    setResult(generateRandomNumbers({ min, max, count, unique }))
  }, [min, max, count, unique])

  const handleClear = useCallback(() => {
    setResult(null)
    setCopied(false)
  }, [])

  const handleCopy = useCallback(async () => {
    if (!result?.ok) return
    await navigator.clipboard.writeText(result.values.join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [result])

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
          Min
          <input
            type="number"
            value={min}
            onChange={(event) => setMin(Number(event.target.value) || 0)}
            aria-label="Minimum value"
            className="focus-ring w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          Max
          <input
            type="number"
            value={max}
            onChange={(event) => setMax(Number(event.target.value) || 0)}
            aria-label="Maximum value"
            className="focus-ring w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          How many
          <input
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={(event) => setCount(Number(event.target.value) || MIN_COUNT)}
            aria-label="How many numbers to generate"
            className="focus-ring w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            checked={unique}
            onChange={(event) => setUnique(event.target.checked)}
            className="focus-ring h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
          />
          No duplicates
        </label>
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> generate &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          {result?.ok ? `${result.values.length} number${result.values.length === 1 ? '' : 's'}` : 'Result'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={!result?.ok}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <CopyIcon className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!result}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <TrashIcon className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      <div role="region" aria-label="Generated random numbers" className="min-h-32 px-4 pb-4">
        {!result && (
          <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
            <DiceIcon className="mx-auto mb-2 h-5 w-5 text-slate-300 dark:text-slate-700" />
            Click Generate to create one or more random numbers.
          </p>
        )}
        {result && !result.ok && <JsonErrorPanel error={result.error} heading="Can't generate numbers" />}
        {result?.ok && (
          <ul className="flex flex-wrap gap-2">
            {result.values.map((value, index) => (
              <li
                key={index}
                className="rounded-lg bg-slate-50 px-3 py-1.5 font-mono text-sm text-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
              >
                {value}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

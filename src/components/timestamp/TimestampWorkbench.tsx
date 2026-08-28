import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import {
  dateToTimestamp,
  timestampToDate,
  type DateToTimestampResult,
  type TimestampToDateResult,
  type TimestampUnit,
} from '@/lib/timestamp/timestampEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { ClockIcon, CopyIcon, SparklesIcon, TrashIcon } from '@/components/icons/Icons'

type Mode = 'to-date' | 'to-timestamp'

const SAMPLE_TIMESTAMP_SECONDS = '1700000000'
const SAMPLE_DATETIME_LOCAL = '2024-01-15T10:30'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Formats a Date as a `datetime-local` input value, using local wall-clock
 * fields (not UTC) — that input type has no timezone of its own. */
function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function TimestampWorkbench() {
  const [mode, setMode] = useState<Mode>('to-date')
  const [unit, setUnit] = useState<TimestampUnit>('seconds')
  const [timestampInput, setTimestampInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [toDateResult, setToDateResult] = useState<TimestampToDateResult | null>(null)
  const [toTimestampResult, setToTimestampResult] = useState<DateToTimestampResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const runConvert = useCallback(() => {
    setCopied(null)
    if (mode === 'to-date') {
      setToDateResult(timestampToDate(timestampInput, unit))
    } else {
      setToTimestampResult(dateToTimestamp(dateInput))
    }
  }, [mode, timestampInput, unit, dateInput])

  const handleClear = useCallback(() => {
    setTimestampInput('')
    setDateInput('')
    setToDateResult(null)
    setToTimestampResult(null)
    setCopied(null)
  }, [])

  const handleNow = useCallback(() => {
    const now = new Date()
    if (mode === 'to-date') {
      setTimestampInput(unit === 'seconds' ? String(Math.floor(now.getTime() / 1000)) : String(now.getTime()))
    } else {
      setDateInput(toDatetimeLocalValue(now))
    }
    setCopied(null)
  }, [mode, unit])

  const handleSample = useCallback(() => {
    setCopied(null)
    if (mode === 'to-date') {
      setTimestampInput(SAMPLE_TIMESTAMP_SECONDS)
      setUnit('seconds')
    } else {
      setDateInput(SAMPLE_DATETIME_LOCAL)
    }
  }, [mode])

  const handleCopy = useCallback(async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1800)
  }, [])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: runConvert },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runConvert, handleClear],
    ),
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Conversion direction">
          <button
            type="button"
            onClick={() => {
              setMode('to-date')
              setToTimestampResult(null)
              setCopied(null)
            }}
            className={
              mode === 'to-date'
                ? 'focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500'
                : 'focus-ring rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }
          >
            Timestamp → Date
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('to-timestamp')
              setToDateResult(null)
              setCopied(null)
            }}
            className={
              mode === 'to-timestamp'
                ? 'focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500'
                : 'focus-ring rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }
          >
            Date → Timestamp
          </button>
        </div>

        <button
          type="button"
          onClick={handleNow}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <ClockIcon className="h-3.5 w-3.5" /> Now
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
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <TrashIcon className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> convert &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="p-4">
        {mode === 'to-date' ? (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
              Unix timestamp
              <input
                type="text"
                inputMode="numeric"
                value={timestampInput}
                onChange={(event) => setTimestampInput(event.target.value)}
                placeholder="1700000000"
                aria-label="Unix timestamp"
                className="focus-ring w-56 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
              Unit
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value as TimestampUnit)}
                className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="seconds">Seconds</option>
                <option value="milliseconds">Milliseconds</option>
              </select>
            </label>
            <button
              type="button"
              onClick={runConvert}
              disabled={timestampInput.trim().length === 0}
              className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Convert
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
              Local date and time
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(event) => setDateInput(event.target.value)}
                aria-label="Local date and time"
                className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <button
              type="button"
              onClick={runConvert}
              disabled={dateInput.length === 0}
              className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Convert
            </button>
          </div>
        )}

        {/* Results */}
        <div className="mt-4">
          {mode === 'to-date' && toDateResult && !toDateResult.ok && (
            <JsonErrorPanel error={toDateResult.error} heading="Invalid timestamp" />
          )}
          {mode === 'to-date' && toDateResult?.ok && (
            <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              {(
                [
                  ['UTC', toDateResult.date.utc],
                  ['Local', `${toDateResult.date.local} (${toDateResult.date.timezone})`],
                  ['ISO 8601', toDateResult.date.iso],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-100">
                    {value}
                    <button
                      type="button"
                      onClick={() => void handleCopy(label, value)}
                      className="focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                      <CopyIcon className="h-3 w-3" /> {copied === label ? 'Copied!' : 'Copy'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {mode === 'to-timestamp' && toTimestampResult && !toTimestampResult.ok && (
            <JsonErrorPanel error={toTimestampResult.error} heading="Invalid date" />
          )}
          {mode === 'to-timestamp' && toTimestampResult?.ok && (
            <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              {(
                [
                  ['Seconds', String(toTimestampResult.seconds)],
                  ['Milliseconds', String(toTimestampResult.milliseconds)],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-100">
                    {value}
                    <button
                      type="button"
                      onClick={() => void handleCopy(label, value)}
                      className="focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                      <CopyIcon className="h-3 w-3" /> {copied === label ? 'Copied!' : 'Copy'}
                    </button>
                  </span>
                </div>
              ))}
              <p className="pt-1 text-xs text-slate-400 dark:text-slate-500">
                Interpreted as {toTimestampResult.date.local} ({toTimestampResult.date.timezone})
              </p>
            </div>
          )}

          {!toDateResult && !toTimestampResult && (
            <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-600">
              Enter a value above and click Convert.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

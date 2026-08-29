import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { decodeFromHex, encodeToHex, type HexResult } from '@/lib/hex/hexEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { formatBytes } from '@/lib/format'
import { CopyIcon, DownloadIcon, HashIcon, SwapIcon, TrashIcon } from '@/components/icons/Icons'

type Mode = 'encode' | 'decode'

const SAMPLE_TEXT = 'Hello from CodeTool 🚀 — café'

export function HexWorkbench() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [uppercase, setUppercase] = useState(false)
  const [spaced, setSpaced] = useState(true)
  const [result, setResult] = useState<HexResult | null>(null)
  const [copied, setCopied] = useState(false)

  // A single linear pass over the input either way — fast enough at any
  // realistic size to run synchronously with no Web Worker.
  const runAction = useCallback(
    (action: Mode) => {
      setMode(action)
      setCopied(false)
      setResult(action === 'encode' ? encodeToHex(input, uppercase, spaced) : decodeFromHex(input))
    },
    [input, uppercase, spaced],
  )

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setCopied(false)
  }, [])

  const handleSample = useCallback(() => {
    if (mode === 'encode') {
      setInput(SAMPLE_TEXT)
    } else {
      const encoded = encodeToHex(SAMPLE_TEXT, uppercase, spaced)
      setInput(encoded.ok ? encoded.output : '')
    }
    setResult(null)
    setCopied(false)
  }, [mode, uppercase, spaced])

  const handleCopy = useCallback(async () => {
    if (!result?.ok) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [result])

  const handleDownload = useCallback(() => {
    if (!result?.ok) return
    const blob = new Blob([result.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hex-output.txt'
    link.click()
    URL.revokeObjectURL(url)
  }, [result])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: () => runAction(mode) },
        { combo: 'mod+shift+c', handler: () => void handleCopy() },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runAction, mode, handleCopy, handleClear],
    ),
  )

  const inputBytes = useMemo(() => new TextEncoder().encode(input).length, [input])
  const inputLabel = mode === 'encode' ? 'Text input' : 'Hex input'
  const outputLabel = mode === 'encode' ? 'Hex output' : 'Text output'
  const errorHeading = mode === 'encode' ? 'Could not encode' : 'Invalid hex'

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Hex actions">
          <button
            type="button"
            onClick={() => runAction('encode')}
            disabled={input.trim().length === 0}
            className={
              mode === 'encode'
                ? 'focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
                : 'focus-ring rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }
          >
            Encode
          </button>
          <button
            type="button"
            onClick={() => runAction('decode')}
            disabled={input.trim().length === 0}
            className={
              mode === 'decode'
                ? 'focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
                : 'focus-ring rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }
          >
            Decode
          </button>
        </div>

        {mode === 'encode' && (
          <>
            <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(event) => setUppercase(event.target.checked)}
                className="focus-ring h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
              />
              Uppercase
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={spaced}
                onChange={(event) => setSpaced(event.target.checked)}
                className="focus-ring h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
              />
              Space-separated
            </label>
          </>
        )}

        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
          <SwapIcon className="h-4 w-4 text-indigo-500" />
          {mode === 'encode' ? 'Text → Hex' : 'Hex → Text'}
        </span>
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> run &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy result &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="grid divide-y divide-slate-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-slate-800">
        {/* Input panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {mode === 'encode' ? 'Text' : 'Hex'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSample}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <HashIcon className="h-3.5 w-3.5" /> Sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={input.length === 0}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <TrashIcon className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            aria-label={inputLabel}
            placeholder={mode === 'encode' ? 'Type or paste text here…\n\nHello, world!' : 'Paste hex here…\n\n48 65 6c 6c 6f'}
            className="focus-ring h-72 w-full flex-1 resize-none border-0 bg-transparent px-4 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-inset lg:h-[24rem] dark:text-slate-100 dark:placeholder:text-slate-600"
          />

          <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
            {inputBytes.toLocaleString()} bytes
          </div>
        </div>

        {/* Output panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {mode === 'encode' ? 'Hex' : 'Text'}
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
                onClick={handleDownload}
                disabled={!result?.ok}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <DownloadIcon className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>

          <div className="h-72 flex-1 overflow-auto px-4 py-2 lg:h-[24rem]" role="region" aria-label={outputLabel}>
            {!result && (
              <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
                Run {mode === 'encode' ? 'Encode' : 'Decode'} to see the result here.
              </p>
            )}
            {result && !result.ok && <JsonErrorPanel error={result.error} heading={errorHeading} />}
            {result?.ok && (
              <pre className="font-mono text-sm break-words whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                {result.output}
              </pre>
            )}
          </div>

          {result?.ok && (
            <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
              <span>
                Input <span className="font-medium text-slate-700 dark:text-slate-300">{formatBytes(result.inputBytes)}</span>
              </span>
              <span className="ml-5">
                Output <span className="font-medium text-slate-700 dark:text-slate-300">{formatBytes(result.outputBytes)}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

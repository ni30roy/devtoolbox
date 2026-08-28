import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { decodeUrlComponent, encodeUrlComponent, type UrlResult } from '@/lib/url/urlEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { formatBytes } from '@/lib/format'
import { CopyIcon, DownloadIcon, FileJsonIcon, SwapIcon, TrashIcon } from '@/components/icons/Icons'

type Mode = 'encode' | 'decode'

const SAMPLE_TEXT = 'https://codetool.co.in/search?q=hello world&lang=हिन्दी'
const sampleEncoded = encodeUrlComponent(SAMPLE_TEXT)
const SAMPLE_ENCODED = sampleEncoded.ok ? sampleEncoded.output : ''

export function UrlWorkbench() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<UrlResult | null>(null)
  const [copied, setCopied] = useState(false)

  // A single encodeURIComponent/decodeURIComponent call is a linear pass
  // over the input — no realistic input size here would freeze the UI, so
  // (like the Base64 tool) this runs synchronously with no Web Worker.
  const runAction = useCallback(
    (action: Mode) => {
      setMode(action)
      setCopied(false)
      setResult(action === 'encode' ? encodeUrlComponent(input) : decodeUrlComponent(input))
    },
    [input],
  )

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setCopied(false)
  }, [])

  const handleSample = useCallback(() => {
    setInput(mode === 'encode' ? SAMPLE_TEXT : SAMPLE_ENCODED)
    setResult(null)
    setCopied(false)
  }, [mode])

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
    link.download = 'url-encoded.txt'
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
  const inputLabel = mode === 'encode' ? 'Text input' : 'URL-encoded input'
  const outputLabel = mode === 'encode' ? 'URL-encoded output' : 'Decoded text output'
  const errorHeading = mode === 'encode' ? 'Could not encode' : 'Invalid URL-encoded input'

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex flex-wrap gap-2" role="group" aria-label="URL encoding actions">
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

        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
          <SwapIcon className="h-4 w-4 text-indigo-500" />
          {mode === 'encode' ? 'Text → URL Encoded' : 'URL Encoded → Text'}
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
              {mode === 'encode' ? 'Text' : 'URL encoded'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSample}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <FileJsonIcon className="h-3.5 w-3.5" /> Sample
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
            placeholder={
              mode === 'encode'
                ? 'Type or paste text here…\n\nhello world'
                : 'Paste URL-encoded text here…\n\nhello%20world'
            }
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
              {mode === 'encode' ? 'URL encoded' : 'Text'}
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

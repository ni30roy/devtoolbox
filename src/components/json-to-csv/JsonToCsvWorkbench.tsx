import { useCallback, useMemo, useRef, useState } from 'react'
import { useJsonToCsvWorker } from '@/hooks/useJsonToCsvWorker'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { CsvResult } from '@/lib/json/jsonToCsv'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { formatBytes } from '@/lib/format'
import { CopyIcon, DownloadIcon, FileJsonIcon, TrashIcon, UploadIcon } from '@/components/icons/Icons'

const LARGE_INPUT_BYTES = 2 * 1024 * 1024 // 2 MB — above this we show a "this may take a moment" hint

const SAMPLE_JSON =
  '[{"name":"Ada Lovelace","role":"Engineer","active":true,"address":{"city":"London"}},{"name":"Alan Turing","role":"Researcher","active":false,"address":{"city":"Manchester"}}]'

export function JsonToCsvWorkbench() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CsvResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)

  const { run, busy } = useJsonToCsvWorker()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const runConvert = useCallback(async () => {
    setCopied(false)
    const outcome = await run(input)
    setResult(outcome)
  }, [input, run])

  const loadFile = useCallback(async (file: File) => {
    const text = await file.text()
    setInput(text)
    setFileName(file.name)
    setResult(null)
  }, [])

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) void loadFile(file)
      event.target.value = ''
    },
    [loadFile],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files?.[0]
      if (file) void loadFile(file)
    },
    [loadFile],
  )

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setFileName(null)
    setCopied(false)
  }, [])

  const handleSample = useCallback(() => {
    setInput(SAMPLE_JSON)
    setFileName(null)
    setResult(null)
    setCopied(false)
  }, [])

  const handleCopy = useCallback(async () => {
    if (!result?.ok) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [result])

  const handleDownload = useCallback(() => {
    if (!result?.ok) return
    const base = fileName ? fileName.replace(/\.json$/i, '') : 'json-to-csv'
    const blob = new Blob([result.output], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${base}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [result, fileName])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: () => void runConvert() },
        { combo: 'mod+shift+c', handler: () => void handleCopy() },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runConvert, handleCopy, handleClear],
    ),
  )

  const inputBytes = useMemo(() => new TextEncoder().encode(input).length, [input])
  const isLarge = inputBytes > LARGE_INPUT_BYTES
  const lineCount = useMemo(() => (input ? input.split('\n').length : 0), [input])

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => void runConvert()}
          disabled={busy || input.trim().length === 0}
          className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Convert to CSV
        </button>

        {busy && (
          <span className="text-xs text-slate-400" role="status">
            Processing…
          </span>
        )}
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> convert &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy result &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="grid divide-y divide-slate-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-slate-800">
        {/* Input panel */}
        <div
          className={`flex flex-col ${isDragging ? 'bg-indigo-50/70 dark:bg-indigo-500/10' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              JSON input
            </span>
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleFileInput}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />
              <button
                type="button"
                onClick={handleSample}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <FileJsonIcon className="h-3.5 w-3.5" /> Sample
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <UploadIcon className="h-3.5 w-3.5" /> Upload
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
            onChange={(event) => {
              setInput(event.target.value)
              setFileName(null)
            }}
            spellCheck={false}
            aria-label="JSON input"
            placeholder={'Paste a JSON array of objects here, drop a .json file, or click Upload…\n\n[\n  { "name": "Ada", "role": "Engineer" }\n]'}
            className="focus-ring h-80 w-full flex-1 resize-none border-0 bg-transparent px-4 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-inset lg:h-[28rem] dark:text-slate-100 dark:placeholder:text-slate-600"
          />

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
            <span>
              {lineCount.toLocaleString()} lines · {inputBytes.toLocaleString()} bytes
              {fileName ? ` · ${fileName}` : ''}
            </span>
            {isLarge && <span>Large input — processing runs in the background.</span>}
          </div>
        </div>

        {/* Output panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              CSV output
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

          <div
            className="h-80 flex-1 overflow-auto px-4 py-2 lg:h-[28rem]"
            role="region"
            aria-label="CSV output"
          >
            {!result && (
              <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
                Run Convert to CSV to see the result here.
              </p>
            )}
            {result && !result.ok && <JsonErrorPanel error={result.error} heading="Can't convert this JSON" />}
            {result?.ok && (
              <pre className="font-mono text-sm break-words whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                {result.output}
              </pre>
            )}
          </div>

          {result?.ok && (
            <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
              <span>
                Rows <span className="font-medium text-slate-700 dark:text-slate-300">{result.rowCount.toLocaleString()}</span>
              </span>
              <span className="ml-5">
                Columns <span className="font-medium text-slate-700 dark:text-slate-300">{result.columnCount.toLocaleString()}</span>
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

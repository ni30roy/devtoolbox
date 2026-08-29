import { useCallback, useMemo, useRef, useState } from 'react'
import { useJsMinifierWorker } from '@/hooks/useJsMinifierWorker'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { JsMinifyResult } from '@/lib/javascript/jsMinifier'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { JsonStats } from '@/components/json-tool/JsonStats'
import { CodeIcon, CopyIcon, DownloadIcon, TrashIcon, UploadIcon } from '@/components/icons/Icons'

const LARGE_INPUT_BYTES = 512 * 1024 // 512 KB — parsing/mangling is heavier than a plain text transform

const SAMPLE_JS = `function greet(name) {
  // Says hello to someone
  const message = "Hello, " + name + "!";
  console.log(message);
  return message;
}

class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {
    this.count += 1;
    return this.count;
  }
}
`

export function JsMinifierWorkbench() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<JsMinifyResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)

  const { run, busy } = useJsMinifierWorker()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const runMinify = useCallback(async () => {
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
    setInput(SAMPLE_JS)
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
    const base = fileName ? fileName.replace(/\.js$/i, '') : 'script'
    const blob = new Blob([result.output], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${base}.min.js`
    link.click()
    URL.revokeObjectURL(url)
  }, [result, fileName])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: () => void runMinify() },
        { combo: 'mod+shift+c', handler: () => void handleCopy() },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runMinify, handleCopy, handleClear],
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
          onClick={() => void runMinify()}
          disabled={busy || input.trim().length === 0}
          className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Minify JavaScript
        </button>

        {busy && (
          <span className="text-xs text-slate-400" role="status">
            Processing…
          </span>
        )}
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> minify &middot;{' '}
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
              JavaScript input
            </span>
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".js,.mjs,.cjs,text/javascript,text/plain"
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
                <CodeIcon className="h-3.5 w-3.5" /> Sample
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
            aria-label="JavaScript input"
            placeholder={'Paste JavaScript here, drop a .js file, or click Upload…\n\nfunction add(a, b) {\n  return a + b;\n}'}
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
              Minified JavaScript
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
            aria-label="Minified JavaScript output"
          >
            {!result && (
              <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
                Run Minify JavaScript to see the result here.
              </p>
            )}
            {result && !result.ok && <JsonErrorPanel error={result.error} heading="Can't minify this JavaScript" />}
            {result?.ok && (
              <pre className="font-mono text-sm break-words whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                {result.output}
              </pre>
            )}
          </div>

          {result?.ok && (
            <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800/60">
              <JsonStats inputBytes={result.inputBytes} outputBytes={result.outputBytes} showSavings />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

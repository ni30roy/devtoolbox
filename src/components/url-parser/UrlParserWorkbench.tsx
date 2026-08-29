import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { parseUrl, type UrlParseResult, type UrlParts } from '@/lib/urlParser/urlParserEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { CopyIcon, LinkIcon, TrashIcon } from '@/components/icons/Icons'

const SAMPLE_URL = 'https://user:pass@sub.example.com:8080/path/to/page?q=hello+world&tag=a%2Bb&tag=c#section'

interface PartRow {
  label: string
  value: string
}

function buildRows(parts: UrlParts): PartRow[] {
  return [
    { label: 'Protocol', value: parts.protocol },
    { label: 'Username', value: parts.username },
    { label: 'Password', value: parts.password },
    { label: 'Host', value: parts.host },
    { label: 'Hostname', value: parts.hostname },
    { label: 'Port', value: parts.port },
    { label: 'Pathname', value: parts.pathname },
    { label: 'Search', value: parts.search },
    { label: 'Hash', value: parts.hash },
    { label: 'Origin', value: parts.origin },
  ]
}

export function UrlParserWorkbench() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<UrlParseResult | null>(null)
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)

  const runParse = useCallback(() => {
    setCopiedLabel(null)
    setResult(parseUrl(input))
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setCopiedLabel(null)
  }, [])

  const handleSample = useCallback(() => {
    setInput(SAMPLE_URL)
    setResult(parseUrl(SAMPLE_URL))
    setCopiedLabel(null)
  }, [])

  const handleCopyRow = useCallback(async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedLabel(label)
    window.setTimeout(() => setCopiedLabel((current) => (current === label ? null : current)), 1800)
  }, [])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: runParse },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runParse, handleClear],
    ),
  )

  const rows = result?.ok ? buildRows(result.parts) : []

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={runParse}
          disabled={input.trim().length === 0}
          className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Parse
        </button>
        <button
          type="button"
          onClick={handleSample}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <LinkIcon className="h-3.5 w-3.5" /> Sample
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

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> parse &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="p-4">
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          URL input
        </label>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') runParse()
          }}
          spellCheck={false}
          aria-label="URL input"
          placeholder="https://example.com/path?query=value#hash"
          className="focus-ring mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-600"
        />

        {result && !result.ok && (
          <div className="mt-4">
            <JsonErrorPanel error={result.error} heading="Can't parse this URL" />
          </div>
        )}

        {result?.ok && (
          <div className="mt-4 space-y-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                    {row.label}
                  </div>
                  <div className="truncate font-mono text-sm text-slate-800 dark:text-slate-100">
                    {row.value.length > 0 ? row.value : <span className="text-slate-400 italic">(empty)</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyRow(row.label, row.value)}
                  disabled={row.value.length === 0}
                  className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <CopyIcon className="h-3.5 w-3.5" /> {copiedLabel === row.label ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}

            <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
              <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                Query parameters {result.parts.queryParams.length > 0 ? `(${result.parts.queryParams.length})` : ''}
              </div>
              {result.parts.queryParams.length === 0 ? (
                <p className="mt-1 text-sm text-slate-400 italic dark:text-slate-500">None</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {result.parts.queryParams.map((param) => (
                    <div key={param.key} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                        {param.key}
                      </span>
                      {param.values.map((value, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {value.length > 0 ? value : '(empty)'}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!result && (
          <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-600">
            Enter a URL above and click Parse to see its components.
          </p>
        )}
      </div>
    </div>
  )
}

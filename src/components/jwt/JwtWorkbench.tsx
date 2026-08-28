import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { decodeJwt, extractTimestampClaims, type JwtResult } from '@/lib/jwt/jwtEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { AlertCircleIcon, CopyIcon, DownloadIcon, FileJsonIcon, TrashIcon } from '@/components/icons/Icons'

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNvZGVUb29sIFVzZXIiLCJyb2xlIjoiZGV2ZWxvcGVyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5OTk5OTk5OTl9.dummysignature_for_demo_only'

function buildDownloadText(result: Extract<JwtResult, { ok: true }>): string {
  const claims = extractTimestampClaims(result.payload.json)
  const claimLines = claims.map((claim) => `${claim.label}: ${claim.formatted}${claim.isPast ? ' (in the past)' : ''}`)
  return [
    '=== HEADER (decoded, not verified) ===',
    result.header.pretty,
    '',
    '=== PAYLOAD (decoded, not verified) ===',
    result.payload.pretty,
    ...(claimLines.length > 0 ? ['', '=== TIMESTAMPS ==='] : []),
    ...claimLines,
    '',
    '=== SIGNATURE (raw, unverified) ===',
    result.signature,
  ].join('\n')
}

export function JwtWorkbench() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<JwtResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Splitting on "." and base64url-decoding two short strings is trivial —
  // no worker needed, this always finishes well under a millisecond.
  const runDecode = useCallback(() => {
    setCopied(false)
    setResult(decodeJwt(input))
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setCopied(false)
  }, [])

  const handleSample = useCallback(() => {
    setInput(SAMPLE_JWT)
    setResult(null)
    setCopied(false)
  }, [])

  const handleCopy = useCallback(async () => {
    if (!result?.ok) return
    await navigator.clipboard.writeText(result.payload.pretty)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [result])

  const handleDownload = useCallback(() => {
    if (!result?.ok) return
    const blob = new Blob([buildDownloadText(result)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'jwt-decoded.txt'
    link.click()
    URL.revokeObjectURL(url)
  }, [result])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: runDecode },
        { combo: 'mod+shift+c', handler: () => void handleCopy() },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runDecode, handleCopy, handleClear],
    ),
  )

  const timestampClaims = result?.ok ? extractTimestampClaims(result.payload.json) : []

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={runDecode}
          disabled={input.trim().length === 0}
          className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Decode
        </button>
        <button
          type="button"
          onClick={handleSample}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <FileJsonIcon className="h-3.5 w-3.5" /> Sample
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={input.length === 0}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <TrashIcon className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> decode &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy payload &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      {/* Input */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            JWT
          </span>
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          aria-label="JWT input"
          placeholder="Paste a JWT here (header.payload.signature)…"
          className="focus-ring h-28 w-full resize-none border-0 bg-transparent px-4 py-2 font-mono text-sm break-all text-slate-800 placeholder:text-slate-400 focus-visible:ring-inset dark:text-slate-100 dark:placeholder:text-slate-600"
        />
      </div>

      {/* Results */}
      <div className="p-4">
        {!result && <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-600">Run Decode to see the result here.</p>}

        {result && !result.ok && <JsonErrorPanel error={result.error} heading="Invalid JWT" />}

        {result?.ok && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This only decodes the token — it does <strong>not</strong> verify the signature. Anyone can read a
                JWT's header and payload without a key, and this tool cannot confirm the token is genuine, unmodified,
                or was issued by anyone in particular.
              </p>
            </div>

            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <CopyIcon className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy payload'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <DownloadIcon className="h-3.5 w-3.5" /> Download
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div role="region" aria-label="Decoded header" className="rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="border-b border-slate-200 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                  Header
                </p>
                <pre className="overflow-x-auto p-3 font-mono text-sm text-slate-800 dark:text-slate-100">
                  {result.header.pretty}
                </pre>
              </div>
              <div role="region" aria-label="Decoded payload" className="rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="border-b border-slate-200 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                  Payload
                </p>
                <pre className="overflow-x-auto p-3 font-mono text-sm text-slate-800 dark:text-slate-100">
                  {result.payload.pretty}
                </pre>
              </div>
            </div>

            {timestampClaims.length > 0 && (
              <div role="region" aria-label="Timestamp claims" className="rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="border-b border-slate-200 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                  Timestamps
                </p>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {timestampClaims.map((claim) => (
                    <li key={claim.label} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{claim.label}</span>
                      <span className="font-mono text-slate-800 dark:text-slate-100">
                        {claim.formatted}
                        {claim.isPast && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-sans text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            in the past
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div role="region" aria-label="Signature (not verified)" className="rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="border-b border-slate-200 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                Signature (not verified)
              </p>
              <p className="overflow-x-auto p-3 font-mono text-sm break-all text-slate-800 dark:text-slate-100">
                {result.signature}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

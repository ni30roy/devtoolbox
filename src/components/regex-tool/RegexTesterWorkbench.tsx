import { useCallback, useMemo, useRef, useState } from 'react'
import { useRegexWorker } from '@/hooks/useRegexWorker'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { RegexResult } from '@/lib/regex/regexEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { CopyIcon, RegexIcon, TrashIcon } from '@/components/icons/Icons'

const FLAG_OPTIONS: { flag: string; label: string; title: string }[] = [
  { flag: 'g', label: 'g', title: 'Global — find all matches, not just the first' },
  { flag: 'i', label: 'i', title: 'Case insensitive' },
  { flag: 'm', label: 'm', title: 'Multiline — ^ and $ match at line breaks' },
  { flag: 's', label: 's', title: 'Dot all — . also matches newlines' },
  { flag: 'u', label: 'u', title: 'Unicode — treat the pattern as a sequence of code points' },
]

const SAMPLE_PATTERN = '(\\w+)@(\\w+)\\.(\\w+)'
const SAMPLE_FLAGS = 'g'
const SAMPLE_TEXT = 'Contact us at support@codetool.co.in or sales@codetool.co.in for help.'

// A worker call can legitimately take up to the worker's own timeout to
// come back (e.g. a catastrophically-backtracking pattern). Debouncing
// keeps a burst of keystrokes from queuing up that many overlapping
// slow calls, and the sequence guard below makes sure that if one does
// still arrive late, it can't clobber a newer, already-displayed result.
const LIVE_MATCH_DEBOUNCE_MS = 200

export function RegexTesterWorkbench() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [result, setResult] = useState<RegexResult | null>(null)
  const [copied, setCopied] = useState(false)

  const { run, busy } = useRegexWorker()
  const requestSeqRef = useRef(0)
  const debounceRef = useRef<number | undefined>(undefined)

  const runTest = useCallback(
    async (nextPattern: string, nextFlags: string, nextTestString: string) => {
      const seq = ++requestSeqRef.current
      setCopied(false)
      if (nextPattern.length === 0) {
        setResult(null)
        return
      }
      const outcome = await run(nextPattern, nextFlags, nextTestString)
      // Discard this answer if a newer request has since been issued.
      if (seq === requestSeqRef.current) setResult(outcome)
    },
    [run],
  )

  // Live re-test triggered directly from whichever input changed — not a
  // derived useEffect — so each keystroke ties straight to the async
  // worker call that answers it, debounced so rapid typing collapses
  // into one call once typing pauses.
  const scheduleRun = useCallback(
    (nextPattern: string, nextFlags: string, nextTestString: string) => {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = window.setTimeout(() => {
        void runTest(nextPattern, nextFlags, nextTestString)
      }, LIVE_MATCH_DEBOUNCE_MS)
    },
    [runTest],
  )

  const handlePatternChange = useCallback(
    (value: string) => {
      setPattern(value)
      scheduleRun(value, flags, testString)
    },
    [flags, testString, scheduleRun],
  )

  const toggleFlag = useCallback(
    (flag: string) => {
      const nextFlags = flags.includes(flag) ? flags.replace(flag, '') : flags + flag
      setFlags(nextFlags)
      scheduleRun(pattern, nextFlags, testString)
    },
    [flags, pattern, testString, scheduleRun],
  )

  const handleTestStringChange = useCallback(
    (value: string) => {
      setTestString(value)
      scheduleRun(pattern, flags, value)
    },
    [pattern, flags, scheduleRun],
  )

  const handleClear = useCallback(() => {
    window.clearTimeout(debounceRef.current)
    setPattern('')
    setTestString('')
    setResult(null)
    setCopied(false)
    requestSeqRef.current++
  }, [])

  const handleSample = useCallback(() => {
    window.clearTimeout(debounceRef.current)
    setPattern(SAMPLE_PATTERN)
    setFlags(SAMPLE_FLAGS)
    setTestString(SAMPLE_TEXT)
    setCopied(false)
    void runTest(SAMPLE_PATTERN, SAMPLE_FLAGS, SAMPLE_TEXT)
  }, [runTest])

  const handleCopyMatches = useCallback(async () => {
    if (!result?.ok || result.matches.length === 0) return
    await navigator.clipboard.writeText(result.matches.map((m) => m.match).join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [result])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+shift+c', handler: () => void handleCopyMatches() },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [handleCopyMatches, handleClear],
    ),
  )

  const highlightRef = useRef<HTMLDivElement>(null)

  const syncHighlightScroll = useCallback((event: React.UIEvent<HTMLTextAreaElement>) => {
    if (!highlightRef.current) return
    highlightRef.current.scrollTop = event.currentTarget.scrollTop
    highlightRef.current.scrollLeft = event.currentTarget.scrollLeft
  }, [])

  const highlightedSegments = useMemo(() => {
    if (!result?.ok || result.matches.length === 0 || testString.length === 0) {
      return [{ text: testString, isMatch: false }]
    }
    const segments: { text: string; isMatch: boolean }[] = []
    let cursor = 0
    for (const m of result.matches) {
      if (m.index > cursor) segments.push({ text: testString.slice(cursor, m.index), isMatch: false })
      if (m.match.length > 0) segments.push({ text: m.match, isMatch: true })
      cursor = m.index + m.match.length
    }
    if (cursor < testString.length) segments.push({ text: testString.slice(cursor), isMatch: false })
    return segments
  }, [result, testString])

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Pattern toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex min-w-[16rem] flex-1 items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-800">
          <span className="text-slate-400">/</span>
          <input
            value={pattern}
            onChange={(event) => handlePatternChange(event.target.value)}
            spellCheck={false}
            aria-label="Regular expression pattern"
            placeholder="pattern"
            className="focus-ring min-w-0 flex-1 border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600"
          />
          <span className="text-slate-400">/{flags}</span>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Regex flags">
          {FLAG_OPTIONS.map(({ flag, label, title }) => (
            <button
              key={flag}
              type="button"
              title={title}
              onClick={() => toggleFlag(flag)}
              className={
                flags.includes(flag)
                  ? 'focus-ring h-8 w-8 rounded-md bg-indigo-600 font-mono text-sm font-semibold text-white'
                  : 'focus-ring h-8 w-8 rounded-md border border-slate-300 font-mono text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSample}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <RegexIcon className="h-3.5 w-3.5" /> Sample
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={pattern.length === 0 && testString.length === 0}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <TrashIcon className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

        {busy && (
          <span className="text-xs text-slate-400" role="status">
            Matching…
          </span>
        )}
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Matches update as you type &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy matches
        &middot; <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="grid divide-y divide-slate-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-slate-800">
        {/* Test string input, with highlighted overlay */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Test string
            </span>
          </div>

          {result && !result.ok ? (
            <div className="h-80 flex-1 overflow-auto px-4 py-2 lg:h-[28rem]">
              <JsonErrorPanel error={result.error} heading="Can't run this pattern" />
            </div>
          ) : (
            <div className="relative h-80 flex-1 lg:h-[28rem]">
              <div
                ref={highlightRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-auto px-4 py-2 font-mono text-sm break-words whitespace-pre-wrap text-slate-800 dark:text-slate-100"
              >
                {highlightedSegments.map((segment, i) =>
                  segment.isMatch ? (
                    <mark
                      key={i}
                      className="rounded-sm bg-amber-200/70 text-slate-900 dark:bg-amber-500/40 dark:text-slate-50"
                    >
                      {segment.text}
                    </mark>
                  ) : (
                    <span key={i}>{segment.text}</span>
                  ),
                )}
              </div>
              <textarea
                value={testString}
                onChange={(event) => handleTestStringChange(event.target.value)}
                onScroll={syncHighlightScroll}
                spellCheck={false}
                aria-label="Test string"
                placeholder="Paste or type text to test your pattern against…"
                className="focus-ring absolute inset-0 h-full w-full resize-none border-0 bg-transparent px-4 py-2 font-mono text-sm text-transparent caret-slate-800 placeholder:text-slate-400 focus-visible:ring-inset dark:caret-slate-100 dark:placeholder:text-slate-600"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
            <span>{testString.length.toLocaleString()} characters</span>
          </div>
        </div>

        {/* Matches panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Matches {result?.ok ? `(${result.matchCount})` : ''}
            </span>
            <button
              type="button"
              onClick={() => void handleCopyMatches()}
              disabled={!result?.ok || result.matches.length === 0}
              className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <CopyIcon className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="h-80 flex-1 overflow-auto px-4 py-2 lg:h-[28rem]" role="region" aria-label="Matches">
            {pattern.length === 0 && (
              <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
                Enter a pattern to see matches here.
              </p>
            )}
            {pattern.length > 0 && result?.ok && result.matches.length === 0 && (
              <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">No matches.</p>
            )}
            {result?.ok && result.matches.length > 0 && (
              <ol className="space-y-2">
                {result.matches.map((m, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-slate-200 p-2.5 font-mono text-sm dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="break-all text-slate-800 dark:text-slate-100">
                        {m.match.length > 0 ? m.match : <span className="text-slate-400 italic">(empty match)</span>}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">at {m.index}</span>
                    </div>
                    {m.groups.length > 0 && (
                      <div className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5 text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
                        {m.groups.map((g, gi) => (
                          <div key={gi}>
                            Group {gi + 1}: <span className="text-slate-700 dark:text-slate-300">{g ?? '(undefined)'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.namedGroups && Object.keys(m.namedGroups).length > 0 && (
                      <div className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5 text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
                        {Object.entries(m.namedGroups).map(([name, value]) => (
                          <div key={name}>
                            {name}: <span className="text-slate-700 dark:text-slate-300">{value ?? '(undefined)'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

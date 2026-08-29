import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { generateLoremIpsum, MAX_COUNT, MIN_COUNT, type LoremMode } from '@/lib/loremIpsum/loremIpsumEngine'
import { CopyIcon, DownloadIcon, SparklesIcon, TrashIcon } from '@/components/icons/Icons'

const MODE_LABEL: Record<LoremMode, string> = {
  words: 'Words',
  sentences: 'Sentences',
  paragraphs: 'Paragraphs',
}

const DEFAULT_COUNT: Record<LoremMode, number> = {
  words: 50,
  sentences: 5,
  paragraphs: 3,
}

export function LoremIpsumWorkbench() {
  const [mode, setMode] = useState<LoremMode>('paragraphs')
  const [count, setCount] = useState(DEFAULT_COUNT.paragraphs)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleModeChange = useCallback((nextMode: LoremMode) => {
    setMode(nextMode)
    setCount(DEFAULT_COUNT[nextMode])
  }, [])

  const handleGenerate = useCallback(() => {
    setCopied(false)
    setOutput(generateLoremIpsum(mode, count, startWithLorem))
  }, [mode, count, startWithLorem])

  const handleClear = useCallback(() => {
    setOutput('')
    setCopied(false)
  }, [])

  const handleCopy = useCallback(async () => {
    if (output.length === 0) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [output])

  const handleDownload = useCallback(() => {
    if (output.length === 0) return
    const blob = new Blob([output + '\n'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lorem-ipsum.txt'
    link.click()
    URL.revokeObjectURL(url)
  }, [output])

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

        <div className="flex flex-wrap gap-2" role="group" aria-label="Lorem ipsum unit">
          {(['paragraphs', 'sentences', 'words'] as LoremMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={
                mode === m
                  ? 'focus-ring rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500'
                  : 'focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          How many
          <input
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={(event) => setCount(Number(event.target.value) || MIN_COUNT)}
            aria-label={`Number of ${mode} to generate`}
            className="focus-ring w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(event) => setStartWithLorem(event.target.checked)}
            className="focus-ring h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
          />
          Start with "Lorem ipsum…"
        </label>
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> generate &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Result
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClear}
            disabled={output.length === 0}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <TrashIcon className="h-3.5 w-3.5" /> Clear
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={output.length === 0}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <CopyIcon className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={output.length === 0}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <DownloadIcon className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>

      <div role="region" aria-label="Generated Lorem Ipsum text" className="min-h-32 px-4 pb-4">
        {output.length === 0 ? (
          <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
            <SparklesIcon className="mx-auto mb-2 h-5 w-5 text-slate-300 dark:text-slate-700" />
            Click Generate to create placeholder text.
          </p>
        ) : (
          <div className="space-y-3 text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-100">{output}</div>
        )}
      </div>
    </div>
  )
}

import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import { convertColor, type ColorFormats, type ColorResult } from '@/lib/color/colorEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { CopyIcon, PaletteIcon, TrashIcon } from '@/components/icons/Icons'

const SAMPLE_COLOR = '#3b82f6'

interface FormatRow {
  label: string
  value: string
}

function buildRows(formats: ColorFormats): FormatRow[] {
  return [
    { label: 'HEX', value: formats.hex },
    { label: 'RGB', value: formats.rgb },
    { label: 'HSL', value: formats.hsl },
    { label: 'HSB / HSV', value: formats.hsb },
    { label: 'CMYK', value: formats.cmyk },
  ]
}

export function ColorConverterWorkbench() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ColorResult | null>(null)
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)

  const runConvert = useCallback(() => {
    setCopiedLabel(null)
    setResult(convertColor(input))
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setCopiedLabel(null)
  }, [])

  const handleSample = useCallback(() => {
    setInput(SAMPLE_COLOR)
    setResult(convertColor(SAMPLE_COLOR))
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
        { combo: 'mod+enter', handler: runConvert },
        { combo: 'mod+shift+x', handler: handleClear },
      ],
      [runConvert, handleClear],
    ),
  )

  const rows = result?.ok ? buildRows(result.formats) : []
  const swatchColor = result?.ok
    ? `rgba(${result.formats.rgba.r}, ${result.formats.rgba.g}, ${result.formats.rgba.b}, ${result.formats.rgba.a})`
    : undefined

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={runConvert}
          disabled={input.trim().length === 0}
          className="focus-ring rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Convert
        </button>
        <button
          type="button"
          onClick={handleSample}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <PaletteIcon className="h-3.5 w-3.5" /> Sample
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
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> convert &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + X</kbd> clear
      </p>

      <div className="p-4">
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Color input
        </label>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') runConvert()
          }}
          spellCheck={false}
          aria-label="Color input"
          placeholder="#3b82f6, rgb(59, 130, 246), or hsl(217, 91%, 60%)"
          className="focus-ring mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-600"
        />

        {result && !result.ok && (
          <div className="mt-4">
            <JsonErrorPanel error={result.error} heading="Can't recognize this color" />
          </div>
        )}

        {result?.ok && (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div
              className="h-32 w-32 shrink-0 self-start rounded-xl border border-slate-200 shadow-inner dark:border-slate-700"
              style={{
                backgroundImage:
                  'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%)',
                backgroundSize: '16px 16px',
              }}
              role="img"
              aria-label={`Color swatch preview: ${swatchColor}`}
            >
              <div className="h-full w-full rounded-xl" style={{ backgroundColor: swatchColor }} />
            </div>

            <div className="flex-1 space-y-2">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                      {row.label}
                    </div>
                    <div className="truncate font-mono text-sm text-slate-800 dark:text-slate-100">{row.value}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopyRow(row.label, row.value)}
                    className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    <CopyIcon className="h-3.5 w-3.5" /> {copiedLabel === row.label ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && (
          <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-600">
            Enter a color above and click Convert to see it in every format.
          </p>
        )}
      </div>
    </div>
  )
}

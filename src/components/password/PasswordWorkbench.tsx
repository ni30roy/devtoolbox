import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from '@/hooks/useHotkeys'
import {
  DEFAULT_LENGTH,
  generatePassword,
  MAX_LENGTH,
  MIN_LENGTH,
  type PasswordOptions,
  type PasswordResult,
} from '@/lib/password/passwordEngine'
import { JsonErrorPanel } from '@/components/json-tool/JsonErrorPanel'
import { CopyIcon, LockIcon } from '@/components/icons/Icons'

type CharsetKey = 'lowercase' | 'uppercase' | 'digits' | 'symbols'

const CHARSET_TOGGLES: { key: CharsetKey; label: string }[] = [
  { key: 'lowercase', label: 'Lowercase (a-z)' },
  { key: 'uppercase', label: 'Uppercase (A-Z)' },
  { key: 'digits', label: 'Numbers (0-9)' },
  { key: 'symbols', label: 'Symbols (!@#$…)' },
]

function strengthLabel(entropyBits: number): { text: string; className: string } {
  if (entropyBits < 40) return { text: 'Weak', className: 'text-red-600 dark:text-red-400' }
  if (entropyBits < 60) return { text: 'Fair', className: 'text-amber-600 dark:text-amber-400' }
  if (entropyBits < 80) return { text: 'Good', className: 'text-emerald-600 dark:text-emerald-400' }
  return { text: 'Strong', className: 'text-emerald-700 dark:text-emerald-300' }
}

export function PasswordWorkbench() {
  const [length, setLength] = useState(DEFAULT_LENGTH)
  const [lowercase, setLowercase] = useState(true)
  const [uppercase, setUppercase] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [result, setResult] = useState<PasswordResult | null>(null)
  const [copied, setCopied] = useState(false)

  const options: PasswordOptions = useMemo(
    () => ({ length, lowercase, uppercase, digits, symbols, excludeAmbiguous }),
    [length, lowercase, uppercase, digits, symbols, excludeAmbiguous],
  )

  const toggles: Record<CharsetKey, [boolean, (value: boolean) => void]> = {
    lowercase: [lowercase, setLowercase],
    uppercase: [uppercase, setUppercase],
    digits: [digits, setDigits],
    symbols: [symbols, setSymbols],
  }

  const handleGenerate = useCallback(() => {
    setCopied(false)
    setResult(generatePassword(options))
  }, [options])

  const handleCopy = useCallback(async () => {
    if (!result?.ok) return
    await navigator.clipboard.writeText(result.password)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [result])

  useHotkeys(
    useMemo(
      () => [
        { combo: 'mod+enter', handler: handleGenerate },
        { combo: 'mod+shift+c', handler: () => void handleCopy() },
      ],
      [handleGenerate, handleCopy],
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
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <LockIcon className="h-3.5 w-3.5" /> Uses crypto.getRandomValues() — never Math.random()
        </span>
      </div>

      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        Shortcuts: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Enter</kbd> generate &middot;{' '}
        <kbd className="rounded border border-slate-300 px-1 dark:border-slate-700">Ctrl/Cmd + Shift + C</kbd> copy
      </p>

      <div className="grid gap-6 p-4 lg:grid-cols-2">
        {/* Options panel */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Length
              <span className="font-mono text-sm text-slate-700 normal-case dark:text-slate-300">{length}</span>
            </label>
            <input
              type="range"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              aria-label="Password length"
              className="focus-ring mt-2 w-full accent-indigo-600"
            />
          </div>

          <div className="space-y-2">
            {CHARSET_TOGGLES.map(({ key, label }) => {
              const [checked, setChecked] = toggles[key]
              return (
                <label key={key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                    className="focus-ring h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
                  />
                  {label}
                </label>
              )
            })}
            <label className="flex items-center gap-2 border-t border-slate-100 pt-2 text-sm text-slate-700 dark:border-slate-800/60 dark:text-slate-300">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={(event) => setExcludeAmbiguous(event.target.checked)}
                className="focus-ring h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
              />
              Exclude ambiguous characters (l, I, O, 0, 1)
            </label>
          </div>
        </div>

        {/* Output panel */}
        <div>
          {!result && (
            <p className="pt-8 text-center text-sm text-slate-400 dark:text-slate-600">
              Click Generate to create a password.
            </p>
          )}
          {result && !result.ok && <JsonErrorPanel error={result.error} heading="Can't generate a password" />}
          {result?.ok && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-3 dark:border-slate-800">
                <span className="min-w-0 flex-1 truncate font-mono text-base text-slate-800 dark:text-slate-100">
                  {result.password}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <CopyIcon className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {(() => {
                const strength = strengthLabel(result.entropyBits)
                return (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Strength <span className={`font-medium ${strength.className}`}>{strength.text}</span>
                    </span>
                    <span>
                      Entropy <span className="font-medium text-slate-700 dark:text-slate-300">{result.entropyBits} bits</span>
                    </span>
                    <span>
                      Charset <span className="font-medium text-slate-700 dark:text-slate-300">{result.charsetSize} characters</span>
                    </span>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

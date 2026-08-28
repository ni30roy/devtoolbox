import { AlertCircleIcon } from '@/components/icons/Icons'
import type { JsonErrorInfo } from '@/lib/json/jsonEngine'

interface JsonErrorPanelProps {
  error: JsonErrorInfo
  /** Override the heading for non-JSON callers (e.g. "Invalid Base64"). */
  heading?: string
}

export function JsonErrorPanel({ error, heading = 'Invalid JSON' }: JsonErrorPanelProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{heading}</p>
          <p className="mt-0.5 break-words">{error.message}</p>
          {error.line !== undefined && (
            <p className="mt-1 font-mono text-xs text-red-700 dark:text-red-400">
              Line {error.line}, column {error.column}
            </p>
          )}
          {error.snippet && (
            <pre className="mt-2 overflow-x-auto rounded-md bg-red-100/70 p-2.5 font-mono text-xs leading-relaxed whitespace-pre text-red-900 dark:bg-red-900/30 dark:text-red-200">
              {error.snippet}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

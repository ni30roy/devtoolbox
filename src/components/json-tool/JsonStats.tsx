import { formatBytes } from '@/lib/format'
import type { JsonAction } from '@/lib/json/jsonEngine'

interface JsonStatsProps {
  inputBytes: number
  outputBytes: number
  action: JsonAction
}

export function JsonStats({ inputBytes, outputBytes, action }: JsonStatsProps) {
  const delta = inputBytes - outputBytes
  const pct = inputBytes > 0 ? Math.round((delta / inputBytes) * 100) : 0

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      <span>
        Input <span className="font-medium text-slate-700 dark:text-slate-300">{formatBytes(inputBytes)}</span>
      </span>
      <span>
        Output <span className="font-medium text-slate-700 dark:text-slate-300">{formatBytes(outputBytes)}</span>
      </span>
      {action === 'minify' && delta > 0 && (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {pct}% smaller ({formatBytes(delta)} saved)
        </span>
      )}
    </div>
  )
}

import { useMemo } from 'react'
import { ToolGrid } from './ToolGrid'
import { tools } from '@/lib/tools/toolsData'
import { ClockIcon } from '@/components/icons/Icons'

const RECENT_COUNT = 3

export function RecentTools() {
  const recent = useMemo(
    () => [...tools].sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1)).slice(0, RECENT_COUNT),
    [],
  )
  if (recent.length === 0) return null

  return (
    <section aria-labelledby="recent-heading" className="border-t border-slate-200 py-14 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-indigo-500" />
        <h2 id="recent-heading" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Recently added
        </h2>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Freshly shipped, ready to use.</p>
      <div className="mt-6">
        <ToolGrid tools={recent} />
      </div>
    </section>
  )
}

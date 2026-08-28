import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/icons/Icons'
import { toolIcons } from '@/lib/tools/toolIcons'
import { getCategoryById } from '@/lib/tools/toolsData'
import type { ToolMeta } from '@/lib/tools/types'

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = toolIcons[tool.workbench]
  const category = getCategoryById(tool.categoryId)

  return (
    <Link
      to={`/tools/${tool.slug}/`}
      className="focus-ring group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icon className="h-5 w-5" />
        </span>
        {tool.popular && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
            Popular
          </span>
        )}
      </div>

      <h3 className="mt-3.5 text-base font-semibold text-slate-900 dark:text-white">{tool.name}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{tool.tagline}</p>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-slate-400 dark:text-slate-500">{category?.name}</span>
        <span className="inline-flex items-center gap-1 font-medium text-indigo-600 group-hover:gap-1.5 dark:text-indigo-400">
          Open <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

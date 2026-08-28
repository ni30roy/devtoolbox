import { ToolGrid } from './ToolGrid'
import { tools } from '@/lib/tools/toolsData'
import { FlameIcon } from '@/components/icons/Icons'

export function PopularTools() {
  const popular = tools.filter((tool) => tool.popular)
  if (popular.length === 0) return null

  return (
    <section aria-labelledby="popular-heading" className="border-t border-slate-200 py-14 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <FlameIcon className="h-5 w-5 text-amber-500" />
        <h2 id="popular-heading" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Popular tools
        </h2>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The tools developers reach for most.</p>
      <div className="mt-6">
        <ToolGrid tools={popular} />
      </div>
    </section>
  )
}

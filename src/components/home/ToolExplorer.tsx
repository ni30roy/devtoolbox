import { useMemo, useState } from 'react'
import { ToolSearch } from './ToolSearch'
import { CategoryFilter, type CategoryFilterValue } from './CategoryFilter'
import { ToolGrid } from './ToolGrid'
import { categories, tools } from '@/lib/tools/toolsData'

export function ToolExplorer() {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<CategoryFilterValue>('all')

  const availableCategories = useMemo(
    () => categories.filter((category) => tools.some((tool) => tool.categoryId === category.id)),
    [],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tools.filter((tool) => {
      if (categoryId !== 'all' && tool.categoryId !== categoryId) return false
      if (!q) return true
      const haystack = `${tool.name} ${tool.tagline} ${tool.keywords.join(' ')}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [query, categoryId])

  return (
    <section id="tools" aria-labelledby="all-tools-heading" className="scroll-mt-24 py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="all-tools-heading" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Browse all tools
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {tools.length} tool{tools.length === 1 ? '' : 's'} and counting.
          </p>
        </div>
        <ToolSearch value={query} onChange={setQuery} />
      </div>

      <div className="mt-5">
        <CategoryFilter categories={availableCategories} active={categoryId} onChange={setCategoryId} />
      </div>

      <div className="mt-6">
        {filtered.length > 0 ? (
          <ToolGrid tools={filtered} />
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No tools match &ldquo;{query}&rdquo;. Try a different search or category.
          </p>
        )}
      </div>
    </section>
  )
}

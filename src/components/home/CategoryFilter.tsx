import type { ToolCategory, ToolCategoryId } from '@/lib/tools/types'

export type CategoryFilterValue = 'all' | ToolCategoryId

interface CategoryFilterProps {
  categories: ToolCategory[]
  active: CategoryFilterValue
  onChange: (value: CategoryFilterValue) => void
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tools by category">
      <CategoryPill label="All" selected={active === 'all'} onClick={() => onChange('all')} />
      {categories.map((category) => (
        <CategoryPill
          key={category.id}
          label={category.name}
          selected={active === category.id}
          onClick={() => onChange(category.id)}
        />
      ))}
    </div>
  )
}

function CategoryPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        selected
          ? 'focus-ring rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white'
          : 'focus-ring rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
      }
    >
      {label}
    </button>
  )
}

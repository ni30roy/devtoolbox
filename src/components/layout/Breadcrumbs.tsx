import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@/components/icons/Icons'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />}
            {item.to ? (
              <Link to={item.to} className="focus-ring rounded hover:text-indigo-600 dark:hover:text-indigo-400">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

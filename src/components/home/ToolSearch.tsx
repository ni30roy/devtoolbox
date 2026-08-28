import { SearchIcon } from '@/components/icons/Icons'

interface ToolSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ToolSearch({ value, onChange }: ToolSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search tools…"
        aria-label="Search tools"
        className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  )
}

import { ToolCard } from './ToolCard'
import type { ToolMeta } from '@/lib/tools/types'

export function ToolGrid({ tools }: { tools: ToolMeta[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.slug}>
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  )
}

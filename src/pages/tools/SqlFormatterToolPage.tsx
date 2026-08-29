import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { SqlFormatterWorkbench } from '@/components/sql-tool/SqlFormatterWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function SqlFormatterToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <SqlFormatterWorkbench />
    </ToolPageLayout>
  )
}

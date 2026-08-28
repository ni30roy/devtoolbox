import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { JsonWorkbench } from '@/components/json-tool/JsonWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function JsonToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <JsonWorkbench mode={tool.jsonMode ?? 'format'} />
    </ToolPageLayout>
  )
}

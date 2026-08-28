import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { JsonToCsvWorkbench } from '@/components/json-to-csv/JsonToCsvWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function JsonToCsvToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <JsonToCsvWorkbench />
    </ToolPageLayout>
  )
}

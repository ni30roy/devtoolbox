import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { JsonToYamlWorkbench } from '@/components/json-to-yaml/JsonToYamlWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function JsonToYamlToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <JsonToYamlWorkbench />
    </ToolPageLayout>
  )
}

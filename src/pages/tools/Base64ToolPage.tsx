import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { Base64Workbench } from '@/components/base64/Base64Workbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function Base64ToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <Base64Workbench />
    </ToolPageLayout>
  )
}

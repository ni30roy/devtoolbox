import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { UuidWorkbench } from '@/components/uuid/UuidWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function UuidToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <UuidWorkbench />
    </ToolPageLayout>
  )
}

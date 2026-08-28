import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { HashWorkbench } from '@/components/hash/HashWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function HashToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <HashWorkbench />
    </ToolPageLayout>
  )
}

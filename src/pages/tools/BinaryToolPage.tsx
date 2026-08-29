import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { BinaryWorkbench } from '@/components/binary/BinaryWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function BinaryToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <BinaryWorkbench />
    </ToolPageLayout>
  )
}

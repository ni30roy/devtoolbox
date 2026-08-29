import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { HexWorkbench } from '@/components/hex/HexWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function HexToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <HexWorkbench />
    </ToolPageLayout>
  )
}

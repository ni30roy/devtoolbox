import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { LoremIpsumWorkbench } from '@/components/lorem-ipsum/LoremIpsumWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function LoremIpsumToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <LoremIpsumWorkbench />
    </ToolPageLayout>
  )
}

import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { RandomNumberWorkbench } from '@/components/random-number/RandomNumberWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function RandomNumberToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <RandomNumberWorkbench />
    </ToolPageLayout>
  )
}

import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { ColorConverterWorkbench } from '@/components/color-tool/ColorConverterWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function ColorConverterToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <ColorConverterWorkbench />
    </ToolPageLayout>
  )
}

import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { CssWorkbench } from '@/components/css-tool/CssWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function CssToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <CssWorkbench mode={tool.cssMode ?? 'format'} />
    </ToolPageLayout>
  )
}

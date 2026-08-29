import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { JsMinifierWorkbench } from '@/components/javascript-tool/JsMinifierWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function JsMinifierToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <JsMinifierWorkbench />
    </ToolPageLayout>
  )
}

import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { HtmlEntityWorkbench } from '@/components/html-entity/HtmlEntityWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function HtmlEntityToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <HtmlEntityWorkbench />
    </ToolPageLayout>
  )
}

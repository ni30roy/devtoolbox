import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { HtmlFormatterWorkbench } from '@/components/html-tool/HtmlFormatterWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function HtmlFormatterToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <HtmlFormatterWorkbench />
    </ToolPageLayout>
  )
}

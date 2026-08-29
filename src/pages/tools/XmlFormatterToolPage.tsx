import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { XmlFormatterWorkbench } from '@/components/xml-tool/XmlFormatterWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function XmlFormatterToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <XmlFormatterWorkbench />
    </ToolPageLayout>
  )
}

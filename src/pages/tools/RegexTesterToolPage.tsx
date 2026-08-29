import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { RegexTesterWorkbench } from '@/components/regex-tool/RegexTesterWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function RegexTesterToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <RegexTesterWorkbench />
    </ToolPageLayout>
  )
}

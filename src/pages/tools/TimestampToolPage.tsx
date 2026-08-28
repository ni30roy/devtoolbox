import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { TimestampWorkbench } from '@/components/timestamp/TimestampWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function TimestampToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <TimestampWorkbench />
    </ToolPageLayout>
  )
}

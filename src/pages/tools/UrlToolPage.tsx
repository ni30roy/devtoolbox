import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { UrlWorkbench } from '@/components/url/UrlWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function UrlToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <UrlWorkbench />
    </ToolPageLayout>
  )
}

import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { UrlParserWorkbench } from '@/components/url-parser/UrlParserWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function UrlParserToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <UrlParserWorkbench />
    </ToolPageLayout>
  )
}

import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { JwtWorkbench } from '@/components/jwt/JwtWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function JwtToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <JwtWorkbench />
    </ToolPageLayout>
  )
}

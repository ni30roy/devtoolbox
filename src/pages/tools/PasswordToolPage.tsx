import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { PasswordWorkbench } from '@/components/password/PasswordWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function PasswordToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <PasswordWorkbench />
    </ToolPageLayout>
  )
}
